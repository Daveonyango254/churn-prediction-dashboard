import React, { useState } from 'react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from 'recharts';
import { TrendingUp, TrendingDown } from 'lucide-react';
import Card from '../components/Card';
import Button from '../components/Button';

const Analytics: React.FC = () => {
  const [timeRange, setTimeRange] = useState('6m');

  const churnTrendData = [
    { month: 'Jan', churn: 12, target: 10 },
    { month: 'Feb', churn: 14, target: 10 },
    { month: 'Mar', churn: 10, target: 10 },
    { month: 'Apr', churn: 15, target: 10 },
    { month: 'May', churn: 8, target: 10 },
    { month: 'Jun', churn: 9, target: 10 },
  ];

  const segmentAnalysis = [
    { segment: 'Enterprise', churn: 3.5, retention: 96.5, ltv: 45000 },
    { segment: 'Mid-Market', churn: 8.2, retention: 91.8, ltv: 15000 },
    { segment: 'SMB', churn: 12.1, retention: 87.9, ltv: 5000 },
  ];

  const cohortData = [
    { cohort: '2023 Q1', m1: 95, m3: 88, m6: 82, m12: 75 },
    { cohort: '2023 Q2', m1: 96, m3: 89, m6: 84, m12: 78 },
    { cohort: '2023 Q3', m1: 94, m3: 87, m6: 81 },
    { cohort: '2024 Q1', m1: 97, m3: 90, m6: 85 },
  ];

  const radarData = [
    { category: 'Product Quality', value: 82 },
    { category: 'Customer Support', value: 75 },
    { category: 'Pricing', value: 68 },
    { category: 'Features', value: 78 },
    { category: 'Onboarding', value: 85 },
    { category: 'Performance', value: 90 },
  ];

  return (
    <div className="p-6 lg:p-8 bg-primary-bg min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl lg:text-4xl font-bold text-text-primary">Analytics</h1>
        <p className="text-text-secondary mt-2">Deep dive into your churn metrics and customer insights.</p>
      </div>

      {/* Time Range Selector */}
      <div className="mb-8 flex gap-2 flex-wrap">
        {['1m', '3m', '6m', '1y', 'all'].map((range) => (
          <Button
            key={range}
            variant={timeRange === range ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => setTimeRange(range)}
          >
            {range === '1m' && 'Last Month'}
            {range === '3m' && 'Last 3 Months'}
            {range === '6m' && 'Last 6 Months'}
            {range === '1y' && 'Last Year'}
            {range === 'all' && 'All Time'}
          </Button>
        ))}
      </div>

      {/* Main Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Churn Trend */}
        <div className="lg:col-span-2">
          <Card title="Churn Rate Trend" subtitle="Monthly churn vs target">
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={churnTrendData}>
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
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="churn"
                    stroke="#ef4444"
                    strokeWidth={2}
                    dot={{ fill: '#ef4444', r: 4 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="target"
                    stroke="#10b981"
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>

        {/* Performance Radar */}
        <Card title="Performance Radar" subtitle="Business health metrics">
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData}>
                <PolarGrid stroke="#2d3748" />
                <PolarAngleAxis dataKey="category" stroke="#9ca3af" tick={{ fontSize: 12 }} />
                <PolarRadiusAxis stroke="#9ca3af" angle={90} domain={[0, 100]} />
                <Radar
                  name="Score"
                  dataKey="value"
                  stroke="#3b82f6"
                  fill="#3b82f6"
                  fillOpacity={0.3}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Segment Analysis */}
      <div className="grid grid-cols-1 gap-6 mb-8">
        <Card title="Segment Analysis" subtitle="Performance breakdown by customer segment">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border-color">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-text-secondary">
                    Segment
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-text-secondary">
                    Churn Rate
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-text-secondary">
                    Retention Rate
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-text-secondary">
                    LTV
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-text-secondary">
                    Trend
                  </th>
                </tr>
              </thead>
              <tbody>
                {segmentAnalysis.map((row) => (
                  <tr
                    key={row.segment}
                    className="border-b border-border-color hover:bg-hover-bg transition-colors"
                  >
                    <td className="py-4 px-4 font-medium text-text-primary">{row.segment}</td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        <span className="text-error font-semibold">{row.churn}%</span>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        <span className="text-success font-semibold">{row.retention}%</span>
                      </div>
                    </td>
                    <td className="py-4 px-4 font-semibold text-accent-primary">
                      ${row.ltv.toLocaleString()}
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-1 text-success">
                        <TrendingUp size={16} />
                        <span>+5%</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      {/* Cohort Analysis */}
      <div className="grid grid-cols-1 gap-6">
        <Card title="Cohort Analysis" subtitle="Retention by onboarding cohort">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border-color">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-text-secondary">
                    Cohort
                  </th>
                  <th className="text-center py-3 px-4 text-sm font-semibold text-text-secondary">
                    Month 1
                  </th>
                  <th className="text-center py-3 px-4 text-sm font-semibold text-text-secondary">
                    Month 3
                  </th>
                  <th className="text-center py-3 px-4 text-sm font-semibold text-text-secondary">
                    Month 6
                  </th>
                  <th className="text-center py-3 px-4 text-sm font-semibold text-text-secondary">
                    Month 12
                  </th>
                </tr>
              </thead>
              <tbody>
                {cohortData.map((row) => (
                  <tr
                    key={row.cohort}
                    className="border-b border-border-color hover:bg-hover-bg transition-colors"
                  >
                    <td className="py-4 px-4 font-medium text-text-primary">{row.cohort}</td>
                    <td className="py-4 px-4 text-center">
                      <span className="inline-block px-3 py-1 rounded bg-success/10 text-success font-semibold">
                        {row.m1}%
                      </span>
                    </td>
                    <td className="py-4 px-4 text-center">
                      <span className="inline-block px-3 py-1 rounded bg-success/10 text-success font-semibold">
                        {row.m3}%
                      </span>
                    </td>
                    <td className="py-4 px-4 text-center">
                      <span className="inline-block px-3 py-1 rounded bg-warning/10 text-warning font-semibold">
                        {row.m6}%
                      </span>
                    </td>
                    <td className="py-4 px-4 text-center">
                      {row.m12 ? (
                        <span className="inline-block px-3 py-1 rounded bg-accent-primary/10 text-accent-primary font-semibold">
                          {row.m12}%
                        </span>
                      ) : (
                        <span className="text-text-secondary">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Analytics;
