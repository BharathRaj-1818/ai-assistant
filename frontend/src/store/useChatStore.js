import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';

const speakText = (text) => {
  if (!('speechSynthesis' in window)) return;
  // Strip markdown or basic symbols before speaking
  const cleanText = text.replace(/[*_#`~]/g, '');
  const utterance = new SpeechSynthesisUtterance(cleanText);
  utterance.rate = 1.05;
  utterance.pitch = 0.95;
  
  // Try to find a good English voice (e.g., Google UK English Female, or similar)
  const voices = window.speechSynthesis.getVoices();
  const preferredVoice = voices.find(v => v.name.includes('Google UK English') || v.name.includes('Female')) || voices[0];
  if (preferredVoice) {
    utterance.voice = preferredVoice;
  }
  
  window.speechSynthesis.speak(utterance);
};

const useChatStore = create((set, get) => ({
  messages: [],
  isStreaming: false,
  isConnected: false,
  socket: null,
  currentStreamId: null,
  isVoiceEnabled: true,

  toggleVoice: () => {
    if (get().isVoiceEnabled) {
      window.speechSynthesis?.cancel();
    }
    set({ isVoiceEnabled: !get().isVoiceEnabled });
  },

  connect: () => {
    if (get().socket) return;
    
    const ws = new WebSocket('ws://127.0.0.1:8000/ws/chat');
    
    ws.onopen = () => {
      set({ isConnected: true, socket: ws });
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      const { currentStreamId, isVoiceEnabled } = get();

      switch (data.type) {
        case 'message':
        case 'command_result':
          if (isVoiceEnabled) speakText(data.content);
          set(state => ({
            messages: [...state.messages, {
              id: uuidv4(),
              role: 'assistant',
              content: data.content,
              isCommand: data.type === 'command_result',
              timestamp: new Date().toISOString()
            }]
          }));
          break;
        case 'stream_start':
          const newId = uuidv4();
          if (isVoiceEnabled) window.speechSynthesis?.cancel(); // Cancel previous speech
          set(state => ({
            isStreaming: true,
            currentStreamId: newId,
            messages: [...state.messages, {
              id: newId,
              role: 'assistant',
              content: '',
              timestamp: new Date().toISOString()
            }]
          }));
          break;
        case 'stream_chunk':
          set(state => ({
            messages: state.messages.map(msg => 
              msg.id === state.currentStreamId
                ? { ...msg, content: msg.content + data.content }
                : msg
            )
          }));
          break;
        case 'stream_end':
          set(state => {
            // Speak the finalized streamed message
            const finalMessage = state.messages.find(m => m.id === state.currentStreamId);
            if (finalMessage && state.isVoiceEnabled) {
              speakText(finalMessage.content);
            }
            return { isStreaming: false, currentStreamId: null };
          });
          break;
        case 'error':
          console.error("WS Error:", data.content);
          if (isVoiceEnabled) speakText("System error encountered.");
          break;
        default:
          break;
      }
    };

    ws.onclose = () => {
      set({ isConnected: false, socket: null, isStreaming: false, currentStreamId: null });
      setTimeout(() => get().connect(), 3000);
    };
  },

  sendMessage: (text) => {
    const { socket } = get();
    if (!socket || socket.readyState !== WebSocket.OPEN) {
      console.warn("WebSocket not connected. Message dropped.");
      return false;
    }

    if (get().isVoiceEnabled) window.speechSynthesis?.cancel(); // Stop talking when user sends a new message

    set(state => ({
      messages: [...state.messages, {
        id: uuidv4(),
        role: 'user',
        content: text,
        timestamp: new Date().toISOString()
      }]
    }));

    socket.send(JSON.stringify({ message: text, memory: {} }));
    return true;
  },

  clearChat: () => {
    const { socket } = get();
    window.speechSynthesis?.cancel();
    set({ messages: [] });
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify({ type: "clear" }));
    }
  }
}));

export default useChatStore;
