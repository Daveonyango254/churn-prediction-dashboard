from __future__ import annotations

import asyncio
import json
import random
from dataclasses import dataclass, field
from datetime import UTC, datetime, timedelta
from typing import Any
from uuid import uuid4

import pandas as pd
from fastapi import HTTPException

from backend.config import (
    DEMO_COOLDOWN_SECONDS,
    DEMO_DURATION_SECONDS,
    DEMO_EVENT_INTERVAL_SECONDS,
    MAX_CONCURRENT_DEMO_SESSIONS,
    MAX_DEMO_EVENTS,
)
from backend.service import ChurnService


def _utc_now() -> datetime:
    return datetime.now(tz=UTC)


@dataclass
class DemoSession:
    id: str
    client_id: str
    planned_events: list[dict[str, Any]]
    queue: asyncio.Queue[dict[str, Any] | None] = field(default_factory=asyncio.Queue)
    status: str = "starting"
    started_at: datetime = field(default_factory=_utc_now)
    processed_events: int = 0
    high_risk_events: int = 0
    avg_probability: float = 0.0
    recent_events: list[dict[str, Any]] = field(default_factory=list)
    task: asyncio.Task[None] | None = None

    def snapshot(self) -> dict[str, Any]:
        return {
            "id": self.id,
            "status": self.status,
            "started_at": self.started_at.isoformat(),
            "processed_events": self.processed_events,
            "high_risk_events": self.high_risk_events,
            "avg_probability": round(self.avg_probability, 3),
            "remaining_events": max(len(self.planned_events) - self.processed_events, 0),
            "max_events": len(self.planned_events),
            "max_duration_seconds": DEMO_DURATION_SECONDS,
        }


