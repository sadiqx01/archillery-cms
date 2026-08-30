import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  FileSpreadsheet, 
  Printer, 
  Download, 
  Briefcase, 
  CheckSquare, 
  CalendarRange, 
  TrendingUp, 
  ChevronRight,
  HardHat
} from 'lucide-react';

export default function Reports() {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchReportData = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await axios.get('/api/reports/consolidated');
      setReport(res.data);
    } catch (err) {
      console.error(err);
      setError('Failed to extract consolidated audit data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReportData();
  }, []);

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] flex-col">
        <div className="w-12 h-12 border-4 border-brand-navy dark:border-white border-t-brand-gold rounded-full animate-spin"></div>
        <p className="mt-4 text-xs font-extrabold text-brand-navy/60 dark:text-white/60 uppercase tracking-widest animate-pulse">Assembling Audit Dossier...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 rounded-3xl bg-white dark:bg-brand-surface border border-red-100 text-center max-w-xl mx-auto shadow-xl">
        <AlertTriangle className="mx-auto mb-4 text-red-500 animate-bounce" size={40} />
        <h3 className="font-outfit font-extrabold text-brand-navy dark:text-white text-lg uppercase tracking-wider">Extraction Failed</h3>
        <p className="text-sm text-brand-navy/60 dark:text-white/60 mt-2 font-medium">{error}</p>
        <button 
          onClick={fetchReportData} 
          className="mt-6 px-6 py-3 bg-brand-navy hover:bg-brand-navy-light dark:hover:bg-brand-navy-light text-white rounded-xl font-bold text-xs uppercase tracking-wider shadow-md transition-colors"
        >
          Re-initialize Audit
        </button>
      </div>
    );
  }

  if (!report) return null;

  const { projects, tasks, attendance, generatedBy, timestamp } = report;

  // Calculate task aggregates
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.status === 'completed').length;
  const inProgressTasks = tasks.filter(t => t.status === 'in_progress').length;
  const pendingTasks = tasks.filter(t => t.status === 'pending').length;
  const taskCompletionRate = totalTasks ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // Calculate attendance aggregates
  const totalAttendance = attendance.length;
  const presentAttendance = attendance.filter(a => a.status === 'present').length;
  const lateAttendance = attendance.filter(a => a.status === 'late').length;
  const presentRate = totalAttendance ? Math.round(((presentAttendance + lateAttendance) / totalAttendance) * 100) : 0;

  return (
    <div className="space-y-8 animate-fadeIn grid-bg min-h-screen pb-16">
      
      {/* Header controls (No print) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 no-print border-b border-brand-navy/5 dark:border-white/10 pb-4">
        <div className="space-y-0.5">
          <h2 className="text-xl font-bold font-outfit text-brand-navy dark:text-white uppercase tracking-wider">Consolidated Ledger</h2>
          <p className="text-xs text-brand-navy/50 dark:text-white/50 font-semibold uppercase tracking-wider">Generate print-ready analytical reports for management audit compliance.</p>
        </div>
        
        <button
          onClick={handlePrint}
          className="inline-flex items-center gap-1.5 px-5 py-3.5 rounded-2xl bg-brand-navy hover:bg-brand-navy-light dark:hover:bg-brand-navy-light text-white font-extrabold text-xs uppercase tracking-wider shadow-md transition-colors"
        >
          <Printer size={16} />
          Print Audit Dossier
        </button>
      </div>

      {/* Printable Report Wrapper */}
      <div className="bg-white dark:bg-brand-surface border border-brand-navy/5 dark:border-white/10 rounded-[32px] p-6 md:p-8 shadow-xl space-y-8 relative overflow-hidden print-card">
        
        {/* Decorative Grid texture */}
        <div className="absolute inset-0 grid-bg opacity-[0.03] pointer-events-none" />

        {/* Academic / Corporate Document Header */}
        <div className="border-b-2 border-brand-navy/15 dark:border-white/15 pb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative z-10">
          <div className="flex items-center gap-3">
            <div className="bg-brand-navy text-brand-gold p-3 rounded-xl print:bg-black print:text-white">
              <HardHat size={24} className="stroke-[2.5]" />
            </div>
            <div>
              <h1 className="font-outfit font-extrabold text-xl tracking-wider text-brand-navy dark:text-white uppercase">ARCHILLERY BUILD LTD</h1>
              <span className="text-[9px] text-brand-gold font-bold tracking-[0.2em] uppercase block print:text-black">CONSTRUCTION MANAGEMENT DIVISION</span>
            </div>
          </div>
          <div className="text-left md:text-right text-xs text-brand-navy/55 dark:text-white/55 space-y-1 font-semibold">
            <div><span className="font-bold">Dossier ID:</span> #AR-CMS-{new Date(timestamp).getFullYear()}-{new Date().toISOString().slice(0,10).replace(/-/g, '')}</div>
            <div><span className="font-bold">Generated:</span> {new Date(timestamp).toLocaleString()}</div>
            <div><span className="font-bold">Auditor:</span> {generatedBy}</div>
          </div>
        </div>

        {/* Core KPI metrics grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
          
          {/* Projects metrics */}
          <div className="p-5 bg-brand-beige/25 dark:bg-brand-dark border border-brand-navy/5 dark:border-white/10 rounded-2xl space-y-2">
            <div className="flex items-center gap-2 text-brand-navy/40 dark:text-white/40">
              <Briefcase size={16} />
              <span className="text-[10px] font-extrabold uppercase tracking-wider">Site Inventory</span>
            </div>
            <div className="text-2xl font-extrabold text-brand-navy dark:text-white">{projects.length}</div>
            <p className="text-[11px] text-brand-navy/50 dark:text-white/50 font-semibold uppercase">Active construction coordinates registered.</p>
          </div>

          {/* Tasks metrics */}
          <div className="p-5 bg-brand-beige/25 dark:bg-brand-dark border border-brand-navy/5 dark:border-white/10 rounded-2xl space-y-2">
            <div className="flex items-center gap-2 text-brand-navy/40 dark:text-white/40">
              <CheckSquare size={16} />
              <span className="text-[10px] font-extrabold uppercase tracking-wider">Task Performance</span>
            </div>
            <div className="text-2xl font-extrabold text-brand-navy dark:text-white">{taskCompletionRate}%</div>
            <p className="text-[11px] text-brand-navy/50 dark:text-white/50 font-semibold uppercase">
              {completedTasks} completed out of {totalTasks} total tasks.
            </p>
          </div>

          {/* Attendance metrics */}
          <div className="p-5 bg-brand-beige/25 dark:bg-brand-dark border border-brand-navy/5 dark:border-white/10 rounded-2xl space-y-2">
            <div className="flex items-center gap-2 text-brand-navy/40 dark:text-white/40">
              <CalendarRange size={16} />
              <span className="text-[10px] font-extrabold uppercase tracking-wider">Roster Compliance</span>
            </div>
            <div className="text-2xl font-extrabold text-brand-navy dark:text-white">{presentRate}%</div>
            <p className="text-[11px] text-brand-navy/50 dark:text-white/50 font-semibold uppercase">
              Average present and late shift check-ins.
            </p>
          </div>

        </div>

        {/* Section 1: Projects Registry Status */}
        <div className="space-y-4 pt-4 border-t border-brand-navy/5 dark:border-white/10 relative z-10">
          <h3 className="font-outfit font-extrabold text-sm text-brand-navy dark:text-white uppercase tracking-wider">1. Project Coordinates Registry</h3>
          
          <div className="overflow-x-auto rounded-xl border border-brand-navy/5 dark:border-white/10">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-brand-navy/5 dark:bg-white/5 text-brand-navy dark:text-white text-[9px] font-extrabold uppercase tracking-wider border-b border-brand-navy/10 dark:border-white/10">
                  <th className="py-3 px-4">Project Name</th>
                  <th className="py-3 px-4">Site Location</th>
                  <th className="py-3 px-4">Client</th>
                  <th className="py-3 px-4 text-right">Budget (₦)</th>
                  <th className="py-3 px-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-navy/5 dark:divide-white/10 font-semibold text-brand-navy/85 dark:text-white/85">
                {projects.map(proj => (
                  <tr key={proj.id} className="hover:bg-brand-beige/10 dark:hover:bg-white/5">
                    <td className="py-3 px-4 font-bold">{proj.name}</td>
                    <td className="py-3 px-4">{proj.location || 'N/A'}</td>
                    <td className="py-3 px-4">{proj.client_name || 'N/A'}</td>
                    <td className="py-3 px-4 text-right font-mono">₦{Number(proj.budget || 0).toLocaleString()}</td>
                    <td className="py-3 px-4 text-center uppercase text-[9px] font-bold">{proj.status.replace('_', ' ')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Section 2: Tasks Status Overview */}
        <div className="space-y-4 pt-4 border-t border-brand-navy/5 dark:border-white/10 relative z-10">
          <h3 className="font-outfit font-extrabold text-sm text-brand-navy dark:text-white uppercase tracking-wider">2. Task Allocation Operations</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* Task summary table */}
            <div className="space-y-3">
              <h4 className="text-[11px] font-extrabold text-brand-navy/40 dark:text-white/40 uppercase tracking-widest">A. Allocation Status Breakdowns</h4>
              <div className="p-4 bg-brand-beige/10 dark:bg-brand-dark border border-brand-navy/5 dark:border-white/10 rounded-xl space-y-2 text-xs font-semibold text-brand-navy/80 dark:text-white/80">
                <div className="flex justify-between border-b border-brand-navy/5 dark:border-white/10 pb-2">
                  <span>Total Task Allocations:</span>
                  <span className="font-bold">{totalTasks}</span>
                </div>
                <div className="flex justify-between border-b border-brand-navy/5 dark:border-white/10 pb-2 text-green-700">
                  <span>Completed Tasks:</span>
                  <span className="font-extrabold">{completedTasks}</span>
                </div>
                <div className="flex justify-between border-b border-brand-navy/5 dark:border-white/10 pb-2 text-amber-700">
                  <span>In-Progress Tasks:</span>
                  <span className="font-extrabold">{inProgressTasks}</span>
                </div>
                <div className="flex justify-between text-brand-navy/50 dark:text-white/50">
                  <span>Pending Tasks:</span>
                  <span className="font-bold">{pendingTasks}</span>
                </div>
              </div>
            </div>

            {/* List of active tasks */}
            <div className="space-y-3">
              <h4 className="text-[11px] font-extrabold text-brand-navy/40 dark:text-white/40 uppercase tracking-widest">B. High Priority Pending Allocations</h4>
              <div className="space-y-2">
                {tasks.filter(t => t.priority === 'high' && t.status !== 'completed').slice(0, 3).map(task => (
                  <div key={task.id} className="p-3 border border-red-100 bg-red-50/20 rounded-xl flex justify-between items-center text-xs">
                    <div>
                      <span className="font-bold text-red-800">{task.title}</span>
                      <span className="text-[10px] text-brand-navy/40 dark:text-white/40 block mt-0.5">{task.project_name}</span>
                    </div>
                    <span className="text-[9px] font-extrabold uppercase px-2 py-0.5 bg-red-100 text-red-800 rounded">
                      {task.status}
                    </span>
                  </div>
                ))}
                {tasks.filter(t => t.priority === 'high' && t.status !== 'completed').length === 0 && (
                  <p className="text-xs text-brand-navy/40 dark:text-white/40 font-bold uppercase py-4 text-center">No critical pending tasks</p>
                )}
              </div>
            </div>

          </div>
        </div>

        {/* Section 3: Attendance Shift Audits */}
        <div className="space-y-4 pt-4 border-t border-brand-navy/5 dark:border-white/10 relative z-10">
          <h3 className="font-outfit font-extrabold text-sm text-brand-navy dark:text-white uppercase tracking-wider">3. Daily Shift Checkpoints</h3>
          
          <div className="overflow-x-auto rounded-xl border border-brand-navy/5 dark:border-white/10">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-brand-navy/5 dark:bg-white/5 text-brand-navy dark:text-white text-[9px] font-extrabold uppercase tracking-wider border-b border-brand-navy/10 dark:border-white/10">
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Operator</th>
                  <th className="py-3 px-4">Check In</th>
                  <th className="py-3 px-4">Check Out</th>
                  <th className="py-3 px-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-navy/5 dark:divide-white/10 font-semibold text-brand-navy/85 dark:text-white/85">
                {attendance.slice(0, 10).map(rec => (
                  <tr key={rec.id} className="hover:bg-brand-beige/10 dark:hover:bg-white/5">
                    <td className="py-3 px-4 font-mono">{rec.date.split('T')[0]}</td>
                    <td className="py-3 px-4 font-bold">{rec.worker_name}</td>
                    <td className="py-3 px-4 font-mono">{rec.check_in_time}</td>
                    <td className="py-3 px-4 font-mono">{rec.check_out_time || 'Shift Active'}</td>
                    <td className="py-3 px-4 text-center uppercase text-[9px] font-bold">{rec.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Document verification stamp footer */}
        <div className="pt-10 border-t-2 border-dashed border-brand-navy/15 dark:border-white/15 flex flex-col sm:flex-row justify-between items-end gap-6 text-xs text-brand-navy/40 dark:text-white/40 font-bold relative z-10 uppercase tracking-widest mt-8">
          <div>
            <p>CMS Ledger Verification Protocol</p>
            <p className="text-[10px] text-brand-navy/35 dark:text-white/35 font-medium mt-1">Archillery Construction Management Desk</p>
          </div>
          <div className="text-left sm:text-right border-t border-brand-navy/20 dark:border-white/20 pt-2 w-48">
            <p>Authorized Signature</p>
          </div>
        </div>

      </div>
    </div>
  );
}

