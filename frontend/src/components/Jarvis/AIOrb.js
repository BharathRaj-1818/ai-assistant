import React from 'react';
import { motion } from 'framer-motion';
import useChatStore from '../../store/useChatStore';

const AIOrb = ({ isListening = false }) => {
  const { isStreaming, isVoiceEnabled } = useChatStore();

  // Determine orb color and animation based on state
  let orbColor = "bg-cyan-400";
  let glowColor = "shadow-[0_0_20px_#22d3ee]";
  let pulseAnimation = "animate-pulse";
  
  if (isListening) {
    orbColor = "bg-red-500";
    glowColor = "shadow-[0_0_30px_#ef4444]";
    pulseAnimation = "animate-ping";
  } else if (isStreaming) {
    orbColor = "bg-blue-400";
    glowColor = "shadow-[0_0_40px_#60a5fa]";
    pulseAnimation = "animate-pulse scale-110";
  } else if (!isVoiceEnabled) {
    orbColor = "bg-gray-500";
    glowColor = "shadow-[0_0_10px_#6b7280]";
    pulseAnimation = "";
  }

  return (
    <div className="relative flex items-center justify-center w-12 h-12">
      {/* Outer Halo */}
      <motion.div 
        animate={
          isStreaming 
            ? { scale: [1, 1.5, 1], opacity: [0.3, 0.6, 0.3] } 
            : isListening
            ? { scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }
            : { scale: [1, 1.1, 1], opacity: [0.2, 0.4, 0.2] }
        }
        transition={{ repeat: Infinity, duration: isStreaming ? 0.8 : 2 }}
        className={`absolute inset-0 ${orbColor} blur-md rounded-full`}
      />
      
      {/* Inner Core */}
      <div className={`w-5 h-5 rounded-full relative z-10 transition-all duration-300 ${orbColor} ${glowColor} ${pulseAnimation}`}>
        {/* Core highlight */}
        <div className="absolute top-1 left-1 w-2 h-2 bg-white/50 rounded-full blur-[1px]"></div>
      </div>
    </div>
  );
};

export default AIOrb;
