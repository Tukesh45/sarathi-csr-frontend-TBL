import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, LabelList } from 'recharts';

interface AnalyticsChartProps {
  data: { name: string; value: number; target: number }[];
  title?: string;
}

const AnalyticsChart: React.FC<AnalyticsChartProps> = ({ data, title }) => {
  if (!data || data.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-state-illustration">📊</div>
        <div className="mb-2 font-bold">No Data Yet</div>
        <div>Start by adding your first project or progress entry!</div>
      </div>
    );
  }
  return (
    <div className="card p-4">
      {title && <h3 className="mb-3">{title}</h3>}
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={data} margin={{ top: 16, right: 24, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="value" fill="#3b82f6">
            <LabelList dataKey="value" position="top" />
          </Bar>
          <Bar dataKey="target" fill="#d1fae5" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default AnalyticsChart; 