
import React from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Cell 
} from 'recharts';

interface ComprehensionData {
  segment: string;
  score: number;
}

interface ComprehensionChartProps {
  data: ComprehensionData[];
}

const ComprehensionChart: React.FC<ComprehensionChartProps> = ({ data }) => {
  return (
    <div className="w-full h-64">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
          <XAxis 
            dataKey="segment" 
            axisLine={false} 
            tickLine={false} 
            style={{ fontSize: '10px', fontWeight: 600, fill: '#94a3b8' }}
          />
          <YAxis 
            domain={[0, 100]}
            axisLine={false} 
            tickLine={false} 
            style={{ fontSize: '10px', fontWeight: 600, fill: '#94a3b8' }}
          />
          <Tooltip 
            cursor={{ fill: '#f8fafc' }}
            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
          />
          <Bar dataKey="score" radius={[4, 4, 0, 0]} barSize={32}>
            {data.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={entry.score > 80 ? '#10b981' : entry.score > 60 ? '#a855f7' : '#f97316'} 
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ComprehensionChart;
