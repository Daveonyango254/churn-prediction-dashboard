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
    blue: 'bg-primary/10 border-primary/30',
    green: 'bg-green-500/10 border-green-500/30',
    red: 'bg-destructive/10 border-destructive/30',
    orange: 'bg-orange-500/10 border-orange-500/30',
  };

  const iconColorClasses = {
    blue: 'text-primary',
    green: 'text-green-500',
    red: 'text-destructive',
    orange: 'text-orange-500',
  };

  return (
    <div className="bg-card border border-border rounded-xl p-6 transition-all hover:border-primary/50 hover:shadow-lg">
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-sm text-muted-foreground mb-1">{label}</p>
          <p className="text-2xl lg:text-3xl font-bold text-foreground">{value}</p>
        </div>
        {icon && (
          <div className={`p-3 rounded-lg ${colorClasses[color]} border`}>
            <div className={iconColorClasses[color]}>{icon}</div>
          </div>
        )}
      </div>
      {change !== undefined && (
        <div className={`flex items-center gap-1 text-sm ${change >= 0 ? 'text-green-500' : 'text-destructive'}`}>
          {change >= 0 ? (
            <TrendingUp size={14} />
          ) : (
            <TrendingDown size={14} />
          )}
          <span>{Math.abs(change)}% from last month</span>
        </div>
      )}
    </div>
  );
};

export default StatCard;
