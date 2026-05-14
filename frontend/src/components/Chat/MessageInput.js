import React, { useState, useRef, useEffect } from 'react';
import useChatStore from '../../store/useChatStore';
import { Send, Paperclip, X, FileText, Mic, MicOff, Camera, Image as ImageIcon, File, Camera as CameraIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import CommandPalette from '../CommandPalette/CommandPalette';

const MessageInput = ({ micTriggerRef }) => {
  const [text, setText] = useState('');
  const [attachments, setAttachments] = useState([]);
  const [isListening, setIsListening] = useState(false);
  const [showUploadMenu, setShowUploadMenu] = useState(false);
  const [showCameraModal, setShowCameraModal] = useState(false);
  const [showCommands, setShowCommands] = useState(false);
  const [stream, setStream] = useState(null);
  
  const photoInputRef = useRef(null);
  const fileInputRef = useRef(null);
  const recognitionRef = useRef(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const inputRef = useRef(null);
  const { sendMessage, isStreaming } = useChatStore();

  useEffect(() => {
    const handleGlobalKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
        setText('/');
        setShowCommands(true);
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'm') {
        e.preventDefault();
        document.getElementById('mic-button')?.click();
      }
      if (e.key === 'Escape') {
        setShowCommands(false);
        setShowUploadMenu(false);
      }
    };
    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, []);

  // Expose mic trigger to parent (for wake word)
  useEffect(() => {
    if (micTriggerRef) {
      micTriggerRef.current = () => {
        document.getElementById('mic-button')?.click();
      };
    }
  }, [micTriggerRef]);

  useEffect(() => {
    if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = true;

      recognitionRef.current.onresult = (event) => {
        let finalTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          }
        }
        if (finalTranscript) {
          setText(prev => prev + (prev ? ' ' : '') + finalTranscript);
        }
      };

      recognitionRef.current.onerror = () => setIsListening(false);
      recognitionRef.current.onend = () => setIsListening(false);
    }
    return () => {
      recognitionRef.current?.stop();
      stopCamera();
    };
  }, []);

  const toggleListen = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      if (recognitionRef.current) {
        recognitionRef.current.start();
        setIsListening(true);
      } else {
        alert("Speech recognition is not supported in this browser.");
      }
    }
  };

  const startCamera = async () => {
    setShowUploadMenu(false);
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true });
      setStream(mediaStream);
      setShowCameraModal(true);
      // Wait for React to render the video element
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }
      }, 100);
    } catch (err) {
      console.error("Error accessing camera:", err);
      alert("Could not access the camera. Please check permissions.");
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setShowCameraModal(false);
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      canvas.toBlob((blob) => {
        if (blob) {
          const file = new File([blob], `capture-${Date.now()}.jpg`, { type: 'image/jpeg' });
          const newAttachment = {
            id: Math.random().toString(36).substring(7),
            file,
            name: file.name,
            type: 'image',
            preview: URL.createObjectURL(blob)
          };
          setAttachments(prev => [...prev, newAttachment]);
        }
        stopCamera();
      }, 'image/jpeg', 0.9);
    }
  };

  const handleSend = () => {
    if ((text.trim() || attachments.length > 0) && !isStreaming) {
      const messageText = text.trim() 
        ? text 
        : `[Uploaded ${attachments.length} attachment${attachments.length > 1 ? 's' : ''}]`;
      
      const success = sendMessage(messageText);
      if (success) {
        setText('');
        setAttachments([]);
        setShowUploadMenu(false);
        if (isListening) {
          recognitionRef.current?.stop();
          setIsListening(false);
        }
      }
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleTextChange = (e) => {
    const val = e.target.value;
    setText(val);
    if (val.startsWith('/')) {
      setShowCommands(true);
    } else {
      setShowCommands(false);
    }
  };

  const handleCommandSelect = (cmd) => {
    setText(cmd);
    setShowCommands(false);
    // Auto focus the input would be nice, but simple state update works.
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      const newAttachments = files.map(file => ({
        id: Math.random().toString(36).substring(7),
        file,
        name: file.name,
        type: file.type.startsWith('image/') ? 'image' : 'document',
        preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : null
      }));
      setAttachments(prev => [...prev, ...newAttachments]);
    }
    e.target.value = '';
    setShowUploadMenu(false);
  };

  const removeAttachment = (id) => {
    setAttachments(prev => prev.filter(att => att.id !== id));
  };

  return (
    <div className="relative p-4 flex flex-col gap-2">
      
      {/* Live Camera Modal */}
      <AnimatePresence>
        {showCameraModal && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
          >
            <div className="bg-gray-900 border border-white/10 p-4 rounded-3xl shadow-2xl max-w-lg w-full flex flex-col gap-4 relative">
              <button onClick={stopCamera} className="absolute top-4 right-4 bg-black/50 p-2 rounded-full text-white hover:bg-red-500 transition-colors z-10">
                <X size={20} />
              </button>
              <div className="relative rounded-2xl overflow-hidden bg-black aspect-video flex items-center justify-center">
                <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover mirror-x"></video>
                <canvas ref={canvasRef} className="hidden"></canvas>
              </div>
              <div className="flex justify-center">
                <button 
                  onClick={capturePhoto} 
                  className="bg-cyan-500 hover:bg-cyan-400 text-white p-4 rounded-full shadow-[0_0_20px_rgba(6,182,212,0.5)] transition-transform hover:scale-105 active:scale-95"
                >
                  <CameraIcon size={32} />
                </button>
              </div>
              <p className="text-center text-xs text-gray-400">Position yourself in the frame and click to capture</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Upload Options Popover */}
      <AnimatePresence>
        {showUploadMenu && (
          <motion.div 
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute bottom-full left-4 mb-2 w-48 bg-gray-900/90 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden shadow-2xl z-50"
          >
            <div className="flex flex-col p-2 gap-1">
              <button 
                onClick={startCamera}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/10 text-gray-300 hover:text-cyan-400 transition-colors w-full text-left text-sm font-medium"
              >
                <Camera size={18} /> Camera
              </button>
              <button 
                onClick={() => photoInputRef.current?.click()}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/10 text-gray-300 hover:text-cyan-400 transition-colors w-full text-left text-sm font-medium"
              >
                <ImageIcon size={18} /> Photos & Videos
              </button>
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/10 text-gray-300 hover:text-cyan-400 transition-colors w-full text-left text-sm font-medium"
              >
                <File size={18} /> Documents
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hidden Inputs */}
      <input type="file" ref={photoInputRef} onChange={handleFileSelect} className="hidden" multiple accept="image/*,video/*" />
      <input type="file" ref={fileInputRef} onChange={handleFileSelect} className="hidden" multiple accept=".pdf,.doc,.docx,.txt,.csv,.xlsx" />

      {/* Command Palette */}
      {showCommands && (
        <CommandPalette onSelect={handleCommandSelect} onClose={() => setShowCommands(false)} />
      )}

      {/* Attachments Preview Area */}
      {attachments.length > 0 && (
        <div className="flex gap-3 overflow-x-auto py-2 scrollbar-thin">
          {attachments.map(att => (
            <div key={att.id} className="relative flex-shrink-0 w-16 h-16 rounded-xl border border-white/10 bg-gray-800 overflow-hidden group">
              {att.type === 'image' ? (
                <img src={att.preview} alt="preview" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 bg-gray-900">
                  <FileText size={20} />
                  <span className="text-[8px] truncate w-full px-1 text-center mt-1">{att.name}</span>
                </div>
              )}
              <button 
                onClick={() => removeAttachment(att.id)}
                className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X size={12} />
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="relative group">
        <div className={`absolute -inset-0.5 rounded-2xl blur transition duration-500 ${isListening ? 'bg-red-500 opacity-50 animate-pulse' : 'bg-gradient-to-r from-cyan-500 to-blue-500 opacity-20 group-hover:opacity-40'}`}></div>
        <div className="relative flex items-center bg-gray-900 border border-white/10 rounded-2xl p-2 backdrop-blur-xl">
          
          <button 
            className={`p-2 transition-colors rounded-xl ${showUploadMenu ? 'bg-white/10 text-cyan-400' : 'text-gray-400 hover:text-cyan-400'}`}
            onClick={() => setShowUploadMenu(!showUploadMenu)}
            title="Attach options"
          >
            <Paperclip size={20} />
          </button>
          
          <input
            ref={inputRef}
            type="text"
            value={text}
            onChange={handleTextChange}
            onKeyDown={handleKeyDown}
            placeholder={isListening ? "Listening..." : "Type a message or press Ctrl+K for commands..."}
            className="flex-1 bg-transparent border-none outline-none text-white px-4 placeholder-gray-500"
            disabled={isStreaming}
          />
          
          {/* Mic Button */}
          <button
            id="mic-button"
            onClick={toggleListen}
            className={`p-2 transition-colors mr-1 ${isListening ? 'text-red-500 animate-pulse' : 'text-gray-400 hover:text-cyan-400'}`}
            title="Speech to text (Ctrl+M)"
          >
            {isListening ? <MicOff size={20} /> : <Mic size={20} />}
          </button>

          {/* Send Button */}
          <button
            onClick={handleSend}
            disabled={(!text.trim() && attachments.length === 0) || isStreaming}
            className={`p-2 rounded-xl transition-all ${
              (text.trim() || attachments.length > 0) && !isStreaming 
                ? 'bg-cyan-500 text-white shadow-[0_0_15px_rgba(6,182,212,0.4)]' 
                : 'bg-white/5 text-gray-500 cursor-not-allowed'
            }`}
          >
            <Send size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default MessageInput;
