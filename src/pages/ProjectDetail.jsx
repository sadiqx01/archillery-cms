import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { 
  ArrowLeft, 
  MapPin, 
  User as UserIcon, 
  DollarSign, 
  Calendar, 
  Clock, 
  Upload, 
  Image as ImageIcon,
  CheckCircle,
  Plus,
  Trash2,
  HardHat,
  MessageSquarePlus,
  ChevronRight,
  AlertTriangle
} from 'lucide-react';

export default function ProjectDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Timeline Progress Update Input
  const [newUpdateDescription, setNewUpdateDescription] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [actionLoading, setActionLoading] = useState(false);

  // Gantt Chart Milestones state
  const [milestones, setMilestones] = useState([
    { id: 1, name: 'Site Preparation & Excavation', start: '2026-02-15', end: '2026-03-30', progress: 100, status: 'completed' },
    { id: 2, name: 'Foundation & Raft Slab Casting', start: '2026-04-01', end: '2026-05-15', progress: 100, status: 'completed' },
    { id: 3, name: 'Skeletal Concrete Frame & Beams', start: '2026-05-16', end: '2026-07-31', progress: 85, status: 'in_progress' },
    { id: 4, name: 'Exterior Glazed Facade & Masonry', start: '2026-08-01', end: '2026-10-15', progress: 30, status: 'in_progress' },
    { id: 5, name: 'MEP Electrical & Plumbing Rough-In', start: '2026-10-16', end: '2026-12-15', progress: 0, status: 'pending' },
    { id: 6, name: 'Interior Joinery & Flooring Finishes', start: '2026-12-16', end: '2027-01-31', progress: 0, status: 'pending' },
    { id: 7, name: 'Final QC Audit & Client Handover', start: '2027-02-01', end: '2027-02-15', progress: 0, status: 'pending' },
  ]);

  const handleToggleMilestone = (id) => {
    setMilestones(prev => prev.map(m => {
      if (m.id === id) {
        const nextStatus = m.status === 'completed' ? 'in_progress' : m.status === 'in_progress' ? 'pending' : 'completed';
        const nextProg = nextStatus === 'completed' ? 100 : nextStatus === 'in_progress' ? 50 : 0;
        return { ...m, status: nextStatus, progress: nextProg };
      }
      return m;
    }));
  };

  const fetchProjectDetails = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await axios.get(`/api/projects/${id}`);
      setProject(res.data);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to download project files');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjectDetails();
  }, [id]);

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  const handleProgressSubmit = async (e) => {
    e.preventDefault();
    if (!newUpdateDescription) {
      alert('Scope description text is required.');
      return;
    }

    setActionLoading(true);
    const formData = new FormData();
    formData.append('description', newUpdateDescription);
    if (selectedFile) {
      formData.append('image', selectedFile);
    }

    try {
      await axios.post(`/api/projects/${id}/progress`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        onUploadProgress: (progressEvent) => {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(progress);
        }
      });

      setNewUpdateDescription('');
      setSelectedFile(null);
      setUploadProgress(0);
      await fetchProjectDetails();
    } catch (err) {
      alert(err.response?.data?.message || 'Error uploading progress file');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] flex-col">
        <div className="w-12 h-12 border-4 border-brand-navy dark:border-white border-t-brand-gold rounded-full animate-spin"></div>
        <p className="mt-4 text-xs font-extrabold text-brand-navy/60 dark:text-white/60 uppercase tracking-widest animate-pulse">Syncing Site ledger...</p>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="p-8 rounded-3xl bg-white dark:bg-brand-surface border border-red-100 text-center max-w-xl mx-auto shadow-xl">
        <ArrowLeft className="mx-auto mb-4 text-red-400" size={32} />
        <h3 className="font-outfit font-extrabold text-brand-navy dark:text-white text-lg uppercase tracking-wider">Sync Error</h3>
        <p className="text-sm text-brand-navy/60 dark:text-white/60 mt-2 font-medium">{error || 'Project data record not found.'}</p>
        <Link 
          to="/projects" 
          className="mt-6 inline-flex items-center gap-1.5 px-6 py-3 bg-brand-navy text-white hover:bg-brand-navy-light rounded-xl font-bold text-xs uppercase tracking-wider transition-colors shadow-md"
        >
          Return to Registry
        </Link>
      </div>
    );
  }

  const tasks = project.tasks || [];
  const progressUpdates = project.progressUpdates || [];

  const getStatusBadgeClass = (status) => {
    const base = 'text-[9px] font-extrabold uppercase px-3 py-1.5 rounded-full border ';
    switch (status) {
      case 'active': return base + 'bg-green-50 text-green-700 border-green-200';
      case 'planning': return base + 'bg-brand-gold/15 text-brand-navy border-brand-gold/25';
      case 'completed': return base + 'bg-blue-50 text-blue-700 border-blue-200';
      case 'on_hold': return base + 'bg-red-50 text-red-700 border-red-200';
      default: return base + 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn grid-bg min-h-screen pb-16">
      
      {/* Navigation Breadcrumb */}
      <div className="flex items-center justify-between no-print border-b border-brand-navy/5 dark:border-white/10 pb-4">
        <Link 
          to="/projects" 
          className="inline-flex items-center gap-1.5 text-xs text-brand-navy/60 dark:text-white/60 font-bold hover:text-brand-gold transition-colors"
        >
          <ArrowLeft size={16} />
          Back to Registry
        </Link>
        <span className="text-[10px] font-extrabold text-brand-navy/40 dark:text-white/40 uppercase tracking-widest">Site ID: #{project.id}</span>
      </div>

      {/* Project Banner Card */}
      <div className="bg-[#001026] text-white rounded-[32px] p-8 relative overflow-hidden shadow-xl border border-white/5">
        <div className="absolute inset-0 grid-bg opacity-15 pointer-events-none" />
        <div className="absolute -top-12 -right-12 w-64 h-64 rounded-full bg-brand-gold/10 blur-[80px]" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div className="space-y-4 flex-1">
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-brand-gold bg-brand-gold/10 px-3.5 py-1.5 rounded-full border border-brand-gold/20 select-none">
                Site Coordinate Ledger
              </span>
              <span className={getStatusBadgeClass(project.status)}>
                {project.status.replace('_', ' ')}
              </span>
            </div>

            <h2 className="font-outfit font-extrabold text-2xl md:text-4xl leading-tight pt-1 max-w-2xl">{project.name}</h2>
            <p className="text-brand-beige/70 text-xs md:text-sm leading-relaxed max-w-2xl font-medium">
              {project.description || 'No construction scope detailed.'}
            </p>
            
            <div className="flex flex-wrap gap-3 pt-3 no-print">
              <Link 
                to={`/projects/${project.id}/financials`}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-brand-gold hover:bg-white text-brand-dark font-extrabold text-[10px] uppercase tracking-widest rounded-xl transition-all shadow-md"
              >
                <DollarSign size={13} /> BOQ & Financials
              </Link>
              <Link 
                to={`/projects/${project.id}/snags`}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-white/10 hover:bg-white/20 text-white font-extrabold text-[10px] uppercase tracking-widest rounded-xl border border-white/15 transition-all shadow-md"
              >
                <AlertTriangle size={13} className="text-brand-gold" /> Defect Snagging Map
              </Link>
            </div>
          </div>

          {project.cover_image && (
            <div className="w-full md:w-80 h-48 rounded-2xl overflow-hidden border border-white/10 shadow-lg shrink-0 relative z-10">
              <img src={project.cover_image} alt={project.name} className="w-full h-full object-cover" />
            </div>
          )}
        </div>
      </div>

      {/* Split Details columns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Hand: parameters card (Lg: col-span-1) */}
        <div className="lg:col-span-1 space-y-8">
          
          {/* Coordinate Parameters */}
          <div className="bg-white dark:bg-brand-surface border border-brand-navy/5 dark:border-white/10 rounded-[28px] p-6 shadow-sm space-y-5 hover:shadow-md transition-all">
            <h3 className="font-outfit font-extrabold text-sm text-brand-navy dark:text-white uppercase tracking-wider border-b border-brand-navy/5 dark:border-white/10 pb-3">Site Coordinates</h3>
            
            <div className="space-y-4 text-xs font-semibold text-brand-navy/80 dark:text-white/80">
              
              <div className="flex items-start gap-3">
                <div className="p-2 bg-brand-beige/50 dark:bg-brand-dark text-brand-navy dark:text-white rounded-xl mt-0.5">
                  <MapPin size={16} className="text-brand-gold" />
                </div>
                <div>
                  <span className="text-[9px] font-extrabold text-brand-navy/40 dark:text-white/40 uppercase tracking-widest block">Geographic Location</span>
                  <span className="text-sm font-bold text-brand-navy dark:text-white block mt-0.5">{project.location || 'Not Specified'}</span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2 bg-brand-beige/50 dark:bg-brand-dark text-brand-navy dark:text-white rounded-xl mt-0.5">
                  <UserIcon size={16} className="text-brand-gold" />
                </div>
                <div>
                  <span className="text-[9px] font-extrabold text-brand-navy/40 dark:text-white/40 uppercase tracking-widest block">Client Authority</span>
                  <span className="text-sm font-bold text-brand-navy dark:text-white block mt-0.5">{project.client_name || 'Generic Client'}</span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2 bg-brand-beige/50 dark:bg-brand-dark text-brand-navy dark:text-white rounded-xl mt-0.5">
                  <DollarSign size={16} className="text-brand-gold" />
                </div>
                <div>
                  <span className="text-[9px] font-extrabold text-brand-navy/40 dark:text-white/40 uppercase tracking-widest block">Aggregated Budget</span>
                  <span className="text-sm font-extrabold text-brand-navy dark:text-white block mt-0.5">₦{Number(project.budget || 0).toLocaleString()}</span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2 bg-brand-beige/50 dark:bg-brand-dark text-brand-navy dark:text-white rounded-xl mt-0.5">
                  <Calendar size={16} className="text-brand-gold" />
                </div>
                <div>
                  <span className="text-[9px] font-extrabold text-brand-navy/40 dark:text-white/40 uppercase tracking-widest block">Contract Duration</span>
                  <span className="text-xs text-brand-navy dark:text-white block mt-0.5 font-bold">
                    {project.start_date ? new Date(project.start_date).toLocaleDateString('en-US', { dateStyle: 'medium' }) : 'N/A'} - {project.end_date ? new Date(project.end_date).toLocaleDateString('en-US', { dateStyle: 'medium' }) : 'N/A'}
                  </span>
                </div>
              </div>

            </div>
          </div>

          {/* Allocation Milestones list */}
          <div className="bg-white dark:bg-brand-surface border border-brand-navy/5 dark:border-white/10 rounded-[28px] p-6 shadow-sm space-y-4 hover:shadow-md transition-all">
            <h3 className="font-outfit font-extrabold text-sm text-brand-navy dark:text-white uppercase tracking-wider border-b border-brand-navy/5 dark:border-white/10 pb-3">Allocated Tasks</h3>
            
            {tasks.length === 0 ? (
              <p className="text-center py-6 text-xs text-brand-navy/40 dark:text-white/40 font-bold uppercase tracking-wider">No tasks scheduled.</p>
            ) : (
              <div className="space-y-3">
                {tasks.map(task => (
                  <div key={task.id} className="p-3.5 border border-brand-navy/5 dark:border-white/10 rounded-xl bg-brand-beige/10 dark:bg-brand-dark flex items-center justify-between text-xs">
                    <div>
                      <span className="font-bold text-brand-navy dark:text-white block truncate max-w-[150px]">{task.title}</span>
                      <span className="text-[9px] text-brand-navy/40 dark:text-white/40 block mt-0.5">Assigned to: {task.worker_name || `Worker #${task.worker_id}`}</span>
                    </div>
                    <span className={`text-[8px] font-extrabold uppercase px-2 py-0.5 rounded ${
                      task.status === 'completed' ? 'bg-blue-50 text-blue-700 border border-blue-200' :
                      task.status === 'in_progress' ? 'bg-brand-gold/15 text-brand-navy border border-brand-gold/20' :
                      'bg-gray-50 text-gray-500 border border-gray-200'
                    }`}>
                      {task.status.replace('_', ' ')}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Structural Specifications */}
          {project.specs && Object.keys(project.specs).length > 0 && (
            <div className="bg-[#001026] text-white border border-white/5 rounded-[28px] p-6 shadow-sm space-y-4 hover:shadow-md transition-all relative overflow-hidden">
              <div className="absolute inset-0 grid-bg opacity-10 pointer-events-none" />
              <h3 className="font-outfit font-extrabold text-sm text-brand-gold uppercase tracking-wider border-b border-white/10 pb-3 relative z-10">Structural Specifications</h3>
              <div className="space-y-3.5 relative z-10 text-xs font-semibold">
                {Object.entries(project.specs).map(([key, val]) => (
                  <div key={key} className="flex justify-between items-start border-b border-white/5 pb-2">
                    <span className="text-brand-beige/50 font-bold uppercase tracking-wider text-[10px]">{key}</span>
                    <span className="text-white text-right font-bold pl-4">{val}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Key Site Features */}
          {project.features && project.features.length > 0 && (
            <div className="bg-white dark:bg-brand-surface border border-brand-navy/5 dark:border-white/10 rounded-[28px] p-6 shadow-sm space-y-4 hover:shadow-md transition-all">
              <h3 className="font-outfit font-extrabold text-sm text-brand-navy dark:text-white uppercase tracking-wider border-b border-brand-navy/5 dark:border-white/10 pb-3">Key Site Features</h3>
              <div className="space-y-2.5 text-xs font-semibold text-brand-navy/80 dark:text-white/80">
                {project.features.map((feat, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-brand-gold shrink-0" />
                    <span>{feat}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Right Hand: Progress Timeline Feed & File Uploader (Lg: col-span-2) */}
        <div className="lg:col-span-2 space-y-8">

          {/* Interactive Gantt Chart & Construction Schedule */}
          <div className="bg-white dark:bg-brand-surface border border-brand-navy/5 dark:border-white/10 rounded-[28px] p-6 shadow-sm space-y-5 hover:shadow-md transition-all">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-brand-navy/5 dark:border-white/10 pb-4">
              <div>
                <h3 className="font-outfit font-extrabold text-sm text-brand-navy dark:text-white uppercase tracking-wider">Project Critical Path & Gantt Schedule</h3>
                <p className="text-[10px] text-brand-navy/50 dark:text-white/50 font-medium mt-0.5">Click any milestone bar to toggle completion status.</p>
              </div>
              <span className="text-[9px] font-extrabold text-brand-gold bg-brand-gold/10 px-3 py-1 rounded-full border border-brand-gold/20 self-start sm:self-auto uppercase tracking-wider">
                Overall Progress: {Math.round(milestones.reduce((acc, m) => acc + m.progress, 0) / milestones.length)}%
              </span>
            </div>

            <div className="space-y-4 pt-2">
              {milestones.map((m) => (
                <div 
                  key={m.id} 
                  onClick={() => handleToggleMilestone(m.id)}
                  className="p-3.5 rounded-2xl border border-brand-navy/5 dark:border-white/10 bg-brand-beige/10 dark:bg-brand-dark hover:border-brand-gold/40 transition-all cursor-pointer group"
                >
                  <div className="flex items-center justify-between text-xs mb-2">
                    <div className="flex items-center gap-2">
                      <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                        m.status === 'completed' ? 'bg-green-500' :
                        m.status === 'in_progress' ? 'bg-brand-gold animate-pulse' :
                        'bg-gray-300 dark:bg-white/20'
                      }`} />
                      <span className="font-bold text-brand-navy dark:text-white group-hover:text-brand-gold transition-colors">{m.name}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-[9px] font-mono text-brand-navy/40 dark:text-white/40 hidden sm:inline">{m.start} → {m.end}</span>
                      <span className={`text-[8px] font-extrabold uppercase px-2.5 py-0.5 rounded-full border ${
                        m.status === 'completed' ? 'bg-green-50 text-green-700 border-green-200 dark:bg-green-950/40 dark:text-green-300 dark:border-green-800/40' :
                        m.status === 'in_progress' ? 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800/40' :
                        'bg-gray-50 text-gray-500 border-gray-200 dark:bg-white/5 dark:text-white/40 dark:border-white/10'
                      }`}>
                        {m.status.replace('_', ' ')}
                      </span>
                    </div>
                  </div>

                  {/* Gantt Bar Visualization */}
                  <div className="w-full bg-brand-navy/5 dark:bg-white/5 rounded-full h-2.5 overflow-hidden flex">
                    <div 
                      className={`h-full transition-all duration-500 ${
                        m.status === 'completed' ? 'bg-green-500' :
                        m.status === 'in_progress' ? 'bg-gradient-to-r from-brand-gold to-amber-500' :
                        'bg-gray-300 dark:bg-white/20'
                      }`}
                      style={{ width: `${m.progress}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Timeline Update upload tool (Admin/Supervisor Only) */}
          {user.role !== 'worker' && (
            <div className="bg-white dark:bg-brand-surface border border-brand-navy/5 dark:border-white/10 rounded-[28px] p-6 shadow-sm space-y-5 hover:shadow-md transition-all no-print">
              <h3 className="font-outfit font-extrabold text-sm text-brand-navy dark:text-white uppercase tracking-wider border-b border-brand-navy/5 dark:border-white/10 pb-3">Log Site Progress Update</h3>
              
              <form onSubmit={handleProgressSubmit} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[9px] font-extrabold uppercase tracking-widest text-brand-navy/50 dark:text-white/50 block ml-1">Scope Description</label>
                  <textarea
                    value={newUpdateDescription}
                    onChange={(e) => setNewUpdateDescription(e.target.value)}
                    rows="2"
                    placeholder="e.g. Concrete slab casting for second floor completed. Steel rebar layout approved by structural engineer..."
                    className="w-full px-4 py-2.5 rounded-xl border border-brand-navy/10 dark:border-white/10 focus:outline-none focus:border-brand-gold text-xs font-medium dark:bg-brand-dark dark:text-white"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                  <div className="space-y-1">
                    <label className="text-[9px] font-extrabold uppercase tracking-widest text-brand-navy/50 dark:text-white/50 block ml-1">Optional Photo Upload</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="w-full text-xs text-brand-navy dark:text-white dark:bg-brand-dark file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-[10px] file:font-extrabold file:uppercase file:tracking-wider file:bg-brand-navy file:text-white hover:file:bg-brand-navy-light file:cursor-pointer"
                    />
                  </div>

                  <div className="flex justify-end pt-3 md:pt-0">
                    <button
                      type="submit"
                      disabled={actionLoading}
                      className="px-6 py-3.5 bg-brand-gold hover:bg-brand-gold/80 text-brand-dark font-extrabold text-xs uppercase tracking-widest rounded-xl transition-all shadow-md flex items-center gap-1.5 disabled:opacity-50"
                    >
                      <Upload size={14} />
                      {actionLoading ? 'Uploading...' : 'Publish Update'}
                    </button>
                  </div>
                </div>

                {uploadProgress > 0 && (
                  <div className="w-full bg-brand-beige dark:bg-brand-dark rounded-full h-1.5 overflow-hidden">
                    <div style={{ width: `${uploadProgress}%` }} className="bg-brand-navy h-full transition-all duration-300" />
                  </div>
                )}
              </form>
            </div>
          )}

          {/* Timeline Feed */}
          <div className="bg-white dark:bg-brand-surface border border-brand-navy/5 dark:border-white/10 rounded-[28px] p-6 shadow-sm space-y-6 hover:shadow-md transition-all">
            <h3 className="font-outfit font-extrabold text-sm text-brand-navy dark:text-white uppercase tracking-wider border-b border-brand-navy/5 dark:border-white/10 pb-3">Site Progress Timeline</h3>
            
            {progressUpdates.length === 0 ? (
              <div className="text-center py-16 flex flex-col items-center">
                <MessageSquarePlus className="text-brand-navy/20 dark:text-white/20 animate-pulse mb-3" size={32} />
                <p className="text-xs text-brand-navy/40 dark:text-white/40 font-bold uppercase tracking-wider">No timeline logs registered.</p>
              </div>
            ) : (
              <div className="space-y-8 relative before:absolute before:inset-y-0 before:left-4 before:w-0.5 before:bg-brand-navy/5 dark:before:bg-white/10">
                {progressUpdates.map((update, index) => (
                  <div key={update.id} className="relative pl-10 flex flex-col md:flex-row md:items-start justify-between gap-6 group">
                    <span className="absolute left-2 top-1.5 w-4 h-4 rounded-full bg-brand-navy border-4 border-white dark:border-brand-surface flex items-center justify-center shadow-sm group-hover:bg-brand-gold transition-colors duration-300" />
                    
                    <div className="space-y-2 flex-1 pr-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-[10px] font-extrabold text-brand-gold bg-brand-navy px-2 py-0.5 rounded uppercase tracking-widest">Milestone {progressUpdates.length - index}</span>
                        <span className="text-brand-navy/30 dark:text-white/30">•</span>
                        <span className="text-xs text-brand-navy/40 dark:text-white/40 font-bold">
                          {new Date(update.update_date).toLocaleDateString('en-US', { dateStyle: 'medium' })}
                        </span>
                      </div>
                      
                      <p className="text-sm font-medium text-brand-navy/80 dark:text-white/80 leading-relaxed">
                        {update.description}
                      </p>
                      
                      <div className="flex items-center gap-1.5 text-[10px] text-brand-navy/40 dark:text-white/40 font-bold uppercase">
                        <HardHat size={12} className="text-brand-gold" />
                        Operator: {update.updater_name} ({update.updater_role})
                      </div>
                    </div>

                    {update.image_url && (
                      <div className="shrink-0 max-w-[200px] w-full rounded-2xl overflow-hidden border border-brand-navy/5 dark:border-white/10 shadow-sm relative group/img cursor-pointer">
                        <img 
                          src={update.image_url} 
                          alt="site update" 
                          className="w-full h-32 object-cover group-hover/img:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-brand-gold/10 opacity-0 group-hover/img:opacity-100 transition-opacity duration-300 pointer-events-none" />
                      </div>
                    )}
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
