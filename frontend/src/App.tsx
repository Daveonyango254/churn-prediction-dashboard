import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  LayoutDashboard, 
  Users, 
  Zap, 
  TrendingUp, 
  AlertTriangle, 
  UserCheck, 
  Search, 
  Filter, 
  RefreshCw,
  ChevronRight,
  Database,
  BarChart3,
  PieChart as PieChartIcon,
  Info
} from 'lucide-react';
import { 
  SiApachespark, 
  SiApachehadoop, 
  SiMysql, 
  SiScikitlearn 
} from 'react-icons/si';
import { 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie
} from 'recharts';

import { rpcCall, invalidateCache } from './api';
import { cn } from './lib/utils';

import { Button } from './components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from './components/ui/card';
import { Input } from './components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './components/ui/select';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from './components/ui/table';
import { Badge } from './components/ui/badge';
import { Separator } from './components/ui/separator';
import { ScrollArea } from './components/ui/scroll-area';
import { Skeleton } from './components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './components/ui/tabs';
import { Label } from './components/ui/label';

// --- Types ---
interface ChurnOverview {
  total: number;
  avg_prob: number;
  churned_count: number;
  churn_rate: number;
}

interface ProbDistribution {
  bin: string;
  count: number;
}

interface FeatureImportance {
  feature: string;
  importance: number;
}

interface Segment {
  id: string;
  label: string;
  category: string;
}

interface Customer {
  customerID: string;
  gender: string;
  SeniorCitizen: number;
  Partner: string;
  Dependents: string;
  tenure: number;
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
  MonthlyCharges: number;
  TotalCharges: string;
  probability: number;
  prediction: string;
}

// --- Components ---

const StatCard = ({ title, value, subValue, icon: Icon, trend }: any) => (
  <Card>
    <CardContent className="p-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <div className="flex items-baseline gap-2">
            <h3 className="text-2xl font-bold font-heading">{value}</h3>
            {trend && (
              <span className={cn("text-xs font-medium", trend > 0 ? "text-rose-500" : "text-emerald-500")}>
                {trend > 0 ? '+' : ''}{trend}%
              </span>
            )}
          </div>
          {subValue && <p className="text-xs text-muted-foreground">{subValue}</p>}
        </div>
        <div className="rounded-lg bg-primary/10 p-2.5">
          <Icon className="h-5 w-5 text-primary" />
        </div>
      </div>
    </CardContent>
  </Card>
);

const TechStackLogo = ({ icon: Icon, label }: any) => (
  <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-sm border border-white/10">
    <Icon className="h-4 w-4 text-white/80" />
    <span className="text-xs font-medium text-white/90">{label}</span>
  </div>
);

