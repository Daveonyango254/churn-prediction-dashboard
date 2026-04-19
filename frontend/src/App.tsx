import {
  Activity,
  AlertTriangle,
  BarChart3,
  BrainCircuit,
  Container,
  Database,
  Filter,
  Play,
  RefreshCcw,
  Search,
  ShieldCheck,
  Square,
  TrendingUp,
  Users,
  Workflow,
} from "lucide-react";
import {
  startTransition,
  useDeferredValue,
  useEffect,
  useRef,
  useState,
} from "react";

import {
  type CustomerRecord,
  type DemoCustomerEvent,
  type DemoSession,
  type FeatureImportance,
  type Metadata,
  type Overview,
  type PredictionResponse,
  type SegmentGroup,
  loadCustomers,
  loadDistribution,
  loadFeatureImportance,
  loadMetadata,
  loadOverview,
  openDemoStream,
  predictCustomer,
  startDemoSession,
  stopDemoSession,
} from "./api";
import { Badge } from "./components/ui/badge";
import { Button } from "./components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./components/ui/card";
import { Input } from "./components/ui/input";
import { Label } from "./components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./components/ui/select";
import { Skeleton } from "./components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./components/ui/table";
import { cn } from "./lib/utils";

type PredictorValue = string | number;

const predictorSelectFields = [
  { name: "Contract", label: "Contract" },
  { name: "InternetService", label: "Internet Service" },
  { name: "TechSupport", label: "Tech Support" },
  { name: "OnlineSecurity", label: "Online Security" },
  { name: "PaymentMethod", label: "Payment Method" },
  { name: "Partner", label: "Partner" },
  { name: "Dependents", label: "Dependents" },
  { name: "Gender", label: "Gender" },
] as const;

const predictorNumberFields = [
  { name: "Tenure", label: "Tenure (months)" },
  { name: "MonthlyCharges", label: "Monthly Charges" },
  { name: "TotalCharges", label: "Total Charges" },
] as const;

const moneyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

function percent(value: number): string {
  return `${(value * 100).toFixed(1)}%`;
}

function MetricCard({
  label,
  value,
  hint,
  icon: Icon,
}: {
  label: string;
  value: string;
  hint: string;
  icon: typeof Users;
}) {
  return (
    <Card className="panel">
      <CardContent className="flex items-start justify-between gap-4 p-6">
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
            {label}
          </p>
          <p className="font-heading text-3xl font-semibold text-slate-950">
            {value}
          </p>
          <p className="text-sm text-slate-500">{hint}</p>
        </div>
        <div className="rounded-2xl border border-white/50 bg-white/80 p-3 text-teal-700 shadow-sm">
          <Icon className="h-5 w-5" />
        </div>
      </CardContent>
    </Card>
  );
}

function StreamStatus({ session }: { session: DemoSession | null }) {
  const active = session && (session.status === "starting" || session.status === "running");

  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-white/60 bg-white/80 px-3 py-1.5 text-sm text-slate-700 shadow-sm">
      <span className={cn("h-2.5 w-2.5 rounded-full", active ? "live-dot" : "bg-slate-300")} />
      {active ? "Live demo running" : "Baseline analytics loaded"}
    </div>
  );
}

