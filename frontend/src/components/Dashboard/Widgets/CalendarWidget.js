import React from 'react';
import { Calendar, Clock } from 'lucide-react';
import { motion } from 'framer-motion';

const CalendarWidget = ({ events }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-black/40 backdrop-blur-md border border-cyan-500/20 rounded-xl p-4 shadow-[0_0_15px_rgba(6,182,212,0.1)] hover:shadow-[0_0_25px_rgba(6,182,212,0.2)] transition-all duration-300"
    >
      <div className="flex items-center gap-2 mb-4 border-b border-cyan-500/20 pb-2">
        <Calendar className="text-cyan-400" size={20} />
        <h3 className="font-semibold text-white/90">Upcoming Events</h3>
      </div>
      
      <div className="space-y-3 max-h-48 overflow-y-auto scrollbar-thin scrollbar-thumb-cyan-500/20 pr-1">
        {!events || events.length === 0 ? (
          <p className="text-sm text-cyan-200/50 italic text-center py-2">No scheduled events</p>
        ) : (
          events.map((event) => (
            <div key={event.id} className="group relative flex items-start justify-between p-2 rounded-lg bg-cyan-950/20 hover:bg-cyan-900/30 transition-colors border border-transparent hover:border-cyan-500/10">
              <div className="flex-1 min-w-0">
                <p className="text-sm text-cyan-100 font-medium truncate">{event.title}</p>
                <div className="flex items-center gap-3 mt-1 text-xs text-cyan-300/60">
                  <span className="flex items-center gap-1">
                    <Calendar size={12} />
                    {event.date}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock size={12} />
                    {event.time}
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </motion.div>
  );
};

export default CalendarWidget;
