export const formatNumber = (value: number): string => {
  if (value >= 1000000) {
    return (value / 1000000).toFixed(1) + 'M';
  }
  if (value >= 1000) {
    return (value / 1000).toFixed(1) + 'K';
  }
  return value.toString();
};

export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

export const formatPercentage = (value: number): string => {
  return `${value.toFixed(1)}%`;
};

export const getChartColor = (index: number): string => {
  const colors = [
    '#3b82f6', // blue
    '#10b981', // green
    '#f59e0b', // amber
    '#ef4444', // red
    '#8b5cf6', // purple
    '#ec4899', // pink
  ];
  return colors[index % colors.length];
};

export const mockChartData = [
  { month: 'Jan', value: 4000, retention: 88 },
  { month: 'Feb', value: 3000, retention: 86 },
  { month: 'Mar', value: 2000, retention: 90 },
  { month: 'Apr', value: 2780, retention: 85 },
  { month: 'May', value: 1890, retention: 92 },
  { month: 'Jun', value: 2390, retention: 91 },
];
