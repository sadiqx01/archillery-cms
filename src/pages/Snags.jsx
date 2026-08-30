import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, AlertCircle, CheckCircle, HelpCircle, HardHat, Camera, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Snags() {
  const { id } = useParams();
  const { user } = useAuth();
  const blueprintRef = useRef(null);

  const [project, setProject] = useState(null);
  const [snags, setSnags] = useState([]);
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Active click coordinate
  const [clickedCoords, setClickedCoords] = useState(null);
  const [activeSnag, setActiveSnag] = useState(null);

  // New Snag form states
  const [description, setDescription] = useState('');
  const [defectType, setDefectType] = useState('Concrete Work');
  const [assignedTo, setAssignedTo] = useState('');
  const [submittingSnag, setSubmittingSnag] = useState(false);

  useEffect(() => {
    fetchSnagTelemetry();
  }, [id]);

  const fetchSnagTelemetry = async () => {
    try {
      setLoading(true);
      setError('');
      const [projRes, snagRes, workerRes] = await Promise.all([
        axios.get(`/api/projects/${id}`),
        axios.get(`/api/snags?projectId=${id}`),
        axios.get('/api/workers') // Gets subcontract field staff
      ]);
      setProject(projRes.data);
      setSnags(snagRes.data);
      setWorkers(workerRes.data.filter(w => w.role === 'worker'));
    } catch (err) {
      console.error(err);
      setError('Failed to fetch defect registers.');
    } finally {
      setLoading(false);
    }
  };

  const handleBlueprintClick = (e) => {
    if (user.role === 'worker') return; // Workers cannot log snags
    if (!blueprintRef.current) return;
    
    const rect = blueprintRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    
    // Save coordinate and clear active snag popup
    setClickedCoords({ x: x.toFixed(2), y: y.toFixed(2) });
    setActiveSnag(null);
  };

  const handleCreateSnag = async (e) => {
    e.preventDefault();
    if (!clickedCoords || !description || !assignedTo) return;
    setSubmittingSnag(true);
    try {
      await axios.post('/api/snags', {
        project_id: id,
        pin_x: clickedCoords.x,
        pin_y: clickedCoords.y,
        description,
        defect_type: defectType,
        assigned_to: assignedTo
      });
      alert('Defect pin logged on blueprint drawing!');
      setClickedCoords(null);
      setDescription('');
      setAssignedTo('');
      fetchSnagTelemetry();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to drop defect pin');
    } finally {
      setSubmittingSnag(false);
    }
  };

  const handleResolveSnag = async (snagId) => {
    try {
      await axios.patch(`/api/snags/${snagId}/resolve`);
      alert('Snag marked as resolved!');
      setActiveSnag(null);
      fetchSnagTelemetry();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update snag');
    }
  };

  const handleSignOffSnag = async (snagId) => {
    try {
      await axios.patch(`/api/snags/${snagId}/signoff`);
      alert('Snag signed off and closed successfully.');
      setActiveSnag(null);
      fetchSnagTelemetry();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to close snag');
    }
  };

  const getPinColor = (status) => {
    switch (status) {
      case 'signed_off': return 'bg-green-500 shadow-green-500/50';
      case 'resolved': return 'bg-amber-500 shadow-amber-500/50';
      default: return 'bg-red-600 shadow-red-600/50';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-navy dark:border-white" />
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="text-center py-16 bg-white dark:bg-brand-surface border border-brand-navy/5 dark:border-white/10 rounded-[32px] p-8 max-w-md mx-auto shadow-sm">
        <AlertCircle className="mx-auto mb-4 text-red-400" size={32} />
        <h3 className="font-outfit font-extrabold text-brand-navy dark:text-white text-lg uppercase tracking-wider">Sync Error</h3>
        <p className="text-sm text-brand-navy/60 dark:text-white/60 mt-2 font-medium">{error || 'Project data record not found.'}</p>
        <Link to="/projects" className="mt-6 inline-flex items-center gap-1.5 px-6 py-3 bg-brand-navy text-white hover:bg-brand-navy-light rounded-xl font-bold text-xs uppercase tracking-wider transition-colors">Return to Registry</Link>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fadeIn grid-bg min-h-screen pb-16">
      
      {/* Navigation Breadcrumb */}
      <div className="flex items-center justify-between border-b border-brand-navy/5 dark:border-white/10 pb-4">
        <Link 
          to={`/projects/${id}`} 
          className="inline-flex items-center gap-1.5 text-xs text-brand-navy/60 dark:text-white/60 font-bold hover:text-brand-gold transition-colors"
        >
          <ArrowLeft size={16} />
          Back to Project Details
        </Link>
        <span className="text-[10px] font-extrabold text-brand-navy/40 dark:text-white/40 uppercase tracking-widest">Quality Control</span>
      </div>

      {/* Title */}
      <div>
        <h2 className="font-outfit font-extrabold text-2xl text-brand-navy dark:text-white uppercase tracking-wider">Interactive Defect Snagging Map</h2>
        <p className="text-xs text-brand-navy/60 dark:text-white/60 font-semibold mt-1">Project: <span className="text-brand-navy dark:text-white">{project.name}</span>. Click on the floorplan drawing layout below to pin discrepancies.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Blueprint drawing (col-span-2) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white dark:bg-brand-surface border border-brand-navy/5 dark:border-white/10 rounded-[32px] p-6 shadow-sm hover:shadow-md transition-all">
            
            {/* Interactive Drawing Container */}
            <div 
              ref={blueprintRef}
              onClick={handleBlueprintClick}
              className="relative aspect-[8/5] bg-brand-navy/[0.02] dark:bg-white/[0.02] border-2 border-dashed border-brand-navy/10 dark:border-white/10 rounded-2xl overflow-hidden cursor-crosshair shadow-inner"
            >
              
              {/* CAD Floorplan Vector Background */}
              <svg viewBox="0 0 800 500" className="w-full h-full text-brand-navy/5 dark:text-white/10 stroke-current stroke-[1.5] opacity-80" fill="none">
                <rect x="20" y="20" width="760" height="460" rx="8" />
                <line x1="260" y1="20" x2="260" y2="480" />
                <line x1="540" y1="20" x2="540" y2="480" />
                <line x1="20" y1="250" x2="780" y2="250" />
                <rect x="340" y="200" width="120" height="100" rx="4" className="stroke-2" />
                <text x="140" y="130" fontSize="10" fontWeight="bold" fill="currentColor" textAnchor="middle">SECTOR A (OFFICE SUITES)</text>
                <text x="400" y="130" fontSize="10" fontWeight="bold" fill="currentColor" textAnchor="middle">SECTOR B (RETAIL HUBS)</text>
                <text x="660" y="130" fontSize="10" fontWeight="bold" fill="currentColor" textAnchor="middle">SECTOR C (STOREFRONTS)</text>
                <text x="140" y="370" fontSize="10" fontWeight="bold" fill="currentColor" textAnchor="middle">BASEMENT PARKING</text>
                <text x="400" y="255" fontSize="10" fontWeight="bold" fill="currentColor" textAnchor="middle">SERVICE ELEVATOR</text>
                <text x="660" y="370" fontSize="10" fontWeight="bold" fill="currentColor" textAnchor="middle">DELIVERIES DOCK</text>
                <circle cx="260" cy="250" r="5" fill="currentColor" />
                <circle cx="540" cy="250" r="5" fill="currentColor" />
              </svg>

              {/* Pins layer Overlay */}
              {snags.map(snag => (
                <button
                  key={snag.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveSnag(snag);
                    setClickedCoords(null);
                  }}
                  style={{ left: `${snag.pin_x}%`, top: `${snag.pin_y}%` }}
                  className={`absolute -translate-x-1/2 -translate-y-1/2 w-4 h-4 rounded-full flex items-center justify-center text-[7px] text-white font-extrabold border-2 border-white shadow-lg transition-all hover:scale-125 select-none ${getPinColor(snag.status)}`}
                >
                  !
                </button>
              ))}

              {/* Temporary active click pin */}
              {clickedCoords && (
                <div
                  style={{ left: `${clickedCoords.x}%`, top: `${clickedCoords.y}%` }}
                  className="absolute -translate-x-1/2 -translate-y-1/2 w-5 h-5 rounded-full border-2 border-white bg-brand-gold animate-ping pointer-events-none"
                />
              )}

            </div>
          </div>
        </div>

        {/* Right Column: Dynamic Form / Detail Panel (col-span-1) */}
        <div className="lg:col-span-1 space-y-4">
          
          {/* 1. Log snag form (shown if coords clicked) */}
          {clickedCoords && (
            <div className="bg-white dark:bg-brand-surface border border-brand-navy/5 dark:border-white/10 rounded-[28px] p-6 shadow-sm space-y-4 hover:shadow-md transition-all animate-fadeIn">
              <div className="flex items-center justify-between border-b border-brand-navy/5 dark:border-white/10 pb-3">
                <div className="flex items-center gap-2">
                  <AlertCircle className="text-brand-gold" size={18} />
                  <h3 className="font-outfit font-extrabold text-sm text-brand-navy dark:text-white uppercase tracking-wider">Log Defect Pin</h3>
                </div>
                <button onClick={() => setClickedCoords(null)} className="text-[9px] font-bold text-brand-navy/50 dark:text-white/50 hover:text-brand-navy dark:hover:text-white uppercase tracking-widest">Cancel</button>
              </div>

              <form onSubmit={handleCreateSnag} className="space-y-4 text-xs font-semibold">
                <div className="grid grid-cols-2 gap-2 text-[10px] text-brand-navy/50 dark:text-white/50 bg-brand-beige/20 dark:bg-brand-dark p-2.5 rounded-xl border border-brand-navy/5 dark:border-white/10">
                  <span>Coordinates X: <strong>{clickedCoords.x}%</strong></span>
                  <span>Coordinates Y: <strong>{clickedCoords.y}%</strong></span>
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-extrabold uppercase tracking-widest text-brand-navy/50 dark:text-white/50 block ml-1">Defect Description</label>
                  <textarea
                    placeholder="Describe the structural defect or installation issue observed..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows="3"
                    className="w-full px-4 py-2.5 rounded-xl border border-brand-navy/10 dark:border-white/10 dark:bg-brand-dark dark:text-white focus:outline-none focus:border-brand-gold font-medium"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[9px] font-extrabold uppercase tracking-widest text-brand-navy/50 dark:text-white/50 block ml-1">Category</label>
                    <select
                      value={defectType}
                      onChange={(e) => setDefectType(e.target.value)}
                      className="w-full px-4 py-2 rounded-xl border border-brand-navy/10 dark:border-white/10 dark:bg-brand-dark dark:text-white focus:outline-none focus:border-brand-gold text-[11px] font-bold text-brand-navy uppercase tracking-wider"
                    >
                      <option value="Concrete Work">Concrete</option>
                      <option value="Electrical Work">Electrical</option>
                      <option value="Plumbing Work">Plumbing</option>
                      <option value="Masonry Work">Masonry</option>
                      <option value="Finishes Work">Finishes</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9px] font-extrabold uppercase tracking-widest text-brand-navy/50 dark:text-white/50 block ml-1">Assign Subcontractor</label>
                    <select
                      value={assignedTo}
                      onChange={(e) => setAssignedTo(e.target.value)}
                      className="w-full px-4 py-2 rounded-xl border border-brand-navy/10 dark:border-white/10 dark:bg-brand-dark dark:text-white focus:outline-none focus:border-brand-gold text-[11px] font-bold text-brand-navy uppercase tracking-wider"
                      required
                    >
                      <option value="" disabled>Select worker...</option>
                      {workers.map(w => (
                        <option key={w.id} value={w.id}>{w.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={submittingSnag}
                  className="w-full py-2.5 bg-brand-navy hover:bg-brand-navy-light text-white font-extrabold text-xs uppercase tracking-widest rounded-xl transition-all shadow-md"
                >
                  {submittingSnag ? 'Saving Defect...' : 'Drop Pin'}
                </button>
              </form>
            </div>
          )}

          {/* 2. Snag detail popover (shown if pin clicked) */}
          {activeSnag && (
            <div className="bg-white dark:bg-brand-surface border border-brand-navy/5 dark:border-white/10 rounded-[28px] p-6 shadow-sm space-y-4 hover:shadow-md transition-all animate-fadeIn">
              <div className="flex items-center justify-between border-b border-brand-navy/5 dark:border-white/10 pb-3">
                <span className="text-[10px] font-extrabold text-brand-navy/40 dark:text-white/40 uppercase tracking-wider">DEFECT #{activeSnag.id} DETAILS</span>
                <button onClick={() => setActiveSnag(null)} className="text-[9px] font-bold text-brand-navy/50 dark:text-white/50 hover:text-brand-navy dark:hover:text-white uppercase tracking-widest">Close</button>
              </div>

              <div className="space-y-3.5 text-xs text-brand-navy dark:text-white">
                <div className="flex justify-between items-center bg-brand-beige/10 dark:bg-brand-dark p-3.5 rounded-2xl border border-brand-navy/5 dark:border-white/10">
                  <div>
                    <span className="font-extrabold text-[10px] text-brand-navy/50 dark:text-white/50 uppercase tracking-widest block">{activeSnag.defect_type}</span>
                    <p className="font-semibold mt-1 leading-relaxed">{activeSnag.description}</p>
                  </div>
                </div>

                <div className="space-y-2 text-[10px] font-bold uppercase tracking-wider text-brand-navy/60 dark:text-white/60">
                  <div className="flex items-center gap-1.5"><User size={13} className="text-brand-gold" /> Subcontractor: {activeSnag.assigned_to_name}</div>
                  <div className="flex items-center gap-1.5"><HardHat size={13} className="text-brand-gold" /> Inspector sign-off: {activeSnag.signed_off_by_name}</div>
                  <div className="flex items-center gap-1.5"><Camera size={13} className="text-brand-gold" /> Status: <span className="font-extrabold uppercase ml-1">{activeSnag.status.replace('_', ' ')}</span></div>
                </div>

                {/* Subcontractor actions: Mark Resolved */}
                {activeSnag.status === 'open' && (
                  <button
                    onClick={() => handleResolveSnag(activeSnag.id)}
                    className="w-full py-2 bg-brand-gold hover:bg-brand-navy text-brand-dark hover:text-white font-extrabold text-xs uppercase tracking-widest rounded-xl transition-all shadow-md"
                  >
                    Mark Resolved
                  </button>
                )}

                {/* Supervisor/Admin actions: Sign Off */}
                {user.role !== 'worker' && activeSnag.status === 'resolved' && (
                  <button
                    onClick={() => handleSignOffSnag(activeSnag.id)}
                    className="w-full py-2 bg-green-600 hover:bg-green-700 text-white font-extrabold text-xs uppercase tracking-widest rounded-xl transition-all shadow-md"
                  >
                    Sign Off Defect (Close)
                  </button>
                )}
              </div>
            </div>
          )}

          {/* 3. Instructors instructions card (default view) */}
          {!clickedCoords && !activeSnag && (
            <div className="bg-[#001026] text-white border border-white/5 rounded-[28px] p-6 shadow-sm space-y-4 hover:shadow-md transition-all relative overflow-hidden">
              <div className="absolute inset-0 grid-bg opacity-10 pointer-events-none" />
              <div className="flex items-center gap-2 border-b border-white/10 pb-3 relative z-10">
                <AlertCircle className="text-brand-gold" size={18} />
                <h3 className="font-outfit font-extrabold text-sm text-white uppercase tracking-wider">Quality Audits Panel</h3>
              </div>
              <p className="text-xs text-brand-beige/70 font-medium leading-relaxed relative z-10">
                To register a defect, click directly on the blue coordinate schematic blueprint. Dropping a pin opens the subcontractor assigning drawer.
              </p>
              <div className="flex gap-4 pt-1.5 text-[9px] font-extrabold uppercase tracking-wider relative z-10">
                <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 bg-red-600 rounded-full inline-block" /> Open</div>
                <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 bg-amber-500 rounded-full inline-block" /> Fixed</div>
                <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 bg-green-500 rounded-full inline-block" /> Closed</div>
              </div>
            </div>
          )}

        </div>

      </div>

    </div>
  );
}
