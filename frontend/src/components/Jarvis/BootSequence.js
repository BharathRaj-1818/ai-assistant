import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

const bootLogs = [
  "INITIALIZING NEURO_AI KERNEL...",
  "LOADING NEURAL NETWORKS [██████████] 100%",
  "ESTABLISHING SECURE UPLINK...",
  "BYPASSING MAINFRAME PROTOCOLS...",
  "SYNCHRONIZING MEMORY CORES...",
  "ACTIVATING VOICE SYNTHESIS...",
  "ALL SYSTEMS NOMINAL.",
  "WELCOME BACK, ADMINISTRATOR."
];

const BootSequence = ({ onComplete }) => {
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    let currentIndex = 0;
    
    const interval = setInterval(() => {
      if (currentIndex < bootLogs.length) {
        setLogs(prev => [...prev, bootLogs[currentIndex]]);
        currentIndex++;
      } else {
        clearInterval(interval);
        setTimeout(onComplete, 1500); // Wait 1.5s after last log before completing
      }
    }, 400); // 400ms per line

    return () => clearInterval(interval);
  }, [onComplete]);

  return (
    <motion.div 
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.1, filter: "blur(10px)" }}
      transition={{ duration: 1.2, ease: "easeInOut" }}
      className="fixed inset-0 z-[999] bg-black flex flex-col justify-center items-center text-cyan-500 font-mono text-sm sm:text-base p-8"
    >
      <div className="w-full max-w-2xl flex flex-col gap-2">
        {logs.map((log, index) => (
          <motion.div 
            key={index}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-3"
          >
            <span className="text-gray-600">[{new Date().toISOString().split('T')[1].substring(0,8)}]</span>
            <span className={index === bootLogs.length - 1 ? "text-white font-bold tracking-widest text-xl mt-4" : ""}>
              {log}
            </span>
          </motion.div>
        ))}
        {logs.length < bootLogs.length && (
          <motion.div 
            animate={{ opacity: [1, 0] }} 
            transition={{ repeat: Infinity, duration: 0.8 }}
            className="w-3 h-5 bg-cyan-500 mt-1"
          />
        )}
      </div>
    </motion.div>
  );
};

export default BootSequence;
