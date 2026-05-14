import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { LayoutDashboard } from 'lucide-react';
import axios from 'axios';
import { Toaster, toast } from 'react-hot-toast';
import SystemStatus from './Widgets/SystemStatus';
import ActivityChart from './Widgets/ActivityChart';
import QuickNotes from './Widgets/QuickNotes';
import WeatherWidget from './Widgets/WeatherWidget';
import TaskManager from './Widgets/TaskManager';
import CalendarWidget from './Widgets/CalendarWidget';
import ClockWidget from './Widgets/ClockWidget';
import MemoryWidget from './Widgets/MemoryWidget';

const Sidebar = () => {
  const [data, setData] = useState(null);
  const prevReminderCount = React.useRef(0);
  const prevCalendarCount = React.useRef(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get('http://127.0.0.1:8000/api/dashboard');
        const newData = res.data;

        // Toast notifications on new items
        if (data && newData.reminders?.length > prevReminderCount.current) {
          toast.success('New task added to dashboard!', { icon: '✅' });
        }
        if (data && newData.calendar?.length > prevCalendarCount.current) {
          toast.success('New event scheduled!', { icon: '📅' });
        }
        prevReminderCount.current = newData.reminders?.length || 0;
        prevCalendarCount.current = newData.calendar?.length || 0;

        setData(newData);
      } catch (err) {
        console.error("Dashboard error", err);
      }
    };
    fetchData();
    const interval = setInterval(fetchData, 8000); // Poll every 8s
    return () => clearInterval(interval);
  }, [data]);

  return (
    <>
      <Toaster
        position="bottom-left"
        toastOptions={{
          style: {
            background: 'rgba(0,0,0,0.85)',
            color: '#a5f3fc',
            border: '1px solid rgba(6,182,212,0.3)',
            backdropFilter: 'blur(12px)',
            fontSize: '13px'
          }
        }}
      />
      <motion.aside 
        initial={{ x: -50, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        className="flex flex-col gap-4 w-full"
      >
        <div className="flex items-center gap-2 mb-2 px-2">
          <LayoutDashboard className="text-cyan-400" size={24} />
          <h2 className="text-lg font-bold tracking-widest text-white/90 uppercase">Dashboard</h2>
        </div>

        <ClockWidget />

        {data ? (
          <>
            <SystemStatus status={data.status} model={data.model} cpu={data.cpu_usage} latency={data.latency} />
            <ActivityChart data={data.activity} />
            <TaskManager tasks={data.reminders} />
            <CalendarWidget events={data.calendar} />
            <MemoryWidget profile={data.profile} />
            <WeatherWidget weather={data.weather} />
            <QuickNotes notes={data.notes} />
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="w-8 h-8 border-4 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin"></div>
          </div>
        )}
      </motion.aside>
    </>
  );
};

export default Sidebar;
