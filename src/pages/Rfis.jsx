import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { HelpCircle, User, FileText, Send, CheckCircle, Clock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Rfis() {
  const { user } = useAuth();
  const [rfis, setRfis] = useState([]);
  const [projects, setProjects] = useState([]);
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // RFI Details Drawer/Modal
  const [activeRfi, setActiveRfi] = useState(null);
  const [rfiAnswer, setRfiAnswer] = useState('');
  const [submittingAnswer, setSubmittingAnswer] = useState(false);

  // New RFI Form
  const [newSubject, setNewSubject] = useState('');
  const [newProjectId, setNewProjectId] = useState('');
  const [newAssigneeId, setNewAssigneeId] = useState('');
  const [newQuestion, setNewQuestion] = useState('');
  const [submittingRfi, setSubmittingRfi] = useState(false);

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      setError('');
      const [rfiRes, projRes, staffRes] = await Promise.all([
        axios.get('/api/rfis'),
        axios.get('/api/projects'),
        axios.get('/api/workers') // Retrives supervisor/admin staff members
      ]);
      setRfis(rfiRes.data);
      setProjects(projRes.data);
      // Filter out only supervisors and admins as possible design consultants
      setStaff(staffRes.data.filter(s => s.role === 'supervisor' || s.role === 'admin'));
    } catch (err) {
      console.error(err);
      setError('Failed to fetch communications telemetry.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRfi = async (e) => {
    e.preventDefault();
    if (!newProjectId || !newAssigneeId || !newSubject || !newQuestion) return;
    setSubmittingRfi(true);
    try {
      await axios.post('/api/rfis', {
        project_id: newProjectId,
        assigned_to: newAssigneeId,
        subject: newSubject,
        question: newQuestion
      });
      alert('RFI submitted successfully to Design Consultant!');
      setNewSubject('');
      setNewQuestion('');
      setNewProjectId('');
      setNewAssigneeId('');
      fetchInitialData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to submit RFI');
    } finally {
      setSubmittingRfi(false);
    }
  };

  const handleAnswerSubmit = async (e) => {
    e.preventDefault();
    if (!rfiAnswer) return;
    setSubmittingAnswer(true);
    try {
      await axios.patch(`/api/rfis/${activeRfi.id}/answer`, { answer: rfiAnswer });
      alert('RFI answer submitted successfully!');
      setRfiAnswer('');
      setActiveRfi(null);
      fetchInitialData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to answer RFI');
    } finally {
      setSubmittingAnswer(false);
    }
  };

  const getStatusBadge = (status) => {
    const base = "text-[9px] font-extrabold uppercase px-2 py-0.5 rounded border ";
    switch (status) {
      case 'answered': return base + "bg-green-50 text-green-700 border-green-200";
      case 'under_review': return base + "bg-amber-50 text-amber-700 border-amber-200";
      default: return base + "bg-blue-50 text-blue-700 border-blue-200";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-navy dark:border-white" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fadeIn grid-bg min-h-screen pb-16">
      
      {/* Page Header */}
      <div className="flex items-center justify-between border-b border-brand-navy/5 dark:border-white/10 pb-4">
        <div>
          <h2 className="font-outfit font-extrabold text-2xl text-brand-navy dark:text-white uppercase tracking-wider">RFI & Submittals Registry</h2>
          <p className="text-xs text-brand-navy/60 dark:text-white/60 font-semibold mt-1">Submit technical clarifications to design consultants and track drawing modifications.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Form & Details (col-span-1) */}
        <div className="space-y-8 lg:col-span-1">
          
          {/* Create New RFI Card */}
          <div className="bg-white dark:bg-brand-surface border border-brand-navy/5 dark:border-white/10 rounded-[28px] p-6 shadow-sm space-y-4 hover:shadow-md transition-all">
            <div className="flex items-center gap-2 border-b border-brand-navy/5 dark:border-white/10 pb-3">
              <HelpCircle className="text-brand-gold" size={18} />
              <h3 className="font-outfit font-extrabold text-sm text-brand-navy dark:text-white uppercase tracking-wider">Log New Clarification (RFI)</h3>
            </div>
            
            <form onSubmit={handleCreateRfi} className="space-y-4 text-xs font-semibold">
              <div className="space-y-1">
                <label className="text-[9px] font-extrabold uppercase tracking-widest text-brand-navy/50 dark:text-white/50 block ml-1">Select Project</label>
                <select
                  value={newProjectId}
                  onChange={(e) => setNewProjectId(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-brand-navy/10 dark:border-white/10 focus:outline-none focus:border-brand-gold font-bold text-brand-navy dark:text-white dark:bg-brand-dark uppercase tracking-wider"
                  required
                >
                  <option value="" disabled>Select project site...</option>
                  {projects.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-extrabold uppercase tracking-widest text-brand-navy/50 dark:text-white/50 block ml-1">Assign Consultant Architect</label>
                <select
                  value={newAssigneeId}
                  onChange={(e) => setNewAssigneeId(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-brand-navy/10 dark:border-white/10 focus:outline-none focus:border-brand-gold font-bold text-brand-navy dark:text-white dark:bg-brand-dark uppercase tracking-wider"
                  required
                >
                  <option value="" disabled>Select staff...</option>
                  {staff.map(s => (
                    <option key={s.id} value={s.id}>{s.name} ({s.role.toUpperCase()})</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-extrabold uppercase tracking-widest text-brand-navy/50 dark:text-white/50 block ml-1">RFI Subject Reference</label>
                <input
                  type="text"
                  placeholder="e.g. Column Reinforcement Conflict"
                  value={newSubject}
                  onChange={(e) => setNewSubject(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-brand-navy/10 dark:border-white/10 focus:outline-none focus:border-brand-gold font-medium dark:bg-brand-dark dark:text-white"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-extrabold uppercase tracking-widest text-brand-navy/50 dark:text-white/50 block ml-1">Drawing/Specification Query</label>
                <textarea
                  placeholder="Describe the blueprint discrepancy or material query..."
                  value={newQuestion}
                  onChange={(e) => setNewQuestion(e.target.value)}
                  rows="4"
                  className="w-full px-4 py-2.5 rounded-xl border border-brand-navy/10 dark:border-white/10 focus:outline-none focus:border-brand-gold font-medium dark:bg-brand-dark dark:text-white"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={submittingRfi}
                className="w-full py-2.5 bg-brand-navy hover:bg-brand-navy-light text-white font-extrabold text-xs uppercase tracking-widest rounded-xl transition-all shadow-md"
              >
                {submittingRfi ? 'Submitting...' : 'Dispatch Request'}
              </button>
            </form>
          </div>

          {/* Active RFI Detail Panel */}
          {activeRfi && (
            <div className="bg-white dark:bg-brand-surface border border-brand-navy/5 dark:border-white/10 rounded-[28px] p-6 shadow-sm space-y-4 hover:shadow-md transition-all animate-fadeIn">
              <div className="flex items-center justify-between border-b border-brand-navy/5 dark:border-white/10 pb-3">
                <span className="text-[9px] font-extrabold text-brand-navy/40 dark:text-white/40">RFI DETAIL RESPONSE</span>
                <span className={getStatusBadge(activeRfi.status)}>{activeRfi.status}</span>
              </div>

              <div className="space-y-3.5 text-xs text-brand-navy dark:text-white">
                <div>
                  <h4 className="font-extrabold text-sm">{activeRfi.subject}</h4>
                  <span className="text-[9px] text-brand-navy/50 dark:text-white/50 font-bold block mt-0.5">Project: {activeRfi.project_name}</span>
                </div>

                <div className="p-3 bg-brand-beige/25 dark:bg-brand-dark/25 border border-brand-navy/5 dark:border-white/10 rounded-xl">
                  <div className="flex justify-between items-center text-[9px] text-brand-navy/40 dark:text-white/40 font-extrabold border-b border-brand-navy/5 dark:border-white/10 pb-1 mb-1.5">
                    <span>SUBMITTED BY: {activeRfi.creator_name}</span>
                    <span>{new Date(activeRfi.created_at).toLocaleDateString()}</span>
                  </div>
                  <p className="font-semibold leading-relaxed">{activeRfi.question}</p>
                </div>

                {activeRfi.answer ? (
                  <div className="p-3 bg-green-50/40 border border-green-200/50 rounded-xl">
                    <div className="flex justify-between items-center text-[9px] text-green-700/60 font-extrabold border-b border-green-200/50 pb-1 mb-1.5">
                      <span>ANSWERED BY: {activeRfi.assignee_name}</span>
                      <span>{new Date(activeRfi.answered_at).toLocaleDateString()}</span>
                    </div>
                    <p className="font-semibold leading-relaxed text-green-800">{activeRfi.answer}</p>
                  </div>
                ) : (
                  <form onSubmit={handleAnswerSubmit} className="space-y-2 pt-1 border-t border-brand-navy/5 dark:border-white/10">
                    <label className="text-[9px] font-extrabold uppercase tracking-widest text-brand-navy/40 dark:text-white/40 block ml-1">Write Consultant Answer</label>
                    <textarea
                      placeholder="Input the engineering clarification / drawing modification detail..."
                      value={rfiAnswer}
                      onChange={(e) => setRfiAnswer(e.target.value)}
                      rows="3"
                      className="w-full px-4 py-2.5 rounded-xl border border-brand-navy/10 dark:border-white/10 focus:outline-none focus:border-brand-gold font-medium dark:bg-brand-dark dark:text-white"
                      required
                    />
                    <button
                      type="submit"
                      disabled={submittingAnswer}
                      className="w-full py-2 bg-green-600 hover:bg-green-700 text-white font-extrabold text-xs uppercase tracking-widest rounded-xl transition-all shadow-md"
                    >
                      {submittingAnswer ? 'Submitting...' : 'Issue Clarification'}
                    </button>
                  </form>
                )}
              </div>
            </div>
          )}

        </div>

        {/* Right Column: RFI List (col-span-2) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white dark:bg-brand-surface border border-brand-navy/5 dark:border-white/10 rounded-[28px] p-6 shadow-sm hover:shadow-md transition-all space-y-4">
            <h3 className="font-outfit font-extrabold text-sm text-brand-navy dark:text-white uppercase tracking-wider border-b border-brand-navy/5 dark:border-white/10 pb-3">Active RFI Submittals</h3>
            
            {rfis.length === 0 ? (
              <p className="text-center py-12 text-xs text-brand-navy/40 dark:text-white/40 font-bold uppercase tracking-wider">No Request for Information registered.</p>
            ) : (
              <div className="space-y-3.5 max-h-[600px] overflow-y-auto pr-1">
                {rfis.map(r => (
                  <div 
                    key={r.id} 
                    onClick={() => setActiveRfi(r)}
                    className={`p-4 border rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 cursor-pointer hover:border-brand-gold hover:bg-brand-beige/5 dark:hover:bg-brand-dark/5 transition-all ${
                      activeRfi && activeRfi.id === r.id ? 'border-brand-gold bg-brand-beige/10 dark:bg-brand-dark/10' : 'border-brand-navy/5 dark:border-white/10 bg-white dark:bg-brand-surface'
                    }`}
                  >
                    <div className="space-y-1 max-w-lg">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-extrabold text-brand-gold uppercase">#RFI-00{r.id}</span>
                        <span className={getStatusBadge(r.status)}>{r.status}</span>
                      </div>
                      <h4 className="text-xs font-bold text-brand-navy dark:text-white uppercase tracking-wider">{r.subject}</h4>
                      <p className="text-[10px] text-brand-navy/60 dark:text-white/60 font-semibold line-clamp-1">{r.question}</p>
                      
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[9px] text-brand-navy/40 dark:text-white/40 font-extrabold uppercase pt-1">
                        <span className="flex items-center gap-1"><FileText size={11} /> {r.project_name}</span>
                        <span className="flex items-center gap-1"><User size={11} /> Consultant: {r.assignee_name}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end md:self-center">
                      <span className="text-[9px] text-brand-navy/40 dark:text-white/40 font-extrabold uppercase shrink-0">
                        {new Date(r.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
