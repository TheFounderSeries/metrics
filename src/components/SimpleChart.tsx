import React from 'react';

interface DataPoint {
  label: string;
  value: number;
  color?: string;
}

interface SimpleChartProps {
  data: DataPoint[];
  type: 'bar' | 'line' | 'pie';
  height?: number;
}

const SimpleChart: React.FC<SimpleChartProps> = ({ data, type, height = 200 }) => {
  const maxValue = Math.max(...data.map(d => d.value));

  if (type === 'bar') {
    return (
      <div className="flex items-end justify-between h-full space-x-2">
        {data.map((item, index) => (
          <div key={index} className="flex-1 flex flex-col items-center">
            <div className="w-full bg-gray-700 rounded-t-lg relative overflow-hidden">
              <div
                className={`${item.color || 'bg-blue-500'} rounded-t-lg transition-all duration-1000 ease-out`}
                style={{
                  height: `${(item.value / maxValue) * height}px`,
                  minHeight: '4px'
                }}
              ></div>
            </div>
            <span className="text-xs text-gray-400 mt-2 text-center">
              {item.label}
            </span>
            <span className="text-sm font-medium text-white">
              {item.value.toLocaleString()}
            </span>
          </div>
        ))}
      </div>
    );
  }

  if (type === 'line') {
    return (
      <div className="relative h-full">
        <svg className="w-full h-full" viewBox={`0 0 400 ${height}`}>
          <polyline
            fill="none"
            stroke="#3B82F6"
            strokeWidth="3"
            points={data.map((item, index) => 
              `${(index / (data.length - 1)) * 380 + 10},${height - (item.value / maxValue) * (height - 20) - 10}`
            ).join(' ')}
          />
          {data.map((item, index) => (
            <circle
              key={index}
              cx={(index / (data.length - 1)) * 380 + 10}
              cy={height - (item.value / maxValue) * (height - 20) - 10}
              r="4"
              fill="#3B82F6"
            />
          ))}
        </svg>
        <div className="flex justify-between mt-2">
          {data.map((item, index) => (
            <div key={index} className="text-center">
              <span className="text-xs text-gray-400">{item.label}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center h-full">
      <div className="text-gray-400">Chart type not implemented</div>
    </div>
  );
};

export default SimpleChart;