import React from 'react';
import { BarChart, Bar, ResponsiveContainer, Tooltip, XAxis } from 'recharts';
import { Activity } from 'lucide-react';

const ActivityChart = ({ data }) => {
  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-3xl p-5 backdrop-blur-xl shadow-lg h-48 flex-shrink-0 flex flex-col">
      <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-2 mb-4">
        <Activity size={16} className="text-blue-400" /> AI Activity
      </h3>
      <div style={{ width: '100%', height: 100 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <Tooltip 
              cursor={{ fill: 'rgba(255, 255, 255, 0.05)' }}
              contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff' }}
              itemStyle={{ color: '#22d3ee' }}
            />
            <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 10 }} dy={10} />
            <Bar dataKey="tokens" fill="url(#colorCyan)" radius={[4, 4, 0, 0]} />
            <defs>
              <linearGradient id="colorCyan" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.2}/>
              </linearGradient>
            </defs>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default ActivityChart;
