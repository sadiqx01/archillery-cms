import React from 'react';
import { Link } from 'react-router-dom';
import { FileText, CheckCircle } from 'lucide-react';

export default function CeoDashboard({
  stats,
  requisitions = [],
  projects = [],
  ceoComments = {},
  setCeoComments,
  handleCeoApproveReq,
  actionLoading,
}) {
  const pendingReqs = requisitions.filter(r => ['pending', 'cto_recommended'].includes(r.status));

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* CEO Telemetry Headers */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-brand-surface border border-brand-navy/5 dark:border-white/5 p-6 rounded-3xl shadow-sm">
          <span className="text-[10px] font-extrabold text-brand-navy/40 dark:text-white/40 uppercase tracking-widest">Total Projects</span>
          <div className="text-2xl font-black text-brand-navy dark:text-white font-outfit mt-1">{stats?.total_projects}</div>
        </div>
        <div className="bg-white dark:bg-brand-surface border border-brand-navy/5 dark:border-white/5 p-6 rounded-3xl shadow-sm">
          <span className="text-[10px] font-extrabold text-brand-navy/40 dark:text-white/40 uppercase tracking-widest">Active Operations</span>
          <div className="text-2xl font-black text-brand-navy dark:text-white font-outfit mt-1">{stats?.active_projects}</div>
        </div>
        <div className="bg-white dark:bg-brand-surface border border-brand-navy/5 dark:border-white/5 p-6 rounded-3xl shadow-sm">
          <span className="text-[10px] font-extrabold text-brand-navy/40 dark:text-white/40 uppercase tracking-widest">Pending Approvals</span>
          <div className="text-2xl font-black text-brand-gold font-outfit mt-1">{pendingReqs.length}</div>
        </div>
        <div className="bg-white dark:bg-brand-surface border border-brand-navy/5 dark:border-white/5 p-6 rounded-3xl shadow-sm">
          <span className="text-[10px] font-extrabold text-brand-navy/40 dark:text-white/40 uppercase tracking-widest">Expenses Budget</span>
          <div className="text-2xl font-black text-brand-navy dark:text-white font-outfit mt-1">₦{stats?.total_budget?.toLocaleString()}</div>
        </div>
      </div>

      {/* CEO Requisitions Authorization Panel */}
      <div className="bg-white dark:bg-brand-surface border border-brand-navy/5 dark:border-white/5 rounded-3xl p-6 shadow-sm space-y-6">
        <div className="border-b border-brand-navy/5 dark:border-white/5 pb-4">
          <h3 className="font-outfit font-extrabold text-lg text-brand-navy dark:text-white uppercase tracking-wider">
            Requisition Authorization Desk (CEO Final Approval)
          </h3>
          <p className="text-[11px] text-brand-navy/50 dark:text-white/50 font-medium">
            Only the CEO holds the final authority to release funds for material procurement, labor payments, and operations expenses.
          </p>
        </div>

        {pendingReqs.length === 0 ? (
          <div className="text-center py-8 text-brand-navy/30 dark:text-white/30 font-bold uppercase text-[10px] tracking-wider">
            All procurement requisitions cleared. Clean Slate.
          </div>
        ) : (
          <div className="space-y-6">
            {pendingReqs.map(req => {
              const proj = projects.find(p => p.id === req.project_id);
              return (
                <div key={req.id} className="p-5 bg-brand-beige/25 dark:bg-white/5 border border-brand-navy/5 dark:border-white/5 rounded-2xl relative overflow-hidden group">
                  {/* Status Badge */}
                  <div className="absolute right-4 top-4">
                    {req.status === 'cto_recommended' ? (
                      <span className="px-3 py-1 bg-blue-500/10 border border-blue-500/30 text-blue-500 font-extrabold text-[9px] uppercase tracking-wider rounded-lg">
                        CTO Recommended
                      </span>
                    ) : (
                      <span className="px-3 py-1 bg-amber-500/10 border border-amber-500/30 text-amber-500 font-extrabold text-[9px] uppercase tracking-wider rounded-lg">
                        Pending Review
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-1">
                      <span className="text-[9px] font-bold text-brand-navy/35 dark:text-white/35 uppercase tracking-wider">Project Location</span>
                      <div className="font-outfit font-extrabold text-sm text-brand-navy dark:text-white truncate">
                        {proj ? proj.name : `Project ID: ${req.project_id}`}
                      </div>
                      <p className="text-[10px] text-brand-navy/50 dark:text-white/50 font-bold uppercase">
                        Req #{req.id} | Type: {req.requisition_type}
                      </p>
                    </div>

                    <div className="space-y-1">
                      <span className="text-[9px] font-bold text-brand-navy/35 dark:text-white/35 uppercase tracking-wider">Line Item Summary</span>
                      <div className="text-xs font-bold text-brand-navy dark:text-white uppercase truncate">
                        {req.item_name}
                      </div>
                      <div className="text-sm font-black text-brand-gold font-outfit">
                        ₦{(req.estimated_cost * req.quantity).toLocaleString()}
                      </div>
                    </div>

                    <div className="space-y-3">
                      {req.cto_comments && (
                        <div className="bg-blue-950/20 border border-blue-500/10 p-2.5 rounded-xl text-[10px] text-blue-200 font-medium">
                          <span className="font-bold block uppercase tracking-wider text-[8px] text-blue-400">CTO Technical Assessment:</span>
                          "{req.cto_comments}"
                        </div>
                      )}
                      
                      <div className="space-y-2">
                        <label className="text-[8px] font-extrabold uppercase tracking-wider text-brand-navy/40 dark:text-white/40 block">CEO Remarks (Optional)</label>
                        <input 
                          type="text" 
                          placeholder="Add final comments..."
                          value={ceoComments[req.id] || ''}
                          onChange={(e) => setCeoComments({ ...ceoComments, [req.id]: e.target.value })}
                          className="w-full px-3 py-1.5 rounded-xl bg-white dark:bg-brand-dark border border-brand-navy/10 dark:border-white/10 text-brand-navy dark:text-white placeholder-brand-navy/20 dark:placeholder-white/20 text-[10px]"
                        />
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => handleCeoApproveReq(req.id, true)}
                          disabled={actionLoading}
                          className="flex-1 py-2 bg-[#00bf63] hover:bg-[#00bf63]/90 text-white font-extrabold text-[9px] uppercase tracking-wider rounded-xl transition-all cursor-pointer text-center"
                        >
                          Approve Release
                        </button>
                        <button
                          onClick={() => handleCeoApproveReq(req.id, false)}
                          disabled={actionLoading}
                          className="flex-1 py-2 bg-red-600 hover:bg-red-700 text-white font-extrabold text-[9px] uppercase tracking-wider rounded-xl transition-all cursor-pointer text-center"
                        >
                          Reject Request
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* CEO Site Operations Tracker */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-brand-surface border border-brand-navy/5 dark:border-white/5 rounded-3xl p-6 shadow-sm space-y-4">
          <h3 className="font-outfit font-extrabold text-sm text-brand-navy dark:text-white uppercase tracking-wider">Projects Summary Dashboard</h3>
          <div className="divide-y divide-brand-navy/5 dark:border-white/5">
            {projects.slice(0, 4).map(proj => (
              <div key={proj.id} className="py-3 flex justify-between items-center text-xs">
                <div>
                  <span className="font-bold text-brand-navy dark:text-white block">{proj.name}</span>
                  <span className="text-[9px] text-brand-navy/55 dark:text-white/55 block uppercase font-medium">{proj.location}</span>
                </div>
                <div className="text-right">
                  <span className="font-black text-brand-navy dark:text-white block">₦{proj.budget.toLocaleString()}</span>
                  <span className="px-2 py-0.5 bg-brand-gold/10 border border-brand-gold/25 text-brand-gold font-extrabold text-[8px] uppercase tracking-wider rounded-md">
                    {proj.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
          <Link to="/projects" className="text-[10px] font-black text-brand-navy/50 dark:text-white/50 uppercase tracking-widest hover:text-brand-gold transition-colors inline-block pt-2">
            Browse All Projects →
          </Link>
        </div>

        <div className="bg-white dark:bg-brand-surface border border-brand-navy/5 dark:border-white/5 rounded-3xl p-6 shadow-sm space-y-4">
          <h3 className="font-outfit font-extrabold text-sm text-brand-navy dark:text-white uppercase tracking-wider">Recent Site Activity Reports</h3>
          <div className="space-y-3">
            <div className="flex gap-3 text-xs">
              <FileText size={18} className="text-brand-gold shrink-0" />
              <div>
                <span className="font-bold text-brand-navy dark:text-white block">Daily Site Report #019 Filed</span>
                <span className="text-[9px] text-brand-navy/50 dark:text-white/50 font-medium">B95 Sahara Estate | Filed by Site Supervisor Musa</span>
              </div>
            </div>
            <div className="flex gap-3 text-xs">
              <CheckCircle size={18} className="text-green-500 shrink-0" />
              <div>
                <span className="font-bold text-brand-navy dark:text-white block">QC Structural Slab Inspection Signed Off</span>
                <span className="text-[9px] text-brand-navy/50 dark:text-white/50 font-medium">Area II Plaza | Certified by Lead Site Engineer Alamin</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
