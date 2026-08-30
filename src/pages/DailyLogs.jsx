import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FileText, Sun, Cloud, Users, ShieldAlert, PlusCircle, Trash, Eye, Clipboard } from 'lucide-react';

export default function DailyLogs() {
  const [logs, setLogs] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Log Detailed Viewer
  const [activeLog, setActiveLog] = useState(null);

  // New Log Form states
  const [newProjectId, setNewProjectId] = useState('');
  const [newLogDate, setNewLogDate] = useState(new Date().toISOString().split('T')[0]);
  const [weatherAm, setWeatherAm] = useState('Clear, 28°C');
  const [weatherPm, setWeatherPm] = useState('Clear, 32°C');
  const [materialsReceived, setMaterialsReceived] = useState('');
  
  // Labor Details sub-states
  const [laborTrades, setLaborTrades] = useState([
    { trade: 'Masons', headcount: 0 },
    { trade: 'Steel Fixers', headcount: 0 },
    { trade: 'Carpenters', headcount: 0 },
    { trade: 'Laborers', headcount: 0 },
    { trade: 'Operators', headcount: 0 }
  ]);
  const [customTrade, setCustomTrade] = useState('');
  const [customHeadcount, setCustomHeadcount] = useState('');

  // Equipment Details sub-states
  const [equipmentList, setEquipmentList] = useState([
    { name: 'Concrete Mixer', hours: 0 },
    { name: 'Excavator', hours: 0 },
    { name: 'Tower Crane', hours: 0 },
    { name: 'Dumper Truck', hours: 0 }
  ]);
  const [customEquipName, setCustomEquipName] = useState('');
  const [customEquipHours, setCustomEquipHours] = useState('');

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
      setError('Failed to fetch daily site logs diaries.');
    } finally {
      setLoading(false);
    }
  };

  // Labor Trade Helpers
  const handleUpdateHeadcount = (idx, val) => {
    const updated = [...laborTrades];
    updated[idx].headcount = parseInt(val) || 0;
    setLaborTrades(updated);
  };

  const handleAddCustomTrade = () => {
    if (!customTrade || !customHeadcount) return;
    setLaborTrades([...laborTrades, { trade: customTrade, headcount: parseInt(customHeadcount) || 0 }]);
    setCustomTrade('');
    setCustomHeadcount('');
  };

  const handleRemoveTrade = (idx) => {
    setLaborTrades(laborTrades.filter((_, i) => i !== idx));
  };

  // Equipment Helpers
  const handleUpdateEquipHours = (idx, val) => {
    const updated = [...equipmentList];
    updated[idx].hours = parseFloat(val) || 0;
    setEquipmentList(updated);
  };

  const handleAddCustomEquip = () => {
    if (!customEquipName || !customEquipHours) return;
    setEquipmentList([...equipmentList, { name: customEquipName, hours: parseFloat(customEquipHours) || 0 }]);
    setCustomEquipName('');
    setCustomEquipHours('');
  };

  const handleRemoveEquip = (idx) => {
    setEquipmentList(equipmentList.filter((_, i) => i !== idx));
  };

  const handleSubmitDailyLog = async (e) => {
    e.preventDefault();
    if (!newProjectId || !newLogDate) {
      alert('Please select project and verify log date.');
      return;
    }
    setSubmittingLog(true);

    // Format labor details mapping
    const laborDetailsObj = {};
    laborTrades.forEach(t => {
      if (t.headcount > 0) laborDetailsObj[t.trade] = t.headcount;
    });

    // Format equipment mapping
    const equipmentDetailsObj = {};
    equipmentList.forEach(eq => {
      if (eq.hours > 0) equipmentDetailsObj[eq.name] = eq.hours;
    });

    try {
      await axios.post('/api/daily-logs', {
        project_id: newProjectId,
        log_date: newLogDate,
        weather_am: weatherAm,
        weather_pm: weatherPm,
        labor_details: laborDetailsObj,
        equipment_details: equipmentDetailsObj,
        materials_received: materialsReceived
      });

      alert('Daily Site Log registered successfully!');
      setNewProjectId('');
      setMaterialsReceived('');
      // Reset counters
      setLaborTrades(laborTrades.map(t => ({ ...t, headcount: 0 })));
      setEquipmentList(equipmentList.map(eq => ({ ...eq, hours: 0 })));
      fetchLogsTelemetry();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to submit site log');
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

  return (
    <div className="space-y-8 animate-fadeIn grid-bg min-h-screen pb-16">
      
      {/* Page Header */}
      <div>
        <h2 className="font-outfit font-extrabold text-2xl text-brand-navy dark:text-white uppercase tracking-wider">Daily Site Diaries</h2>
        <p className="text-xs text-brand-navy/60 dark:text-white/60 font-semibold mt-1">Formal daily construction telemetry records, compiling manual weather audits, machinery utilization, and tradesmen headcounts.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Form entries (col-span-1) */}
        <div className="lg:col-span-1 space-y-8 no-print">
          
          <div className="bg-white dark:bg-brand-surface border border-brand-navy/5 dark:border-white/10 rounded-[28px] p-6 shadow-sm space-y-4 hover:shadow-md transition-all">
            <div className="flex items-center gap-2 border-b border-brand-navy/5 dark:border-white/10 pb-3">
              <Clipboard className="text-brand-gold" size={18} />
              <h3 className="font-outfit font-extrabold text-sm text-brand-navy dark:text-white uppercase tracking-wider">Log Site Activity Diary</h3>
            </div>

            <form onSubmit={handleSubmitDailyLog} className="space-y-4 text-xs font-semibold">
              
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[9px] font-extrabold uppercase tracking-widest text-brand-navy/50 dark:text-white/50 block ml-1">Select Project</label>
                  <select
                    value={newProjectId}
                    onChange={(e) => setNewProjectId(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-brand-navy/10 dark:border-white/10 focus:outline-none focus:border-brand-gold font-bold text-brand-navy dark:text-white dark:bg-brand-dark uppercase tracking-wider"
                    required
                  >
                    <option value="" disabled>Select project...</option>
                    {projects.map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-extrabold uppercase tracking-widest text-brand-navy/50 dark:text-white/50 block ml-1">Log Date</label>
                  <input
                    type="date"
                    value={newLogDate}
                    onChange={(e) => setNewLogDate(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-brand-navy/10 dark:border-white/10 focus:outline-none focus:border-brand-gold font-medium dark:bg-brand-dark dark:text-white"
                    required
                  />
                </div>
              </div>

              {/* Weather AM/PM */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[9px] font-extrabold uppercase tracking-widest text-brand-navy/50 dark:text-white/50 block ml-1 flex items-center gap-1"><Sun size={11} className="text-brand-gold" /> Weather AM</label>
                  <input
                    type="text"
                    value={weatherAm}
                    onChange={(e) => setWeatherAm(e.target.value)}
                    className="w-full px-4 py-2 rounded-xl border border-brand-navy/10 dark:border-white/10 focus:outline-none focus:border-brand-gold font-medium dark:bg-brand-dark dark:text-white"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-extrabold uppercase tracking-widest text-brand-navy/50 dark:text-white/50 block ml-1 flex items-center gap-1"><Cloud size={11} className="text-brand-gold" /> Weather PM</label>
                  <input
                    type="text"
                    value={weatherPm}
                    onChange={(e) => setWeatherPm(e.target.value)}
                    className="w-full px-4 py-2 rounded-xl border border-brand-navy/10 dark:border-white/10 focus:outline-none focus:border-brand-gold font-medium dark:bg-brand-dark dark:text-white"
                    required
                  />
                </div>
              </div>

              {/* Labor Trades Section */}
              <div className="space-y-2 border-t border-brand-navy/5 dark:border-white/10 pt-3">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-[9px] font-extrabold text-brand-navy/40 dark:text-white/40 uppercase tracking-widest flex items-center gap-1"><Users size={12} /> Tradesmen On-site</span>
                </div>
                <div className="space-y-1.5 max-h-[160px] overflow-y-auto pr-1">
                  {laborTrades.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center gap-2 p-1.5 border border-brand-navy/5 dark:border-white/10 bg-brand-beige/10 dark:bg-brand-dark/10 rounded-xl">
                      <span className="font-bold text-[11px] truncate max-w-[120px]">{item.trade}</span>
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          value={item.headcount === 0 ? '' : item.headcount}
                          placeholder="Headcount"
                          onChange={(e) => handleUpdateHeadcount(idx, e.target.value)}
                          className="w-20 px-2 py-1 border border-brand-navy/10 dark:border-white/10 rounded text-center font-bold text-xs dark:bg-brand-dark dark:text-white"
                        />
                        {idx >= 5 && (
                          <button type="button" onClick={() => handleRemoveTrade(idx)} className="text-red-500 hover:text-red-700">
                            <Trash size={12} />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Add Custom Trade inputs */}
                <div className="flex gap-1.5 pt-1.5">
                  <input
                    type="text"
                    placeholder="Custom trade..."
                    value={customTrade}
                    onChange={(e) => setCustomTrade(e.target.value)}
                    className="flex-1 px-3 py-1.5 rounded border border-brand-navy/10 dark:border-white/10 font-medium dark:bg-brand-dark dark:text-white"
                  />
                  <input
                    type="number"
                    placeholder="Qty"
                    value={customHeadcount}
                    onChange={(e) => setCustomHeadcount(e.target.value)}
                    className="w-14 px-2 py-1.5 rounded border border-brand-navy/10 dark:border-white/10 font-medium text-center dark:bg-brand-dark dark:text-white"
                  />
                  <button type="button" onClick={handleAddCustomTrade} className="p-2 bg-brand-gold/15 hover:bg-brand-gold/25 rounded-xl transition-all">
                    <PlusCircle size={15} />
                  </button>
                </div>
              </div>

              {/* Equipment Schedule hours */}
              <div className="space-y-2 border-t border-brand-navy/5 dark:border-white/10 pt-3">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-[9px] font-extrabold text-brand-navy/40 dark:text-white/40 uppercase tracking-widest flex items-center gap-1">Equipment utilization (Hrs)</span>
                </div>
                <div className="space-y-1.5 max-h-[140px] overflow-y-auto pr-1">
                  {equipmentList.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center gap-2 p-1.5 border border-brand-navy/5 dark:border-white/10 bg-brand-beige/10 dark:bg-brand-dark/10 rounded-xl">
                      <span className="font-bold text-[11px] truncate max-w-[120px]">{item.name}</span>
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          step="0.5"
                          value={item.hours === 0 ? '' : item.hours}
                          placeholder="Hrs used"
                          onChange={(e) => handleUpdateEquipHours(idx, e.target.value)}
                          className="w-20 px-2 py-1 border border-brand-navy/10 dark:border-white/10 rounded text-center font-bold text-xs dark:bg-brand-dark dark:text-white"
                        />
                        {idx >= 4 && (
                          <button type="button" onClick={() => handleRemoveEquip(idx)} className="text-red-500 hover:text-red-700">
                            <Trash size={12} />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Add Custom Equip inputs */}
                <div className="flex gap-1.5 pt-1.5">
                  <input
                    type="text"
                    placeholder="Custom Plant..."
                    value={customEquipName}
                    onChange={(e) => setCustomEquipName(e.target.value)}
                    className="flex-1 px-3 py-1.5 rounded border border-brand-navy/10 dark:border-white/10 font-medium dark:bg-brand-dark dark:text-white"
                  />
                  <input
                    type="number"
                    step="0.5"
                    placeholder="Hrs"
                    value={customEquipHours}
                    onChange={(e) => setCustomEquipHours(e.target.value)}
                    className="w-14 px-2 py-1.5 rounded border border-brand-navy/10 dark:border-white/10 font-medium text-center dark:bg-brand-dark dark:text-white"
                  />
                  <button type="button" onClick={handleAddCustomEquip} className="p-2 bg-brand-gold/15 hover:bg-brand-gold/25 rounded-xl transition-all">
                    <PlusCircle size={15} />
                  </button>
                </div>
              </div>

              {/* Material Received notes */}
              <div className="space-y-1 border-t border-brand-navy/5 dark:border-white/10 pt-3">
                <label className="text-[9px] font-extrabold uppercase tracking-widest text-brand-navy/50 dark:text-white/50 block ml-1">Material Deliveries Received today</label>
                <textarea
                  placeholder="Describe truck arrivals, steel deliveries, aggregate tons, waybill codes..."
                  value={materialsReceived}
                  onChange={(e) => setMaterialsReceived(e.target.value)}
                  rows="3"
                  className="w-full px-4 py-2.5 rounded-xl border border-brand-navy/10 dark:border-white/10 focus:outline-none focus:border-brand-gold font-medium dark:bg-brand-dark dark:text-white"
                />
              </div>

              <button
                type="submit"
                disabled={submittingLog}
                className="w-full py-2.5 bg-brand-navy hover:bg-brand-navy-light text-white font-extrabold text-xs uppercase tracking-widest rounded-xl transition-all shadow-md"
              >
                {submittingLog ? 'Registering site diary...' : 'Log Site Diary'}
              </button>
            </form>
          </div>

        </div>

        {/* Right Column: Diaries registry list (col-span-2) */}
        <div className="lg:col-span-2 space-y-4">
          
          {/* Logs List card container */}
          <div className="bg-white dark:bg-brand-surface border border-brand-navy/5 dark:border-white/10 rounded-[28px] p-6 shadow-sm hover:shadow-md transition-all space-y-4">
            <h3 className="font-outfit font-extrabold text-sm text-brand-navy dark:text-white uppercase tracking-wider border-b border-brand-navy/5 dark:border-white/10 pb-3">Site Diary Registers</h3>
            
            {logs.length === 0 ? (
              <p className="text-center py-16 text-xs text-brand-navy/40 dark:text-white/40 font-bold uppercase tracking-wider">No daily diaries registered.</p>
            ) : (
              <div className="space-y-3.5 max-h-[700px] overflow-y-auto pr-1">
                {logs.map(log => (
                  <div key={log.id} className="p-4 border border-brand-navy/5 dark:border-white/10 rounded-2xl bg-white dark:bg-brand-surface space-y-3 hover:border-brand-gold transition-colors">
                    <div className="flex justify-between items-center border-b border-brand-navy/5 dark:border-white/10 pb-2">
                      <span className="text-[10px] font-extrabold text-brand-gold uppercase">DIARY #LOG-00{log.id}</span>
                      <span className="text-xs font-bold text-brand-navy dark:text-white">{new Date(log.log_date).toLocaleDateString('en-US', { dateStyle: 'medium' })}</span>
                    </div>

                    <div className="text-xs">
                      <span className="font-bold text-brand-navy dark:text-white block uppercase text-sm">{log.project_name}</span>
                      <span className="text-[10px] text-brand-navy/40 dark:text-white/40 font-bold block mt-0.5">Supervisor: {log.logged_by_name}</span>
                    </div>

                    {/* Weather stats */}
                    <div className="grid grid-cols-2 gap-4 text-[10px] font-bold uppercase tracking-wider text-brand-navy/60 dark:text-white/60 bg-brand-beige/20 dark:bg-brand-dark/20 p-2.5 rounded-xl border border-brand-navy/5 dark:border-white/10">
                      <span className="flex items-center gap-1"><Sun size={12} className="text-brand-gold shrink-0" /> AM: {log.weather_am}</span>
                      <span className="flex items-center gap-1"><Cloud size={12} className="text-brand-gold shrink-0" /> PM: {log.weather_pm}</span>
                    </div>

                    {/* Expand details trigger */}
                    <div className="flex justify-between items-center text-[10px] text-brand-navy/50 dark:text-white/50 font-bold border-t border-brand-navy/5 dark:border-white/10 pt-2 mt-2">
                      <span>Labor: {Object.keys(log.labor_details).length} trades logged | Plant: {Object.keys(log.equipment_details).length} utilized</span>
                      <button
                        onClick={() => setActiveLog(log)}
                        className="flex items-center gap-1 text-brand-gold hover:text-brand-navy dark:hover:text-white"
                      >
                        <Eye size={12} /> Expand Diary Entry
                      </button>
                    </div>

                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

      </div>

      {/* Diary details Modal viewer */}
      {activeLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-brand-dark/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-brand-surface border border-brand-navy/5 dark:border-white/10 w-full max-w-lg rounded-[28px] p-6 shadow-xl space-y-5 animate-scaleUp">
            <div className="flex justify-between items-center border-b border-brand-navy/5 dark:border-white/10 pb-3">
              <h3 className="font-outfit font-extrabold text-sm text-brand-navy dark:text-white uppercase tracking-wider">
                DAILY SITE LOGS - {new Date(activeLog.log_date).toLocaleDateString('en-US', { dateStyle: 'medium' })}
              </h3>
              <button 
                onClick={() => setActiveLog(null)} 
                className="text-xs font-bold text-brand-navy/50 dark:text-white/50 hover:text-brand-navy dark:hover:text-white uppercase tracking-wider"
              >
                Close
              </button>
            </div>

            <div className="space-y-4 max-h-[400px] overflow-y-auto text-xs pr-1">
              <div>
                <span className="text-[9px] font-extrabold text-brand-navy/40 dark:text-white/40 uppercase tracking-widest block">Project Location</span>
                <span className="font-bold text-brand-navy dark:text-white text-sm uppercase">{activeLog.project_name}</span>
              </div>

              {/* Weather */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 border border-brand-navy/5 dark:border-white/10 bg-brand-beige/10 dark:bg-brand-dark/10 rounded-xl">
                  <span className="text-[8px] font-extrabold text-brand-navy/40 dark:text-white/40 uppercase block">AM Weather</span>
                  <span className="font-bold block mt-1">{activeLog.weather_am}</span>
                </div>
                <div className="p-3 border border-brand-navy/5 dark:border-white/10 bg-brand-beige/10 dark:bg-brand-dark/10 rounded-xl">
                  <span className="text-[8px] font-extrabold text-brand-navy/40 dark:text-white/40 uppercase block">PM Weather</span>
                  <span className="font-bold block mt-1">{activeLog.weather_pm}</span>
                </div>
              </div>

              {/* Labor Trade details grid */}
              <div className="space-y-1.5">
                <span className="text-[9px] font-extrabold text-brand-navy/40 dark:text-white/40 uppercase tracking-widest block">Labor Headcount schedule</span>
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(activeLog.labor_details).map(([trade, headcount]) => (
                    <div key={trade} className="p-2.5 border border-brand-navy/5 dark:border-white/10 rounded-xl flex justify-between bg-brand-beige/10 dark:bg-brand-dark/10 font-bold">
                      <span className="text-brand-navy dark:text-white">{trade}</span>
                      <span className="text-brand-gold">{headcount} Men</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Plant/Equipment usage hours */}
              <div className="space-y-1.5">
                <span className="text-[9px] font-extrabold text-brand-navy/40 dark:text-white/40 uppercase tracking-widest block">Plant schedule engine hours</span>
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(activeLog.equipment_details).map(([equip, hrs]) => (
                    <div key={equip} className="p-2.5 border border-brand-navy/5 dark:border-white/10 rounded-xl flex justify-between bg-brand-beige/10 dark:bg-brand-dark/10 font-bold">
                      <span className="text-brand-navy dark:text-white">{equip}</span>
                      <span className="text-brand-gold">{hrs} Hours</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Material received details */}
              <div>
                <span className="text-[9px] font-extrabold text-brand-navy/40 dark:text-white/40 uppercase tracking-widest block">Material Deliveries Received</span>
                <div className="p-3 border border-brand-navy/5 dark:border-white/10 bg-brand-beige/10 dark:bg-brand-dark/10 rounded-xl font-semibold leading-relaxed mt-1 text-brand-navy/80 dark:text-white/80">
                  {activeLog.materials_received || 'No material deliveries logged today.'}
                </div>
              </div>

            </div>
          </div>
        </div>
      )}

    </div>
  );
}
