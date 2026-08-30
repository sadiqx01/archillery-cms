import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { 
  CalendarRange, 
  Clock, 
  UserCheck, 
  Search, 
  Edit2, 
  X,
  FileCheck
} from 'lucide-react';

export default function Attendance() {
  const { user, isAdmin, isSupervisor } = useAuth();
  
  const [attendance, setAttendance] = useState([]);
  const [workers, setWorkers] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(true);

  // Manual update overrides
  const [overrideTarget, setOverrideTarget] = useState(null);
  const [overrideStatus, setOverrideStatus] = useState('present');
  const [overrideNotes, setOverrideNotes] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [attRes, workerRes] = await Promise.all([
        axios.get(`/api/attendance?date=${selectedDate}`),
        (isAdmin || isSupervisor) ? axios.get('/api/workers') : Promise.resolve({ data: [] })
      ]);
      setAttendance(attRes.data);
      setWorkers(workerRes.data);
    } catch (err) {
      console.error(err);
      alert('Failed to synchronize attendance sheets');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedDate]);

  const handleOpenOverrideModal = (record) => {
    setOverrideTarget(record);
    setOverrideStatus(record.status);
    setOverrideNotes(record.notes || '');
  };

  const handleOverrideSubmit = async (e) => {
    e.preventDefault();
    if (!overrideTarget) return;

    setActionLoading(true);
    try {
      await axios.put(`/api/attendance/${overrideTarget.id}`, {
        status: overrideStatus,
        notes: overrideNotes
      });
      setOverrideTarget(null);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Override submission failed');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRegisterAbsence = async (workerId) => {
    try {
      await axios.post('/api/attendance/manual', {
        user_id: workerId,
        date: selectedDate,
        status: 'absent',
        notes: 'Marked absent by supervisor'
      });
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Absence registration failed');
    }
  };

  const getStatusBadgeClass = (status) => {
    const base = 'text-[9px] font-extrabold uppercase px-2.5 py-1 rounded-full border ';
    switch (status) {
      case 'present': return base + 'bg-green-50 text-green-700 border-green-200';
      case 'late': return base + 'bg-amber-50 text-amber-700 border-amber-200';
      case 'absent': return base + 'bg-red-50 text-red-700 border-red-200';
      case 'leave': return base + 'bg-blue-50 text-blue-700 border-blue-200';
      default: return base + 'bg-gray-50 text-gray-500 border-gray-200';
    }
  };

  // Find workers who do not have attendance logged for the selected date
  const absentWorkers = workers.filter(w => 
    w.role === 'worker' && 
    !attendance.some(att => att.user_id === w.id)
  );

  return (
    <div className="space-y-6 animate-fadeIn grid-bg min-h-screen pb-16">
      
      {/* Header Panel */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-0.5">
          <h2 className="text-xl font-bold font-outfit text-brand-navy dark:text-white uppercase tracking-wider">Attendance Sheets</h2>
          <p className="text-xs text-brand-navy/50 dark:text-white/50 font-semibold uppercase tracking-wider">Audit daily worker checkpoints, duty logs, and roster lists.</p>
        </div>

        {/* Date Selector */}
        <div className="flex items-center gap-2">
          <CalendarRange size={16} className="text-brand-gold" />
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="px-4 py-2.5 rounded-xl border border-brand-navy/10 dark:border-white/10 focus:outline-none focus:border-brand-gold text-xs font-bold text-brand-navy dark:text-white dark:bg-brand-dark tracking-wider"
          />
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-8 h-8 border-4 border-brand-navy dark:border-white border-t-brand-gold rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          
          {/* Attendance Log List Table (Lg: col-span-2) */}
          <div className="lg:col-span-2 bg-white dark:bg-brand-surface border border-brand-navy/5 dark:border-white/10 rounded-[28px] p-6 shadow-sm space-y-6 hover:shadow-md transition-all">
            <h3 className="font-outfit font-extrabold text-sm text-brand-navy dark:text-white uppercase tracking-wider border-b border-brand-navy/5 dark:border-white/10 pb-3">Duty Checkpoint Logs</h3>
            
            {attendance.length === 0 ? (
              <div className="text-center py-12 flex flex-col items-center">
                <Clock className="text-brand-navy/20 dark:text-white/20 animate-pulse mb-3" size={36} />
                <p className="text-xs text-brand-navy/40 dark:text-white/40 font-bold uppercase tracking-wider">No shift arrival logs registered for this date.</p>
              </div>
            ) : (
              <div className="overflow-x-auto rounded-2xl border border-brand-navy/5 dark:border-white/10 shadow-inner">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-[#001026] text-white text-[9px] font-extrabold uppercase tracking-widest">
                      <th className="py-4 px-4">Operator</th>
                      <th className="py-4 px-4">Check In</th>
                      <th className="py-4 px-4">Check Out</th>
                      <th className="py-4 px-4 text-center">Status</th>
                      {(isAdmin || isSupervisor) && <th className="py-4 px-4 text-center no-print">Actions</th>}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-brand-navy/5 dark:divide-white/10 text-xs text-brand-navy/85 dark:text-white/85 font-semibold">
                    {attendance.map((record) => (
                      <tr key={record.id} className="hover:bg-brand-beige/25 dark:hover:bg-brand-dark/25 transition-colors">
                        <td className="py-4 px-4">
                          <div className="font-bold text-brand-navy dark:text-white">{record.worker_name}</div>
                          <div className="text-[10px] text-brand-navy/40 dark:text-white/40 font-medium">{record.worker_email}</div>
                        </td>
                        <td className="py-4 px-4 font-mono">{record.check_in_time}</td>
                        <td className="py-4 px-4 font-mono">{record.check_out_time || 'Shift Active'}</td>
                        <td className="py-4 px-4 text-center">
                          <span className={getStatusBadgeClass(record.status)}>{record.status}</span>
                          {record.notes && (
                            <div className="text-[9px] text-brand-navy/40 dark:text-white/40 italic font-medium mt-1 truncate max-w-[120px]" title={record.notes}>
                              Notes: {record.notes}
                            </div>
                          )}
                        </td>
                        {(isAdmin || isSupervisor) && (
                          <td className="py-4 px-4 text-center no-print">
                            <button
                              onClick={() => handleOpenOverrideModal(record)}
                              className="p-2 border border-brand-navy/10 dark:border-white/10 text-brand-navy dark:text-white hover:text-brand-gold hover:border-brand-gold/30 rounded-xl transition-all"
                              title="Modify shift details"
                            >
                              <Edit2 size={12} />
                            </button>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Supervisor Action Tray: Register absences (Lg: col-span-1) */}
          {(isAdmin || isSupervisor) && (
            <div className="lg:col-span-1 bg-white dark:bg-brand-surface border border-brand-navy/5 dark:border-white/10 rounded-[28px] p-6 shadow-sm space-y-6 hover:shadow-md transition-all no-print">
              <h3 className="font-outfit font-extrabold text-sm text-brand-navy dark:text-white uppercase tracking-wider border-b border-brand-navy/5 dark:border-white/10 pb-3">Absence Dispatch Registry</h3>
              
              {absentWorkers.length === 0 ? (
                <div className="text-center py-8">
                  <UserCheck className="mx-auto mb-3 text-green-500 animate-pulse" size={32} />
                  <p className="text-xs text-brand-navy/50 dark:text-white/50 font-bold uppercase tracking-wider">All active staff registered.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-xs text-brand-navy/55 dark:text-white/55 font-medium leading-relaxed">
                    The following staff members have no arrival check-in logged for {selectedDate}. Mark them absent if required.
                  </p>
                  <div className="space-y-3 max-h-[40vh] overflow-y-auto pr-1">
                    {absentWorkers.map(worker => (
                      <div key={worker.id} className="p-3.5 border border-brand-navy/5 dark:border-white/10 rounded-xl bg-brand-beige/10 dark:bg-brand-dark/10 flex items-center justify-between gap-2 text-xs">
                        <div className="overflow-hidden">
                          <span className="font-bold text-brand-navy dark:text-white block truncate">{worker.name}</span>
                          <span className="text-[10px] text-brand-navy/40 dark:text-white/40 font-medium block truncate mt-0.5">{worker.email}</span>
                        </div>
                        <button
                          onClick={() => handleRegisterAbsence(worker.id)}
                          className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 font-extrabold text-[9px] uppercase tracking-wider rounded-lg transition-all"
                        >
                          Mark Absent
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

        </div>
      )}

      {/* Manual Override Modal */}
      {overrideTarget && (
        <div className="fixed inset-0 z-50 bg-brand-dark/55 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-brand-surface border border-brand-navy/10 dark:border-white/10 w-full max-w-md rounded-[28px] p-6 md:p-8 shadow-2xl relative animate-scaleIn">
            
            <button
              onClick={() => setOverrideTarget(null)}
              className="absolute top-5 right-5 p-2 text-brand-navy/40 dark:text-white/40 hover:text-brand-navy dark:hover:text-white hover:bg-brand-navy/5 dark:hover:bg-white/5 rounded-xl transition-colors"
            >
              <X size={16} />
            </button>

            <h3 className="font-outfit font-extrabold text-base md:text-lg text-brand-navy dark:text-white mb-1 uppercase tracking-wider">
              Shift Roster Override
            </h3>
            <p className="text-xs text-brand-navy/50 dark:text-white/50 mb-6 font-semibold uppercase tracking-wider">Override attendance details for {overrideTarget.worker_name}.</p>

            <form onSubmit={handleOverrideSubmit} className="space-y-4">
              
              <div className="space-y-1">
                <label className="text-[9px] font-extrabold uppercase tracking-widest text-brand-navy/50 dark:text-white/50 block ml-1">Duty Status Coordinates</label>
                <select
                  value={overrideStatus}
                  onChange={(e) => setOverrideStatus(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-brand-navy/10 dark:border-white/10 focus:outline-none focus:border-brand-gold text-xs font-bold text-brand-navy dark:text-white dark:bg-brand-dark uppercase tracking-wider"
                >
                  <option value="present">Present</option>
                  <option value="late">Late Arrival</option>
                  <option value="absent">Absent</option>
                  <option value="leave">Authorised Leave</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-extrabold uppercase tracking-widest text-brand-navy/50 dark:text-white/50 block ml-1">Supervisor Remarks</label>
                <textarea
                  value={overrideNotes}
                  onChange={(e) => setOverrideNotes(e.target.value)}
                  rows="3"
                  placeholder="e.g. Cleared by project manager due to medical appointment..."
                  className="w-full px-4 py-2.5 rounded-xl border border-brand-navy/10 dark:border-white/10 focus:outline-none focus:border-brand-gold text-xs font-medium dark:bg-brand-dark dark:text-white"
                />
              </div>

              {/* Buttons */}
              <div className="flex justify-end gap-3 pt-6 border-t border-brand-navy/5 dark:border-white/10">
                <button
                  type="button"
                  onClick={() => setOverrideTarget(null)}
                  className="px-5 py-2.5 rounded-xl border border-brand-navy/10 dark:border-white/10 text-brand-navy dark:text-white font-bold text-xs uppercase tracking-wider hover:bg-brand-beige dark:hover:bg-brand-dark"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-5 py-2.5 rounded-xl bg-brand-navy text-white hover:bg-brand-navy-light font-bold text-xs uppercase tracking-wider transition-colors"
                >
                  {actionLoading ? 'Saving...' : 'Apply Override'}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
}
