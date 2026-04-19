import React, { useState, useEffect } from 'react';
import {
  Settings,
  Database,
  Activity,
  RefreshCw,
  CheckCircle,
  AlertTriangle,
  Server,
  Cpu,
  HardDrive,
  Globe,
  Play,
  Pause,
  RotateCcw,
  Download,
  Upload,
  Trash2,
  Shield,
  Users,
  Key,
  Zap,
} from 'lucide-react';
import Card from '../components/Card';
import Button from '../components/Button';

interface SystemStatus {
  api: 'online' | 'offline' | 'degraded';
  database: 'online' | 'offline' | 'degraded';
  ml_model: 'online' | 'offline' | 'degraded';
  streaming: 'active' | 'paused' | 'stopped';
}

interface ModelConfig {
  threshold: number;
  retrainInterval: number;
  features: string[];
  lastTraining: string;
  accuracy: number;
}

const Admin: React.FC = () => {
  const [systemStatus, setSystemStatus] = useState<SystemStatus>({
    api: 'online',
    database: 'online',
    ml_model: 'online',
    streaming: 'active',
  });

  const [modelConfig, setModelConfig] = useState<ModelConfig>({
    threshold: 0.65,
    retrainInterval: 7,
    features: ['tenure', 'usage_rate', 'support_tickets', 'payment_delays', 'nps_score'],
    lastTraining: '2026-04-15',
    accuracy: 91.4,
  });

  const [isRetraining, setIsRetraining] = useState(false);
  const [streamingEnabled, setStreamingEnabled] = useState(true);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleRetrain = async () => {
    setIsRetraining(true);
    // Simulate retraining
    setTimeout(() => {
      setIsRetraining(false);
      setModelConfig((prev) => ({
        ...prev,
        lastTraining: new Date().toISOString().split('T')[0],
        accuracy: 92.1,
      }));
    }, 3000);
  };

  const handleSaveConfig = () => {
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online':
      case 'active':
        return 'text-success bg-success/10';
      case 'degraded':
      case 'paused':
        return 'text-warning bg-warning/10';
      default:
        return 'text-destructive bg-destructive/10';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'online':
      case 'active':
        return <CheckCircle size={16} />;
      case 'degraded':
      case 'paused':
        return <AlertTriangle size={16} />;
      default:
        return <AlertTriangle size={16} />;
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 bg-background min-h-screen">
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground">Admin Configuration</h1>
            <p className="text-muted-foreground mt-2">System management and ML model configuration</p>
          </div>
          <Button
            variant="primary"
            icon={<RefreshCw size={18} className={isRetraining ? 'animate-spin' : ''} />}
            onClick={handleRetrain}
            disabled={isRetraining}
          >
            {isRetraining ? 'Retraining...' : 'Retrain Model'}
          </Button>
        </div>
      </div>

      {/* Success Message */}
      {saveSuccess && (
        <div className="mb-6 p-4 rounded-lg bg-success/10 border border-success/30 text-success flex items-center gap-2">
          <CheckCircle size={20} />
          <span>Configuration saved successfully!</span>
        </div>
      )}

      {/* System Status */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
        {[
          { label: 'API Status', value: systemStatus.api, icon: Server },
          { label: 'Database', value: systemStatus.database, icon: Database },
          { label: 'ML Model', value: systemStatus.ml_model, icon: Cpu },
          { label: 'Streaming', value: systemStatus.streaming, icon: Activity },
        ].map((item) => {
          const Icon = item.icon;
          return (
            <Card key={item.label} className="!p-4">
              <div className="flex items-center gap-3">
                <div className={`p-2 sm:p-3 rounded-lg ${getStatusColor(item.value)}`}>
                  <Icon size={20} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs sm:text-sm text-muted-foreground truncate">{item.label}</p>
                  <div className="flex items-center gap-1.5 mt-1">
                    {getStatusIcon(item.value)}
                    <span className="font-semibold text-sm sm:text-base text-foreground capitalize">
                      {item.value}
                    </span>
                  </div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Model Configuration */}
        <Card title="Model Configuration" subtitle="Adjust ML model parameters">
          <div className="space-y-6">
            {/* Churn Threshold */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Churn Risk Threshold
              </label>
              <div className="flex items-center gap-4">
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={modelConfig.threshold * 100}
                  onChange={(e) =>
                    setModelConfig((prev) => ({
                      ...prev,
                      threshold: parseInt(e.target.value) / 100,
                    }))
                  }
                  className="flex-1 h-2 bg-secondary rounded-lg appearance-none cursor-pointer accent-primary"
                />
                <span className="w-16 text-center font-semibold text-primary text-lg">
                  {Math.round(modelConfig.threshold * 100)}%
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Customers above this threshold are flagged as high risk
              </p>
            </div>

            {/* Retrain Interval */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Automatic Retrain Interval (days)
              </label>
              <select
                value={modelConfig.retrainInterval}
                onChange={(e) =>
                  setModelConfig((prev) => ({
                    ...prev,
                    retrainInterval: parseInt(e.target.value),
                  }))
                }
                className="premium-input"
              >
                <option value={1}>Daily</option>
                <option value={7}>Weekly</option>
                <option value={14}>Bi-weekly</option>
                <option value={30}>Monthly</option>
              </select>
            </div>

            {/* Model Stats */}
            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border">
              <div>
                <p className="text-sm text-muted-foreground">Model Accuracy</p>
                <p className="text-2xl font-bold text-success">{modelConfig.accuracy}%</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Last Training</p>
                <p className="text-lg font-semibold text-foreground">{modelConfig.lastTraining}</p>
              </div>
            </div>
          </div>
        </Card>

        {/* Feature Selection */}
        <Card title="Feature Selection" subtitle="Select features for churn prediction">
          <div className="space-y-3">
            {[
              { id: 'tenure', label: 'Customer Tenure', description: 'Time since signup' },
              { id: 'usage_rate', label: 'Usage Rate', description: 'Product usage frequency' },
              { id: 'support_tickets', label: 'Support Tickets', description: 'Number of support requests' },
              { id: 'payment_delays', label: 'Payment Delays', description: 'Late payment history' },
              { id: 'nps_score', label: 'NPS Score', description: 'Net Promoter Score' },
              { id: 'login_frequency', label: 'Login Frequency', description: 'How often user logs in' },
              { id: 'feature_adoption', label: 'Feature Adoption', description: 'Features used vs available' },
            ].map((feature) => (
              <label
                key={feature.id}
                className="flex items-center gap-3 p-3 rounded-lg bg-secondary hover:bg-muted cursor-pointer transition-colors"
              >
                <input
                  type="checkbox"
                  checked={modelConfig.features.includes(feature.id)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setModelConfig((prev) => ({
                        ...prev,
                        features: [...prev.features, feature.id],
                      }));
                    } else {
                      setModelConfig((prev) => ({
                        ...prev,
                        features: prev.features.filter((f) => f !== feature.id),
                      }));
                    }
                  }}
                  className="w-5 h-5 rounded border-border text-primary focus:ring-primary accent-primary"
                />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-foreground text-sm">{feature.label}</p>
                  <p className="text-xs text-muted-foreground">{feature.description}</p>
                </div>
              </label>
            ))}
          </div>
        </Card>

        {/* Streaming Configuration */}
        <Card title="Live Streaming" subtitle="Configure real-time data streaming">
          <div className="space-y-4">
            {/* Streaming Toggle */}
            <div className="flex items-center justify-between p-4 rounded-lg bg-secondary">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${streamingEnabled ? 'bg-success/10 text-success' : 'bg-muted text-muted-foreground'}`}>
                  <Activity size={20} />
                </div>
                <div>
                  <p className="font-medium text-foreground">Real-time Streaming</p>
                  <p className="text-sm text-muted-foreground">Process customer data in real-time</p>
                </div>
              </div>
              <button
                onClick={() => setStreamingEnabled(!streamingEnabled)}
                className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${
                  streamingEnabled ? 'bg-primary' : 'bg-muted border border-border'
                }`}
              >
                <span
                  className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                    streamingEnabled ? 'translate-x-7' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {/* Streaming Stats */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-lg bg-secondary text-center">
                <p className="text-2xl font-bold text-primary">1,247</p>
                <p className="text-xs text-muted-foreground mt-1">Events/minute</p>
              </div>
              <div className="p-4 rounded-lg bg-secondary text-center">
                <p className="text-2xl font-bold text-success">99.8%</p>
                <p className="text-xs text-muted-foreground mt-1">Uptime</p>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex flex-wrap gap-2">
              <Button variant="secondary" size="sm" icon={<Play size={16} />}>
                Start
              </Button>
              <Button variant="secondary" size="sm" icon={<Pause size={16} />}>
                Pause
              </Button>
              <Button variant="secondary" size="sm" icon={<RotateCcw size={16} />}>
                Restart
              </Button>
            </div>
          </div>
        </Card>

        {/* Data Management */}
        <Card title="Data Management" subtitle="Import, export, and manage data">
          <div className="space-y-4">
            {/* Import/Export */}
            <div className="grid grid-cols-2 gap-3">
              <Button variant="secondary" icon={<Upload size={18} />} fullWidth>
                Import Data
              </Button>
              <Button variant="secondary" icon={<Download size={18} />} fullWidth>
                Export Data
              </Button>
            </div>

            {/* Data Stats */}
            <div className="p-4 rounded-lg bg-secondary space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Total Customers</span>
                <span className="font-semibold text-foreground">12,547</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Training Records</span>
                <span className="font-semibold text-foreground">45,892</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Last Sync</span>
                <span className="font-semibold text-success">2 min ago</span>
              </div>
            </div>

            {/* Danger Zone */}
            <div className="pt-4 border-t border-border">
              <p className="text-sm font-medium text-destructive mb-3">Danger Zone</p>
              <Button variant="danger" size="sm" icon={<Trash2 size={16} />}>
                Clear All Data
              </Button>
            </div>
          </div>
        </Card>

        {/* API Keys */}
        <Card title="API Keys" subtitle="Manage integration keys" className="lg:col-span-2">
          <div className="space-y-4">
            {[
              { name: 'Production API Key', key: 'sk_prod_****************************', status: 'active', lastUsed: '2 min ago' },
              { name: 'Development API Key', key: 'sk_dev_*****************************', status: 'active', lastUsed: '1 hour ago' },
              { name: 'Webhook Secret', key: 'whsec_****************************', status: 'active', lastUsed: '5 min ago' },
            ].map((apiKey, idx) => (
              <div
                key={idx}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-lg bg-secondary"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="p-2 rounded-lg bg-primary/10 text-primary">
                    <Key size={18} />
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium text-foreground text-sm">{apiKey.name}</p>
                    <p className="text-xs text-muted-foreground font-mono truncate">{apiKey.key}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 justify-between sm:justify-end">
                  <span className="text-xs text-muted-foreground">Used {apiKey.lastUsed}</span>
                  <Button variant="ghost" size="sm">
                    Regenerate
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Save Button */}
      <div className="mt-8 flex flex-col sm:flex-row gap-3">
        <Button variant="primary" icon={<Zap size={18} />} onClick={handleSaveConfig}>
          Save Configuration
        </Button>
        <Button variant="secondary">
          Reset to Defaults
        </Button>
      </div>
    </div>
  );
};

export default Admin;
