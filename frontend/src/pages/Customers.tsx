import React, { useState } from 'react';
import {
  Search,
  ChevronUp,
  ChevronDown,
  AlertTriangle,
  MoreVertical,
  Eye,
} from 'lucide-react';
import Card from '../components/Card';
import Button from '../components/Button';

interface Customer {
  id: string;
  name: string;
  email: string;
  segment: string;
  mrr: number;
  churnRisk: 'low' | 'medium' | 'high';
  riskScore: number;
  status: 'active' | 'at-risk' | 'churned';
  joinDate: string;
}

const Customers: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'risk' | 'mrr'>('risk');
  const [filterRisk, setFilterRisk] = useState<'all' | 'high' | 'medium' | 'low'>('all');

  const mockCustomers: Customer[] = [
    {
      id: '1',
      name: 'Acme Corp',
      email: 'contact@acme.com',
      segment: 'Enterprise',
      mrr: 15000,
      churnRisk: 'high',
      riskScore: 87,
      status: 'at-risk',
      joinDate: '2022-01-15',
    },
    {
      id: '2',
      name: 'TechStart Inc',
      email: 'info@techstart.com',
      segment: 'Mid-Market',
      mrr: 5000,
      churnRisk: 'medium',
      riskScore: 62,
      status: 'active',
      joinDate: '2022-06-20',
    },
    {
      id: '3',
      name: 'Growth Labs',
      email: 'hello@growthlabs.com',
      segment: 'SMB',
      mrr: 2000,
      churnRisk: 'low',
      riskScore: 28,
      status: 'active',
      joinDate: '2023-02-10',
    },
    {
      id: '4',
      name: 'Digital Solutions',
      email: 'support@digital.com',
      segment: 'Enterprise',
      mrr: 12000,
      churnRisk: 'high',
      riskScore: 92,
      status: 'at-risk',
      joinDate: '2021-09-05',
    },
    {
      id: '5',
      name: 'CloudFirst Ltd',
      email: 'team@cloudfirst.com',
      segment: 'Mid-Market',
      mrr: 4500,
      churnRisk: 'low',
      riskScore: 15,
      status: 'active',
      joinDate: '2023-05-12',
    },
    {
      id: '6',
      name: 'DataViz Pro',
      email: 'contact@dataviz.com',
      segment: 'SMB',
      mrr: 1500,
      churnRisk: 'medium',
      riskScore: 58,
      status: 'active',
      joinDate: '2023-07-25',
    },
  ];

  let filtered = mockCustomers.filter((c) =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (filterRisk !== 'all') {
    filtered = filtered.filter((c) => c.churnRisk === filterRisk);
  }

  filtered.sort((a, b) => {
    if (sortBy === 'name') return a.name.localeCompare(b.name);
    if (sortBy === 'risk') return b.riskScore - a.riskScore;
    if (sortBy === 'mrr') return b.mrr - a.mrr;
    return 0;
  });

  const getRiskColor = (risk: string) => {
    if (risk === 'high') return 'bg-error/10 text-error border-error/30';
    if (risk === 'medium') return 'bg-warning/10 text-warning border-warning/30';
    return 'bg-success/10 text-success border-success/30';
  };

  return (
    <div className="p-6 lg:p-8 bg-primary-bg min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl lg:text-4xl font-bold text-text-primary">Customers</h1>
        <p className="text-text-secondary mt-2">Manage and monitor your customer base for churn risk.</p>
      </div>

      {/* Filters and Search */}
      <Card className="mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Search */}
          <div className="lg:col-span-2">
            <div className="flex items-center bg-tertiary-bg border border-border-color rounded-lg px-3 gap-2">
              <Search size={18} className="text-text-secondary" />
              <input
                type="text"
                placeholder="Search customers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="premium-input border-none bg-transparent p-2 flex-1"
              />
            </div>
          </div>

          {/* Sort */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="premium-input"
          >
            <option value="risk">Sort by Risk</option>
            <option value="name">Sort by Name</option>
            <option value="mrr">Sort by MRR</option>
          </select>

          {/* Filter */}
          <select
            value={filterRisk}
            onChange={(e) => setFilterRisk(e.target.value as any)}
            className="premium-input"
          >
            <option value="all">All Risks</option>
            <option value="high">High Risk</option>
            <option value="medium">Medium Risk</option>
            <option value="low">Low Risk</option>
          </select>
        </div>
      </Card>

      {/* Customers Table */}
      <div className="grid grid-cols-1 gap-4">
        {filtered.map((customer) => (
          <Card key={customer.id} className="hover:border-accent-primary transition-colors">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              {/* Left: Customer Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-lg bg-accent-primary/10 flex items-center justify-center flex-shrink-0">
                    <span className="font-semibold text-accent-primary text-lg">
                      {customer.name.charAt(0)}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-text-primary truncate">{customer.name}</h3>
                    <p className="text-sm text-text-secondary truncate">{customer.email}</p>
                    <div className="flex flex-wrap gap-2 mt-2">
                      <span className="text-xs px-2 py-1 rounded bg-secondary-bg text-text-secondary border border-border-color">
                        {customer.segment}
                      </span>
                      <span className="text-xs px-2 py-1 rounded bg-secondary-bg text-accent-primary border border-accent-primary/30">
                        ${customer.mrr.toLocaleString()}/mo
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right: Risk and Actions */}
              <div className="flex flex-col md:flex-row md:items-center gap-4 md:justify-end">
                {/* Risk Score */}
                <div className={`flex items-center gap-2 px-3 py-2 rounded-lg border ${getRiskColor(customer.churnRisk)}`}>
                  {customer.churnRisk === 'high' && <AlertTriangle size={16} />}
                  <div>
                    <p className="text-xs font-medium">Risk Score</p>
                    <p className="text-lg font-bold">{customer.riskScore}%</p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <Button variant="secondary" size="sm" icon={<Eye size={16} />}>
                    View
                  </Button>
                  <button className="p-2 hover:bg-hover-bg rounded-lg transition-colors">
                    <MoreVertical size={16} className="text-text-secondary" />
                  </button>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {filtered.length === 0 && (
        <Card className="text-center py-12">
          <div className="flex flex-col items-center gap-4">
            <AlertTriangle size={48} className="text-text-secondary/30" />
            <p className="text-text-secondary">No customers found matching your filters</p>
          </div>
        </Card>
      )}
    </div>
  );
};

export default Customers;
