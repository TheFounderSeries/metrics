import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  icon?: React.ReactNode;
  highlight?: boolean;
}

const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  subtitle,
  trend,
  trendValue,
  icon,
  highlight = false
}) => {
  const getTrendColor = () => {
    switch (trend) {
      case 'up': return 'text-green-400';
      case 'down': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const getTrendIcon = () => {
    switch (trend) {
      case 'up': return <TrendingUp className="w-4 h-4" />;
      case 'down': return <TrendingDown className="w-4 h-4" />;
      default: return <Minus className="w-4 h-4" />;
    }
  };

  return (
    <div className={`bg-gray-900 border ${highlight ? 'border-blue-500 ring-2 ring-blue-500/20' : 'border-gray-700'} rounded-xl p-6 hover:border-gray-600 transition-all group`}>
      <div className="flex items-start justify-between mb-4">
        <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wide">
          {title}
        </h3>
        {icon && (
          <div className="text-gray-400 group-hover:text-gray-300 transition-colors">
            {icon}
          </div>
        )}
      </div>
      
      <div className="mb-2">
        <span className="text-3xl font-bold text-white">
          {value}
        </span>
      </div>

      {subtitle && (
        <p className="text-sm text-gray-400 mb-2">
          {subtitle}
        </p>
      )}

      {trend && trendValue && (
        <div className={`flex items-center gap-1 text-sm ${getTrendColor()}`}>
          {getTrendIcon()}
          <span>{trendValue}</span>
        </div>
      )}
    </div>
  );
};

export default MetricCard;