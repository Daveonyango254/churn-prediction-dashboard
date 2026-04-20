import React, { useState } from 'react';
import { 
  Database, Cloud, Server, FileJson, Link2, CheckCircle2, 
  AlertCircle, Plus, ExternalLink, RefreshCw
} from 'lucide-react';

interface DataConnection {
  id: string;
  name: string;
  type: 'database' | 'api' | 'warehouse' | 'file';
  status: 'connected' | 'disconnected' | 'error';
  lastSync?: string;
  recordCount?: number;
}

const DataSource: React.FC = () => {
  const [connections] = useState<DataConnection[]>([
    {
      id: '1',
      name: 'Telco Customer Database',
      type: 'database',
      status: 'connected',
      lastSync: '2 minutes ago',
      recordCount: 7043
    }
  ]);

  const [showAddModal, setShowAddModal] = useState(false);

  const connectionTypes = [
    { 
      type: 'database', 
      icon: Database, 
      label: 'SQL Database',
      description: 'PostgreSQL, MySQL, SQL Server, or other relational databases',
      examples: ['PostgreSQL', 'MySQL', 'SQL Server', 'SQLite']
    },
    { 
      type: 'api', 
      icon: Link2, 
      label: 'REST API',
      description: 'Connect to external APIs that provide customer data',
      examples: ['Salesforce', 'HubSpot', 'Custom APIs']
    },
    { 
      type: 'warehouse', 
      icon: Cloud, 
      label: 'Data Warehouse',
      description: 'Cloud-based data warehouses for large-scale analytics',
      examples: ['BigQuery', 'Snowflake', 'Redshift', 'Databricks']
    },
    { 
      type: 'file', 
      icon: FileJson, 
      label: 'File Upload',
      description: 'Upload CSV or JSON files with customer data',
      examples: ['CSV', 'JSON', 'Parquet']
    }
  ];

  const getStatusBadge = (status: DataConnection['status']) => {
    switch (status) {
      case 'connected':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-50 text-emerald-700 text-xs rounded-full">
            <CheckCircle2 size={12} />
            Connected
          </span>
        );
      case 'error':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-red-50 text-red-700 text-xs rounded-full">
            <AlertCircle size={12} />
            Error
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full">
            Disconnected
          </span>
        );
    }
  };

  const getTypeIcon = (type: DataConnection['type']) => {
    switch (type) {
      case 'database': return Database;
      case 'api': return Link2;
      case 'warehouse': return Cloud;
      case 'file': return FileJson;
      default: return Server;
    }
  };

  return (
    <div className="p-4 lg:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-foreground">Data Sources</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Connect databases, APIs, or data warehouses to power the churn prediction model
          </p>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="btn-primary text-sm px-4 py-2 w-fit"
        >
          <Plus size={16} />
          Add Connection
        </button>
      </div>

      {/* Info Section */}
      <section className="card p-5">
        <h2 className="text-sm font-medium text-foreground mb-3">How Data Sources Work</h2>
        <p className="text-sm text-muted-foreground leading-relaxed mb-4">
          Data sources provide the customer records that are scored by the Random Forest model during live streaming. 
          When you start a demo session, synthetic customer profiles are generated based on the connected data schema. 
          In production, you would connect a real database or API endpoint to score actual customer records.
        </p>
        
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
          {connectionTypes.map(({ type, icon: Icon, label, description }) => (
            <div key={type} className="p-4 bg-secondary rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Icon size={16} className="text-primary" />
                <span className="text-sm font-medium text-foreground">{label}</span>
              </div>
              <p className="text-xs text-muted-foreground">{description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Active Connections */}
      <section className="card p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-medium text-foreground">Active Connections</h2>
          <span className="text-xs text-muted-foreground">{connections.length} source(s)</span>
        </div>

        {connections.length === 0 ? (
          <div className="text-center py-12">
            <Database size={40} className="mx-auto text-muted-foreground/40 mb-3" />
            <p className="text-sm text-muted-foreground">No data sources connected</p>
            <p className="text-xs text-muted-foreground mt-1">Add a connection to get started</p>
          </div>
        ) : (
          <div className="space-y-3">
            {connections.map((conn) => {
              const TypeIcon = getTypeIcon(conn.type);
              return (
                <div 
                  key={conn.id} 
                  className="flex items-center justify-between p-4 bg-secondary rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-background rounded-md">
                      <TypeIcon size={18} className="text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">{conn.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {conn.recordCount?.toLocaleString()} records
                        {conn.lastSync && ` · Synced ${conn.lastSync}`}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {getStatusBadge(conn.status)}
                    <button className="p-1.5 hover:bg-background rounded-md transition-colors">
                      <RefreshCw size={14} className="text-muted-foreground" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Schema Preview */}
      <section className="card p-5">
        <h2 className="text-sm font-medium text-foreground mb-3">Expected Data Schema</h2>
        <p className="text-xs text-muted-foreground mb-4">
          The model expects customer records with the following features for churn prediction:
        </p>
        
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-2 px-3 text-xs font-medium text-muted-foreground">Field</th>
                <th className="text-left py-2 px-3 text-xs font-medium text-muted-foreground">Type</th>
                <th className="text-left py-2 px-3 text-xs font-medium text-muted-foreground">Description</th>
              </tr>
            </thead>
            <tbody className="text-xs">
              {[
                { field: 'customerID', type: 'string', desc: 'Unique customer identifier' },
                { field: 'tenure', type: 'integer', desc: 'Months with service' },
                { field: 'MonthlyCharges', type: 'float', desc: 'Monthly bill amount' },
                { field: 'TotalCharges', type: 'float', desc: 'Cumulative charges' },
                { field: 'Contract', type: 'enum', desc: 'Month-to-month, One year, Two year' },
                { field: 'PaymentMethod', type: 'enum', desc: 'Electronic check, Credit card, etc.' },
                { field: 'InternetService', type: 'enum', desc: 'DSL, Fiber optic, No' },
                { field: 'OnlineSecurity', type: 'enum', desc: 'Yes, No, No internet service' },
                { field: 'TechSupport', type: 'enum', desc: 'Yes, No, No internet service' },
              ].map((row) => (
                <tr key={row.field} className="border-b border-border/50">
                  <td className="py-2 px-3 font-mono text-foreground">{row.field}</td>
                  <td className="py-2 px-3 text-muted-foreground">{row.type}</td>
                  <td className="py-2 px-3 text-muted-foreground">{row.desc}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Add Connection Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-card rounded-xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="p-5 border-b border-border">
              <h3 className="text-base font-semibold text-foreground">Add Data Source</h3>
              <p className="text-xs text-muted-foreground mt-1">Select a connection type to get started</p>
            </div>
            
            <div className="p-5 space-y-3">
              {connectionTypes.map(({ type, icon: Icon, label, description, examples }) => (
                <button
                  key={type}
                  className="w-full text-left p-4 bg-secondary hover:bg-secondary/80 rounded-lg transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-background rounded-md">
                      <Icon size={18} className="text-primary" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-foreground">{label}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {examples.map((ex) => (
                          <span key={ex} className="text-xs px-1.5 py-0.5 bg-background rounded text-muted-foreground">
                            {ex}
                          </span>
                        ))}
                      </div>
                    </div>
                    <ExternalLink size={14} className="text-muted-foreground mt-1" />
                  </div>
                </button>
              ))}
            </div>
            
            <div className="p-4 border-t border-border flex justify-end">
              <button 
                onClick={() => setShowAddModal(false)}
                className="btn-outline text-sm px-4 py-2"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DataSource;
