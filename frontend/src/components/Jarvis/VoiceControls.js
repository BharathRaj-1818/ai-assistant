import React from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import useChatStore from '../../store/useChatStore';

const VoiceControls = () => {
  const { isVoiceEnabled, toggleVoice } = useChatStore();

  return (
    <button
      onClick={toggleVoice}
      className={`flex items-center gap-2 px-3 py-1.5 rounded-full border transition-all ${
        isVoiceEnabled 
          ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/20' 
          : 'bg-gray-800/50 border-gray-700 text-gray-500 hover:bg-gray-800'
      }`}
      title={isVoiceEnabled ? "Voice Output Active" : "Voice Output Muted"}
    >
      {isVoiceEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
      <span className="text-[10px] font-bold tracking-wider uppercase">
        {isVoiceEnabled ? 'Voice On' : 'Voice Off'}
      </span>
    </button>
  );
};

export default VoiceControls;
