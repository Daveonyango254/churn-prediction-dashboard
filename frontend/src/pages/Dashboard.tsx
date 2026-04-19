import React, { useState, useEffect } from 'react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
} from 'recharts';
import {
  Users,
  TrendingDown,
  AlertCircle,
  Activity,
  DollarSign,
} from 'lucide-react';
import StatCard from '../components/StatCard';
import Card from '../components/Card';
import Button from '../components/Button';

const Dashboard: React.FC = () => {
  const [dashboardData, setDashboardData] = useState<any>(null);

  useEffect(() => {
    // Simulated API call - replace with actual API
    const mockData = {
      stats: {
        totalCustomers: 12547,
        churnRate: 8.5,
        atRiskCustomers: 342,
        retentionRate: 91.5,
      },
      timeSeriesData: [
        { month: 'Jan', churn: 12, retention: 88, customers: 1200 },
        { month: 'Feb', churn: 14, retention: 86, customers: 1350 },
        { month: 'Mar', churn: 10, retention: 90, customers: 1520 },
        { month: 'Apr', churn: 15, retention: 85, customers: 1680 },
        { month: 'May', churn: 8, retention: 92, customers: 1850 },
        { month: 'Jun', churn: 9, retention: 91, customers: 2100 },
      ],
      churnBySegment: [
        { segment: 'Enterprise', value: 3.5, customers: 450 },
        { segment: 'Mid-Market', value: 8.2, customers: 2300 },
        { segment: 'SMB', value: 12.1, customers: 9797 },
      ],
      topReasons: [
        { reason: 'Better Alternative', count: 45, percentage: 28 },
        { reason: 'Price Too High', count: 32, percentage: 20 },
        { reason: 'Poor Support', count: 28, percentage: 17 },
        { reason: 'Feature Gaps', count: 31, percentage: 19 },
        { reason: 'Other', count: 25, percentage: 16 },
      ],
    };
    setDashboardData(mockData);
  }, []);

  if (!dashboardData) {
    return <div className="p-8">Loading...</div>;
  }

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

  return (
    <div className="p-6 lg:p-8 bg-primary-bg min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl lg:text-4xl font-bold text-text-primary">Dashboard</h1>
        <p className="text-text-secondary mt-2">Welcome back! Here&apos;s your churn analytics overview.</p>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          label="Total Customers"
          value={dashboardData.stats.totalCustomers.toLocaleString()}
          change={12}
          icon={<Users size={20} />}
          color="blue"
        />
        <StatCard
          label="Churn Rate"
          value={`${dashboardData.stats.churnRate}%`}
          change={-3}
          icon={<TrendingDown size={20} />}
          color="red"
        />
        <StatCard
          label="At-Risk Customers"
          value={dashboardData.stats.atRiskCustomers}
          change={5}
          icon={<AlertCircle size={20} />}
          color="orange"
        />
        <StatCard
          label="Retention Rate"
          value={`${dashboardData.stats.retentionRate}%`}
          change={3}
          icon={<Activity size={20} />}
          color="green"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Churn vs Retention Trend */}
        <div className="lg:col-span-2">
          <Card title="Trend Analysis" subtitle="Churn vs Retention over time">
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={dashboardData.timeSeriesData}>
                  <defs>
                    <linearGradient id="colorChurn" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorRetention" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2d3748" />
                  <XAxis dataKey="month" stroke="#9ca3af" />
                  <YAxis stroke="#9ca3af" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1f2937',
                      border: '1px solid #2d3748',
                      borderRadius: '8px',
                    }}
                    cursor={{ fill: 'rgba(59, 130, 246, 0.1)' }}
                  />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="churn"
                    stroke="#ef4444"
                    fillOpacity={1}
                    fill="url(#colorChurn)"
                  />
                  <Area
                    type="monotone"
                    dataKey="retention"
                    stroke="#10b981"
                    fillOpacity={1}
                    fill="url(#colorRetention)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>

        {/* Churn by Segment */}
        <div>
          <Card title="Churn by Segment" subtitle="Segment performance">
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={dashboardData.churnBySegment}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ segment, value }) => `${segment} ${value}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {dashboardData.churnBySegment.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1f2937',
                      border: '1px solid #2d3748',
                      borderRadius: '8px',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Customer Growth */}
        <Card title="Customer Growth" subtitle="Total customers added monthly">
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dashboardData.timeSeriesData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2d3748" />
                <XAxis dataKey="month" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1f2937',
                    border: '1px solid #2d3748',
                    borderRadius: '8px',
                  }}
                />
                <Bar dataKey="customers" fill="#3b82f6" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Top Churn Reasons */}
        <Card title="Top Churn Reasons" subtitle="Most common reasons for churn">
          <div className="space-y-4">
            {dashboardData.topReasons.map((reason: any, index: number) => (
              <div key={index} className="flex items-center justify-between p-3 bg-tertiary-bg rounded-lg hover:bg-hover-bg transition-colors">
                <div className="flex-1">
                  <p className="text-sm font-medium text-text-primary">{reason.reason}</p>
                  <div className="mt-2 h-2 bg-secondary-bg rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${reason.percentage}%`,
                        backgroundColor: COLORS[index % COLORS.length],
                      }}
                    />
                  </div>
                </div>
                <span className="ml-4 text-sm font-semibold text-text-secondary w-12 text-right">
                  {reason.percentage}%
                </span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
