import React, { useEffect, useState, useRef } from 'react';
import ChatBox from './components/Chat/ChatBox';
import MessageInput from './components/Chat/MessageInput';
import Sidebar from './components/Dashboard/Sidebar';
import BootSequence from './components/Jarvis/BootSequence';
import BriefingModal from './components/Jarvis/BriefingModal';
import WakeWordListener from './components/Jarvis/WakeWordListener';
import AIOrb from './components/Jarvis/AIOrb';
import VoiceControls from './components/Jarvis/VoiceControls';
import useChatStore from './store/useChatStore';
import { AnimatePresence } from 'framer-motion';
import { Trash2 } from 'lucide-react';

function App() {
  const { connect, isConnected, clearChat } = useChatStore();
  const [booting, setBooting] = useState(true);
  const [showBriefing, setShowBriefing] = useState(false);
  const [wakeWordActive, setWakeWordActive] = useState(true);
  const micTriggerRef = useRef(null);

  useEffect(() => {
    connect();
    if ('speechSynthesis' in window) {
      window.speechSynthesis.getVoices();
    }
  }, [connect]);

  const handleBootComplete = () => {
    setBooting(false);
    setShowBriefing(true); // Show briefing after boot
  };

  return (
    <div className="absolute inset-0 bg-[#050510] text-white flex flex-col overflow-hidden">
      {/* Neural Background Gradients */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-cyan-600/20 blur-[120px] rounded-full pointer-events-none z-0" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-800/20 blur-[120px] rounded-full pointer-events-none z-0" />

      {/* Boot Sequence Overlay */}
      <AnimatePresence>
        {booting && <BootSequence onComplete={handleBootComplete} />}
      </AnimatePresence>

      {/* Briefing Modal */}
      <AnimatePresence>
        {showBriefing && <BriefingModal onDismiss={() => setShowBriefing(false)} />}
      </AnimatePresence>

      {/* Wake Word Listener — always active after boot */}
      <WakeWordListener
        active={!booting && !showBriefing && wakeWordActive}
        onWakeWord={() => micTriggerRef.current?.()}
      />

      {/* Header — always rendered */}
      <header className="flex-none flex-shrink-0 flex justify-between items-center py-2 px-4 relative z-10 border-b border-cyan-500/20 bg-black/70 backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <AIOrb />
          <div>
            <h1 className="text-lg font-bold tracking-wide text-cyan-300">NeuroAI</h1>
            <div className="flex items-center gap-1.5 text-[10px] text-gray-400 font-medium tracking-wider uppercase">
              <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${isConnected ? 'bg-green-400 shadow-[0_0_6px_#4ade80]' : 'bg-red-500'}`} />
              {isConnected ? 'Core Online' : 'Connecting...'}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={clearChat}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-gray-600 bg-gray-800/80 text-gray-300 hover:bg-red-500/20 hover:border-red-400/60 hover:text-red-400 transition-all text-[11px] font-bold tracking-wider uppercase"
            title="Clear Chat History"
          >
            <Trash2 size={13} />
            <span className="hidden sm:inline">Clear Chat</span>
          </button>
          <VoiceControls />
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex w-full max-w-7xl mx-auto relative z-10 p-2 md:p-4 gap-4 md:gap-6 overflow-hidden min-h-0">
        {/* Left Sidebar Dashboard */}
        <div className="hidden md:flex w-64 lg:w-80 flex-col h-full overflow-y-auto overflow-x-hidden scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent flex-shrink-0 pb-4">
          <Sidebar />
        </div>

        {/* Right Chat Area */}
        <div className="flex-1 flex flex-col bg-white/[0.02] border border-white/5 rounded-3xl backdrop-blur-2xl shadow-2xl overflow-hidden relative min-w-0">
          <ChatBox />
          <div className="border-t border-white/5 bg-gray-900/50 backdrop-blur-xl flex-shrink-0">
            <MessageInput micTriggerRef={micTriggerRef} />
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;