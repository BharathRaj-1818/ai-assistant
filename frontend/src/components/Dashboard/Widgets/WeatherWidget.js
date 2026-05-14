import React from 'react';
import { CloudRain, MapPin } from 'lucide-react';

const WeatherWidget = ({ weather }) => {
  return (
    <div className="bg-gradient-to-br from-blue-900/40 to-cyan-900/20 border border-cyan-500/20 rounded-3xl p-5 backdrop-blur-xl shadow-lg relative overflow-hidden group">
      <div className="absolute top-[-20%] right-[-10%] w-24 h-24 bg-cyan-400/20 blur-2xl rounded-full pointer-events-none"></div>
      
      <div className="flex justify-between items-start relative z-10">
        <div className="flex flex-col">
          <span className="text-3xl font-light text-white tracking-tighter">{weather?.temp || '--'}</span>
          <span className="text-sm font-medium text-cyan-200 mt-1">{weather?.condition || 'Unknown'}</span>
        </div>
        <CloudRain size={32} className="text-cyan-400 drop-shadow-[0_0_15px_rgba(6,182,212,0.6)]" />
      </div>
      
      <div className="mt-4 flex items-center gap-1.5 text-xs text-gray-400">
        <MapPin size={12} className="text-blue-400" />
        <span>{weather?.location || 'Locating...'}</span>
      </div>
    </div>
  );
};

export default WeatherWidget;
