import React, { useEffect, useState } from 'react';
import { Cpu, HardDrive, MemoryStick, Server, Zap, Clock } from 'lucide-react';
import axios from 'axios';
import { motion } from 'framer-motion';

const StatBar = ({ label, percent, value, color }) => (
  <div className="flex flex-col gap-1">
    <div className="flex justify-between items-center">
      <span className="text-xs text-gray-500">{label}</span>
      <span className="text-xs font-mono text-white">{value}</span>
    </div>
    <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${percent}%` }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className={`h-full rounded-full ${color}`}
        style={{ boxShadow: `0 0 8px currentColor` }}
      />
    </div>
  </div>
);

const SystemStatus = ({ status, model }) => {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await axios.get('http://127.0.0.1:8000/api/system');
        setStats(res.data);
      } catch (err) {
        console.error('System stats error', err);
      }
    };
    fetchStats();
    const interval = setInterval(fetchStats, 5000); // Poll every 5s
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-3xl p-5 backdrop-blur-xl shadow-lg relative overflow-hidden group">
      <div className="absolute -inset-2 bg-gradient-to-tr from-cyan-500/10 to-blue-500/10 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-2">
            <Server size={16} className="text-cyan-400" /> System Core
          </h3>
          <span className="flex items-center gap-1.5 text-xs text-green-400 bg-green-400/10 px-2 py-1 rounded-full border border-green-400/20">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" /> {status}
          </span>
        </div>

        <div className="flex items-center gap-2 mb-4 text-xs text-gray-500">
          <Zap size={12} className="text-cyan-400" />
          <span className="font-mono text-white/80">{model}</span>
          {stats?.uptime && (
            <>
              <span className="mx-1 text-gray-700">·</span>
              <Clock size={12} />
              <span>Up {stats.uptime}</span>
            </>
          )}
        </div>

        {stats ? (
          <div className="flex flex-col gap-3">
            <StatBar label="CPU" percent={stats.cpu_percent} value={stats.cpu_label} color="bg-cyan-400" />
            <StatBar label="RAM" percent={stats.ram_percent} value={`${stats.ram_used_gb}/${stats.ram_total_gb}`} color="bg-blue-400" />
            <StatBar label="Disk" percent={stats.disk_percent} value={`${stats.disk_used_gb}/${stats.disk_total_gb}`} color="bg-purple-400" />
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-1.5 bg-gray-800 rounded-full animate-pulse" />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SystemStatus;
