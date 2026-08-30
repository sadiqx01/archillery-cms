import React from 'react';
import { CheckCircle } from 'lucide-react';

export default function WorkerDashboard({
  myTasks = [],
  attendanceToday,
  actionLoading,
  clockInNotes,
  setClockInNotes,
  handleClockIn,
  handleClockOut,
  handleUpdateTaskStatus,
}) {
  const pendingTasks = myTasks.filter(t => t.status !== 'completed');
  const completedTasks = myTasks.filter(t => t.status === 'completed');

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Worker Shift Status & Clocking Console */}
      <div className="bg-white dark:bg-brand-surface border border-brand-navy/5 dark:border-white/5 rounded-3xl p-6 md:p-8 shadow-sm relative overflow-hidden group">
        <div className="absolute top-0 left-0 w-full h-[4px] bg-brand-navy dark:bg-brand-gold" />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div className="space-y-4">
            <div className="space-y-2">
              <span className="px-3 py-1 bg-brand-gold/10 border border-brand-gold/30 text-brand-gold text-[9px] font-extrabold uppercase tracking-widest rounded-lg">
                Shift Console & Attendance
              </span>
              <h3 className="font-outfit font-extrabold text-xl md:text-2xl text-brand-navy dark:text-white uppercase tracking-wider">
                Field Staff Clock-In
              </h3>
            </div>
            <p className="text-xs text-brand-navy/60 dark:text-white/60 font-medium leading-relaxed">
              Log in when you arrive at your assigned project site. Your GPS coordinates and check-in times are logged in the attendance ledger.
            </p>
          </div>

          <div className="bg-brand-beige/20 dark:bg-white/5 border border-brand-navy/5 dark:border-white/5 p-6 rounded-2xl space-y-4">
            {attendanceToday ? (
              <div className="space-y-4 text-center">
                <div className="inline-flex p-3 rounded-full bg-[#00bf63]/10 border border-[#00bf63]/25 text-[#00bf63] mb-1 animate-bounce">
                  <CheckCircle size={28} />
                </div>
                <div>
                  <span className="font-bold text-xs text-brand-navy dark:text-white block uppercase tracking-wider">Attendance Registered</span>
                  <span className="text-[10px] text-brand-navy/50 dark:text-white/50 block font-bold mt-1 uppercase">
                    Check-In Time: {attendanceToday.check_in_time} | Status: {attendanceToday.status}
                  </span>
                  {attendanceToday.check_out_time ? (
                    <span className="text-[10px] text-brand-navy/50 dark:text-white/50 block font-bold uppercase">
                      Check-Out Time: {attendanceToday.check_out_time}
                    </span>
                  ) : (
                    <button
                      onClick={handleClockOut}
                      disabled={actionLoading}
                      className="mt-4 px-6 py-2 bg-red-600 hover:bg-red-700 text-white font-extrabold text-[10px] uppercase tracking-wider rounded-xl transition-all cursor-pointer"
                    >
                      Clock Out
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[8px] font-extrabold uppercase tracking-wider text-brand-navy/40 dark:text-white/40 block">Daily Work Brief / Notes</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Mason work at Sector 4 Foundation..."
                    value={clockInNotes}
                    onChange={(e) => setClockInNotes(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-white dark:bg-brand-dark border border-brand-navy/10 dark:border-white/10 text-brand-navy dark:text-white placeholder-brand-navy/20 dark:placeholder-white/20 text-xs font-bold transition-all"
                  />
                </div>
                <button
                  onClick={handleClockIn}
                  disabled={actionLoading}
                  className="w-full py-3 bg-brand-navy hover:bg-brand-navy-light text-white font-extrabold text-[10px] uppercase tracking-widest rounded-xl transition-all cursor-pointer"
                >
                  Submit site Check-In
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Worker Checklist Tasks */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Active tasks */}
        <div className="bg-white dark:bg-brand-surface border border-brand-navy/5 dark:border-white/5 rounded-3xl p-6 shadow-sm space-y-4">
          <h4 className="font-outfit font-black text-sm text-brand-navy dark:text-white uppercase tracking-wider">Pending Roster Duties</h4>
          {pendingTasks.length === 0 ? (
            <div className="text-center py-6 text-brand-navy/35 dark:text-white/35 font-bold uppercase text-[9px] tracking-wider">
              Duties fully completed. Excellent work!
            </div>
          ) : (
            <div className="space-y-3">
              {pendingTasks.map(task => (
                <div key={task.id} className="p-4 bg-brand-beige/10 dark:bg-white/5 border border-brand-navy/5 dark:border-white/5 rounded-xl flex justify-between items-center">
                  <div>
                    <span className="font-bold text-xs text-brand-navy dark:text-white block">{task.title}</span>
                    <p className="text-[10px] text-brand-navy/55 dark:text-white/55 font-bold mt-1 uppercase">Project: {task.project_name}</p>
                  </div>
                  <button
                    onClick={() => handleUpdateTaskStatus(task.id, task.status)}
                    className="px-3.5 py-1.5 bg-brand-navy hover:bg-brand-navy-light text-white font-extrabold text-[9px] uppercase tracking-wider rounded-xl transition-all cursor-pointer"
                  >
                    {task.status === 'pending' ? 'Start Duty' : 'Mark Done'}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Completed tasks */}
        <div className="bg-white dark:bg-brand-surface border border-brand-navy/5 dark:border-white/5 rounded-3xl p-6 shadow-sm space-y-4">
          <h4 className="font-outfit font-black text-sm text-brand-navy dark:text-white uppercase tracking-wider">Completed Assignments</h4>
          {completedTasks.length === 0 ? (
            <div className="text-center py-6 text-brand-navy/35 dark:text-white/35 font-bold uppercase text-[9px] tracking-wider">
              No completed tasks logs today.
            </div>
          ) : (
            <div className="space-y-3">
              {completedTasks.map(task => (
                <div key={task.id} className="p-4 bg-[#00bf63]/5 border border-[#00bf63]/15 rounded-xl flex justify-between items-center">
                  <div>
                    <span className="font-bold text-xs text-brand-navy dark:text-white block">{task.title}</span>
                    <p className="text-[10px] text-brand-navy/55 dark:text-white/55 font-bold mt-1 uppercase">Project: {task.project_name}</p>
                  </div>
                  <span className="px-2 py-0.5 bg-[#00bf63]/10 text-[#00bf63] font-bold text-[8px] uppercase tracking-wider rounded border border-[#00bf63]/20">
                    Completed
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
