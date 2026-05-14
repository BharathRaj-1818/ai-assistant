import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Terminal, CloudRain, ListTodo, FileText, Trash2 } from 'lucide-react';

const commands = [
  { id: '/weather', icon: <CloudRain size={16}/>, desc: 'Get weather for a city', action: '/weather ' },
  { id: '/todo', icon: <ListTodo size={16}/>, desc: 'Add a new todo task', action: '/todo ' },
  { id: '/note', icon: <FileText size={16}/>, desc: 'Save a quick note', action: '/note ' },
  { id: '/clear', icon: <Trash2 size={16}/>, desc: 'Clear chat history', action: '/clear' },
  { id: '/help', icon: <Terminal size={16}/>, desc: 'Show all commands', action: '/help' },
];

const CommandPalette = ({ onSelect, onClose }) => {
  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 10 }}
        className="absolute bottom-full left-4 mb-2 w-72 bg-gray-900/90 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden shadow-2xl z-50"
      >
        <div className="px-3 py-2 border-b border-white/5 text-xs text-gray-400 font-semibold tracking-wider">
          SUGGESTED COMMANDS
        </div>
        <ul className="max-h-60 overflow-y-auto p-2 scrollbar-none">
          {commands.map((cmd) => (
            <li 
              key={cmd.id}
              onClick={() => onSelect(cmd.action)}
              className="flex items-center gap-3 px-3 py-2 hover:bg-white/10 rounded-xl cursor-pointer text-gray-300 hover:text-cyan-400 transition-colors group"
            >
              <div className="text-gray-500 group-hover:text-cyan-400 transition-colors">
                {cmd.icon}
              </div>
              <div className="flex flex-col">
                <span className="font-mono text-sm font-semibold">{cmd.id}</span>
                <span className="text-xs text-gray-500">{cmd.desc}</span>
              </div>
            </li>
          ))}
        </ul>
      </motion.div>
    </AnimatePresence>
  );
};

export default CommandPalette;
