import React from 'react';
import { Brain } from 'lucide-react';
import { motion } from 'framer-motion';

const MemoryWidget = ({ profile }) => {
  const entries = profile ? Object.entries(profile) : [];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-black/40 backdrop-blur-md border border-purple-500/20 rounded-xl p-4 shadow-[0_0_15px_rgba(168,85,247,0.08)] hover:shadow-[0_0_25px_rgba(168,85,247,0.15)] transition-all duration-300"
    >
      <div className="flex items-center gap-2 mb-3 border-b border-purple-500/20 pb-2">
        <Brain className="text-purple-400" size={20} />
        <h3 className="font-semibold text-white/90">AI Memory</h3>
        <span className="ml-auto text-xs text-purple-300/50 bg-purple-900/30 px-2 py-0.5 rounded-full">
          {entries.length} facts
        </span>
      </div>

      <div className="space-y-2 max-h-36 overflow-y-auto scrollbar-thin scrollbar-thumb-purple-500/20 pr-1">
        {entries.length === 0 ? (
          <p className="text-xs text-purple-200/40 italic text-center py-2">
            No profile facts yet. Chat with NeuroAI to build memory.
          </p>
        ) : (
          entries.map(([key, value]) => (
            <div key={key} className="flex items-start justify-between gap-2 text-xs rounded-lg p-1.5 bg-purple-950/20 hover:bg-purple-900/20 transition-colors">
              <span className="text-purple-300/70 font-medium capitalize shrink-0">{key.replace(/_/g, ' ')}</span>
              <span className="text-white/70 text-right truncate">{value}</span>
            </div>
          ))
        )}
      </div>
    </motion.div>
  );
};

export default MemoryWidget;
