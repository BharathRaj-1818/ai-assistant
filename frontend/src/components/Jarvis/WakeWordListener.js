import React, { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic } from 'lucide-react';

const WAKE_WORD = 'hey neuro';

/**
 * WakeWordListener - continuously listens for "Hey Neuro" in the background.
 * When detected, calls onWakeWord() to activate the microphone input.
 */
const WakeWordListener = ({ onWakeWord, active }) => {
  const recognitionRef = useRef(null);
  const [listening, setListening] = useState(false);
  const [detected, setDetected] = useState(false);

  const startListening = useCallback(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onresult = (event) => {
      const transcript = Array.from(event.results)
        .map(r => r[0].transcript.toLowerCase())
        .join(' ');

      if (transcript.includes(WAKE_WORD)) {
        setDetected(true);
        recognition.stop();
        setTimeout(() => setDetected(false), 2000);
        onWakeWord();
      }
    };

    recognition.onend = () => {
      setListening(false);
      // Auto-restart to keep listening
      if (active) {
        setTimeout(() => startListening(), 500);
      }
    };

    recognition.onerror = (e) => {
      if (e.error !== 'aborted' && e.error !== 'no-speech') {
        setListening(false);
      }
    };

    recognitionRef.current = recognition;
    recognition.start();
    setListening(true);
  }, [active, onWakeWord]);

  useEffect(() => {
    if (active) {
      startListening();
    } else {
      recognitionRef.current?.stop();
      setListening(false);
    }
    return () => recognitionRef.current?.stop();
  }, [active, startListening]);

  if (!active) return null;

  return (
    <AnimatePresence>
      {detected ? (
        <motion.div
          key="detected"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-5 py-3 bg-cyan-500/20 border border-cyan-400/50 rounded-full backdrop-blur-md shadow-[0_0_30px_rgba(6,182,212,0.4)]"
        >
          <Mic size={18} className="text-cyan-400 animate-pulse" />
          <span className="text-cyan-300 font-semibold text-sm tracking-wider">Wake word detected — listening...</span>
        </motion.div>
      ) : (
        listening && (
          <motion.div
            key="standby"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed bottom-6 right-6 z-40 flex items-center gap-1.5 px-3 py-1.5 bg-black/60 border border-gray-700/50 rounded-full text-gray-500 text-xs"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-500/50 animate-pulse" />
            Say "Hey Neuro" to activate
          </motion.div>
        )
      )}
    </AnimatePresence>
  );
};

export default WakeWordListener;
