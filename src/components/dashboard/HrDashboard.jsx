import React from 'react';
import { Plus } from 'lucide-react';

export default function HrDashboard({
  employees = [],
  leaves = [],
  vacancies = [],
  interviews = [],
  activeHrTab,
  setActiveHrTab,
  perfForm,
  setPerfForm,
  setShowAddEmpModal,
  setSelectedEmp,
  handleDeactivateEmployee,
  handleApproveLeave,
  setShowAddVacModal,
  setShowAddIntModal,
  handleSubmitPerformanceReview,
}) {
  return (
    <div className="space-y-8 animate-fadeIn">
      {/* HR Telemetry Indicators */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-brand-surface border border-brand-navy/5 dark:border-white/5 p-5 rounded-2xl shadow-sm">
          <span className="text-[10px] font-extrabold text-brand-navy/40 dark:text-white/40 uppercase tracking-widest">Total Staff Registry</span>
          <div className="text-xl font-black text-brand-navy dark:text-white mt-1">{employees.length}</div>
        </div>
        <div className="bg-white dark:bg-brand-surface border border-brand-navy/5 dark:border-white/5 p-5 rounded-2xl shadow-sm">
          <span className="text-[10px] font-extrabold text-brand-navy/40 dark:text-white/40 uppercase tracking-widest">Leave Approvals Approved</span>
          <div className="text-xl font-black text-[#00bf63] mt-1">
            {leaves.filter(l => l.status === 'approved').length}
          </div>
        </div>
        <div className="bg-white dark:bg-brand-surface border border-brand-navy/5 dark:border-white/5 p-5 rounded-2xl shadow-sm">
          <span className="text-[10px] font-extrabold text-brand-navy/40 dark:text-white/40 uppercase tracking-widest">Leaves Pending HR Review</span>
          <div className="text-xl font-black text-brand-gold mt-1">
            {leaves.filter(l => l.status === 'pending').length}
          </div>
        </div>
        <div className="bg-white dark:bg-brand-surface border border-brand-navy/5 dark:border-white/5 p-5 rounded-2xl shadow-sm">
          <span className="text-[10px] font-extrabold text-brand-navy/40 dark:text-white/40 uppercase tracking-widest">Job Vacancies Open</span>
          <div className="text-xl font-black text-brand-navy dark:text-white mt-1">
            {vacancies.filter(v => v.status === 'open').length}
          </div>
        </div>
      </div>

      {/* HR Dashboard Navigation tabs */}
      <div className="flex border-b border-brand-navy/5 dark:border-white/5 gap-4">
        {['employees', 'leaves', 'recruitment', 'performance', 'payroll'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveHrTab(tab)}
            className={`pb-3 font-extrabold text-[10px] uppercase tracking-wider border-b-2 transition-all cursor-pointer ${
              activeHrTab === tab 
                ? 'border-brand-gold text-brand-gold'
                : 'border-transparent text-brand-navy/40 dark:text-white/40 hover:text-brand-navy dark:hover:text-white'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Active HR Tab panel Content */}
      {activeHrTab === 'employees' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center bg-white dark:bg-brand-surface p-4 rounded-2xl border border-brand-navy/5 dark:border-white/5 shadow-sm">
            <div>
              <h4 className="font-outfit font-black text-sm text-brand-navy dark:text-white uppercase tracking-wider">Employee Registry</h4>
              <p className="text-[10px] text-brand-navy/50 dark:text-white/50 font-medium">Add, archive, deactivate and manage employment records.</p>
            </div>
            <button
              onClick={() => setShowAddEmpModal(true)}
              className="px-4 py-2 bg-brand-gold hover:bg-white text-brand-dark border border-brand-gold transition-all text-[10px] uppercase tracking-wider font-extrabold rounded-xl cursor-pointer flex items-center gap-1"
            >
              <Plus size={14} /> Register Staff
            </button>
          </div>

          {/* Employee List Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {employees.map(emp => (
              <div key={emp.id} className="bg-white dark:bg-brand-surface border border-brand-navy/5 dark:border-white/5 rounded-2xl p-5 shadow-sm space-y-4">
                <div className="flex gap-3">
                  <div className="w-12 h-12 rounded-full overflow-hidden bg-brand-navy/5 border border-brand-navy/10 shrink-0">
                    <img 
                      src={emp.photo || '/default-avatar.svg'} 
                      alt={emp.name} 
                      className="w-full h-full object-cover"
                      onError={(e) => { e.target.src = '/default-avatar.svg'; }}
                    />
                  </div>
                  <div>
                    <span className="font-outfit font-extrabold text-xs text-brand-navy dark:text-white block">{emp.name}</span>
                    <span className="text-[9px] text-brand-gold font-bold uppercase tracking-wider block">{emp.position}</span>
                    <span className="text-[9px] text-brand-navy/40 dark:text-white/40 uppercase block">{emp.department}</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-brand-navy/5 dark:border-white/5 flex justify-between items-center">
                  <button
                    onClick={() => setSelectedEmp(emp)}
                    className="px-3 py-1.5 bg-brand-beige/50 hover:bg-brand-gold/10 text-brand-navy dark:text-white font-bold text-[9px] uppercase tracking-wider rounded-lg border border-brand-navy/5 dark:border-white/5 transition-all cursor-pointer"
                  >
                    View Profile
                  </button>
                  <button
                    onClick={() => handleDeactivateEmployee(emp.id, emp.status === 'active')}
                    className={`px-3 py-1.5 font-bold text-[9px] uppercase tracking-wider rounded-lg border transition-all cursor-pointer ${
                      emp.status === 'active'
                        ? 'bg-red-500/10 border-red-500/20 text-red-500 hover:bg-red-500 hover:text-white'
                        : 'bg-green-500/10 border-green-500/20 text-[#00bf63] hover:bg-green-500 hover:text-white'
                    }`}
                  >
                    {emp.status === 'active' ? 'Deactivate' : 'Activate'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeHrTab === 'leaves' && (
        <div className="bg-white dark:bg-brand-surface border border-brand-navy/5 dark:border-white/5 rounded-3xl p-6 shadow-sm space-y-4">
          <h4 className="font-outfit font-black text-sm text-brand-navy dark:text-white uppercase tracking-wider">Leave Applications Review</h4>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-brand-navy/5 dark:border-white/5 text-[9px] text-brand-navy/40 dark:text-white/40 uppercase tracking-widest">
                  <th className="py-3">Employee Name</th>
                  <th>Leave Dates</th>
                  <th>Type / Purpose</th>
                  <th>Status</th>
                  <th className="text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-navy/5 dark:divide-white/5 font-medium text-brand-navy dark:text-white/80">
                {leaves.map(l => (
                  <tr key={l.id} className="hover:bg-brand-beige/10">
                    <td className="py-3.5">
                      <span className="font-bold block">{l.name}</span>
                      <span className="text-[9px] text-brand-navy/40 dark:text-white/40">{l.position}</span>
                    </td>
                    <td>
                      {l.start_date} to {l.end_date}
                    </td>
                    <td>
                      <span className="font-bold text-[9px] bg-brand-gold/15 text-brand-gold border border-brand-gold/20 px-2 py-0.5 rounded uppercase">{l.type}</span>
                      <p className="text-[10px] text-brand-navy/50 dark:text-white/55 mt-0.5">"{l.reason}"</p>
                    </td>
                    <td>
                      <span className={`px-2 py-0.5 font-bold uppercase tracking-wider text-[8px] border rounded ${
                        l.status === 'approved'
                          ? 'bg-[#00bf63]/10 border-[#00bf63]/20 text-[#00bf63]'
                          : l.status === 'rejected'
                            ? 'bg-red-500/10 border-red-500/20 text-red-500'
                            : 'bg-amber-500/10 border-amber-500/20 text-amber-500'
                      }`}>
                        {l.status}
                      </span>
                    </td>
                    <td className="text-right">
                      {l.status === 'pending' && (
                        <div className="inline-flex gap-1">
                          <button
                            onClick={() => handleApproveLeave(l.id, true)}
                            className="px-2 py-1 bg-green-500/15 hover:bg-green-500 text-green-500 hover:text-white border border-green-500/20 text-[9px] font-extrabold uppercase rounded transition-all cursor-pointer"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleApproveLeave(l.id, false)}
                            className="px-2 py-1 bg-red-500/15 hover:bg-red-500 text-red-500 hover:text-white border border-red-500/20 text-[9px] font-extrabold uppercase rounded transition-all cursor-pointer"
                          >
                            Reject
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeHrTab === 'recruitment' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Vacancies */}
          <div className="bg-white dark:bg-brand-surface border border-brand-navy/5 dark:border-white/5 rounded-3xl p-6 shadow-sm space-y-4">
            <div className="flex justify-between items-center">
              <h4 className="font-outfit font-black text-sm text-brand-navy dark:text-white uppercase tracking-wider">Job Vacancies Dashboard</h4>
              <button
                onClick={() => setShowAddVacModal(true)}
                className="px-2.5 py-1 bg-brand-navy hover:bg-brand-navy-light text-white text-[9px] font-bold uppercase tracking-wider rounded-lg border border-brand-navy/5 cursor-pointer"
              >
                Post Vacancy
              </button>
            </div>
            <div className="divide-y divide-brand-navy/5 dark:divide-white/5">
              {vacancies.map(v => (
                <div key={v.id} className="py-3 flex justify-between items-center text-xs">
                  <div>
                    <span className="font-bold text-brand-navy dark:text-white block">{v.title}</span>
                    <span className="text-[9px] text-brand-navy/40 dark:text-white/40 block font-bold uppercase">{v.department}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-brand-gold font-bold block">{v.applicationsCount} Applicants</span>
                    <span className="px-1.5 py-0.5 bg-brand-gold/10 text-brand-gold border border-brand-gold/20 font-extrabold text-[8px] uppercase tracking-wider rounded">
                      {v.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Interviews */}
          <div className="bg-white dark:bg-brand-surface border border-brand-navy/5 dark:border-white/5 rounded-3xl p-6 shadow-sm space-y-4">
            <div className="flex justify-between items-center">
              <h4 className="font-outfit font-black text-sm text-brand-navy dark:text-white uppercase tracking-wider">Scheduled Interviews</h4>
              <button
                onClick={() => setShowAddIntModal(true)}
                className="px-2.5 py-1 bg-brand-navy hover:bg-brand-navy-light text-white text-[9px] font-bold uppercase tracking-wider rounded-lg border border-brand-navy/5 cursor-pointer"
              >
                Schedule
              </button>
            </div>
            <div className="divide-y divide-brand-navy/5 dark:divide-white/5">
              {interviews.map(i => (
                <div key={i.id} className="py-3 flex justify-between items-center text-xs">
                  <div>
                    <span className="font-bold text-brand-navy dark:text-white block">{i.candidate_name}</span>
                    <span className="text-[9px] text-brand-navy/40 dark:text-white/40 block font-bold uppercase">{i.vacancy_title}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-brand-navy/55 dark:text-white/55 font-bold block">
                      {new Date(i.date).toLocaleString()}
                    </span>
                    <span className="px-1.5 py-0.5 bg-blue-500/10 text-blue-500 border border-blue-500/20 font-extrabold text-[8px] uppercase tracking-wider rounded">
                      {i.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeHrTab === 'performance' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Record Performance Reviews Form */}
          <div className="bg-white dark:bg-brand-surface border border-brand-navy/5 dark:border-white/5 rounded-3xl p-6 shadow-sm space-y-4 lg:col-span-1">
            <h4 className="font-outfit font-black text-sm text-brand-navy dark:text-white uppercase tracking-wider">File Staff Assessment</h4>
            <form onSubmit={handleSubmitPerformanceReview} className="space-y-4">
              <div className="space-y-2">
                <label className="text-[9px] font-bold uppercase tracking-wider text-brand-navy/40 dark:text-white/40">Select Staff</label>
                <select
                  value={perfForm.user_id}
                  onChange={(e) => setPerfForm({ ...perfForm, user_id: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-brand-beige/20 dark:bg-brand-dark border border-brand-navy/10 dark:border-white/10 text-brand-navy dark:text-white text-xs"
                  required
                >
                  <option value="">-- Choose Employee --</option>
                  {employees.map(e => (
                    <option key={e.id} value={e.id}>{e.name} ({e.position})</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-[9px] font-bold uppercase tracking-wider text-brand-navy/40 dark:text-white/40">Assessment Type</label>
                <select
                  value={perfForm.type}
                  onChange={(e) => setPerfForm({ ...perfForm, type: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-brand-beige/20 dark:bg-brand-dark border border-brand-navy/10 dark:border-white/10 text-brand-navy dark:text-white text-xs"
                >
                  <option value="commendation">Commendation Letter</option>
                  <option value="warning">Disciplinary warning</option>
                  <option value="training">Training completed</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-[9px] font-bold uppercase tracking-wider text-brand-navy/40 dark:text-white/40">Remarks / Observation</label>
                <textarea
                  rows="3"
                  placeholder="Describe staff achievements, warnings, or safety compliance logs..."
                  value={perfForm.notes}
                  onChange={(e) => setPerfForm({ ...perfForm, notes: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-brand-beige/20 dark:bg-brand-dark border border-brand-navy/10 dark:border-white/10 text-brand-navy dark:text-white text-xs resize-none"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-brand-navy hover:bg-brand-navy-light text-white font-extrabold text-[10px] uppercase tracking-wider rounded-xl transition-all cursor-pointer block"
              >
                Save Assessment Record
              </button>
            </form>
          </div>

          {/* Performance Review Log list */}
          <div className="bg-white dark:bg-brand-surface border border-brand-navy/5 dark:border-white/5 rounded-3xl p-6 shadow-sm space-y-4 lg:col-span-2">
            <h4 className="font-outfit font-black text-sm text-brand-navy dark:text-white uppercase tracking-wider">Assessment History</h4>
            <div className="space-y-4 max-h-[350px] overflow-y-auto pr-2">
              {employees.filter(e => e.perf_notes && e.perf_notes.length > 0).map(emp => (
                <div key={emp.id} className="p-4 bg-brand-beige/20 dark:bg-white/5 rounded-xl border border-brand-navy/5 dark:border-white/5 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-xs text-brand-navy dark:text-white">{emp.name}</span>
                    <span className="text-[9px] text-brand-navy/40 dark:text-white/40">{emp.position}</span>
                  </div>
                  <div className="space-y-2">
                    {emp.perf_notes.map((note, index) => (
                      <div key={index} className="pl-3 border-l-2 border-brand-gold text-[10px] text-brand-navy dark:text-white/80">
                        <span className="font-bold uppercase text-brand-gold">{note.type}</span> ({note.date}):
                        <p className="mt-0.5">"{note.notes}"</p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeHrTab === 'payroll' && (
        <div className="bg-white dark:bg-brand-surface border border-brand-navy/5 dark:border-white/5 rounded-3xl p-6 shadow-sm space-y-4">
          <div className="flex justify-between items-center border-b border-brand-navy/5 dark:border-white/5 pb-3">
            <div>
              <h4 className="font-outfit font-black text-sm text-brand-navy dark:text-white uppercase tracking-wider">Payroll Overview (Read-Only)</h4>
              <p className="text-[10px] text-brand-navy/50 dark:text-white/50 font-medium">HR holds salary oversight, but final financial approvals are CEO-controlled.</p>
            </div>
            <span className="px-3 py-1 bg-brand-gold/10 border border-brand-gold/25 text-brand-gold text-[8px] uppercase tracking-widest font-black rounded-lg">
              ₦ Naira Denominated
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-brand-navy/5 dark:border-white/5 text-[9px] text-brand-navy/40 dark:text-white/40 uppercase tracking-widest">
                  <th className="py-3">Employee</th>
                  <th>Department</th>
                  <th>Basic Monthly Salary</th>
                  <th>Joined Date</th>
                  <th className="text-right">Payroll Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-navy/5 dark:divide-white/5 font-medium text-brand-navy dark:text-white/85">
                {employees.map(emp => (
                  <tr key={emp.id} className="hover:bg-brand-beige/5">
                    <td className="py-3">
                      <span className="font-bold block">{emp.name}</span>
                      <span className="text-[9px] text-brand-gold uppercase tracking-wider">{emp.position}</span>
                    </td>
                    <td>{emp.department}</td>
                    <td className="font-black text-brand-navy dark:text-white">₦{emp.salary?.toLocaleString()}</td>
                    <td>{emp.joined_date || '2024-01-01'}</td>
                    <td className="text-right">
                      <span className="px-2 py-0.5 bg-[#00bf63]/10 border border-[#00bf63]/25 text-[#00bf63] font-bold text-[8px] uppercase tracking-wider rounded">
                        Paid
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
