import React from 'react';
import { CheckCircle } from 'lucide-react';

export default function EngineerDashboard({
  attendanceToday,
  handleClockIn,
  setShowInspectionModal,
  setShowSlumpModal,
}) {
  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Engineer action header */}
      <div className="flex justify-between items-center bg-white dark:bg-brand-surface p-5 border border-brand-navy/5 dark:border-white/5 rounded-3xl shadow-sm">
        <div>
          <h3 className="font-outfit font-black text-lg text-brand-navy dark:text-white uppercase tracking-wider">Field Engineering Operations Console</h3>
          <p className="text-[10px] text-brand-navy/50 dark:text-white/50 font-medium">Coordinate site inspections, test structural concrete slump indices, and log observations.</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowInspectionModal(true)}
            className="px-3 py-2 bg-brand-gold hover:bg-white text-brand-dark border border-brand-gold font-extrabold text-[9px] uppercase tracking-wider rounded-xl cursor-pointer transition-all"
          >
            Log Observation
          </button>
          <button
            onClick={() => setShowSlumpModal(true)}
            className="px-3 py-2 bg-brand-navy hover:bg-brand-navy-light text-white font-extrabold text-[9px] uppercase tracking-wider rounded-xl cursor-pointer transition-all border border-brand-navy"
          >
            Concrete Slump Test
          </button>
        </div>
      </div>

      {/* Attendance card & specifications lookups */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Clock Console */}
        <div className="bg-white dark:bg-brand-surface border border-brand-navy/5 dark:border-white/5 rounded-3xl p-6 shadow-sm space-y-4">
          <h4 className="font-outfit font-black text-sm text-brand-navy dark:text-white uppercase tracking-wider">Roster Registry (Sign Attendance)</h4>
          {attendanceToday ? (
            <div className="text-center py-4 space-y-3">
              <CheckCircle size={32} className="text-[#00bf63] mx-auto animate-bounce" />
              <span className="font-bold text-xs text-brand-navy dark:text-white block">ATTENDANCE LOGGED</span>
              <span className="text-[9px] text-brand-navy/40 dark:text-white/40 block">In: {attendanceToday.check_in_time}</span>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-[11px] text-brand-navy/50 dark:text-white/50">Submit your coordinate logs to check-in.</p>
              <button
                onClick={handleClockIn}
                className="w-full py-3 bg-brand-navy hover:bg-brand-navy-light text-white font-extrabold text-[10px] uppercase tracking-wider rounded-xl transition-colors cursor-pointer"
              >
                Clock In
              </button>
            </div>
          )}
        </div>

        {/* Drawings specs lookup */}
        <div className="bg-white dark:bg-brand-surface border border-brand-navy/5 dark:border-white/5 rounded-3xl p-6 shadow-sm space-y-4">
          <h4 className="font-outfit font-black text-sm text-brand-navy dark:text-white uppercase tracking-wider">Drawings & Blueprint reference</h4>
          <div className="space-y-3">
            <a href="#" className="p-3 bg-brand-beige/10 hover:bg-brand-gold/10 border border-brand-navy/5 dark:border-white/5 rounded-2xl block text-xs font-bold text-brand-navy dark:text-white transition-all">
              Structural Blueprint A1-028.dwg
              <span className="text-[9px] text-brand-navy/40 dark:text-white/40 block font-normal mt-0.5">Approved concrete reinforcement dimensions.</span>
            </a>
            <a href="#" className="p-3 bg-brand-beige/10 hover:bg-brand-gold/10 border border-brand-navy/5 dark:border-white/5 rounded-2xl block text-xs font-bold text-brand-navy dark:text-white transition-all">
              Drainage Elevation Section.dwg
              <span className="text-[9px] text-brand-navy/40 dark:text-white/40 block font-normal mt-0.5">Vetted shopfront plumbing layouts.</span>
            </a>
          </div>
        </div>

        {/* Materials purchase recommendation */}
        <div className="bg-white dark:bg-brand-surface border border-brand-navy/5 dark:border-white/5 rounded-3xl p-6 shadow-sm space-y-4">
          <h4 className="font-outfit font-black text-sm text-brand-navy dark:text-white uppercase tracking-wider">Purchase Recommendation</h4>
          <p className="text-[11px] text-brand-navy/55 dark:text-white/55">Recommend structural materials to the CTO operations verification queue.</p>
          <button
            onClick={() => {
              alert('Recommendation checklist sent. Open the procurement tab to generate requisition forms.');
            }}
            className="w-full py-2.5 bg-brand-navy hover:bg-brand-navy-light text-white text-[9px] font-bold uppercase tracking-wider rounded-xl transition-all cursor-pointer block border border-brand-navy"
          >
            Recommend Materials
          </button>
        </div>
      </div>
    </div>
  );
}
