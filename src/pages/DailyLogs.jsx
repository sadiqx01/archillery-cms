import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FileText, Sun, Cloud, Users, ShieldAlert, PlusCircle, Trash, Eye, Clipboard, Calendar, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function DailyLogs() {
  const { user } = useAuth();
  const [logs, setLogs] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Selected Detailed Viewer Modal
  const [activeLog, setActiveLog] = useState(null);

  // Short Daily Update Form states
  const [newProjectId, setNewProjectId] = useState('');
  const [newLogDate, setNewLogDate] = useState(new Date().toISOString().split('T')[0]);
  const [workCompleted, setWorkCompleted] = useState('');
  const [materialsUsed, setMaterialsUsed] = useState('');
  const [issues, setIssues] = useState('');
  const [submittingLog, setSubmittingLog] = useState(false);

  useEffect(() => {
    fetchLogsTelemetry();
  }, []);

  const fetchLogsTelemetry = async () => {
    try {
      setLoading(true);
      setError('');
      const [logsRes, projRes] = await Promise.all([
        axios.get('/api/daily-logs'),
        axios.get('/api/projects')
      ]);
      setLogs(logsRes.data);
      setProjects(projRes.data);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch daily site updates.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitDailyLog = async (e) => {
    e.preventDefault();
    if (!newProjectId || !workCompleted) {
      alert('Please select a project and enter the work completed.');
      return;
    }
    setSubmittingLog(true);

    try {
      await axios.post('/api/daily-logs', {
        project_id: newProjectId,
        log_date: newLogDate,
        work_completed: workCompleted,
        materials_used: materialsUsed || 'Standard materials',
        issues: issues || 'No site issues or delays',
        weather_am: 'Clear, 28°C',
        weather_pm: 'Clear, 32°C',
        materials_received: materialsUsed
      });

      alert('Daily site update submitted successfully!');
      setNewProjectId('');
      setWorkCompleted('');
      setMaterialsUsed('');
      setIssues('');
      fetchLogsTelemetry();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to submit daily update');
    } finally {
      setSubmittingLog(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-navy dark:border-white" />
      </div>
    );
  }

  const canPostLog = ['supervisor', 'engineer', 'ceo', 'cto', 'it'].includes(user?.role);

  return (
    <div className="space-y-6 animate-fadeIn pb-16">
      
      {/* Page Header */}
      <div>
        <h2 className="font-outfit font-extrabold text-2xl text-brand-navy dark:text-white uppercase tracking-wider">
          Daily Site Updates
        </h2>
        <p className="text-xs text-brand-navy/60 dark:text-white/60 font-semibold mt-1">
          Simple daily site reports tracking work completed, materials used, and site issues.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        {/* Left Column: Short Daily Update Form */}
        {canPostLog && (
          <div className="lg:col-span-1 bg-white dark:bg-brand-surface border border-brand-navy/5 dark:border-white/10 rounded-[28px] p-6 shadow-sm space-y-4 hover:shadow-md transition-all no-print">
            <div className="flex items-center gap-2 border-b border-brand-navy/5 dark:border-white/10 pb-3">
              <Clipboard className="text-brand-gold" size={18} />
              <h3 className="font-outfit font-extrabold text-sm text-brand-navy dark:text-white uppercase tracking-wider">
                New Daily Update
              </h3>
            </div>

            <form onSubmit={handleSubmitDailyLog} className="space-y-3.5 text-xs font-semibold">
              
              <div className="space-y-1">
                <label className="text-[10px] font-extrabold uppercase tracking-wider text-brand-navy/50 dark:text-white/50 block">Project Site</label>
                <select
                  value={newProjectId}
                  onChange={(e) => setNewProjectId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-brand-navy/10 dark:border-white/10 focus:outline-none focus:border-brand-gold font-bold text-brand-navy dark:text-white dark:bg-brand-dark text-xs"
                  required
                >
                  <option value="" disabled>Select project site...</option>
                  {projects.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-extrabold uppercase tracking-wider text-brand-navy/50 dark:text-white/50 block">Date</label>
                <input
                  type="date"
                  value={newLogDate}
                  onChange={(e) => setNewLogDate(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-brand-navy/10 dark:border-white/10 focus:outline-none focus:border-brand-gold font-medium dark:bg-brand-dark dark:text-white text-xs"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-extrabold uppercase tracking-wider text-brand-navy/50 dark:text-white/50 block">
                  Work Completed Today
                </label>
                <textarea
                  rows="3"
                  placeholder="e.g. Casted 12 columns on Sector B ground floor. Steel reinforcement inspected and approved."
                  value={workCompleted}
                  onChange={(e) => setWorkCompleted(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-brand-navy/10 dark:border-white/10 focus:outline-none focus:border-brand-gold font-medium dark:bg-brand-dark dark:text-white text-xs resize-none"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-extrabold uppercase tracking-wider text-brand-navy/50 dark:text-white/50 block">
                  Materials Used / Received
                </label>
                <textarea
                  rows="2"
                  placeholder="e.g. 60 bags Dangote Cement, 10 tons 16mm rebar, 2 trips sand."
                  value={materialsUsed}
                  onChange={(e) => setMaterialsUsed(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-brand-navy/10 dark:border-white/10 focus:outline-none focus:border-brand-gold font-medium dark:bg-brand-dark dark:text-white text-xs resize-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-extrabold uppercase tracking-wider text-brand-navy/50 dark:text-white/50 block">
                  Issues / Delays (If any)
                </label>
                <textarea
                  rows="2"
                  placeholder="e.g. Rain delay between 2 PM and 3 PM. Concrete supplier delivered 1 hour late."
                  value={issues}
                  onChange={(e) => setIssues(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-brand-navy/10 dark:border-white/10 focus:outline-none focus:border-brand-gold font-medium dark:bg-brand-dark dark:text-white text-xs resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={submittingLog}
                className="w-full py-2.5 bg-brand-navy hover:bg-brand-navy-light text-white font-extrabold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md cursor-pointer"
              >
                {submittingLog ? 'Posting...' : 'Post Daily Update'}
              </button>
            </form>
          </div>
        )}

        {/* Right Column: Feed of Daily Updates */}
        <div className={`space-y-4 ${canPostLog ? 'lg:col-span-2' : 'lg:col-span-3'}`}>
          <div className="bg-white dark:bg-brand-surface border border-brand-navy/5 dark:border-white/10 rounded-[28px] p-6 shadow-sm space-y-4">
            <div className="flex justify-between items-center border-b border-brand-navy/5 dark:border-white/10 pb-3">
              <h3 className="font-outfit font-extrabold text-sm text-brand-navy dark:text-white uppercase tracking-wider">
                Site Updates Log
              </h3>
              <span className="text-[10px] text-brand-navy/40 dark:text-white/40 font-bold uppercase">{logs.length} Updates Filed</span>
            </div>

            {logs.length === 0 ? (
              <p className="text-center py-12 text-xs text-brand-navy/40 dark:text-white/40 font-bold uppercase tracking-wider">
                No daily updates filed yet.
              </p>
            ) : (
              <div className="space-y-4">
                {logs.map(log => (
                  <div key={log.id} className="p-4 border border-brand-navy/5 dark:border-white/10 rounded-2xl bg-brand-beige/10 dark:bg-brand-dark/40 space-y-3 hover:border-brand-gold/30 transition-all">
                    {/* Header */}
                    <div className="flex flex-wrap justify-between items-center gap-2 border-b border-brand-navy/5 dark:border-white/5 pb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-brand-navy dark:text-white text-xs uppercase">
                          {log.project_name}
                        </span>
                        <span className="text-[10px] text-brand-gold font-bold">
                          • {new Date(log.log_date).toLocaleDateString()}
                        </span>
                      </div>
                      <span className="text-[9px] text-brand-navy/40 dark:text-white/40 uppercase font-bold">
                        Logged by: {log.logged_by_name}
                      </span>
                    </div>

                    {/* Work Completed */}
                    <div className="space-y-1">
                      <span className="text-[9px] font-extrabold uppercase tracking-wider text-brand-navy/40 dark:text-white/40 block">
                        Work Completed:
                      </span>
                      <p className="text-xs text-brand-navy/90 dark:text-white/90 leading-relaxed font-semibold">
                        {log.work_completed || (log.labor_details ? Object.keys(log.labor_details).join(', ') + ' active on site' : 'Site work underway.')}
                      </p>
                    </div>

                    {/* Materials Used */}
                    {(log.materials_used || log.materials_received) && (
                      <div className="space-y-0.5 bg-white dark:bg-brand-surface p-2.5 rounded-xl border border-brand-navy/5 dark:border-white/5">
                        <span className="text-[9px] font-extrabold uppercase tracking-wider text-brand-navy/40 dark:text-white/40 block">
                          Materials:
                        </span>
                        <p className="text-xs text-brand-navy/70 dark:text-white/70 font-medium">
                          {log.materials_used || log.materials_received}
                        </p>
                      </div>
                    )}

                    {/* Issues / Constraints */}
                    {log.issues && log.issues !== 'None reported' && (
                      <div className="p-2.5 rounded-xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-800/40 text-xs flex items-start gap-2 text-amber-800 dark:text-amber-300">
                        <AlertTriangle size={13} className="shrink-0 mt-0.5" />
                        <div>
                          <strong className="text-[9px] uppercase tracking-wider block">Site Issues / Delays:</strong>
                          <span>{log.issues}</span>
                        </div>
                      </div>
                    )}

                    {/* Footer link to view full audit */}
                    <div className="flex justify-end pt-1">
                      <button
                        onClick={() => setActiveLog(log)}
                        className="text-[10px] font-extrabold uppercase text-brand-gold hover:underline cursor-pointer flex items-center gap-1"
                      >
                        <Eye size={12} /> View Full Entry
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Full Entry Modal */}
      {activeLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-brand-dark/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-brand-surface border border-brand-navy/10 dark:border-white/10 w-full max-w-lg rounded-[28px] p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-brand-navy/5 dark:border-white/10 pb-3">
              <div>
                <h3 className="font-outfit font-extrabold text-sm text-brand-navy dark:text-white uppercase tracking-wider">
                  Daily Site Diary Entry
                </h3>
                <span className="text-[10px] text-brand-gold font-bold">{activeLog.project_name} • {activeLog.log_date}</span>
              </div>
              <button 
                onClick={() => setActiveLog(null)} 
                className="text-xs font-bold text-brand-navy/40 dark:text-white/40 hover:text-brand-navy dark:hover:text-white cursor-pointer uppercase"
              >
                Close
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-brand-beige/20 dark:bg-brand-dark rounded-xl space-y-1">
                <span className="text-[9px] uppercase font-bold text-brand-navy/40 dark:text-white/40 block">Work Completed</span>
                <p className="font-semibold text-brand-navy dark:text-white leading-relaxed">{activeLog.work_completed || 'General construction activities'}</p>
              </div>

              <div className="p-3 bg-brand-beige/20 dark:bg-brand-dark rounded-xl space-y-1">
                <span className="text-[9px] uppercase font-bold text-brand-navy/40 dark:text-white/40 block">Materials Used</span>
                <p className="font-semibold text-brand-navy dark:text-white">{activeLog.materials_used || activeLog.materials_received || 'Standard materials'}</p>
              </div>

              <div className="p-3 bg-brand-beige/20 dark:bg-brand-dark rounded-xl space-y-1">
                <span className="text-[9px] uppercase font-bold text-brand-navy/40 dark:text-white/40 block">Site Issues</span>
                <p className="font-semibold text-brand-navy dark:text-white">{activeLog.issues || 'No delays or constraints'}</p>
              </div>

              {activeLog.labor_details && Object.keys(activeLog.labor_details).length > 0 && (
                <div className="p-3 border border-brand-navy/5 dark:border-white/5 rounded-xl space-y-1">
                  <span className="text-[9px] uppercase font-bold text-brand-navy/40 dark:text-white/40 block">Labor Crew</span>
                  <div className="flex flex-wrap gap-2 text-[10px]">
                    {Object.entries(activeLog.labor_details).map(([k, v]) => (
                      <span key={k} className="px-2 py-0.5 rounded bg-brand-beige/40 dark:bg-white/5 font-bold">
                        {k}: {v}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end pt-2 border-t border-brand-navy/5 dark:border-white/10">
              <button
                onClick={() => setActiveLog(null)}
                className="px-4 py-2 bg-brand-navy dark:bg-white/10 text-white rounded-xl text-xs font-bold uppercase cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
