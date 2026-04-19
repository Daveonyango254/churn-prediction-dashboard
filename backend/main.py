from __future__ import annotations

from contextlib import asynccontextmanager
from typing import Any

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, StreamingResponse

from backend.config import (
    APP_NAME,
    APP_VERSION,
    DEMO_COOLDOWN_SECONDS,
    DEMO_DURATION_SECONDS,
    DEMO_EVENT_INTERVAL_SECONDS,
    MAX_CONCURRENT_DEMO_SESSIONS,
    MAX_DEMO_EVENTS,
    allowed_origins,
)
from backend.demo import DemoSessionManager
from backend.service import ChurnService, SEGMENT_FIELDS


def _request_filters(request: Request) -> dict[str, str]:
    return {
        field: value
        for field in SEGMENT_FIELDS
        if (value := request.query_params.get(field))
    }


def _client_id(request: Request) -> str:
    forwarded_for = request.headers.get("x-forwarded-for", "")
    if forwarded_for:
        client = forwarded_for.split(",", 1)[0].strip()
        if client:
            return client
    if request.client and request.client.host:
        return request.client.host
    return "unknown-client"


@asynccontextmanager
async def lifespan(app: FastAPI):
    service = ChurnService()
    app.state.churn_service = service
    app.state.demo_manager = DemoSessionManager(service)
    yield


app = FastAPI(
    title=APP_NAME,
    version=APP_VERSION,
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins(),
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def root() -> dict[str, Any]:
    return {
        "name": APP_NAME,
        "version": APP_VERSION,
        "docs": "/docs",
        "health": "/api/health",
    }


@app.get("/api/health")
def health(request: Request) -> dict[str, Any]:
    service: ChurnService = request.app.state.churn_service
    return {
        "status": "ok",
        "model_ready": True,
        "historical_rows": int(len(service.historical)),
        "demo_rows": int(len(service.demo_seed)),
    }


@app.get("/api/metadata")
def metadata(request: Request) -> dict[str, Any]:
    service: ChurnService = request.app.state.churn_service
    response = service.metadata()
    response["demo_limits"] = {
        "max_concurrent_sessions": MAX_CONCURRENT_DEMO_SESSIONS,
        "max_events": MAX_DEMO_EVENTS,
        "cooldown_seconds": DEMO_COOLDOWN_SECONDS,
        "duration_seconds": DEMO_DURATION_SECONDS,
        "event_interval_seconds": DEMO_EVENT_INTERVAL_SECONDS,
    }
    return response


@app.get("/api/overview")
def overview(request: Request) -> dict[str, Any]:
    service: ChurnService = request.app.state.churn_service
    return service.overview(filters=_request_filters(request))


@app.get("/api/distribution")
def distribution(request: Request) -> list[dict[str, Any]]:
    service: ChurnService = request.app.state.churn_service
    return service.distribution(filters=_request_filters(request))


@app.get("/api/feature-importance")
def feature_importance(request: Request) -> list[dict[str, Any]]:
    service: ChurnService = request.app.state.churn_service
    return service.feature_importance


@app.get("/api/segments")
def segments(request: Request) -> list[dict[str, Any]]:
    service: ChurnService = request.app.state.churn_service
    return service.segment_options


@app.get("/api/customers")
def customers(request: Request, limit: int = 50, search: str | None = None) -> list[dict[str, Any]]:
    service: ChurnService = request.app.state.churn_service
    return service.customers(
        filters=_request_filters(request),
        search=search,
        limit=min(max(limit, 1), 100),
    )


@app.post("/api/predict")
async def predict(request: Request) -> dict[str, Any]:
    service: ChurnService = request.app.state.churn_service
    payload = await request.json()
    result = service.predict(payload)
    return {
        "customer": result.customer,
        "probability": result.probability,
        "prediction": result.prediction,
        "risk_notes": result.risk_notes,
    }


@app.post("/api/demo/session")
async def create_demo_session(request: Request) -> JSONResponse:
    manager: DemoSessionManager = request.app.state.demo_manager
    payload = await request.json() if request.headers.get("content-length") else {}
    requested_events = payload.get("requested_events") if isinstance(payload, dict) else None
    client_id = _client_id(request)
    session = await manager.create_session(client_id=client_id, requested_events=requested_events)
    return JSONResponse(session)


@app.post("/api/demo/session/{session_id}/stop")
async def stop_demo_session(session_id: str, request: Request) -> dict[str, Any]:
    manager: DemoSessionManager = request.app.state.demo_manager
    return await manager.stop_session(session_id)


@app.get("/api/demo/session/{session_id}/events")
async def stream_demo_session(session_id: str, request: Request) -> StreamingResponse:
    manager: DemoSessionManager = request.app.state.demo_manager
    generator = manager.event_stream(session_id)
    return StreamingResponse(
        generator,
        media_type="text/event-stream",
        headers={"Cache-Control": "no-cache"},
    )