class DemoSessionManager:
    def __init__(self, service: ChurnService) -> None:
        self.service = service
        self.sessions: dict[str, DemoSession] = {}
        self.client_cooldowns: dict[str, datetime] = {}
        self.lock = asyncio.Lock()

    async def create_session(
        self, client_id: str, requested_events: int | None = None
    ) -> dict[str, Any]:
        async with self.lock:
            self._cleanup_finished_sessions()
            self._enforce_limits(client_id)

            count = min(max(requested_events or MAX_DEMO_EVENTS, 1), MAX_DEMO_EVENTS)
            seed_frame = self.service.demo_seed.sample(
                n=count,
                replace=count > len(self.service.demo_seed),
                random_state=random.randint(1, 1_000_000),
            )
            planned_events = seed_frame.to_dict(orient="records")

            session_id = uuid4().hex[:12]
            session = DemoSession(
                id=session_id,
                client_id=client_id,
                planned_events=planned_events,
            )
            session.task = asyncio.create_task(self._run_session(session))
            self.sessions[session_id] = session
            self.client_cooldowns[client_id] = _utc_now()

            return {
                "session": session.snapshot(),
                "limits": {
                    "max_concurrent_sessions": MAX_CONCURRENT_DEMO_SESSIONS,
                    "max_events": MAX_DEMO_EVENTS,
                    "cooldown_seconds": DEMO_COOLDOWN_SECONDS,
                    "duration_seconds": DEMO_DURATION_SECONDS,
                    "event_interval_seconds": DEMO_EVENT_INTERVAL_SECONDS,
                },
            }

    async def stop_session(self, session_id: str) -> dict[str, Any]:
        async with self.lock:
            session = self.sessions.get(session_id)
            if not session:
                raise HTTPException(status_code=404, detail="Demo session not found.")
            if session.status in {"completed", "stopped"}:
                return {"session": session.snapshot()}

            session.status = "stopped"
            await session.queue.put(
                {"type": "session_state", "payload": {"session": session.snapshot()}}
            )
            return {"session": session.snapshot()}

    async def event_stream(self, session_id: str):
        session = self.sessions.get(session_id)
        if not session:
            raise HTTPException(status_code=404, detail="Demo session not found.")

        while True:
            if session.status in {"completed", "stopped"} and session.queue.empty():
                break

            try:
                envelope = await asyncio.wait_for(session.queue.get(), timeout=15)
            except TimeoutError:
                yield ": keep-alive\n\n"
                continue

            if envelope is None:
                break

            event_name = envelope.get("type", "message")
            payload = envelope.get("payload", {})
            yield f"event: {event_name}\ndata: {json.dumps(payload)}\n\n"

    def _cleanup_finished_sessions(self) -> None:
        expiry = _utc_now() - timedelta(minutes=10)
        removable = [
            session_id
            for session_id, session in self.sessions.items()
            if session.started_at < expiry and session.status in {"completed", "stopped"}
        ]
        for session_id in removable:
            self.sessions.pop(session_id, None)

    def _enforce_limits(self, client_id: str) -> None:
        active_sessions = [
            session for session in self.sessions.values() if session.status not in {"completed", "stopped"}
        ]
        if len(active_sessions) >= MAX_CONCURRENT_DEMO_SESSIONS:
            raise HTTPException(
                status_code=429,
                detail="The live demo is at capacity. Please wait a moment and try again.",
            )

        last_started = self.client_cooldowns.get(client_id)
        if last_started:
            ready_at = last_started + timedelta(seconds=DEMO_COOLDOWN_SECONDS)
            if ready_at > _utc_now():
                retry_in = int((ready_at - _utc_now()).total_seconds()) + 1
                raise HTTPException(
                    status_code=429,
                    detail=f"Please wait {retry_in}s before starting another live session.",
                )

    async def _run_session(self, session: DemoSession) -> None:
        session.status = "running"
        await session.queue.put(
            {"type": "session_started", "payload": {"session": session.snapshot()}}
        )

        total_probability = 0.0
        started = _utc_now()

        try:
            for index, base_customer in enumerate(session.planned_events, start=1):
                if session.status == "stopped":
                    break
                if (_utc_now() - started).total_seconds() >= DEMO_DURATION_SECONDS:
                    session.status = "stopped"
                    break

                await asyncio.sleep(DEMO_EVENT_INTERVAL_SECONDS)
                customer = self._mutate_customer(base_customer, index)
                result = self.service.score_demo_customer(customer)

                session.processed_events += 1
                total_probability += result["probability"]
                session.avg_probability = total_probability / session.processed_events
                if result["prediction"] == "Yes":
                    session.high_risk_events += 1

                event_payload = {
                    "sequence": session.processed_events,
                    "session_id": session.id,
                    "emitted_at": _utc_now().isoformat(),
                    **result,
                }
                session.recent_events.append(event_payload)
                session.recent_events = session.recent_events[-8:]

                await session.queue.put(
                    {"type": "customer_scored", "payload": event_payload}
                )
                await session.queue.put(
                    {
                        "type": "session_state",
                        "payload": {
                            "session": session.snapshot(),
                            "recent_events": session.recent_events,
                        },
                    }
                )

            if session.status != "stopped":
                session.status = "completed"
        finally:
            await session.queue.put(
                {
                    "type": "session_finished",
                    "payload": {
                        "session": session.snapshot(),
                        "recent_events": session.recent_events,
                    },
                }
            )
            await session.queue.put(None)

    def _mutate_customer(self, base_customer: dict[str, Any], index: int) -> dict[str, Any]:
        rng = random.Random(f"{index}-{base_customer.get('customerID', 'customer')}")
        customer = dict(base_customer)
        base_id = str(customer.get("customerID", "demo-customer"))

        tenure = int(float(customer.get("Tenure", 12)))
        tenure = max(0, min(72, tenure + rng.randint(-3, 4)))

        monthly = float(customer.get("MonthlyCharges", 70.0))
        monthly = max(18.0, min(120.0, monthly + rng.uniform(-6.5, 8.0)))

        total = float(customer.get("TotalCharges", tenure * monthly))
        total = max(0.0, total + rng.uniform(-120.0, 140.0))

        customer["customerID"] = f"{base_id}-live-{index}"
        customer["Tenure"] = tenure
        customer["MonthlyCharges"] = round(monthly, 2)
        customer["TotalCharges"] = round(max(total, tenure * monthly * 0.4), 2)
        return customer
