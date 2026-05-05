import React from 'react';
import { LucideProps } from 'lucide-react';
import './ProgressChart.css';

interface ProgressChartProps {
  value: number;
  max: number;
  label: string;
  icon: React.ForwardRefExoticComponent<Omit<LucideProps, "ref"> & React.RefAttributes<SVGSVGElement>>;
  color: string;
  unit?: string;
}

const ProgressChart: React.FC<ProgressChartProps> = ({ 
  value, 
  max, 
  label, 
  icon: Icon, 
  color,
  unit = '' 
}) => {
  const percentage = Math.min((value / max) * 100, 100);
  const circumference = 2 * Math.PI * 45;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="progress-chart">
      <div className="chart-header">
        <Icon size={20} className="chart-icon" color={color} />
        <span className="chart-label">{label}</span>
      </div>
      
      <div className="chart-container">
        <svg className="progress-ring" width="120" height="120">
          <circle
            className="progress-ring-bg"
            cx="60"
            cy="60"
            r="45"
            fill="none"
            stroke="rgba(255, 255, 255, 0.1)"
            strokeWidth="8"
          />
          <circle
            className="progress-ring-fill"
            cx="60"
            cy="60"
            r="45"
            fill="none"
            stroke={color}
            strokeWidth="8"
            strokeLinecap="round"
            style={{
              strokeDasharray: circumference,
              strokeDashoffset,
              transform: 'rotate(-90deg)',
              transformOrigin: '60px 60px',
              transition: 'stroke-dashoffset 1s ease-in-out'
            }}
          />
        </svg>
        
        <div className="chart-value">
          <span className="value-number">{value}</span>
          <span className="value-unit">{unit}</span>
        </div>
      </div>
      
      <div className="chart-footer">
        <span className="progress-text">{percentage.toFixed(0)}% of goal</span>
        <div className="progress-bar">
          <div 
            className="progress-fill" 
            style={{ 
              width: `${percentage}%`,
              backgroundColor: color 
            }}
          ></div>
        </div>
      </div>
    </div>
  );
};

export default ProgressChart;
