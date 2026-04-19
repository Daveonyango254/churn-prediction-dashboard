export type Overview = {
  total_customers: number;
  avg_predicted_risk: number;
  high_risk_customers: number;
  high_risk_rate: number;
  actual_churn_customers: number;
  actual_churn_rate: number;
};

export type DistributionPoint = {
  bin: string;
  count: number;
};

export type FeatureImportance = {
  feature: string;
  importance: number;
};

export type SegmentOption = {
  value: string;
  label: string;
  count: number;
};

export type SegmentGroup = {
  field: string;
  label: string;
  options: SegmentOption[];
};

export type CustomerRecord = {
  customerID: string;
  Tenure: number;
  MonthlyCharges: number;
  TotalCharges: number;
  Gender: string;
  SeniorCitizen: number;
  Partner: string;
  Dependents: string;
  PhoneService: string;
  MultipleLines: string;
  InternetService: string;
  OnlineSecurity: string;
  OnlineBackup: string;
  DeviceProtection: string;
  TechSupport: string;
  StreamingTV: string;
  StreamingMovies: string;
  Contract: string;
  PaperlessBilling: string;
  PaymentMethod: string;
  probability: number;
  prediction: string;
  actual_churn?: string;
};

export type NumericFieldOptions = {
  min: number;
  max: number;
  step: number;
};

export type PredictorOptions = Record<string, string[] | NumericFieldOptions>;

export type Metadata = {
  default_profile: Record<string, string | number>;
  segment_fields: SegmentGroup[];
  predictor_options: PredictorOptions;
  feature_columns: string[];
  historical_rows: number;
  demo_rows: number;
  demo_limits: {
    max_concurrent_sessions: number;
    max_events: number;
    cooldown_seconds: number;
    duration_seconds: number;
    event_interval_seconds: number;
  };
};

export type PredictionResponse = {
  customer: CustomerRecord;
  probability: number;
  prediction: string;
  risk_notes: string[];
};

export type DemoSession = {
  id: string;
  status: "starting" | "running" | "completed" | "stopped";
  started_at: string;
  processed_events: number;
  high_risk_events: number;
  avg_probability: number;
  remaining_events: number;
  max_events: number;
  max_duration_seconds: number;
};

export type DemoStartResponse = {
  session: DemoSession;
  limits: Metadata["demo_limits"];
};

export type DemoCustomerEvent = {
  sequence: number;
  session_id: string;
  emitted_at: string;
  customer: CustomerRecord;
  probability: number;
  prediction: string;
  risk_notes: string[];
};

type SessionStatePayload = {
  session: DemoSession;
  recent_events?: DemoCustomerEvent[];
};

type DemoHandlers = {
  onStarted?: (payload: SessionStatePayload) => void;
  onCustomer?: (payload: DemoCustomerEvent) => void;
  onState?: (payload: SessionStatePayload) => void;
  onFinished?: (payload: SessionStatePayload) => void;
  onError?: (message: string) => void;
};

const FALLBACK_PRODUCTION_API_BASE =
  "https://churn-platform-api-247833790903.us-central1.run.app";
const PRODUCTION_HOSTS = new Set([
  "churnpulsedashboard.xyz",
  "www.churnpulsedashboard.xyz",
]);
const RAW_API_BASE = import.meta.env.VITE_API_BASE_URL?.trim() ?? "";

function resolveApiBase(): string {
  if (RAW_API_BASE) {
    return RAW_API_BASE.replace(/\/$/, "");
  }

  if (typeof window === "undefined") {
    return "";
  }

  const host = window.location.hostname.toLowerCase();
  if (PRODUCTION_HOSTS.has(host) || host.endsWith(".vercel.app")) {
    return FALLBACK_PRODUCTION_API_BASE;
  }

  return "";
}

const API_BASE = resolveApiBase();

function apiUrl(path: string): string {
  return API_BASE ? `${API_BASE}${path}` : path;
}

function buildQuery(params?: Record<string, string | number | undefined>): string {
  const query = new URLSearchParams();
  Object.entries(params ?? {}).forEach(([key, value]) => {
    if (value !== undefined && value !== "") {
      query.set(key, String(value));
    }
  });
  const queryString = query.toString();
  return queryString ? `?${queryString}` : "";
}

async function requestJson<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(apiUrl(path), {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });

  if (!response.ok) {
    let message = "Request failed.";
    try {
      const payload = await response.json();
      message = payload.detail ?? message;
    } catch {
      message = response.statusText || message;
    }
    throw new Error(message);
  }

  return response.json() as Promise<T>;
}

export function loadMetadata(): Promise<Metadata> {
  return requestJson<Metadata>("/api/metadata");
}

export function loadOverview(filters: Record<string, string>) {
  return requestJson<Overview>(`/api/overview${buildQuery(filters)}`);
}

export function loadDistribution(filters: Record<string, string>) {
  return requestJson<DistributionPoint[]>(
    `/api/distribution${buildQuery(filters)}`
  );
}

export function loadFeatureImportance() {
  return requestJson<FeatureImportance[]>("/api/feature-importance");
}

export function loadCustomers(params: Record<string, string | number | undefined>) {
  return requestJson<CustomerRecord[]>(`/api/customers${buildQuery(params)}`);
}

export function predictCustomer(payload: Record<string, string | number>) {
  return requestJson<PredictionResponse>("/api/predict", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function startDemoSession() {
  return requestJson<DemoStartResponse>("/api/demo/session", {
    method: "POST",
    body: JSON.stringify({}),
  });
}

export function stopDemoSession(sessionId: string) {
  return requestJson<{ session: DemoSession }>(`/api/demo/session/${sessionId}/stop`, {
    method: "POST",
  });
}

export function openDemoStream(
  sessionId: string,
  handlers: DemoHandlers
): EventSource {
  const source = new EventSource(apiUrl(`/api/demo/session/${sessionId}/events`));

  const bind = <T>(eventName: string, handler?: (payload: T) => void) => {
    if (!handler) return;
    source.addEventListener(eventName, (event) => {
      const payload = JSON.parse((event as MessageEvent).data) as T;
      handler(payload);
    });
  };

  bind<SessionStatePayload>("session_started", handlers.onStarted);
  bind<DemoCustomerEvent>("customer_scored", handlers.onCustomer);
  bind<SessionStatePayload>("session_state", handlers.onState);
  bind<SessionStatePayload>("session_finished", handlers.onFinished);

  source.onerror = () => {
    handlers.onError?.("The live event stream disconnected.");
  };

  return source;
}
