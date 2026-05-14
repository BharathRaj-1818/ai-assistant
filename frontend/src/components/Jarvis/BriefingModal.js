import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, X, CheckCircle2 } from 'lucide-react';
import axios from 'axios';

const BriefingModal = ({ onDismiss }) => {
  const [briefing, setBriefing] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await axios.get('http://127.0.0.1:8000/api/briefing');
        setBriefing(res.data);
      } catch (err) {
        console.error('Briefing error', err);
        setBriefing({ briefing: 'All systems online. Ready to assist, Administrator.', time: '', date: '', pending_tasks: 0, events: 0 });
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
    >
      <motion.div
        initial={{ scale: 0.9, y: 20, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        exit={{ scale: 0.95, y: -10, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        className="relative max-w-lg w-full bg-[#080818] border border-cyan-500/30 rounded-3xl p-6 shadow-[0_0_60px_rgba(6,182,212,0.2)]"
      >
        {/* Glow background */}
        <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-cyan-500/5 to-blue-600/5 pointer-events-none" />

        {/* Header */}
        <div className="flex items-center justify-between mb-5 relative">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center">
              <Sparkles size={16} className="text-cyan-400" />
            </div>
            <div>
              <p className="text-xs text-cyan-400/70 uppercase tracking-widest font-bold">NeuroAI Briefing</p>
              {briefing && <p className="text-xs text-gray-500">{briefing.date} · {briefing.time}</p>}
            </div>
          </div>
          <button
            onClick={onDismiss}
            className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-gray-500 hover:text-white transition-all"
          >
            <X size={16} />
          </button>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex flex-col gap-2 py-4">
            {[1, 2, 3].map(i => (
              <div key={i} className={`h-3 bg-white/5 rounded-full animate-pulse ${i === 3 ? 'w-1/2' : 'w-full'}`} />
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-white/90 text-sm leading-relaxed font-light">
              {briefing?.briefing}
            </p>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="flex items-center gap-2 bg-cyan-950/30 border border-cyan-500/20 rounded-xl p-3">
                <CheckCircle2 size={16} className="text-cyan-400 flex-shrink-0" />
                <div>
                  <p className="text-xs text-gray-400">Pending Tasks</p>
                  <p className="text-sm font-bold text-white">{briefing?.pending_tasks || 0}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 bg-blue-950/30 border border-blue-500/20 rounded-xl p-3">
                <Sparkles size={16} className="text-blue-400 flex-shrink-0" />
                <div>
                  <p className="text-xs text-gray-400">Events Today</p>
                  <p className="text-sm font-bold text-white">{briefing?.events || 0}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        <button
          onClick={onDismiss}
          className="mt-5 w-full py-2.5 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 text-sm font-semibold tracking-wider uppercase transition-all"
        >
          Begin Session
        </button>
      </motion.div>
    </motion.div>
  );
};

export default BriefingModal;
