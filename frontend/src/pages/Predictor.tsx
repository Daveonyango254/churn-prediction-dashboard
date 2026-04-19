import React, { useState } from 'react';
import { Zap, TrendingDown, AlertCircle, CheckCircle, Users } from 'lucide-react';
import Card from '../components/Card';
import Button from '../components/Button';

interface Prediction {
  customerId: string;
  customerName: string;
  riskScore: number;
  churnProbability: number;
  keyFactors: string[];
  recommendedAction: string;
}

const Predictor: React.FC = () => {
  const [predictions, setPredictions] = useState<Prediction[]>([
    {
      customerId: '1',
      customerName: 'Acme Corp',
      riskScore: 87,
      churnProbability: 0.87,
      keyFactors: [
        'Low feature usage (-45%)',
        'No support tickets in 3 months',
        'Price increase triggered',
        'Competitor activity detected',
      ],
      recommendedAction: 'Schedule executive sync & offer discount',
    },
    {
      customerId: '4',
      customerName: 'Digital Solutions',
      riskScore: 92,
      churnProbability: 0.92,
      keyFactors: [
        'Declining usage trend',
        'Multiple billing disputes',
        'Key user left company',
        'Negative NPS sentiment',
      ],
      recommendedAction: 'Immediate intervention - sales call required',
    },
    {
      customerId: '2',
      customerName: 'TechStart Inc',
      riskScore: 62,
      churnProbability: 0.62,
      keyFactors: [
        'Moderate usage decline',
        'Feature requests not implemented',
        'Seasonal business pattern',
      ],
      recommendedAction: 'Personalized onboarding session',
    },
  ]);

  const getRiskLevel = (score: number) => {
    if (score >= 80) return { level: 'Critical', color: 'bg-error/10 text-error border-error/30' };
    if (score >= 60) return { level: 'High', color: 'bg-warning/10 text-warning border-warning/30' };
    return { level: 'Medium', color: 'bg-accent-primary/10 text-accent-primary border-accent-primary/30' };
  };

  const handleTakeAction = (customerId: string) => {
    alert(`Opening intervention workflow for customer ${customerId}`);
  };

  const stats = [
    { label: 'At-Risk Customers', value: 342, icon: AlertCircle, color: 'red' },
    { label: 'Critical Risk', value: 45, icon: TrendingDown, color: 'red' },
    { label: 'Intervention Success', value: '76%', icon: CheckCircle, color: 'green' },
    { label: 'Avg. Recovery Time', value: '14 days', icon: Zap, color: 'blue' },
  ];

  return (
    <div className="p-6 lg:p-8 bg-primary-bg min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl lg:text-4xl font-bold text-text-primary">Churn Predictor</h1>
        <p className="text-text-secondary mt-2">AI-powered predictions and intervention recommendations</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label} className="text-center">
              <div className="flex justify-center mb-3">
                <div
                  className={`p-3 rounded-lg ${
                    stat.color === 'red'
                      ? 'bg-error/10 text-error'
                      : stat.color === 'green'
                      ? 'bg-success/10 text-success'
                      : 'bg-accent-primary/10 text-accent-primary'
                  }`}
                >
                  <Icon size={24} />
                </div>
              </div>
              <p className="text-3xl font-bold text-text-primary mb-1">{stat.value}</p>
              <p className="text-sm text-text-secondary">{stat.label}</p>
            </Card>
          );
        })}
      </div>

      {/* Predictions */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-text-primary mb-6">High-Risk Predictions</h2>

        {predictions.map((prediction) => {
          const risk = getRiskLevel(prediction.riskScore);
          return (
            <Card key={prediction.customerId}>
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Left: Customer Info */}
                <div className="lg:col-span-1">
                  <div className="w-12 h-12 rounded-lg bg-accent-primary/10 flex items-center justify-center mb-3">
                    <Users size={24} className="text-accent-primary" />
                  </div>
                  <h3 className="font-semibold text-text-primary mb-1">{prediction.customerName}</h3>
                  <p className="text-sm text-text-secondary">ID: {prediction.customerId}</p>
                </div>

                {/* Middle: Risk Assessment */}
                <div className="lg:col-span-2">
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-text-secondary">Churn Probability</span>
                      <span className="text-lg font-bold text-error">
                        {(prediction.churnProbability * 100).toFixed(0)}%
                      </span>
                    </div>
                    <div className="w-full h-2 bg-secondary-bg rounded-full overflow-hidden">
                      <div
                        className="h-full bg-error rounded-full transition-all"
                        style={{ width: `${prediction.churnProbability * 100}%` }}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <p className="text-sm font-medium text-text-secondary">Key Risk Factors:</p>
                    {prediction.keyFactors.map((factor, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-sm">
                        <span className="text-warning mt-0.5">•</span>
                        <span className="text-text-secondary">{factor}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Right: Risk Badge & Action */}
                <div className="lg:col-span-1 flex flex-col items-end justify-between">
                  <div className={`px-3 py-2 rounded-lg border ${risk.color} text-center w-full mb-4`}>
                    <p className="text-xs font-medium">Risk Level</p>
                    <p className="text-lg font-bold">{risk.level}</p>
                    <p className="text-sm mt-1">{prediction.riskScore}%</p>
                  </div>

                  <div className="w-full space-y-2">
                    <p className="text-xs font-medium text-text-secondary mb-2">
                      {prediction.recommendedAction}
                    </p>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => handleTakeAction(prediction.customerId)}
                      className="w-full"
                    >
                      Take Action
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Model Info */}
      <Card className="mt-8" title="Model Information" subtitle="Current prediction model stats">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <p className="text-sm text-text-secondary mb-2">Accuracy</p>
            <p className="text-2xl font-bold text-success">91.4%</p>
          </div>
          <div>
            <p className="text-sm text-text-secondary mb-2">Training Data</p>
            <p className="text-2xl font-bold text-accent-primary">12,500 customers</p>
          </div>
          <div>
            <p className="text-sm text-text-secondary mb-2">Last Updated</p>
            <p className="text-2xl font-bold text-text-primary">2 days ago</p>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default Predictor;
