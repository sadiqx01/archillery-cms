import React from 'react';
import { CheckCircle, CloudSun } from 'lucide-react';

export default function SupervisorDashboard({
  myTasks = [],
  requisitions = [],
  attendanceToday,
  actionLoading,
  clockInNotes,
  setClockInNotes,
  weatherAM,
  setWeatherAM,
  weatherPM,
  setWeatherPM,
  handleClockIn,
  handleClockOut,
  handleUpdateTaskStatus,
  setShowReqModal,
  setShowReportModal,
}) {
  const activeSupervisorTasks = (myTasks || []).filter(t => t.status !== 'completed');

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Supervisor Action header */}
      <div className="flex justify-between items-center bg-white dark:bg-brand-surface p-5 border border-brand-navy/5 dark:border-white/5 rounded-3xl shadow-sm">
        <div>
          <h3 className="font-outfit font-black text-lg text-brand-navy dark:text-white uppercase tracking-wider">Site Supervisor Operations Dashboard</h3>
          <p className="text-[10px] text-brand-navy/50 dark:text-white/50 font-medium">Log site diaries, manage clock roster, and request materials.</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowReqModal(true)}
            className="px-3 py-2 bg-brand-gold hover:bg-white text-brand-dark border border-brand-gold font-extrabold text-[9px] uppercase tracking-wider rounded-xl cursor-pointer transition-all"
          >
            Material Request
          </button>
          <button
            onClick={() => setShowReportModal(true)}
            className="px-3 py-2 bg-brand-navy hover:bg-brand-navy-light text-white font-extrabold text-[9px] uppercase tracking-wider rounded-xl cursor-pointer transition-all border border-brand-navy"
          >
            Write Daily Log
          </button>
        </div>
      </div>

      {/* Attendance Check-in Panel & Weather Console */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Clocking Card */}
        <div className="bg-white dark:bg-brand-surface border border-brand-navy/5 dark:border-white/5 rounded-3xl p-6 shadow-sm space-y-4">
          <h4 className="font-outfit font-black text-sm text-brand-navy dark:text-white uppercase tracking-wider">Today's Site Attendance</h4>
          
          {attendanceToday ? (
            <div className="space-y-4 text-center py-4">
              <div className="inline-flex p-3 rounded-full bg-green-500/10 border border-green-500/20 text-[#00bf63] mb-2 animate-bounce">
                <CheckCircle size={32} />
              </div>
              <div className="text-xs font-bold text-brand-navy dark:text-white">
                CLOCK ROSTER SIGNED
              </div>
              <div className="text-[10px] text-brand-navy/50 dark:text-white/50 uppercase font-bold">
                In: {attendanceToday.check_in_time || 'N/A'} | Out: {attendanceToday.check_out_time || 'Active on site'}
              </div>
              {attendanceToday.check_in_time && !attendanceToday.check_out_time && (
                <button
                  onClick={handleClockOut}
                  disabled={actionLoading}
                  className="w-full py-3 bg-red-600 hover:bg-red-700 text-white font-extrabold text-[10px] uppercase tracking-wider rounded-xl transition-all cursor-pointer block"
                >
                  Clock Out
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-[11px] text-brand-navy/50 dark:text-white/50">Submit your daily coordinate log-in checklist to sign attendance.</p>
              <div className="space-y-2">
                <label className="text-[8px] font-extrabold uppercase tracking-wider text-brand-navy/40 dark:text-white/40">Check-in Notes</label>
                <input 
                  type="text" 
                  placeholder="Enter work scopes or delays..."
                  value={clockInNotes}
                  onChange={(e) => setClockInNotes(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-brand-beige/25 dark:bg-brand-dark border border-brand-navy/10 dark:border-white/10 text-brand-navy dark:text-white placeholder-brand-navy/20 dark:placeholder-white/20 text-xs"
                />
              </div>
              <button
                onClick={handleClockIn}
                disabled={actionLoading}
                className="w-full py-3 bg-brand-navy hover:bg-brand-navy-light text-white font-extrabold text-[10px] uppercase tracking-wider rounded-xl transition-all cursor-pointer block"
              >
                Clock In to Site
              </button>
            </div>
          )}
        </div>

        {/* Interactive Weather Console */}
        <div className="bg-white dark:bg-brand-surface border border-brand-navy/5 dark:border-white/5 rounded-3xl p-6 shadow-sm space-y-4">
          <h4 className="font-outfit font-black text-sm text-brand-navy dark:text-white uppercase tracking-wider">Weather Logging Console</h4>
          <div className="p-4 bg-brand-beige/20 dark:bg-white/5 border border-brand-navy/5 dark:border-white/5 rounded-2xl flex items-center gap-3">
            <CloudSun size={28} className="text-brand-gold shrink-0" />
            <div>
              <span className="font-black text-brand-navy dark:text-white block font-outfit">Weather Tracker</span>
              <span className="text-[9px] text-brand-navy/50 dark:text-white/50 block font-bold uppercase">AM: {weatherAM} | PM: {weatherPM}</span>
            </div>
          </div>
          <div className="space-y-3 pt-2">
            <div className="space-y-1">
              <label className="text-[8px] font-extrabold uppercase tracking-wider text-brand-navy/40 dark:text-white/40 block">Toggle Morning Weather</label>
              <select
                value={weatherAM}
                onChange={(e) => setWeatherAM(e.target.value)}
                className="w-full px-2 py-1 bg-brand-beige/40 dark:bg-brand-dark border border-brand-navy/10 dark:border-white/10 rounded-lg text-[10px] text-brand-navy dark:text-white font-bold"
              >
                <option value="Sunny, 28°C">Sunny, 28°C</option>
                <option value="Rainy, 22°C">Rainy, 22°C</option>
                <option value="Dusty / Harmattan, 26°C">Dusty / Harmattan, 26°C</option>
                <option value="Stormy, 21°C">Stormy, 21°C</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-[8px] font-extrabold uppercase tracking-wider text-brand-navy/40 dark:text-white/40 block">Toggle Afternoon Weather</label>
              <select
                value={weatherPM}
                onChange={(e) => setWeatherPM(e.target.value)}
                className="w-full px-2 py-1 bg-brand-beige/40 dark:bg-brand-dark border border-brand-navy/10 dark:border-white/10 rounded-lg text-[10px] text-brand-navy dark:text-white font-bold"
              >
                <option value="Dusty, 32°C">Dusty, 32°C</option>
                <option value="Clear Sky, 34°C">Clear Sky, 34°C</option>
                <option value="Windy, 29°C">Windy, 29°C</option>
                <option value="Heavy Rain, 20°C">Heavy Rain, 20°C</option>
              </select>
            </div>
          </div>
        </div>

        {/* Pending Requests Status Tracker */}
        <div className="bg-white dark:bg-brand-surface border border-brand-navy/5 dark:border-white/5 rounded-3xl p-6 shadow-sm space-y-4">
          <h4 className="font-outfit font-black text-sm text-brand-navy dark:text-white uppercase tracking-wider">Requests Pipeline status</h4>
          <div className="space-y-3 max-h-[160px] overflow-y-auto pr-1">
            {(requisitions || []).slice(0, 4).map(req => (
              <div key={req.id} className="text-xs p-2.5 bg-brand-beige/10 dark:bg-white/5 border border-brand-navy/5 dark:border-white/5 rounded-xl flex justify-between items-center">
                <div>
                  <span className="font-bold block truncate">{req.item_name}</span>
                  <span className="text-[8px] text-brand-navy/40 dark:text-white/40 uppercase block">Req #{req.id} | Cost: ₦{req.estimated_cost?.toLocaleString()}</span>
                </div>
                <span className={`px-1.5 py-0.5 text-[8px] font-extrabold uppercase tracking-wider border rounded ${
                  req.status === 'approved'
                    ? 'bg-green-500/10 border-green-500/20 text-[#00bf63]'
                    : req.status === 'rejected' || req.status === 'cto_rejected'
                      ? 'bg-red-500/10 border-red-500/20 text-red-500'
                      : 'bg-amber-500/10 border-amber-500/20 text-amber-500'
                }`}>
                  {req.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Supervisor Tasks Log list */}
      <div className="bg-white dark:bg-brand-surface border border-brand-navy/5 dark:border-white/5 rounded-3xl p-6 shadow-sm space-y-4">
        <h4 className="font-outfit font-black text-sm text-brand-navy dark:text-white uppercase tracking-wider">Active Site Work Checklists</h4>
        {activeSupervisorTasks.length === 0 ? (
          <div className="text-center py-6 text-brand-navy/35 dark:text-white/35 font-bold uppercase text-[9px] tracking-wider">
            No tasks assigned on site.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activeSupervisorTasks.map(task => (
              <div key={task.id} className="p-4 bg-brand-beige/20 dark:bg-white/5 border border-brand-navy/5 dark:border-white/5 rounded-2xl flex justify-between items-center">
                <div>
                  <span className="font-bold text-xs text-brand-navy dark:text-white block">{task.title}</span>
                  <p className="text-[10px] text-brand-navy/50 dark:text-white/55">Priority: {task.priority} | Status: {task.status}</p>
                </div>
                <button
                  onClick={() => handleUpdateTaskStatus(task.id, task.status)}
                  className="px-3 py-1 bg-brand-navy hover:bg-brand-navy-light text-white font-extrabold text-[9px] uppercase tracking-wider rounded-xl transition-all cursor-pointer"
                >
                  {task.status === 'pending' ? 'Start Task' : 'Complete'}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
