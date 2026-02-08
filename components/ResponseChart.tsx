
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
import { FormProject } from '../types';

interface ResponseChartProps {
  projects: FormProject[];
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-900 border-none rounded-[1.5rem] p-4 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        <p className="text-[10px] font-bold text-purple-400 uppercase tracking-widest mb-1">Intelligence Point</p>
        <p className="text-sm font-bold text-white mb-2">{label}</p>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-purple-500" />
          <p className="text-xs font-medium text-slate-300">
            {payload[0].value} Validated Responses
          </p>
        </div>
      </div>
    );
  }
  return null;
};

const ResponseChart: React.FC<ResponseChartProps> = ({ projects }) => {
  // Prepare data for visualization - Top 6 most active forms
  const data = projects
    .sort((a, b) => b.responsesCount - a.responsesCount)
    .slice(0, 6)
    .map(p => ({
      name: p.title.length > 15 ? p.title.substring(0, 12) + '...' : p.title,
      responses: p.responsesCount,
      fullName: p.title
    }));

  return (
    <div className="w-full h-full min-h-[320px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 20 }}>
          <defs>
            <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#a855f7" />
              <stop offset="50%" stopColor="#ec4899" />
              <stop offset="100%" stopColor="#f97316" />
            </linearGradient>
          </defs>
          <CartesianGrid 
            strokeDasharray="3 3" 
            vertical={false} 
            stroke="#f1f5f9" 
          />
          <XAxis 
            dataKey="name" 
            axisLine={false} 
            tickLine={false} 
            dy={15}
            style={{ 
              fontSize: '11px', 
              fontWeight: 700, 
              fill: '#94a3b8',
              textTransform: 'uppercase',
              letterSpacing: '0.05em'
            }} 
          />
          <YAxis 
            axisLine={false} 
            tickLine={false} 
            dx={-10}
            style={{ 
              fontSize: '11px', 
              fontWeight: 700, 
              fill: '#94a3b8' 
            }} 
          />
          <Tooltip 
            cursor={{ fill: '#f8fafc', radius: 12 }} 
            content={<CustomTooltip />}
            offset={20}
          />
          <Bar 
            dataKey="responses" 
            radius={[12, 12, 4, 4]} 
            barSize={48}
            animationDuration={1500}
            animationEasing="ease-in-out"
          >
            {data.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill="url(#barGradient)" 
                fillOpacity={0.9}
                className="hover:fill-opacity-100 transition-all cursor-pointer"
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ResponseChart;
