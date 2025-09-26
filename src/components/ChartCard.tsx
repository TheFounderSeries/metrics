import React from 'react';

interface ChartCardProps {
  title: string;
  children: React.ReactNode;
  subtitle?: string;
}

const ChartCard: React.FC<ChartCardProps> = ({ title, children, subtitle }) => {
  return (
    <div className="bg-gray-900 border border-gray-700 rounded-xl p-6 hover:border-gray-600 transition-all">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-white mb-1">
          {title}
        </h3>
        {subtitle && (
          <p className="text-sm text-gray-400">
            {subtitle}
          </p>
        )}
      </div>
      <div className="h-64">
        {children}
      </div>
    </div>
  );
};

export default ChartCard;