export default function App() {
  const [activeTab, setActiveTab] = useState('overview');
  const [overview, setOverview] = useState<ChurnOverview | null>(null);
  const [distribution, setDistribution] = useState<ProbDistribution[]>([]);
  const [featureImportance, setFeatureImportance] = useState<FeatureImportance[]>([]);
  const [segments, setSegments] = useState<Segment[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<Record<string, string>>({});
  
  // Predictor state
  const [predictorData, setPredictorData] = useState<Partial<Customer>>({
    gender: 'Male',
    SeniorCitizen: 0,
    Partner: 'No',
    Dependents: 'No',
    tenure: 12,
    PhoneService: 'Yes',
    MultipleLines: 'No',
    InternetService: 'Fiber optic',
    OnlineSecurity: 'No',
    OnlineBackup: 'No',
    DeviceProtection: 'No',
    TechSupport: 'No',
    StreamingTV: 'No',
    StreamingMovies: 'No',
    Contract: 'Month-to-month',
    PaperlessBilling: 'Yes',
    PaymentMethod: 'Electronic check',
    MonthlyCharges: 70.0,
    TotalCharges: '840.0'
  });
  const [predictionResult, setPredictionResult] = useState<any>(null);
  const [predicting, setPredicting] = useState(false);

  // --- Data Loading ---
  const loadData = useCallback(async () => {
    setLoading(true);
    console.log("[FETCH_START] loadData");
    try {
      const activeFilters = Object.fromEntries(
        Object.entries(filters).filter(([_, v]) => v !== 'all')
      );
      const [ov, dist, feat, segs, custs] = await Promise.all([
        rpcCall({ func: 'get_churn_overview' }),
        rpcCall({ func: 'get_probability_distribution', args: { segments: Object.values(activeFilters) } }),
        rpcCall({ func: 'get_feature_importance' }),
        rpcCall({ func: 'get_customer_segments' }),
        rpcCall({ func: 'get_customers', args: { segment_filters: activeFilters, limit: 50 } })
      ]);
      
      setOverview(ov);
      setDistribution(dist);
      setFeatureImportance(feat);
      setSegments(segs);
      setCustomers(custs);
      console.log("[FETCH_RESPONSE] Data loaded successfully");
    } catch (err) {
      console.error("[PARSE_ERROR] Failed to load data", err);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    loadData();
    console.log("[RENDER_SUCCESS] Dashboard mounted");
  }, [loadData]);

  const handlePredict = async () => {
    setPredicting(true);
    console.log("[ACTION_START] predict_churn");
    try {
      const res = await rpcCall({ func: 'predict_churn', args: { customer_data: predictorData } });
      setPredictionResult(res);
      console.log("[FETCH_RESPONSE] Prediction successful");
    } catch (err) {
      console.error("[PARSE_ERROR] Prediction failed", err);
    } finally {
      setPredicting(false);
    }
  };

  // Group segments by category
  const groupedSegments = useMemo(() => {
    if (!segments) return {};
    return segments.reduce((acc: Record<string, Segment[]>, seg) => {
      if (!acc[seg.category]) acc[seg.category] = [];
      acc[seg.category].push(seg);
      return acc;
    }, {});
  }, [segments]);

  const handleFilterChange = (category: string, value: string) => {
    const newFilters = { ...filters };
    if (value === 'all') {
      delete newFilters[category];
    } else {
      newFilters[category] = value;
    }
    setFilters(newFilters);
  };

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 border-r bg-muted/20 flex flex-col hidden md:flex">
        <div className="p-6 border-b">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded bg-primary flex items-center justify-center">
              <TrendingUp className="h-5 w-5 text-primary-foreground" />
            </div>
            <h1 className="font-heading font-bold text-lg tracking-tight">ChurnGuard AI</h1>
          </div>
        </div>
        
        <nav className="flex-1 p-4 space-y-1">
          <Button 
            variant={activeTab === 'overview' ? 'default' : 'ghost'} 
            className="w-full justify-start gap-3"
            onClick={() => setActiveTab('overview')}
          >
            <LayoutDashboard className="h-4 w-4" />
            Overview
          </Button>
          <Button 
            variant={activeTab === 'customers' ? 'default' : 'ghost'} 
            className="w-full justify-start gap-3"
            onClick={() => setActiveTab('customers')}
          >
            <Users className="h-4 w-4" />
            Customer List
          </Button>
          <Button 
            variant={activeTab === 'predictor' ? 'default' : 'ghost'} 
            className="w-full justify-start gap-3"
            onClick={() => setActiveTab('predictor')}
          >
            <Zap className="h-4 w-4" />
            Risk Predictor
          </Button>
        </nav>

        <div className="p-4 mt-auto">
          <Card className="bg-primary/5 border-primary/10">
            <CardContent className="p-4 space-y-2">
              <div className="flex items-center gap-2 text-xs font-semibold text-primary uppercase tracking-wider">
                <Database className="h-3 w-3" />
                Data Source
              </div>
              <p className="text-xs text-muted-foreground">Telco Customer Churn (Processed via Scikit-Learn)</p>
            </CardContent>
          </Card>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile Header */}
        <header className="md:hidden border-b p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            <h1 className="font-heading font-bold">ChurnGuard AI</h1>
          </div>
          <Button variant="ghost" size="icon">
            <Search className="h-5 w-5" />
          </Button>
        </header>

        <ScrollArea className="flex-1">
          <div className="p-4 md:p-8 space-y-8 max-w-7xl mx-auto w-full">
            
            {activeTab === 'overview' && (
              <>
                {/* Hero Section */}
                <section className="relative rounded-2xl overflow-hidden min-h-[320px] flex flex-col justify-end p-8 bg-mesh">
                  <img 
                    src="./assets/hero-call-center-1.jpg" 
                    alt="Customer Intelligence" 
                    className="absolute inset-0 w-full h-full object-cover mix-blend-overlay opacity-40"
                    style={{ backgroundColor: '#1e293b' }}
                  />
                  <div className="relative z-10 space-y-4 max-w-2xl">
                    <Badge variant="secondary" className="bg-primary/20 text-white border-none backdrop-blur-md">
                      AI-Driven Insights
                    </Badge>
                    <h2 className="text-4xl font-heading font-bold text-white tracking-tight">
                      Anticipate Customer Needs, <span className="text-primary-foreground underline decoration-primary/50">Reduce Churn.</span>
                    </h2>
                    <p className="text-white/80 text-lg leading-relaxed">
                      Leverage advanced behavioral analytics to identify at-risk customers before they leave. Our predictive engine analyzes over 20 behavioral indicators to score risk in real-time.
                    </p>
                    <div className="flex flex-wrap gap-4 pt-2">
                      <TechStackLogo icon={SiApachespark} label="Spark" />
                      <TechStackLogo icon={SiScikitlearn} label="Scikit-Learn" />
                      <TechStackLogo icon={SiMysql} label="MySQL" />
                    </div>
                  </div>
                </section>

                {/* KPI Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <StatCard 
                    title="Total Customers" 
                    value={overview?.total.toLocaleString() || '0'} 
                    icon={Users} 
                  />
                  <StatCard 
                    title="Average Risk Score" 
                    value={`${((overview?.avg_prob || 0) * 100).toFixed(1)}%`} 
                    icon={AlertTriangle}
                    trend={+2.4}
                  />
                  <StatCard 
                    title="Predicted Churns" 
                    value={overview?.churned_count.toLocaleString() || '0'} 
                    icon={TrendingUp} 
                  />
                  <StatCard 
                    title="Overall Churn Rate" 
                    value={`${((overview?.churn_rate || 0) * 100).toFixed(1)}%`} 
                    icon={UserCheck}
                    trend={-1.2}
                  />
                </div>

                {/* Filters Row */}
                <div className="flex flex-wrap items-center gap-4 bg-muted/30 p-4 rounded-xl border">
                  <div className="flex items-center gap-2 mr-2">
                    <Filter className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Segment Exploration:</span>
                  </div>
                  
                  {Object.entries(groupedSegments).map(([category, items]) => (
                    <div key={category} className="space-y-1">
                      <Select 
                        value={filters[category] || 'all'} 
                        onValueChange={(val) => handleFilterChange(category, val)}
                      >
                        <SelectTrigger className="w-[180px] h-9">
                          <SelectValue placeholder={category} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All {category}s</SelectItem>
                          {items.map((item) => (
                            <SelectItem key={item.id} value={item.label}>{item.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  ))}
                  
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="ml-auto"
                    onClick={() => { setFilters({}); loadData(); }}
                  >
                    <RefreshCw className="h-3 w-3 mr-2" />
                    Reset
                  </Button>
                </div>

                {/* Charts Row */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card className="lg:col-span-1 shadow-sm">
                    <CardHeader>
                      <CardTitle className="text-lg font-heading flex items-center gap-2">
                        <BarChart3 className="h-4 w-4 text-primary" />
                        Risk Distribution
                      </CardTitle>
                      <CardDescription>Histogram of predicted churn probabilities across selected segments.</CardDescription>
                    </CardHeader>
                    <CardContent className="h-[350px]">
                      {loading ? (
                        <Skeleton className="w-full h-full" />
                      ) : (
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={distribution}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                            <XAxis 
                              dataKey="bin" 
                              tick={{ fontSize: 12 }} 
                              stroke="hsl(var(--muted-foreground))"
                            />
                            <YAxis 
                              tick={{ fontSize: 12 }} 
                              stroke="hsl(var(--muted-foreground))"
                            />
                            <Tooltip 
                              cursor={{ fill: 'hsl(var(--primary)/0.05)' }}
                              contentStyle={{ 
                                backgroundColor: 'hsl(var(--background))', 
                                borderColor: 'hsl(var(--border))',
                                borderRadius: 'var(--radius)'
                              }}
                            />
                            <Bar 
                              dataKey="count" 
                              fill="hsl(var(--primary))" 
                              radius={[4, 4, 0, 0]}
                              barSize={40}
                            />
                          </BarChart>
                        </ResponsiveContainer>
                      )}
                    </CardContent>
                  </Card>

                  <Card className="lg:col-span-1 shadow-sm">
                    <CardHeader>
                      <CardTitle className="text-lg font-heading flex items-center gap-2">
                        <Zap className="h-4 w-4 text-primary" />
                        Key Drivers (Feature Importance)
                      </CardTitle>
                      <CardDescription>Factors with the highest statistical impact on customer churn risk.</CardDescription>
                    </CardHeader>
                    <CardContent className="h-[350px]">
                      {loading ? (
                        <Skeleton className="w-full h-full" />
                      ) : (
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart 
                            data={featureImportance} 
                            layout="vertical"
                            margin={{ left: 40, right: 20 }}
                          >
                            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="hsl(var(--border))" />
                            <XAxis 
                              type="number"
                              tick={{ fontSize: 12 }} 
                              stroke="hsl(var(--muted-foreground))"
                            />
                            <YAxis 
                              dataKey="feature" 
                              type="category"
                              tick={{ fontSize: 11 }} 
                              width={100}
                              stroke="hsl(var(--muted-foreground))"
                            />
                            <Tooltip 
                              cursor={{ fill: 'hsl(var(--primary)/0.05)' }}
                              contentStyle={{ 
                                backgroundColor: 'hsl(var(--background))', 
                                borderColor: 'hsl(var(--border))',
                                borderRadius: 'var(--radius)'
                              }}
                            />
                            <Bar 
                              dataKey="importance" 
                              fill="hsl(var(--primary))" 
                              radius={[0, 4, 4, 0]}
                            />
                          </BarChart>
                        </ResponsiveContainer>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </>
            )}

            {activeTab === 'customers' && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-3xl font-heading font-bold tracking-tight">Customer Risk Registry</h2>
                    <p className="text-muted-foreground mt-1">Deep-dive into high-risk individual profiles and behavioral patterns.</p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={loadData}>
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Refresh
                    </Button>
                  </div>
                </div>

                <Card>
                  <CardHeader className="pb-3 border-b">
                    <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                      <div className="relative w-full sm:w-96">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input placeholder="Search customer ID..." className="pl-9" />
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-muted-foreground">Showing top 50 risk profiles</span>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-0">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-muted/50">
                          <TableHead>Customer ID</TableHead>
                          <TableHead>Contract</TableHead>
                          <TableHead>Service</TableHead>
                          <TableHead>Tenure</TableHead>
                          <TableHead>Monthly Charge</TableHead>
                          <TableHead className="text-right">Risk Score</TableHead>
                          <TableHead className="text-center">Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {loading ? (
                          Array.from({ length: 10 }).map((_, i) => (
                            <TableRow key={i}>
                              <TableCell colSpan={7}><Skeleton className="h-10 w-full" /></TableCell>
                            </TableRow>
                          ))
                        ) : customers.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={7} className="h-32 text-center text-muted-foreground">No customers found matching these filters.</TableCell>
                          </TableRow>
                        ) : (
                          customers.map((c) => (
                            <TableRow key={c.customerID} className="group hover:bg-muted/30 transition-colors">
                              <TableCell className="font-medium">{c.customerID}</TableCell>
                              <TableCell>{c.Contract}</TableCell>
                              <TableCell>{c.InternetService}</TableCell>
                              <TableCell>{c.tenure} mo</TableCell>
                              <TableCell>${c.MonthlyCharges}</TableCell>
                              <TableCell className="text-right">
                                <div className="flex items-center justify-end gap-2">
                                  <div className="w-16 h-1.5 rounded-full bg-muted overflow-hidden">
                                    <div 
                                      className={cn(
                                        "h-full rounded-full",
                                        c.probability > 0.7 ? "bg-rose-500" : c.probability > 0.4 ? "bg-amber-500" : "bg-emerald-500"
                                      )}
                                      style={{ width: `${c.probability * 100}%` }}
                                    />
                                  </div>
                                  <span className="font-semibold text-sm">{(c.probability * 100).toFixed(0)}%</span>
                                </div>
                              </TableCell>
                              <TableCell className="text-center">
                                <Badge variant={c.prediction === 'Yes' ? 'destructive' : 'secondary'} className="rounded-sm px-2 py-0">
                                  {c.prediction === 'Yes' ? 'High Risk' : 'Retained'}
                                </Badge>
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </div>
            )}

            {activeTab === 'predictor' && (
              <div className="max-w-5xl mx-auto space-y-8 animate-in zoom-in-95 duration-500">
                <div className="text-center space-y-2">
                  <h2 className="text-3xl font-heading font-bold tracking-tight">Real-time Risk Predictor</h2>
                  <p className="text-muted-foreground max-w-2xl mx-auto">
                    Input a customer's profile details to generate an instant churn probability score using our trained neural network.
                  </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {/* Form */}
                  <Card className="lg:col-span-2">
                    <CardHeader>
                      <CardTitle className="text-lg">Customer Attributes</CardTitle>
                      <CardDescription>Provide current subscription and behavioral data.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label>Contract Type</Label>
                          <Select 
                            value={predictorData.Contract} 
                            onValueChange={(val) => setPredictorData({...predictorData, Contract: val})}
                          >
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Month-to-month">Month-to-month</SelectItem>
                              <SelectItem value="One year">One year</SelectItem>
                              <SelectItem value="Two year">Two year</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label>Internet Service</Label>
                          <Select 
                            value={predictorData.InternetService} 
                            onValueChange={(val) => setPredictorData({...predictorData, InternetService: val})}
                          >
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="DSL">DSL</SelectItem>
                              <SelectItem value="Fiber optic">Fiber optic</SelectItem>
                              <SelectItem value="No">No Internet</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label>Tenure (Months)</Label>
                          <Input 
                            type="number" 
                            value={predictorData.tenure} 
                            onChange={(e) => setPredictorData({...predictorData, tenure: parseInt(e.target.value)})}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label>Monthly Charges ($)</Label>
                          <Input 
                            type="number" 
                            value={predictorData.MonthlyCharges} 
                            onChange={(e) => setPredictorData({...predictorData, MonthlyCharges: parseFloat(e.target.value)})}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label>Tech Support</Label>
                          <Select 
                            value={predictorData.TechSupport} 
                            onValueChange={(val) => setPredictorData({...predictorData, TechSupport: val})}
                          >
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Yes">Yes</SelectItem>
                              <SelectItem value="No">No</SelectItem>
                              <SelectItem value="No internet service">No Internet</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label>Online Security</Label>
                          <Select 
                            value={predictorData.OnlineSecurity} 
                            onValueChange={(val) => setPredictorData({...predictorData, OnlineSecurity: val})}
                          >
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Yes">Yes</SelectItem>
                              <SelectItem value="No">No</SelectItem>
                              <SelectItem value="No internet service">No Internet</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="bg-muted/30 border-t mt-6 flex justify-between items-center p-6">
                      <div className="text-sm text-muted-foreground flex items-center gap-2">
                        <Info className="h-4 w-4" />
                        Model Accuracy: 82.4%
                      </div>
                      <Button onClick={handlePredict} disabled={predicting} size="lg" className="min-w-[150px]">
                        {predicting ? <RefreshCw className="h-4 w-4 animate-spin mr-2" /> : <Zap className="h-4 w-4 mr-2" />}
                        Generate Score
                      </Button>
                    </CardFooter>
                  </Card>

                  {/* Result */}
                  <div className="space-y-6">
                    <Card className="h-full">
                      <CardHeader className="p-0 overflow-hidden">
                         <img 
                          src="./assets/card-customer-help-1.jpg" 
                          alt="Customer Analysis" 
                          className="w-full h-40 object-cover"
                        />
                      </CardHeader>
                      <CardContent className="p-6 text-center space-y-6">
                        <div className="space-y-2">
                          <h3 className="font-heading font-bold text-xl">Prediction Outcome</h3>
                          <p className="text-sm text-muted-foreground">The risk profile is calculated based on historical churn patterns.</p>
                        </div>

                        {predictionResult ? (
                          <div className="animate-in zoom-in-50 duration-500 space-y-6">
                            <div className="relative h-48 w-48 mx-auto">
                              <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                  <Pie
                                    data={[
                                      { name: 'Risk', value: predictionResult.probability * 100 },
                                      { name: 'Safe', value: (1 - predictionResult.probability) * 100 }
                                    ]}
                                    innerRadius={60}
                                    outerRadius={80}
                                    startAngle={180}
                                    endAngle={0}
                                    dataKey="value"
                                    paddingAngle={5}
                                  >
                                    <Cell fill={predictionResult.probability > 0.5 ? 'hsl(var(--destructive))' : 'hsl(var(--primary))'} />
                                    <Cell fill="hsl(var(--muted))" />
                                  </Pie>
                                </PieChart>
                              </ResponsiveContainer>
                              <div className="absolute inset-0 flex flex-col items-center justify-center pt-12">
                                <span className="text-4xl font-bold font-heading">{(predictionResult.probability * 100).toFixed(0)}%</span>
                                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">Risk Score</span>
                              </div>
                            </div>

                            <div className={cn(
                              "p-4 rounded-lg border flex flex-col items-center gap-2",
                              predictionResult.prediction === 'Yes' 
                                ? "bg-rose-50 border-rose-200 text-rose-800" 
                                : "bg-emerald-50 border-emerald-200 text-emerald-800"
                            )}>
                              {predictionResult.prediction === 'Yes' ? (
                                <>
                                  <AlertTriangle className="h-6 w-6" />
                                  <span className="font-bold">High Churn Potential</span>
                                </>
                              ) : (
                                <>
                                  <UserCheck className="h-6 w-6" />
                                  <span className="font-bold">Low Risk Profile</span>
                                </>
                              )}
                            </div>
                          </div>
                        ) : (
                          <div className="h-64 flex flex-col items-center justify-center border-2 border-dashed rounded-xl p-8 text-muted-foreground space-y-3">
                            <TrendingUp className="h-12 w-12 opacity-20" />
                            <p className="text-sm">Click 'Generate Score' to see the predicted outcome here.</p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </div>
            )}

            {/* Tech Stack Footer */}
            <section className="pt-12 pb-8 text-center space-y-6 border-t">
              <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-[0.2em]">Enterprise Data Infrastructure</h4>
              <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
                <div className="flex items-center gap-2">
                  <SiApachespark className="h-8 w-8" />
                  <span className="text-lg font-bold font-heading">Spark</span>
                </div>
                <div className="flex items-center gap-2">
                  <SiApachehadoop className="h-8 w-8" />
                  <span className="text-lg font-bold font-heading">Hadoop</span>
                </div>
                <div className="flex items-center gap-2">
                  <SiScikitlearn className="h-8 w-8" />
                  <span className="text-lg font-bold font-heading">Scikit-Learn</span>
                </div>
                <div className="flex items-center gap-2">
                  <SiMysql className="h-8 w-8" />
                  <span className="text-lg font-bold font-heading">MySQL</span>
                </div>
              </div>
            </section>
          </div>
        </ScrollArea>
      </main>
    </div>
  );
}
