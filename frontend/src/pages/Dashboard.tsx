import React, { useState, useEffect, useRef } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell
} from 'recharts';
import {
  Play, Square, Users, AlertTriangle, TrendingDown, Activity,
  Server, Cloud, Database, GitBranch, Zap, Info
} from 'lucide-react';
import {
  loadOverview, loadFeatureImportance, loadMetadata,
  startDemoSession, stopDemoSession, openDemoStream,
  Overview, FeatureImportance, DemoCustomerEvent, DemoSession
} from '../api';

const RISK_COLORS = {
  low: '#22c55e',
  medium: '#eab308', 
  high: '#ef4444'
};

const Dashboard: React.FC = () => {
  const [overview, setOverview] = useState<Overview | null>(null);
  const [features, setFeatures] = useState<FeatureImportance[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Live demo state
  const [session, setSession] = useState<DemoSession | null>(null);
  const [events, setEvents] = useState<DemoCustomerEvent[]>([]);
  const [streamStatus, setStreamStatus] = useState<'idle' | 'starting' | 'running' | 'stopping'>('idle');
  const eventSourceRef = useRef<EventSource | null>(null);

  // Load initial data
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [overviewData, featuresData] = await Promise.all([
          loadOverview({}),
          loadFeatureImportance()
        ]);
        setOverview(overviewData);
        setFeatures(featuresData);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load data');
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      eventSourceRef.current?.close();
    };
  }, []);

  const handleStartDemo = async () => {
    try {
      setStreamStatus('starting');
      setEvents([]);
      const response = await startDemoSession();
      setSession(response.session);

      const source = openDemoStream(response.session.id, {
        onStarted: (payload) => {
          setSession(payload.session);
          setStreamStatus('running');
        },
        onCustomer: (event) => {
          setEvents(prev => [event, ...prev].slice(0, 50));
        },
        onState: (payload) => {
          setSession(payload.session);
        },
        onFinished: (payload) => {
          setSession(payload.session);
          setStreamStatus('idle');
          eventSourceRef.current?.close();
        },
        onError: (msg) => {
          setError(msg);
          setStreamStatus('idle');
        }
      });

      eventSourceRef.current = source;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start demo');
      setStreamStatus('idle');
    }
  };

  const handleStopDemo = async () => {
    if (!session) return;
    try {
      setStreamStatus('stopping');
      await stopDemoSession(session.id);
      eventSourceRef.current?.close();
      setStreamStatus('idle');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to stop demo');
      setStreamStatus('idle');
    }
  };

  const getRiskLevel = (probability: number) => {
    if (probability >= 0.7) return { label: 'High', color: RISK_COLORS.high };
    if (probability >= 0.4) return { label: 'Medium', color: RISK_COLORS.medium };
    return { label: 'Low', color: RISK_COLORS.low };
  };

  // Group features by category for cleaner display
  const groupedFeatures = features.reduce((acc, f) => {
    const parts = f.feature.split('_');
    const group = parts[0];
    if (!acc[group]) acc[group] = [];
    acc[group].push(f);
    return acc;
  }, {} as Record<string, FeatureImportance[]>);

  const aggregatedGroups = Object.entries(groupedFeatures)
    .map(([group, items]) => ({
      group: group.charAt(0).toUpperCase() + group.slice(1),
      importance: items.reduce((sum, i) => sum + i.importance, 0),
      features: items.length
    }))
    .sort((a, b) => b.importance - a.importance)
    .slice(0, 10);

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-6 space-y-6">
      {/* Error Banner */}
      {error && (
        <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      {/* Project Info Section */}
      <section className="card p-6">
        <div className="flex items-start gap-3 mb-4">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Info size={20} className="text-primary" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-foreground">Customer Churn Prediction Platform</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Machine Learning-powered analytics for proactive customer retention
            </p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mt-6">
          <div>
            <h3 className="text-sm font-medium text-foreground mb-2">What This Does</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              This platform uses a <strong>Random Forest classifier</strong> trained on historical telecom customer data 
              to predict which customers are likely to churn. The model analyzes 20+ features including contract type, 
              tenure, monthly charges, and service usage to generate real-time risk scores.
            </p>
          </div>
          
          <div>
            <h3 className="text-sm font-medium text-foreground mb-2">Why It Matters</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Customer acquisition costs 5-25x more than retention. By identifying at-risk customers early, 
              businesses can deploy targeted interventions—personalized offers, proactive support, or contract 
              adjustments—to reduce churn and protect revenue.
            </p>
          </div>
        </div>

        {/* Tech Stack */}
        <div className="mt-6 pt-6 border-t border-border">
          <h3 className="text-sm font-medium text-foreground mb-3">Deployment & Engineering</h3>
          <div className="flex flex-wrap gap-2">
            {[
              { icon: Server, label: 'FastAPI Backend' },
              { icon: Cloud, label: 'Google Cloud Run' },
              { icon: Database, label: 'Scikit-learn Pipeline' },
              { icon: GitBranch, label: 'CI/CD via GitHub Actions' },
              { icon: Zap, label: 'React + Vite Frontend' },
            ].map(({ icon: Icon, label }) => (
              <span key={label} className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-secondary text-xs text-muted-foreground rounded-md">
                <Icon size={12} />
                {label}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* KPI Cards */}
      {overview && (
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="card p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-50 rounded-lg">
                <Users size={18} className="text-blue-600" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Total Customers</p>
                <p className="text-xl font-semibold text-foreground">{overview.total_customers.toLocaleString()}</p>
              </div>
            </div>
          </div>

          <div className="card p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-50 rounded-lg">
                <Activity size={18} className="text-amber-600" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Avg Risk Score</p>
                <p className="text-xl font-semibold text-foreground">{(overview.avg_predicted_risk * 100).toFixed(1)}%</p>
              </div>
            </div>
          </div>

          <div className="card p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-50 rounded-lg">
                <AlertTriangle size={18} className="text-red-600" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">High Risk</p>
                <p className="text-xl font-semibold text-foreground">{overview.high_risk_customers.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">({(overview.high_risk_rate * 100).toFixed(1)}%)</p>
              </div>
            </div>
          </div>

          <div className="card p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-50 rounded-lg">
                <TrendingDown size={18} className="text-emerald-600" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Actual Churn</p>
                <p className="text-xl font-semibold text-foreground">{overview.actual_churn_customers.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">({(overview.actual_churn_rate * 100).toFixed(1)}%)</p>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Feature Importance */}
        <section className="card p-5">
          <h3 className="text-sm font-medium text-foreground mb-1">Feature Drivers (Random Forest Importance)</h3>
          <p className="text-xs text-muted-foreground mb-4">
            Aggregated importance scores by feature group from the trained model
          </p>
          
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={aggregatedGroups} layout="vertical" margin={{ left: 0, right: 16 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis type="number" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} tickFormatter={(v) => `${(v * 100).toFixed(0)}%`} />
                <YAxis type="category" dataKey="group" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} width={80} />
                <Tooltip
                  contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '6px', fontSize: '12px' }}
                  formatter={(value: number) => [`${(value * 100).toFixed(2)}%`, 'Importance']}
                />
                <Bar dataKey="importance" radius={[0, 4, 4, 0]}>
                  {aggregatedGroups.map((entry, index) => (
                    <Cell key={index} fill={index === 0 ? 'hsl(221, 83%, 53%)' : index < 3 ? 'hsl(142, 71%, 45%)' : 'hsl(215, 16%, 47%)'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>

        {/* Live Events Feed */}
        <section className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-medium text-foreground">Live Scoring Demo</h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Synthetic events scored in real-time
              </p>
            </div>
            
            <div className="flex items-center gap-2">
              {streamStatus === 'running' && (
                <span className="flex items-center gap-1.5 text-xs text-emerald-600">
                  <span className="live-dot" />
                  Live
                </span>
              )}
              
              {streamStatus === 'idle' ? (
                <button
                  onClick={handleStartDemo}
                  className="btn-primary text-xs px-3 py-1.5"
                >
                  <Play size={14} />
                  Start Demo
                </button>
              ) : streamStatus === 'running' ? (
                <button
                  onClick={handleStopDemo}
                  className="btn-outline text-xs px-3 py-1.5"
                >
                  <Square size={14} />
                  Stop
                </button>
              ) : (
                <span className="text-xs text-muted-foreground">
                  {streamStatus === 'starting' ? 'Starting...' : 'Stopping...'}
                </span>
              )}
            </div>
          </div>

          {/* Session Stats */}
          {session && streamStatus !== 'idle' && (
            <div className="grid grid-cols-3 gap-3 mb-4 p-3 bg-secondary rounded-lg text-center">
              <div>
                <p className="text-lg font-semibold text-foreground">{session.processed_events}</p>
                <p className="text-xs text-muted-foreground">Scored</p>
              </div>
              <div>
                <p className="text-lg font-semibold text-red-600">{session.high_risk_events}</p>
                <p className="text-xs text-muted-foreground">High Risk</p>
              </div>
              <div>
                <p className="text-lg font-semibold text-foreground">{(session.avg_probability * 100).toFixed(1)}%</p>
                <p className="text-xs text-muted-foreground">Avg Score</p>
              </div>
            </div>
          )}

          {/* Events List */}
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {events.length === 0 ? (
              <div className="text-center py-8 text-sm text-muted-foreground">
                {streamStatus === 'idle' 
                  ? 'Click "Start Demo" to see live scoring'
                  : 'Waiting for events...'}
              </div>
            ) : (
              events.map((event, idx) => {
                const risk = getRiskLevel(event.probability);
                return (
                  <div
                    key={`${event.session_id}-${event.sequence}`}
                    className={`flex items-center justify-between p-3 rounded-lg border ${
                      idx === 0 ? 'bg-primary/5 border-primary/20' : 'bg-secondary border-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className="w-2 h-2 rounded-full flex-shrink-0"
                        style={{ backgroundColor: risk.color }}
                      />
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">
                          {event.customer.customerID}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {event.customer.Contract} · ${event.customer.MonthlyCharges}/mo
                        </p>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0 ml-3">
                      <p className="text-sm font-semibold" style={{ color: risk.color }}>
                        {(event.probability * 100).toFixed(0)}%
                      </p>
                      <p className="text-xs text-muted-foreground">{risk.label} Risk</p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </section>
      </div>

      {/* Detailed Feature List */}
      <section className="card p-5">
        <h3 className="text-sm font-medium text-foreground mb-4">All Feature Importance Scores</h3>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {features.slice(0, 20).map((f) => (
            <div key={f.feature} className="flex items-center justify-between p-2 bg-secondary rounded-md">
              <span className="text-xs text-muted-foreground truncate mr-2">{f.feature}</span>
              <span className="text-xs font-medium text-foreground">{(f.importance * 100).toFixed(1)}%</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Dashboard;
