import React, { useState, useEffect } from 'react';
import { FileText, Clock, Trash2 } from 'lucide-react';
import axios from 'axios';

const QuickNotes = ({ notes: initialNotes }) => {
  const [notes, setNotes] = useState([]);

  useEffect(() => {
    if (initialNotes) setNotes(initialNotes);
  }, [initialNotes]);

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://127.0.0.1:8000/api/notes/${id}`);
      setNotes(notes.filter(n => n.id !== id));
    } catch (error) {
      console.error("Failed to delete note", error);
    }
  };

  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-3xl p-5 backdrop-blur-xl shadow-lg h-64 flex-shrink-0 flex flex-col">
      <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-2 mb-4">
        <FileText size={16} className="text-yellow-400" /> Recent Memory
      </h3>
      
      <div className="flex-1 overflow-y-auto scrollbar-thin space-y-3 pr-2">
        {notes && notes.length > 0 ? (
          notes.map((note, idx) => (
            <div key={idx} className="bg-gray-800/50 rounded-xl p-3 border border-white/5 hover:border-yellow-500/30 transition-all group relative">
              <p className="text-sm text-gray-200 line-clamp-2 leading-relaxed pr-6">{note.content}</p>
              <div className="mt-2 flex items-center justify-between">
                <div className="flex items-center gap-1 text-[10px] text-gray-500">
                  <Clock size={10} />
                  <span>{note.date}</span>
                </div>
              </div>
              <button 
                onClick={() => handleDelete(note.id)}
                className="absolute top-3 right-3 text-gray-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                title="Delete memory"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-gray-500 gap-2 opacity-50">
            <FileText size={24} />
            <span className="text-xs">Memory core empty</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuickNotes;
