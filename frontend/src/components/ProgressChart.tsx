import React, { useEffect, useState } from 'react';
import { LucideProps } from 'lucide-react';
import './ProgressChart.css';

interface ProgressChartProps {
  value: number;
  max: number;
  label: string;
  icon: React.ForwardRefExoticComponent<Omit<LucideProps, "ref"> & React.RefAttributes<SVGSVGElement>>;
  color?: string; // We will use dynamic color primarily now
  unit?: string;
}

const ProgressChart: React.FC<ProgressChartProps> = ({ 
  value, 
  max, 
  label, 
  icon: Icon, 
  unit = '' 
}) => {
  const percentage = Math.min((value / max) * 100, 100);
  const circumference = 2 * Math.PI * 45;
  const [dashoffset, setDashoffset] = useState(circumference);

  // Animate the ring drawing itself on load
  useEffect(() => {
    const timeout = setTimeout(() => {
      setDashoffset(circumference - (percentage / 100) * circumference);
    }, 150);
    return () => clearTimeout(timeout);
  }, [percentage, circumference]);

  // Dynamic Color based on completion %
  const getDynamicColor = () => {
    if (percentage < 33) return '#fbbf24'; // Amber
    if (percentage < 66) return '#22d3ee'; // Vivid Teal/Cyan
    return '#10b981'; // Green
  };

  const activeColor = getDynamicColor();

  return (
    <div className="progress-chart">
      <div className="chart-header">
        <Icon size={20} className="chart-icon" style={{ color: activeColor }} />
        <span className="chart-label">{label}</span>
      </div>
      
      <div className="chart-container">
        <svg className="progress-ring" width="120" height="120">
          {/* Subtle blurred drop shadow for the glowing effect */}
          <defs>
            <filter id={`glow-${label.replace(/\s+/g, '-')}`}>
              <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>
          
          <circle
            className="progress-ring-bg"
            cx="60"
            cy="60"
            r="45"
            fill="none"
            stroke="rgba(255, 255, 255, 0.05)"
            strokeWidth="8"
          />
          <circle
            className="progress-ring-fill"
            cx="60"
            cy="60"
            r="45"
            fill="none"
            stroke={activeColor}
            strokeWidth="8"
            strokeLinecap="round"
            filter={`url(#glow-${label.replace(/\s+/g, '-')})`}
            style={{
              strokeDasharray: circumference,
              strokeDashoffset: dashoffset,
              transform: 'rotate(-90deg)',
              transformOrigin: '60px 60px',
              transition: 'stroke-dashoffset 1.5s cubic-bezier(0.4, 0, 0.2, 1)'
            }}
          />
        </svg>
        
        <div className="chart-value">
          <span className="value-number">{value}</span>
          <span className="value-separator">/</span>
          <span className="value-max">{max}</span>
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
              backgroundColor: activeColor 
            }}
          ></div>
        </div>
      </div>
    </div>
  );
};

export default ProgressChart;
