import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, 
  Briefcase, 
  Users, 
  CheckSquare, 
  CalendarRange, 
  FileSpreadsheet, 
  HardHat,
  ChevronRight,
  HelpCircle,
  ShoppingBag,
  FileText
} from 'lucide-react';

export default function Sidebar({ isOpen, toggleSidebar }) {
  const { user } = useAuth();
  if (!user) return null;

  const allLinks = [
    { 
      name: 'Dashboard', 
      to: '/', 
      icon: LayoutDashboard, 
      roles: ['ceo', 'cto', 'hr', 'it', 'supervisor', 'engineer', 'worker'] 
    },
    { 
      name: 'Projects', 
      to: '/projects', 
      icon: Briefcase, 
      roles: ['ceo', 'cto', 'it', 'supervisor', 'engineer'] 
    },
    { 
      name: 'Staff Registry', 
      to: '/workers', 
      icon: Users, 
      roles: ['ceo', 'hr', 'it'] 
    },
    { 
      name: 'Tasks', 
      to: '/tasks', 
      icon: CheckSquare, 
      roles: ['ceo', 'cto', 'it', 'supervisor', 'engineer', 'worker'] 
    },
    { 
      name: 'Attendance', 
      to: '/attendance', 
      icon: CalendarRange, 
      roles: ['ceo', 'hr', 'it', 'supervisor', 'engineer', 'worker'] 
    },
    { 
      name: 'RFIs', 
      to: '/rfis', 
      icon: HelpCircle, 
      roles: ['ceo', 'cto', 'supervisor', 'engineer'] 
    },
    { 
      name: 'Procurement', 
      to: '/procurement', 
      icon: ShoppingBag, 
      roles: ['ceo', 'cto', 'it', 'supervisor', 'engineer'] 
    },
    { 
      name: 'Daily Logs', 
      to: '/daily-logs', 
      icon: FileText, 
      roles: ['ceo', 'cto', 'supervisor', 'engineer'] 
    },
    { 
      name: 'Reports', 
      to: '/reports', 
      icon: FileSpreadsheet, 
      roles: ['ceo', 'cto', 'hr', 'supervisor', 'engineer'] 
    },
  ];

  const authorizedLinks = allLinks.filter(link => link.roles.includes(user.role));

  const roleLabels = {
    ceo: 'CEO / Executive',
    cto: 'CTO / Director',
    hr: 'HR Manager',
    it: 'Head of IT / Admin',
    supervisor: 'Site Supervisor',
    engineer: 'Site Engineer',
    worker: 'Field Worker'
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-brand-dark/60 backdrop-blur-sm lg:hidden"
          onClick={toggleSidebar}
        />
      )}

      {/* Sidebar Panel */}
      <aside 
        className={`fixed inset-y-0 left-0 z-50 flex flex-col w-64 bg-[#001026] text-white transition-transform duration-300 lg:translate-x-0 lg:static border-r border-white/5 relative ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Subtle grid background inside sidebar */}
        <div className="absolute inset-0 z-0 grid-bg-dark opacity-10 pointer-events-none" />

        {/* Brand Header */}
        <div className="flex items-center gap-3 h-20 px-6 border-b border-white/5 relative z-10">
          <div className="bg-transparent p-0 flex items-center justify-center shrink-0">
            <img src="/logo.png" alt="Archillery Logo" className="h-10 w-auto object-contain" />
          </div>
          <div>
            <h1 className="font-outfit font-extrabold text-lg tracking-wider text-white leading-none">ARCHILLERY</h1>
            <span className="text-[9px] text-brand-gold font-bold tracking-[0.15em] uppercase block mt-1">CMS PORTAL</span>
          </div>
        </div>

        {/* User Card */}
        <div className="p-5 border-b border-white/5 bg-white/5 relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-brand-gold/10 border border-brand-gold/25 flex items-center justify-center font-bold text-brand-gold uppercase text-sm shrink-0">
              {user.name.charAt(0)}
            </div>
            <div className="overflow-hidden">
              <h2 className="text-sm font-semibold truncate text-white/90">{user.name}</h2>
              <span className="inline-block text-[9px] font-extrabold tracking-wider text-brand-gold uppercase px-2 py-0.5 rounded bg-brand-gold/10 border border-brand-gold/15 mt-1">
                {roleLabels[user.role]}
              </span>
            </div>
          </div>
        </div>

        {/* Nav Links */}
        <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto relative z-10">
          {authorizedLinks.map((link) => {
            const Icon = link.icon;
            return (
              <NavLink
                key={link.name}
                to={link.to}
                onClick={() => {
                  if (window.innerWidth < 1024) toggleSidebar();
                }}
                className={({ isActive }) =>
                  `flex items-center justify-between px-4 py-3 rounded-xl font-bold text-xs uppercase tracking-wider transition-all group relative overflow-hidden ${
                    isActive
                      ? 'bg-brand-gold text-brand-dark shadow-lg shadow-brand-gold/5 font-extrabold'
                      : 'text-white/60 hover:bg-white/5 hover:text-white'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    {/* Active vertical border bar inside link card */}
                    {isActive && (
                      <div className="absolute left-0 top-0 bottom-0 w-[4px] bg-brand-navy-light" />
                    )}
                    <div className="flex items-center gap-3">
                      <Icon size={16} className={`transition-transform group-hover:scale-110 ${isActive ? 'text-brand-dark' : 'text-brand-gold'}`} />
                      <span>{link.name}</span>
                    </div>
                    <ChevronRight size={14} className={`transition-all ${isActive ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0'}`} />
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-white/5 bg-white/5 text-center relative z-10 space-y-3">
          <button 
            onClick={() => {
              if (window.confirm('Re-synchronize database instance with master configuration? All local transaction buffers will be flushed.')) {
                localStorage.removeItem('archillery_cms_db');
                window.location.reload();
              }
            }}
            className="w-full py-2 bg-brand-navy/15 hover:bg-brand-navy dark:hover:bg-brand-navy-light text-brand-gold font-extrabold text-[9px] uppercase tracking-widest rounded-lg border border-brand-navy/10 hover:border-brand-navy/30 transition-all cursor-pointer block"
            title="Force synchronization with master database catalog"
          >
            Diagnostics Sync
          </button>
          <div className="text-[9px] text-white/30 uppercase tracking-widest font-bold">
            © {new Date().getFullYear()} ARCHILLERY BUILD
          </div>
        </div>
      </aside>
    </>
  );
}
