import React, { useEffect, useRef } from 'react';
import useChatStore from '../../store/useChatStore';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, User, Copy, Check } from 'lucide-react';

const CopyButton = ({ text }) => {
  const [copied, setCopied] = React.useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button onClick={handleCopy} className="absolute top-2 right-2 p-1.5 rounded-md bg-white/10 hover:bg-white/20 transition-colors text-white/60 hover:text-white">
      {copied ? <Check size={13} /> : <Copy size={13} />}
    </button>
  );
};

const TypingIndicator = () => (
  <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="flex gap-4 justify-start">
    <div className="w-8 h-8 rounded-full bg-cyan-500/20 flex items-center justify-center flex-shrink-0 border border-cyan-500/50 shadow-[0_0_15px_rgba(6,182,212,0.3)]">
      <Bot size={16} className="text-cyan-400" />
    </div>
    <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center gap-1.5">
      {[0, 0.2, 0.4].map((delay, i) => (
        <motion.div key={i} className="w-2 h-2 rounded-full bg-cyan-400/70"
          animate={{ y: [0, -6, 0] }} transition={{ duration: 0.7, repeat: Infinity, delay }} />
      ))}
    </div>
  </motion.div>
);

const ChatBox = () => {
  const { messages, isStreaming } = useChatStore();
  const endOfMessagesRef = useRef(null);
  const isLastStreaming = isStreaming && messages.length > 0 && messages[messages.length - 1].role === 'assistant';

  useEffect(() => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isStreaming]);

  const markdownComponents = {
    code({ node, inline, className, children, ...props }) {
      const match = /language-(\w+)/.exec(className || '');
      const codeText = String(children).replace(/\n$/, '');
      if (!inline && match) {
        return (
          <div className="relative group">
            <CopyButton text={codeText} />
            <SyntaxHighlighter
              style={oneDark}
              language={match[1]}
              PreTag="div"
              className="!rounded-xl !text-sm !my-2"
              {...props}
            >
              {codeText}
            </SyntaxHighlighter>
          </div>
        );
      }
      return <code className="bg-white/10 text-cyan-300 px-1.5 py-0.5 rounded text-sm font-mono" {...props}>{children}</code>;
    },
    blockquote({ children }) {
      return (
        <blockquote className="border-l-4 border-cyan-500/50 pl-4 my-2 text-cyan-200/70 italic bg-cyan-950/20 rounded-r-lg py-2 pr-2">
          {children}
        </blockquote>
      );
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-6 scrollbar-thin scrollbar-thumb-white/10">
      {messages.length === 0 && !isStreaming && (
        <div className="flex flex-col items-center justify-center h-full text-white/50 space-y-4">
          <Bot size={48} className="opacity-50 animate-pulse text-cyan-400" />
          <p className="text-lg">NeuroAI Systems Online. How can I assist you today?</p>
        </div>
      )}
      
      {messages.map((msg) => (
        <motion.div
          key={msg.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className={`flex gap-4 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
        >
          {msg.role === 'assistant' && (
            <div className="w-8 h-8 rounded-full bg-cyan-500/20 flex items-center justify-center flex-shrink-0 border border-cyan-500/50 shadow-[0_0_15px_rgba(6,182,212,0.3)]">
              <Bot size={16} className="text-cyan-400" />
            </div>
          )}
          
          <div className={`max-w-[80%] rounded-2xl p-4 ${
            msg.role === 'user' 
              ? 'bg-blue-600/30 border border-blue-500/30 text-white shadow-lg backdrop-blur-md' 
              : 'bg-white/5 border border-white/10 text-gray-200 shadow-lg backdrop-blur-md'
          }`}>
            {msg.isCommand && <span className="text-xs uppercase tracking-wider text-cyan-400 font-bold mb-1 block">SYSTEM COMMAND</span>}
            <div className="prose prose-invert prose-p:leading-relaxed prose-p:my-1 max-w-none text-sm">
              <ReactMarkdown components={markdownComponents}>{msg.content}</ReactMarkdown>
            </div>
          </div>

          {msg.role === 'user' && (
            <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0 border border-blue-500/50">
              <User size={16} className="text-blue-400" />
            </div>
          )}
        </motion.div>
      ))}

      <AnimatePresence>
        {isStreaming && !isLastStreaming && <TypingIndicator />}
      </AnimatePresence>

      <div ref={endOfMessagesRef} />
    </div>
  );
};

export default ChatBox;

