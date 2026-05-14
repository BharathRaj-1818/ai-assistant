import React, { useState, useEffect } from 'react';
import { CheckSquare, Square, Trash2, ListTodo } from 'lucide-react';
import axios from 'axios';

const TaskManager = ({ tasks: initialTasks }) => {
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    if (initialTasks) setTasks(initialTasks);
  }, [initialTasks]);

  const handleToggle = async (id, currentStatus) => {
    // Optimistic UI update
    setTasks(tasks.map(t => t.id === id ? { ...t, completed: !currentStatus } : t));
    try {
      await axios.patch(`http://127.0.0.1:8000/api/reminders/${id}`);
    } catch (error) {
      console.error("Failed to toggle task", error);
      // Revert on failure
      setTasks(tasks.map(t => t.id === id ? { ...t, completed: currentStatus } : t));
    }
  };

  const handleDelete = async (id) => {
    // Optimistic UI update
    const previousTasks = [...tasks];
    setTasks(tasks.filter(t => t.id !== id));
    try {
      await axios.delete(`http://127.0.0.1:8000/api/reminders/${id}`);
    } catch (error) {
      console.error("Failed to delete task", error);
      setTasks(previousTasks); // Revert on failure
    }
  };

  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-3xl p-5 backdrop-blur-xl shadow-lg h-64 flex-shrink-0 flex flex-col">
      <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-2 mb-4">
        <ListTodo size={16} className="text-purple-400" /> Active Tasks
      </h3>
      
      <div className="flex-1 overflow-y-auto scrollbar-thin space-y-2 pr-2">
        {tasks && tasks.length > 0 ? (
          tasks.map((task) => (
            <div 
              key={task.id} 
              className={`flex items-center justify-between p-3 rounded-xl border transition-all group ${
                task.completed 
                  ? 'bg-green-900/10 border-green-500/20' 
                  : 'bg-gray-800/50 border-white/5 hover:border-purple-500/30'
              }`}
            >
              <div className="flex items-center gap-3 overflow-hidden">
                <button 
                  onClick={() => handleToggle(task.id, task.completed)}
                  className="flex-shrink-0 text-gray-400 hover:text-green-400 transition-colors"
                >
                  {task.completed ? <CheckSquare size={18} className="text-green-500" /> : <Square size={18} />}
                </button>
                <span className={`text-sm truncate transition-all duration-300 ${
                  task.completed ? 'text-gray-500 line-through decoration-gray-500' : 'text-gray-200'
                }`}>
                  {task.task}
                </span>
              </div>
              <button 
                onClick={() => handleDelete(task.id)}
                className="flex-shrink-0 ml-2 text-gray-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                title="Delete task"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-gray-500 gap-2 opacity-50">
            <ListTodo size={24} />
            <span className="text-xs">No active tasks</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default TaskManager;
