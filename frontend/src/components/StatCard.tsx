import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface StatCardProps {
  label: string;
  value: string | number;
  change?: number;
  icon?: React.ReactNode;
  color?: 'blue' | 'green' | 'red' | 'orange';
}

const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  change,
  icon,
  color = 'blue',
}) => {
  const colorClasses = {
    blue: 'bg-accent-primary/10 border-accent-primary/30',
    green: 'bg-success/10 border-success/30',
    red: 'bg-error/10 border-error/30',
    orange: 'bg-warning/10 border-warning/30',
  };

  const iconColorClasses = {
    blue: 'text-accent-primary',
    green: 'text-success',
    red: 'text-error',
    orange: 'text-warning',
  };

  return (
    <div className="stat-card group">
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="stat-label">{label}</p>
          <p className="stat-value">{value}</p>
        </div>
        {icon && (
          <div
            className={`p-3 rounded-lg ${colorClasses[color]} border`}
          >
            <div className={iconColorClasses[color]}>{icon}</div>
          </div>
        )}
      </div>
      {change !== undefined && (
        <div className={`stat-change ${change >= 0 ? 'positive' : 'negative'}`}>
          <div className="flex items-center gap-1">
            {change >= 0 ? (
              <TrendingUp size={14} />
            ) : (
              <TrendingDown size={14} />
            )}
            <span>{Math.abs(change)}% from last month</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default StatCard;
