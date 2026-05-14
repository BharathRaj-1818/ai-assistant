import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const ClockWidget = () => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const hours = time.getHours().toString().padStart(2, '0');
  const minutes = time.getMinutes().toString().padStart(2, '0');
  const seconds = time.getSeconds().toString().padStart(2, '0');
  const dateStr = time.toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-black/40 backdrop-blur-md border border-cyan-500/20 rounded-xl p-4 shadow-[0_0_15px_rgba(6,182,212,0.1)] text-center"
    >
      <div className="font-mono text-3xl font-bold tracking-widest text-cyan-300 drop-shadow-[0_0_8px_rgba(6,182,212,0.6)]">
        {hours}
        <motion.span
          animate={{ opacity: [1, 0, 1] }}
          transition={{ duration: 1, repeat: Infinity }}
        >:</motion.span>
        {minutes}
        <span className="text-lg text-cyan-500/60 ml-2">{seconds}</span>
      </div>
      <p className="text-xs text-cyan-200/50 mt-1 tracking-wider">{dateStr}</p>
    </motion.div>
  );
};

export default ClockWidget;