function ArchitectureCard({
  title,
  icon: Icon,
  points,
  tone,
}: {
  title: string;
  icon: typeof Workflow;
  points: string[];
  tone: "light" | "dark";
}) {
  return (
    <Card className={cn(tone === "dark" ? "panel-dark" : "panel")}>
      <CardHeader className="space-y-3">
        <div className="flex items-center gap-3">
          <div
            className={cn(
              "rounded-2xl p-3",
              tone === "dark"
                ? "bg-white/10 text-white"
                : "bg-slate-950/5 text-slate-900"
            )}
          >
            <Icon className="h-5 w-5" />
          </div>
          <div>
            <CardTitle className={cn("font-heading text-xl", tone === "dark" && "text-white")}>
              {title}
            </CardTitle>
            <CardDescription className={tone === "dark" ? "text-slate-300" : ""}>
              Resume-facing architecture summary.
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {points.map((point) => (
          <div
            key={point}
            className={cn(
              "rounded-2xl border px-4 py-3 text-sm leading-relaxed",
              tone === "dark"
                ? "border-white/10 bg-white/5 text-slate-100"
                : "border-slate-200/80 bg-white/70 text-slate-700"
            )}
          >
            {point}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function DistributionBars({
  data,
}: {
  data: { bin: string; count: number }[];
}) {
  const maxCount = Math.max(...data.map((item) => item.count), 1);

  return (
    <div className="grid h-full grid-cols-5 gap-3 lg:grid-cols-10">
      {data.map((item) => {
        const height = Math.max((item.count / maxCount) * 100, 8);
        return (
          <div key={item.bin} className="flex min-h-0 flex-col justify-end gap-3">
            <div className="group relative flex flex-1 items-end">
              <div className="absolute -top-8 left-1/2 hidden -translate-x-1/2 rounded-full bg-slate-950 px-2 py-1 text-xs text-white shadow-lg group-hover:block">
                {item.count}
              </div>
              <div className="w-full rounded-t-[18px] bg-teal-100">
                <div
                  className="w-full rounded-t-[18px] bg-teal-700 transition-[height] duration-300"
                  style={{ height: `${height}%` }}
                />
              </div>
            </div>
            <p className="text-center text-[11px] leading-4 text-slate-500">{item.bin}</p>
          </div>
        );
      })}
    </div>
  );
}

function ImportanceBars({
  data,
}: {
  data: FeatureImportance[];
}) {
  const maxValue = Math.max(...data.map((item) => item.importance), 0.0001);

  return (
    <div className="space-y-4">
      {data.map((item) => (
        <div key={item.feature} className="space-y-2">
          <div className="flex items-center justify-between gap-4 text-sm">
            <span className="font-medium text-slate-700">{item.feature}</span>
            <span className="font-mono text-xs text-slate-500">
              {item.importance.toFixed(4)}
            </span>
          </div>
          <div className="h-3 overflow-hidden rounded-full bg-orange-100">
            <div
              className="h-full rounded-full bg-orange-500"
              style={{ width: `${(item.importance / maxValue) * 100}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function App() {
  const [metadata, setMetadata] = useState<Metadata | null>(null);
  const [segments, setSegments] = useState<SegmentGroup[]>([]);
  const [overview, setOverview] = useState<Overview | null>(null);
  const [distribution, setDistribution] = useState<{ bin: string; count: number }[]>([]);
  const [featureImportance, setFeatureImportance] = useState<FeatureImportance[]>([]);
  const [customers, setCustomers] = useState<CustomerRecord[]>([]);
  const [predictorProfile, setPredictorProfile] = useState<Record<string, PredictorValue>>({});
  const [prediction, setPrediction] = useState<PredictionResponse | null>(null);
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [search, setSearch] = useState("");
  const deferredSearch = useDeferredValue(search);
  const [dashboardLoading, setDashboardLoading] = useState(true);
  const [customerLoading, setCustomerLoading] = useState(true);
  const [predicting, setPredicting] = useState(false);
  const [pageError, setPageError] = useState<string | null>(null);
  const [sessionError, setSessionError] = useState<string | null>(null);
  const [demoSession, setDemoSession] = useState<DemoSession | null>(null);
  const [liveEvents, setLiveEvents] = useState<DemoCustomerEvent[]>([]);
  const eventSourceRef = useRef<EventSource | null>(null);

  useEffect(() => {
    let active = true;

    async function bootstrap() {
      try {
        setPageError(null);
        const [meta, topDrivers] = await Promise.all([
          loadMetadata(),
          loadFeatureImportance(),
        ]);
        if (!active) return;
        setMetadata(meta);
        setSegments(meta.segment_fields);
        setPredictorProfile(meta.default_profile);
        setFeatureImportance(topDrivers);
      } catch (error) {
        if (!active) return;
        setPageError(error instanceof Error ? error.message : "Failed to load application metadata.");
      }
    }

    bootstrap();

    return () => {
      active = false;
      eventSourceRef.current?.close();
    };
  }, []);

  useEffect(() => {
    let active = true;

    async function loadDashboard() {
      try {
        setDashboardLoading(true);
        const [nextOverview, nextDistribution] = await Promise.all([
          loadOverview(filters),
          loadDistribution(filters),
        ]);
        if (!active) return;
        setOverview(nextOverview);
        setDistribution(nextDistribution);
      } catch (error) {
        if (!active) return;
        setPageError(error instanceof Error ? error.message : "Failed to load dashboard analytics.");
      } finally {
        if (active) {
          setDashboardLoading(false);
        }
      }
    }

    loadDashboard();

    return () => {
      active = false;
    };
  }, [filters]);

  useEffect(() => {
    let active = true;

    async function loadTable() {
      try {
        setCustomerLoading(true);
        const nextCustomers = await loadCustomers({
          ...filters,
          search: deferredSearch || undefined,
          limit: 50,
        });
        if (!active) return;
        setCustomers(nextCustomers);
      } catch (error) {
        if (!active) return;
        setPageError(error instanceof Error ? error.message : "Failed to load customer profiles.");
      } finally {
        if (active) {
          setCustomerLoading(false);
        }
      }
    }

    loadTable();

    return () => {
      active = false;
    };
  }, [filters, deferredSearch]);

  function updateFilter(field: string, value: string) {
    startTransition(() => {
      setFilters((current) => {
        if (value === "all") {
          const next = { ...current };
          delete next[field];
          return next;
        }
        return { ...current, [field]: value };
      });
    });
  }

  function resetFilters() {
    startTransition(() => {
      setFilters({});
      setSearch("");
    });
  }

  async function handlePredict() {
    try {
      setPredicting(true);
      setPrediction(await predictCustomer(predictorProfile));
    } catch (error) {
      setSessionError(error instanceof Error ? error.message : "Prediction failed.");
    } finally {
      setPredicting(false);
    }
  }

  async function handleStartDemo() {
    try {
      setSessionError(null);
      setLiveEvents([]);
      eventSourceRef.current?.close();

      const response = await startDemoSession();
      setDemoSession(response.session);

      const source = openDemoStream(response.session.id, {
        onStarted: ({ session }) => setDemoSession(session),
        onCustomer: (payload) => {
          setLiveEvents((current) => [payload, ...current].slice(0, 8));
        },
        onState: ({ session }) => setDemoSession(session),
        onFinished: ({ session }) => {
          setDemoSession(session);
          eventSourceRef.current?.close();
          eventSourceRef.current = null;
        },
        onError: (message) => {
          setSessionError(message);
          eventSourceRef.current?.close();
          eventSourceRef.current = null;
        },
      });

      eventSourceRef.current = source;
    } catch (error) {
      setSessionError(error instanceof Error ? error.message : "Unable to start the live demo.");
    }
  }

  async function handleStopDemo() {
    if (!demoSession) return;
    try {
      const response = await stopDemoSession(demoSession.id);
      setDemoSession(response.session);
    } catch (error) {
      setSessionError(error instanceof Error ? error.message : "Unable to stop the live demo.");
    } finally {
      eventSourceRef.current?.close();
      eventSourceRef.current = null;
    }
  }

  const liveRunning =
    demoSession?.status === "running" || demoSession?.status === "starting";

  const demoHighlights = metadata?.demo_limits;

  return (
    <div className="min-h-screen bg-[hsl(var(--background))] text-slate-900">
      <div className="mx-auto flex min-h-screen w-full max-w-7xl flex-col gap-6 px-4 py-5 md:px-6 lg:px-8">
        <header className="panel flex flex-col gap-6 p-6 md:flex-row md:items-center md:justify-between">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-3">
              <Badge className="rounded-full border-none bg-teal-600/15 px-3 py-1 text-teal-700">
                Resume demo
              </Badge>
              <Badge
                variant="outline"
                className="rounded-full border-slate-300/70 bg-white/80 px-3 py-1 text-slate-600"
              >
                Random Forest + on-demand streaming
              </Badge>
            </div>
            <div className="space-y-2">
              <h1 className="font-heading text-4xl font-semibold tracking-tight text-slate-950 md:text-5xl">
                Churn Prediction Platform
              </h1>
              <p className="max-w-3xl text-base leading-7 text-slate-600 md:text-lg">
                Production-style telecom churn analytics with a trained Random Forest pipeline,
                segment drilldowns, live synthetic event scoring, and a deployment story built for a
                portfolio walkthrough.
              </p>
            </div>
          </div>
          <div className="flex flex-col items-start gap-3 md:items-end">
            <StreamStatus session={demoSession} />
            <div className="flex flex-wrap gap-3">
              <Button
                size="lg"
                onClick={handleStartDemo}
                disabled={liveRunning || !metadata}
                className="rounded-full bg-slate-950 px-6 text-white hover:bg-slate-800"
              >
                <Play className="mr-2 h-4 w-4" />
                Start live demo
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={handleStopDemo}
                disabled={!liveRunning}
                className="rounded-full border-slate-300 bg-white/80 px-6"
              >
                <Square className="mr-2 h-4 w-4" />
                Stop stream
              </Button>
            </div>
          </div>
        </header>

        {(pageError || sessionError) && (
          <Card className="border-rose-300 bg-rose-50">
            <CardContent className="flex items-start gap-3 p-5 text-rose-700">
              <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
              <div className="space-y-1">
                {pageError && <p>{pageError}</p>}
                {sessionError && <p>{sessionError}</p>}
              </div>
            </CardContent>
          </Card>
        )}

        <section className="grid gap-6 lg:grid-cols-[1.7fr,1fr]">
          <Card className="hero-card overflow-hidden border-none">
            <CardContent className="relative flex h-full flex-col justify-between gap-8 p-6 md:p-8">
              <div className="grid gap-4 md:grid-cols-3">
                {dashboardLoading || !overview ? (
                  Array.from({ length: 3 }).map((_, index) => (
                    <Skeleton key={index} className="h-24 w-full rounded-3xl" />
                  ))
                ) : (
                  <>
                    <div className="rounded-3xl border border-white/10 bg-white/10 p-5 backdrop-blur">
                      <p className="text-sm uppercase tracking-[0.22em] text-cyan-100/70">Historical base</p>
                      <p className="mt-3 font-heading text-3xl font-semibold text-white">
                        {overview.total_customers.toLocaleString()}
                      </p>
                      <p className="mt-1 text-sm text-slate-200">scored customer records</p>
                    </div>
                    <div className="rounded-3xl border border-white/10 bg-white/10 p-5 backdrop-blur">
                      <p className="text-sm uppercase tracking-[0.22em] text-cyan-100/70">Predicted risk</p>
                      <p className="mt-3 font-heading text-3xl font-semibold text-white">
                        {percent(overview.avg_predicted_risk)}
                      </p>
                      <p className="mt-1 text-sm text-slate-200">average churn probability</p>
                    </div>
                    <div className="rounded-3xl border border-white/10 bg-white/10 p-5 backdrop-blur">
                      <p className="text-sm uppercase tracking-[0.22em] text-cyan-100/70">Observed churn</p>
                      <p className="mt-3 font-heading text-3xl font-semibold text-white">
                        {percent(overview.actual_churn_rate)}
                      </p>
                      <p className="mt-1 text-sm text-slate-200">actual label rate in training history</p>
                    </div>
                  </>
                )}
              </div>

              <div className="max-w-3xl space-y-4">
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-100/80">
                  Hosted demo path
                </p>
                <h2 className="font-heading text-3xl font-semibold leading-tight text-white md:text-4xl">
                  Containerized API, live visitor-triggered streaming, and a dashboard designed for a
                  recruiter to understand in under a minute.
                </h2>
                <p className="max-w-2xl text-base leading-7 text-slate-200">
                  The public deployment is optimized for reliability and cost control. The original big-data
                  architecture remains part of the project story, while the hosted version makes the product
                  demo concrete and fast.
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <Badge className="rounded-full border-none bg-white/15 px-3 py-1 text-white">
                  Vercel frontend
                </Badge>
                <Badge className="rounded-full border-none bg-white/15 px-3 py-1 text-white">
                  FastAPI container
                </Badge>
                <Badge className="rounded-full border-none bg-white/15 px-3 py-1 text-white">
                  Docker-first local setup
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card className="panel">
            <CardHeader className="space-y-4">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <CardTitle className="font-heading text-2xl">Live stream control</CardTitle>
                  <CardDescription>
                    On-demand synthetic events scored by the trained model.
                  </CardDescription>
                </div>
                <div className="rounded-2xl bg-teal-600/10 p-3 text-teal-700">
                  <Activity className="h-5 w-5" />
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-3xl border border-slate-200/80 bg-white/80 p-4">
                  <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Session status</p>
                  <p className="mt-2 font-heading text-2xl font-semibold text-slate-950">
                    {demoSession?.status ?? "idle"}
                  </p>
                </div>
                <div className="rounded-3xl border border-slate-200/80 bg-white/80 p-4">
                  <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Events processed</p>
                  <p className="mt-2 font-heading text-2xl font-semibold text-slate-950">
                    {demoSession?.processed_events ?? 0}
                  </p>
                </div>
                <div className="rounded-3xl border border-slate-200/80 bg-white/80 p-4">
                  <p className="text-xs uppercase tracking-[0.24em] text-slate-500">High-risk events</p>
                  <p className="mt-2 font-heading text-2xl font-semibold text-slate-950">
                    {demoSession?.high_risk_events ?? 0}
                  </p>
                </div>
                <div className="rounded-3xl border border-slate-200/80 bg-white/80 p-4">
                  <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Live avg risk</p>
                  <p className="mt-2 font-heading text-2xl font-semibold text-slate-950">
                    {percent(demoSession?.avg_probability ?? 0)}
                  </p>
                </div>
              </div>

              {demoHighlights && (
                <div className="rounded-3xl border border-dashed border-slate-300/80 bg-slate-50/90 p-4">
                  <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Guardrails</p>
                  <div className="mt-3 grid gap-3 text-sm text-slate-600 sm:grid-cols-2">
                    <p>Max concurrent sessions: {demoHighlights.max_concurrent_sessions}</p>
                    <p>Max events per run: {demoHighlights.max_events}</p>
                    <p>Cooldown per visitor: {demoHighlights.cooldown_seconds}s</p>
                    <p>Target event cadence: {demoHighlights.event_interval_seconds}s</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </section>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {dashboardLoading || !overview ? (
            Array.from({ length: 4 }).map((_, index) => (
              <Skeleton key={index} className="h-36 w-full rounded-3xl" />
            ))
          ) : (
            <>
              <MetricCard
                label="Customers"
                value={overview.total_customers.toLocaleString()}
                hint="Historical customer profiles scored on startup."
                icon={Users}
              />
              <MetricCard
                label="High-Risk Cohort"
                value={overview.high_risk_customers.toLocaleString()}
                hint={`${percent(overview.high_risk_rate)} of the filtered dataset.`}
                icon={AlertTriangle}
              />
              <MetricCard
                label="Average Risk"
                value={percent(overview.avg_predicted_risk)}
                hint="Mean model probability across the current segment."
                icon={TrendingUp}
              />
              <MetricCard
                label="Observed Churn"
                value={overview.actual_churn_customers.toLocaleString()}
                hint={`${percent(overview.actual_churn_rate)} actual churn labels.`}
                icon={ShieldCheck}
              />
            </>
          )}
        </section>

        <Card className="panel">
          <CardHeader className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <CardTitle className="font-heading text-2xl">Segment drilldown</CardTitle>
                <CardDescription>
                  Filter historical data, search the highest-risk customer profiles, and reset to the full baseline.
                </CardDescription>
              </div>
              <Button
                variant="outline"
                className="rounded-full border-slate-300 bg-white/80"
                onClick={resetFilters}
              >
                <RefreshCcw className="mr-2 h-4 w-4" />
                Reset filters
              </Button>
            </div>
          </CardHeader>
          <CardContent className="grid gap-4 lg:grid-cols-[repeat(3,minmax(0,1fr))_1.2fr]">
            {segments.map((segment) => (
              <div key={segment.field} className="space-y-2">
                <Label>{segment.label}</Label>
                <Select
                  value={filters[segment.field] ?? "all"}
                  onValueChange={(value) => updateFilter(segment.field, value)}
                >
                  <SelectTrigger className="h-11 rounded-2xl border-slate-300 bg-white">
                    <SelectValue placeholder={`All ${segment.label}`} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All {segment.label}</SelectItem>
                    {segment.options.map((option) => (
                      <SelectItem key={`${segment.field}-${option.value}`} value={option.value}>
                        {option.label} ({option.count})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ))}

            <div className="space-y-2">
              <Label>Search customer ID</Label>
              <div className="relative">
                <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search the top-risk registry"
                  className="h-11 rounded-2xl border-slate-300 bg-white pl-11"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <section className="grid gap-6 xl:grid-cols-2">
          <Card className="panel">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 font-heading text-2xl">
                <BarChart3 className="h-5 w-5 text-teal-700" />
                Risk distribution
              </CardTitle>
              <CardDescription>
                Historical predicted probability bands for the current segment selection.
              </CardDescription>
            </CardHeader>
            <CardContent className="h-[320px]">
              {dashboardLoading ? (
                <Skeleton className="h-full w-full rounded-3xl" />
              ) : (
                <DistributionBars data={distribution} />
              )}
            </CardContent>
          </Card>

          <Card className="panel">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 font-heading text-2xl">
                <BrainCircuit className="h-5 w-5 text-orange-600" />
                Feature drivers
              </CardTitle>
              <CardDescription>
                Aggregated Random Forest importance by raw feature group.
              </CardDescription>
            </CardHeader>
            <CardContent className="h-[320px]">
              {featureImportance.length === 0 ? (
                <Skeleton className="h-full w-full rounded-3xl" />
              ) : (
                <div className="h-full overflow-y-auto pr-2">
                  <ImportanceBars data={featureImportance} />
                </div>
              )}
            </CardContent>
          </Card>
        </section>

        <section className="grid gap-6 lg:grid-cols-[1.6fr,1fr]">
          <Card className="panel">
            <CardHeader className="space-y-3">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <CardTitle className="font-heading text-2xl">Customer risk registry</CardTitle>
                  <CardDescription>
                    Highest-risk historical profiles after segment filters and customer search.
                  </CardDescription>
                </div>
                <Badge
                  variant="outline"
                  className="rounded-full border-slate-300 bg-white/70 px-3 py-1 text-slate-600"
                >
                  Top 50 profiles
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <Table>
                <TableHeader>
                  <TableRow className="border-slate-200">
                    <TableHead>Customer</TableHead>
                    <TableHead>Contract</TableHead>
                    <TableHead>Service</TableHead>
                    <TableHead>Monthly</TableHead>
                    <TableHead>Risk</TableHead>
                    <TableHead>Model</TableHead>
                    <TableHead>Actual</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {customerLoading ? (
                    Array.from({ length: 6 }).map((_, index) => (
                      <TableRow key={index}>
                        <TableCell colSpan={7}>
                          <Skeleton className="h-12 w-full rounded-2xl" />
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    customers.map((customer) => (
                      <TableRow key={customer.customerID} className="border-slate-200">
                        <TableCell className="font-medium text-slate-950">
                          {customer.customerID}
                        </TableCell>
                        <TableCell>{customer.Contract}</TableCell>
                        <TableCell>{customer.InternetService}</TableCell>
                        <TableCell>{moneyFormatter.format(customer.MonthlyCharges)}</TableCell>
                        <TableCell className="min-w-[140px]">
                          <div className="flex items-center gap-3">
                            <div className="h-2 w-20 overflow-hidden rounded-full bg-slate-200">
                              <div
                                className={cn(
                                  "h-full rounded-full",
                                  customer.probability >= 0.6
                                    ? "bg-rose-500"
                                    : customer.probability >= 0.35
                                      ? "bg-amber-500"
                                      : "bg-emerald-500"
                                )}
                                style={{ width: `${customer.probability * 100}%` }}
                              />
                            </div>
                            <span>{percent(customer.probability)}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            className={cn(
                              "rounded-full border-none px-3 py-1",
                              customer.prediction === "Yes"
                                ? "bg-rose-100 text-rose-700"
                                : "bg-emerald-100 text-emerald-700"
                            )}
                          >
                            {customer.prediction === "Yes" ? "High risk" : "Stable"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge
                            className={cn(
                              "rounded-full border-none px-3 py-1",
                              customer.actual_churn === "Yes"
                                ? "bg-slate-950 text-white"
                                : "bg-slate-200 text-slate-700"
                            )}
                          >
                            {customer.actual_churn === "Yes" ? "Churned" : "Stayed"}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <div className="grid gap-6">
            <Card className="panel">
              <CardHeader className="space-y-3">
                <CardTitle className="flex items-center gap-2 font-heading text-2xl">
                  <Activity className="h-5 w-5 text-teal-700" />
                  Live event feed
                </CardTitle>
                <CardDescription>
                  Recent synthetic events scored during the current visitor session.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {liveEvents.length === 0 ? (
                  <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50/80 p-6 text-sm leading-7 text-slate-500">
                    Start the live demo to stream synthetic customer events into the dashboard.
                  </div>
                ) : (
                  liveEvents.map((event) => (
                    <div
                      key={`${event.session_id}-${event.sequence}`}
                      className="rounded-3xl border border-slate-200/80 bg-white/90 p-4"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-medium text-slate-950">
                            {event.customer.customerID}
                          </p>
                          <p className="text-sm text-slate-500">
                            {event.customer.Contract} | {event.customer.InternetService}
                          </p>
                        </div>
                        <Badge
                          className={cn(
                            "rounded-full border-none px-3 py-1",
                            event.prediction === "Yes"
                              ? "bg-rose-100 text-rose-700"
                              : "bg-emerald-100 text-emerald-700"
                          )}
                        >
                          {percent(event.probability)}
                        </Badge>
                      </div>
                      <p className="mt-3 text-sm leading-6 text-slate-600">
                        {event.risk_notes[0]}
                      </p>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>

            <ArchitectureCard
              title="Full local data platform"
              icon={Container}
              tone="dark"
              points={[
                "Original project flow: Kafka producer -> Spark Structured Streaming -> churn scoring -> BI dashboard.",
                "Hadoop/HDFS remains part of the documented training-data story for the full local architecture.",
                "The hosted app focuses on a truthful, fast public demo while preserving the broader big-data narrative.",
              ]}
            />
          </div>
        </section>

        <section className="grid gap-6 xl:grid-cols-[1.4fr,1fr]">
          <Card className="panel">
            <CardHeader className="space-y-4">
              <CardTitle className="flex items-center gap-2 font-heading text-2xl">
                <BrainCircuit className="h-5 w-5 text-teal-700" />
                Predictor workbench
              </CardTitle>
              <CardDescription>
                Adjust a customer profile and score it with the same Random Forest pipeline used by the dashboard.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-5 md:grid-cols-2">
                {predictorSelectFields.map((field) => {
                  const options = Array.isArray(metadata?.predictor_options[field.name])
                    ? (metadata?.predictor_options[field.name] as string[])
                    : [];
                  return (
                    <div key={field.name} className="space-y-2">
                      <Label>{field.label}</Label>
                      <Select
                        value={String(predictorProfile[field.name] ?? "")}
                        onValueChange={(value) =>
                          setPredictorProfile((current) => ({
                            ...current,
                            [field.name]: value,
                          }))
                        }
                      >
                        <SelectTrigger className="h-11 rounded-2xl border-slate-300 bg-white">
                          <SelectValue placeholder={`Select ${field.label}`} />
                        </SelectTrigger>
                        <SelectContent>
                          {options.map((option) => (
                            <SelectItem key={`${field.name}-${option}`} value={option}>
                              {option}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  );
                })}

                {predictorNumberFields.map((field) => {
                  const bounds = metadata?.predictor_options[field.name];
                  const numericBounds =
                    bounds && !Array.isArray(bounds)
                      ? bounds
                      : { min: 0, max: 100, step: 1 };
                  return (
                    <div key={field.name} className="space-y-2">
                      <Label>{field.label}</Label>
                      <Input
                        type="number"
                        min={numericBounds.min}
                        max={numericBounds.max}
                        step={numericBounds.step}
                        value={predictorProfile[field.name] ?? ""}
                        onChange={(event) =>
                          setPredictorProfile((current) => ({
                            ...current,
                            [field.name]:
                              event.target.value === ""
                                ? ""
                                : Number(event.target.value),
                          }))
                        }
                        className="h-11 rounded-2xl border-slate-300 bg-white"
                      />
                    </div>
                  );
                })}
              </div>

              <div className="flex flex-wrap gap-3">
                <Button
                  onClick={handlePredict}
                  disabled={!metadata || predicting}
                  className="rounded-full bg-slate-950 px-6 text-white hover:bg-slate-800"
                >
                  <BrainCircuit className="mr-2 h-4 w-4" />
                  {predicting ? "Scoring profile..." : "Generate prediction"}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    if (metadata) {
                      setPredictorProfile(metadata.default_profile);
                      setPrediction(null);
                    }
                  }}
                  className="rounded-full border-slate-300 bg-white/80 px-6"
                >
                  <RefreshCcw className="mr-2 h-4 w-4" />
                  Reset profile
                </Button>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-6">
            <Card className="panel">
              <CardHeader>
                <CardTitle className="font-heading text-2xl">Prediction result</CardTitle>
                <CardDescription>
                  Probability, model classification, and quick interpretation notes.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {!prediction ? (
                  <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50/80 p-6 text-sm leading-7 text-slate-500">
                    Submit a profile to see the predicted churn probability and supporting notes.
                  </div>
                ) : (
                  <>
                    <div className="rounded-3xl border border-slate-200/80 bg-white/90 p-5">
                      <p className="text-xs uppercase tracking-[0.24em] text-slate-500">
                        Probability
                      </p>
                      <p className="mt-3 font-heading text-5xl font-semibold text-slate-950">
                        {percent(prediction.probability)}
                      </p>
                      <p className="mt-2 text-sm text-slate-500">
                        Model classification:{" "}
                        <span className="font-medium text-slate-900">
                          {prediction.prediction === "Yes" ? "High risk" : "Stable"}
                        </span>
                      </p>
                    </div>
                    <div className="space-y-3">
                      {prediction.risk_notes.map((note) => (
                        <div
                          key={note}
                          className="rounded-3xl border border-slate-200/80 bg-white/90 p-4 text-sm leading-6 text-slate-600"
                        >
                          {note}
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            <ArchitectureCard
              title="Deployment + engineering story"
              icon={Workflow}
              tone="light"
              points={[
                "Public deployment: Vercel frontend + containerized API service with hard limits around live usage.",
                "Model: Random Forest pipeline trained offline from repo-local telecom churn data and shipped as a saved artifact.",
                "Docker remains central to the project story for local validation, packaging, and infrastructure narrative.",
              ]}
            />
          </div>
        </section>

        <footer className="grid gap-4 md:grid-cols-3">
          <Card className="panel">
            <CardContent className="flex h-full items-start gap-4 p-5">
              <div className="rounded-2xl bg-slate-950/5 p-3 text-slate-900">
                <Database className="h-5 w-5" />
              </div>
              <div className="space-y-2">
                <p className="font-medium text-slate-950">Historical seed</p>
                <p className="text-sm leading-6 text-slate-600">
                  {metadata?.historical_rows?.toLocaleString() ?? "0"} telecom records loaded from the
                  repo and scored on backend startup.
                </p>
              </div>
            </CardContent>
          </Card>
          <Card className="panel">
            <CardContent className="flex h-full items-start gap-4 p-5">
              <div className="rounded-2xl bg-slate-950/5 p-3 text-slate-900">
                <Filter className="h-5 w-5" />
              </div>
              <div className="space-y-2">
                <p className="font-medium text-slate-950">Segment analytics</p>
                <p className="text-sm leading-6 text-slate-600">
                  Contract, internet service, and payment method filters drive every overview and table query.
                </p>
              </div>
            </CardContent>
          </Card>
          <Card className="panel">
            <CardContent className="flex h-full items-start gap-4 p-5">
              <div className="rounded-2xl bg-slate-950/5 p-3 text-slate-900">
                <Container className="h-5 w-5" />
              </div>
              <div className="space-y-2">
                <p className="font-medium text-slate-950">Container-ready</p>
                <p className="text-sm leading-6 text-slate-600">
                  The standalone app is packaged for Docker and documented for a Vercel plus Cloud Run deployment path.
                </p>
              </div>
            </CardContent>
          </Card>
        </footer>
      </div>
    </div>
  );
}
