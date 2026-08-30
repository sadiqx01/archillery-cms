import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Menu, LogOut, Calendar, ShieldCheck, Sun, Moon } from 'lucide-react';

export default function Header({ toggleSidebar }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  if (!user) return null;

  const getSectionTitle = () => {
    const path = location.pathname;
    if (path === '/') return 'Control Dashboard';
    if (path.startsWith('/projects')) return 'Projects Ledger';
    if (path.startsWith('/workers')) return 'Staff Registry';
    if (path.startsWith('/tasks')) return 'Task Allocations';
    if (path.startsWith('/attendance')) return 'Shift Attendance';
    if (path.startsWith('/reports')) return 'Audit Reports';
    return 'CMS Terminal';
  };

  const getLocalDateString = () => {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return new Date().toLocaleDateString('en-US', options);
  };

  return (
    <header className="h-20 bg-white/80 dark:bg-brand-surface/80 backdrop-blur-md border-b border-brand-navy/5 dark:border-white/10 flex items-center justify-between px-6 md:px-8 no-print sticky top-0 z-40 shadow-sm">
      {/* Left side: Toggle button and section title */}
      <div className="flex items-center gap-4">
        <button
          onClick={toggleSidebar}
          className="p-2.5 text-brand-navy dark:text-white hover:bg-brand-navy/5 dark:hover:bg-white/5 rounded-xl lg:hidden transition-colors"
          aria-label="Toggle navigation drawer"
        >
          <Menu size={20} />
        </button>

        <div className="space-y-0.5">
          <h1 className="font-outfit font-extrabold text-lg md:text-xl text-brand-navy dark:text-white uppercase tracking-wider">
            {getSectionTitle()}
          </h1>
          <p className="hidden sm:flex items-center gap-1.5 text-[10px] text-brand-navy/50 dark:text-white/50 font-bold uppercase tracking-wider">
            <Calendar size={12} className="text-brand-gold" />
            {getLocalDateString()}
          </p>
        </div>
      </div>

      {/* Right side: Session user credentials & logout */}
      <div className="flex items-center gap-4">
        <button
          onClick={toggleTheme}
          className="p-2.5 text-brand-navy hover:bg-brand-navy/5 dark:text-white dark:hover:bg-white/5 rounded-xl transition-all border border-brand-navy/10 dark:border-white/10 flex items-center justify-center shadow-sm duration-300"
          title="Toggle Light/Dark Theme"
        >
          {theme === 'light' ? <Moon size={14} /> : <Sun size={14} />}
        </button>

        <div className="hidden md:flex flex-col text-right">
          <span className="text-[9px] font-extrabold text-brand-navy/40 dark:text-white/40 uppercase tracking-widest transition-colors duration-300">Active Operator</span>
          <span className="text-xs font-extrabold text-brand-navy dark:text-white flex items-center gap-1 mt-0.5 justify-end transition-colors duration-300">
            <ShieldCheck size={12} className="text-brand-gold shrink-0" />
            {user.name}
          </span>
        </div>

        <div className="w-px h-8 bg-brand-navy/5 dark:bg-white/10 hidden md:block" />

        <button
          onClick={logout}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 font-bold text-[10px] uppercase tracking-wider hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors shadow-sm duration-300"
          title="Log out of CMS session"
        >
          <LogOut size={13} />
          <span className="hidden sm:inline">Sign Out</span>
        </button>
      </div>
    </header>
  );
}
