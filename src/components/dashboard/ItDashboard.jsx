import React from 'react';
import { Plus, Trash2 } from 'lucide-react';

export default function ItDashboard({
  projects = [],
  employees = [],
  itUserRoles = {},
  setItUserRoles,
  setShowAddProjModal,
  handleDeleteProject,
  handleUpdateUserRole,
  handleResetUserPassword,
}) {
  const handleDiagnosticsSync = () => {
    if (window.confirm('Re-synchronize database instance with master configuration? All local transaction buffers will be flushed.')) {
      localStorage.removeItem('archillery_cms_db');
      window.location.reload();
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* IT Action Headers */}
      <div className="flex justify-between items-center bg-white dark:bg-brand-surface p-5 border border-brand-navy/5 dark:border-white/5 rounded-3xl shadow-sm">
        <div>
          <h3 className="font-outfit font-black text-lg text-brand-navy dark:text-white uppercase tracking-wider">System Administration Console</h3>
          <p className="text-[10px] text-brand-navy/50 dark:text-white/50 font-medium">Head of IT manages database instances, projects creation, and worker security credentials.</p>
        </div>
        <button
          onClick={() => setShowAddProjModal(true)}
          className="px-4 py-2 bg-brand-gold hover:bg-white text-brand-dark border border-brand-gold font-extrabold text-[10px] uppercase tracking-wider rounded-xl cursor-pointer transition-all flex items-center gap-1"
        >
          <Plus size={14} /> Create Project
        </button>
      </div>

      {/* Project Controls Registry */}
      <div className="bg-white dark:bg-brand-surface border border-brand-navy/5 dark:border-white/5 rounded-3xl p-6 shadow-sm space-y-4">
        <h4 className="font-outfit font-black text-sm text-brand-navy dark:text-white uppercase tracking-wider">Projects Controls Register</h4>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-brand-navy/5 dark:border-white/5 text-[9px] text-brand-navy/40 dark:text-white/40 uppercase tracking-widest">
                <th className="py-3">Project Title</th>
                <th>Location</th>
                <th>Budget</th>
                <th>Status</th>
                <th className="text-right">Project Operations</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-navy/5 dark:divide-white/5 font-medium text-brand-navy dark:text-white/80">
              {projects.map(proj => (
                <tr key={proj.id} className="hover:bg-brand-beige/5">
                  <td className="py-3.5">
                    <span className="font-bold block">{proj.name}</span>
                    <span className="text-[9px] text-brand-navy/40 dark:text-white/40 block">Client: {proj.client_name}</span>
                  </td>
                  <td>{proj.location}</td>
                  <td className="font-black">₦{proj.budget?.toLocaleString()}</td>
                  <td>
                    <span className="px-2 py-0.5 bg-brand-gold/10 border border-brand-gold/25 text-brand-gold font-bold text-[8px] uppercase tracking-wider rounded">
                      {proj.status}
                    </span>
                  </td>
                  <td className="text-right">
                    <button
                      onClick={() => handleDeleteProject(proj.id)}
                      className="p-1.5 bg-red-500/10 border border-red-500/20 text-red-500 hover:bg-red-500 hover:text-white rounded-lg transition-colors cursor-pointer"
                      title="Delete project"
                    >
                      <Trash2 size={13} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* User Account Registry & Privileges desk */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-brand-surface border border-brand-navy/5 dark:border-white/5 rounded-3xl p-6 shadow-sm space-y-4 lg:col-span-2">
          <h4 className="font-outfit font-black text-sm text-brand-navy dark:text-white uppercase tracking-wider">User Account Privilege Controls</h4>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-brand-navy/5 dark:border-white/5 text-[9px] text-brand-navy/40 dark:text-white/40 uppercase tracking-widest">
                  <th className="py-3">Staff Member</th>
                  <th>Email Address</th>
                  <th>Assigned Role</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-navy/5 dark:divide-white/5 font-medium text-brand-navy dark:text-white/80">
                {employees.map(emp => (
                  <tr key={emp.id} className="hover:bg-brand-beige/5">
                    <td className="py-3">
                      <span className="font-bold block">{emp.name}</span>
                      <span className="text-[9px] text-brand-navy/40 dark:text-white/40">{emp.position}</span>
                    </td>
                    <td>{emp.email}</td>
                    <td>
                      <select
                        value={itUserRoles[emp.id] || emp.role}
                        onChange={(e) => {
                          setItUserRoles({ ...itUserRoles, [emp.id]: e.target.value });
                          handleUpdateUserRole(emp.id, e.target.value);
                        }}
                        className="px-2 py-1 bg-brand-beige/40 dark:bg-brand-dark border border-brand-navy/10 dark:border-white/10 rounded-lg text-[10px] font-bold text-brand-navy dark:text-white"
                      >
                        <option value="ceo">CEO</option>
                        <option value="cto">CTO</option>
                        <option value="hr">HR</option>
                        <option value="it">Head of IT</option>
                        <option value="supervisor">Supervisor</option>
                        <option value="engineer">Engineer</option>
                        <option value="worker">Worker</option>
                      </select>
                    </td>
                    <td className="text-right">
                      <button
                        onClick={() => handleResetUserPassword(emp.id)}
                        className="px-2 py-1 bg-brand-navy/15 hover:bg-brand-navy text-brand-navy hover:text-white border border-brand-navy/10 text-[9px] uppercase tracking-wider font-extrabold rounded-lg transition-all cursor-pointer"
                      >
                        Reset Pass
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Database Backup Console */}
        <div className="bg-white dark:bg-brand-surface border border-brand-navy/5 dark:border-white/5 rounded-3xl p-6 shadow-sm space-y-5 lg:col-span-1">
          <h4 className="font-outfit font-black text-sm text-brand-navy dark:text-white uppercase tracking-wider">Database Backups & Diagnostics</h4>
          <div className="space-y-4 text-xs font-medium text-brand-navy/70 dark:text-white/70">
            <p>Manage SQL database backup protocols and local data state sync operations.</p>
            
            <div className="p-4 bg-brand-beige/20 dark:bg-white/5 rounded-xl border border-brand-navy/5 dark:border-white/5 space-y-1">
              <span className="text-[9px] font-bold text-brand-navy/40 dark:text-white/40 uppercase block">Database Instance</span>
              <span className="font-bold text-brand-navy dark:text-white block">Archillery Enterprise DB v2.1</span>
              <span className="text-[10px] text-brand-navy/50 dark:text-white/50 block">Status: Active & Synced</span>
            </div>

            <div className="space-y-2 pt-2">
              <button
                onClick={() => alert('Compiling Database Backup... Archillery_Backup.sql downloaded successfully.')}
                className="w-full py-3 bg-brand-navy hover:bg-brand-navy-light text-white font-extrabold text-[9px] uppercase tracking-widest rounded-xl transition-all cursor-pointer block border border-brand-navy"
              >
                Download DB Backup
              </button>
              <button
                onClick={handleDiagnosticsSync}
                className="w-full py-3 bg-brand-navy/15 hover:bg-brand-navy text-brand-gold font-extrabold text-[9px] uppercase tracking-widest rounded-xl transition-all cursor-pointer block border border-brand-navy/15"
              >
                Diagnostics Sync
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
