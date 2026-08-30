import React from 'react';

export default function CtoDashboard({
  stats,
  requisitions = [],
  projects = [],
  ctoComments = {},
  setCtoComments,
  handleCtoRecommendReq,
  actionLoading,
}) {
  const pendingReqs = (requisitions || []).filter(r => r.status === 'pending');

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* CTO Telemetry Header */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-brand-surface border border-brand-navy/5 dark:border-white/5 p-6 rounded-3xl shadow-sm">
          <span className="text-[10px] font-extrabold text-brand-navy/40 dark:text-white/40 uppercase tracking-widest">Active Engineering Projects</span>
          <div className="text-2xl font-black text-brand-navy dark:text-white font-outfit mt-1">{stats?.active_projects}</div>
        </div>
        <div className="bg-white dark:bg-brand-surface border border-brand-navy/5 dark:border-white/5 p-6 rounded-3xl shadow-sm">
          <span className="text-[10px] font-extrabold text-brand-navy/40 dark:text-white/40 uppercase tracking-widest">Pending Technical Assessments</span>
          <div className="text-2xl font-black text-brand-gold font-outfit mt-1">{pendingReqs.length}</div>
        </div>
        <div className="bg-white dark:bg-brand-surface border border-brand-navy/5 dark:border-white/5 p-6 rounded-3xl shadow-sm">
          <span className="text-[10px] font-extrabold text-brand-navy/40 dark:text-white/40 uppercase tracking-widest">Structural Safety Incidents</span>
          <div className="text-2xl font-black text-[#00bf63] font-outfit mt-1">0</div>
        </div>
      </div>

      {/* CTO Requisition Verification Desk */}
      <div className="bg-white dark:bg-brand-surface border border-brand-navy/5 dark:border-white/5 rounded-3xl p-6 shadow-sm space-y-6">
        <div className="border-b border-brand-navy/5 dark:border-white/5 pb-4">
          <h3 className="font-outfit font-extrabold text-lg text-brand-navy dark:text-white uppercase tracking-wider">
            Procurement Technical Verification Desk (CTO Operations Review)
          </h3>
          <p className="text-[11px] text-brand-navy/50 dark:text-white/50 font-medium">
            Vets material specs, quantity indices, and steel/concrete load metrics. Submit your recommendation to the CEO.
          </p>
        </div>

        {pendingReqs.length === 0 ? (
          <div className="text-center py-8 text-brand-navy/30 dark:text-white/30 font-bold uppercase text-[10px] tracking-wider">
            No pending requisitions awaiting technical assessment.
          </div>
        ) : (
          <div className="space-y-6">
            {pendingReqs.map(req => {
              const proj = (projects || []).find(p => p.id === req.project_id);
              return (
                <div key={req.id} className="p-5 bg-brand-beige/25 dark:bg-white/5 border border-brand-navy/5 dark:border-white/5 rounded-2xl relative">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-1">
                      <span className="text-[9px] font-bold text-brand-navy/35 dark:text-white/35 uppercase tracking-wider">Project Location</span>
                      <div className="font-outfit font-extrabold text-sm text-brand-navy dark:text-white truncate">
                        {proj ? proj.name : `Project ID: ${req.project_id}`}
                      </div>
                      <p className="text-[10px] text-brand-navy/50 dark:text-white/50 font-bold uppercase">
                        Req #{req.id} | Quantity: {req.quantity}
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
                      <div className="space-y-2">
                        <label className="text-[8px] font-extrabold uppercase tracking-wider text-brand-navy/40 dark:text-white/40 block">
                          CTO Technical assessment Comments
                        </label>
                        <textarea 
                          rows="2"
                          placeholder="Vetting steel grade/concrete slump specifications..."
                          value={ctoComments[req.id] || ''}
                          onChange={(e) => setCtoComments({ ...ctoComments, [req.id]: e.target.value })}
                          className="w-full px-3 py-1.5 rounded-xl bg-white dark:bg-brand-dark border border-brand-navy/10 dark:border-white/10 text-brand-navy dark:text-white placeholder-brand-navy/20 dark:placeholder-white/20 text-[10px] resize-none"
                        />
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => handleCtoRecommendReq(req.id, true)}
                          disabled={actionLoading}
                          className="flex-1 py-2 bg-blue-500 hover:bg-blue-600 text-white font-extrabold text-[9px] uppercase tracking-wider rounded-xl transition-all cursor-pointer text-center"
                        >
                          Recommend Approval
                        </button>
                        <button
                          onClick={() => handleCtoRecommendReq(req.id, false)}
                          disabled={actionLoading}
                          className="flex-1 py-2 bg-red-600 hover:bg-red-700 text-white font-extrabold text-[9px] uppercase tracking-wider rounded-xl transition-all cursor-pointer text-center"
                        >
                          Recommend Rejection
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
    </div>
  );
}
