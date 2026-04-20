import React, { useState, useEffect } from 'react';
import { Sliders, AlertTriangle, CheckCircle, RefreshCw } from 'lucide-react';
import { loadMetadata, predictCustomer, Metadata, PredictionResponse } from '../api';

const RISK_COLORS = {
  low: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
  medium: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
  high: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200' }
};

const Predictor: React.FC = () => {
  const [metadata, setMetadata] = useState<Metadata | null>(null);
  const [profile, setProfile] = useState<Record<string, string | number>>({});
  const [result, setResult] = useState<PredictionResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [predicting, setPredicting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load metadata on mount
  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const data = await loadMetadata();
        setMetadata(data);
        setProfile(data.default_profile);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load metadata');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleChange = (field: string, value: string | number) => {
    setProfile(prev => ({ ...prev, [field]: value }));
  };

  const handlePredict = async () => {
    try {
      setPredicting(true);
      setError(null);
      const response = await predictCustomer(profile);
      setResult(response);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Prediction failed');
    } finally {
      setPredicting(false);
    }
  };

  const handleReset = () => {
    if (metadata) {
      setProfile(metadata.default_profile);
      setResult(null);
    }
  };

  const getRiskLevel = (probability: number) => {
    if (probability >= 0.7) return { label: 'High Risk', ...RISK_COLORS.high };
    if (probability >= 0.4) return { label: 'Medium Risk', ...RISK_COLORS.medium };
    return { label: 'Low Risk', ...RISK_COLORS.low };
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">Loading predictor options...</p>
        </div>
      </div>
    );
  }

  if (!metadata) {
    return (
      <div className="p-6">
        <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-lg text-sm">
          Failed to load predictor configuration. Please refresh the page.
        </div>
      </div>
    );
  }

  const { predictor_options } = metadata;

  // Organize fields into categories
  const numericFields = ['Tenure', 'MonthlyCharges', 'TotalCharges'];
  const categoricalFields = Object.keys(predictor_options).filter(
    k => !numericFields.includes(k) && Array.isArray(predictor_options[k])
  );

  return (
    <div className="p-4 lg:p-6 space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Sliders size={20} className="text-primary" />
          </div>
          <h1 className="text-xl font-semibold text-foreground">Predictor Workbench</h1>
        </div>
        <p className="text-sm text-muted-foreground">
          Adjust customer profile parameters and score with the Random Forest model
        </p>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Profile Editor */}
        <div className="lg:col-span-2 space-y-6">
          {/* Numeric Fields */}
          <section className="card p-5">
            <h3 className="text-sm font-medium text-foreground mb-4">Account Metrics</h3>
            <div className="grid sm:grid-cols-3 gap-4">
              {numericFields.map(field => {
                const opts = predictor_options[field];
                if (!opts || typeof opts === 'object' && 'min' in opts) {
                  const numOpts = opts as { min: number; max: number; step: number } | undefined;
                  return (
                    <div key={field}>
                      <label className="block text-xs text-muted-foreground mb-1.5">{field}</label>
                      <input
                        type="number"
                        value={profile[field] ?? ''}
                        onChange={(e) => handleChange(field, parseFloat(e.target.value) || 0)}
                        min={numOpts?.min}
                        max={numOpts?.max}
                        step={numOpts?.step || 1}
                        className="input"
                      />
                      {numOpts && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Range: {numOpts.min} - {numOpts.max}
                        </p>
                      )}
                    </div>
                  );
                }
                return null;
              })}
            </div>
          </section>

          {/* Categorical Fields */}
          <section className="card p-5">
            <h3 className="text-sm font-medium text-foreground mb-4">Customer Profile</h3>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {categoricalFields.map(field => {
                const options = predictor_options[field] as string[];
                return (
                  <div key={field}>
                    <label className="block text-xs text-muted-foreground mb-1.5">{field}</label>
                    <select
                      value={profile[field] ?? ''}
                      onChange={(e) => handleChange(field, e.target.value)}
                      className="select"
                    >
                      {options.map(opt => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Actions */}
          <div className="flex flex-wrap gap-3">
            <button
              onClick={handlePredict}
              disabled={predicting}
              className="btn-primary"
            >
              {predicting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Scoring...
                </>
              ) : (
                'Score Customer'
              )}
            </button>
            <button
              onClick={handleReset}
              className="btn-secondary"
            >
              <RefreshCw size={16} />
              Reset to Default
            </button>
          </div>
        </div>

        {/* Results Panel */}
        <div className="lg:col-span-1">
          <div className="card p-5 sticky top-6">
            <h3 className="text-sm font-medium text-foreground mb-4">Prediction Result</h3>
            
            {result ? (
              <div className="space-y-4">
                {/* Risk Score */}
                <div className={`p-4 rounded-lg border ${getRiskLevel(result.probability).bg} ${getRiskLevel(result.probability).border}`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className={`text-sm font-medium ${getRiskLevel(result.probability).text}`}>
                      {getRiskLevel(result.probability).label}
                    </span>
                    {result.probability >= 0.5 ? (
                      <AlertTriangle size={18} className={getRiskLevel(result.probability).text} />
                    ) : (
                      <CheckCircle size={18} className={getRiskLevel(result.probability).text} />
                    )}
                  </div>
                  <p className={`text-3xl font-bold ${getRiskLevel(result.probability).text}`}>
                    {(result.probability * 100).toFixed(1)}%
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">Churn Probability</p>
                </div>

                {/* Prediction Label */}
                <div className="p-3 bg-secondary rounded-lg">
                  <p className="text-xs text-muted-foreground">Model Prediction</p>
                  <p className="text-sm font-medium text-foreground mt-0.5">
                    {result.prediction === 'Yes' ? 'Likely to Churn' : 'Likely to Stay'}
                  </p>
                </div>

                {/* Risk Notes */}
                {result.risk_notes && result.risk_notes.length > 0 && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-2">Risk Factors</p>
                    <ul className="space-y-1.5">
                      {result.risk_notes.map((note, idx) => (
                        <li key={idx} className="text-xs text-foreground flex items-start gap-2">
                          <span className="text-amber-500 mt-0.5">•</span>
                          {note}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Customer ID */}
                <div className="pt-3 border-t border-border">
                  <p className="text-xs text-muted-foreground">Customer ID</p>
                  <p className="text-sm font-mono text-foreground">{result.customer.customerID}</p>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <Sliders size={32} className="text-muted-foreground mx-auto mb-3 opacity-50" />
                <p className="text-sm text-muted-foreground">
                  Adjust the profile and click "Score Customer" to see predictions
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Model Info */}
      <section className="card p-5">
        <h3 className="text-sm font-medium text-foreground mb-3">About the Model</h3>
        <div className="grid sm:grid-cols-3 gap-4 text-sm">
          <div>
            <p className="text-muted-foreground">Algorithm</p>
            <p className="font-medium text-foreground">Random Forest Classifier</p>
          </div>
          <div>
            <p className="text-muted-foreground">Training Data</p>
            <p className="font-medium text-foreground">{metadata.historical_rows.toLocaleString()} customers</p>
          </div>
          <div>
            <p className="text-muted-foreground">Features</p>
            <p className="font-medium text-foreground">{metadata.feature_columns.length} input features</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Predictor;
