import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ShoppingBag, FileText, CheckCircle, PlusCircle, Eye, AlertTriangle, Printer, Clock, Check, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Procurement() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('requisitions');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Data registers
  const [projects, setProjects] = useState([]);
  const [requisitions, setRequisitions] = useState([]);
  const [lpos, setLpos] = useState([]);
  const [grns, setGrns] = useState([]);

  // Short Material Request Form State
  const [reqProjectId, setReqProjectId] = useState('');
  const [reqMaterial, setReqMaterial] = useState('');
  const [reqQuantity, setReqQuantity] = useState('');
  const [reqUnit, setReqUnit] = useState('bags');
  const [reqPurpose, setReqPurpose] = useState('');
  const [submittingReq, setSubmittingReq] = useState(false);

  // Review comments mapping
  const [reviewComments, setReviewComments] = useState({});

  // 2. Issue LPO states (Secondary)
  const [selectedReq, setSelectedReq] = useState(null);
  const [vendorName, setVendorName] = useState('');
  const [submittingLpo, setSubmittingLpo] = useState(false);

  // 3. Log GRN states (Secondary)
  const [selectedLpo, setSelectedLpo] = useState(null);
  const [deliveryNoteRef, setDeliveryNoteRef] = useState('');
  const [grnItems, setGrnItems] = useState([]);
  const [submittingGrn, setSubmittingGrn] = useState(false);

  // Detail Modal
  const [selectedDetailObject, setSelectedDetailObject] = useState(null);
  const [detailType, setDetailType] = useState('');

  useEffect(() => {
    fetchProcurementData();
  }, []);

  const fetchProcurementData = async () => {
    try {
      setLoading(true);
      setError('');
      const [projRes, reqRes, lpoRes, grnRes] = await Promise.all([
        axios.get('/api/projects'),
        axios.get('/api/procurement/requisitions'),
        axios.get('/api/procurement/lpos'),
        axios.get('/api/procurement/grns')
      ]);
      setProjects(projRes.data);
      setRequisitions(reqRes.data);
      setLpos(lpoRes.data);
      setGrns(grnRes.data);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch procurement records.');
    } finally {
      setLoading(false);
    }
  };

  // Submit Short Material Request
  const handleCreateRequisition = async (e) => {
    e.preventDefault();
    if (!reqProjectId || !reqMaterial || !reqQuantity) {
      alert('Please fill in project, material name, and quantity.');
      return;
    }
    setSubmittingReq(true);
    try {
      await axios.post('/api/procurement/requisitions', {
        project_id: reqProjectId,
        material: reqMaterial,
        quantity: reqQuantity,
        unit: reqUnit || 'units',
        purpose: reqPurpose
      });
      alert('Material Request submitted successfully!');
      setReqProjectId('');
      setReqMaterial('');
      setReqQuantity('');
      setReqUnit('bags');
      setReqPurpose('');
      fetchProcurementData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to submit material request');
    } finally {
      setSubmittingReq(false);
    }
  };

  // CTO Review (Recommend or Reject)
  const handleCtoRecommend = async (reqId, recommend) => {
    const comments = reviewComments[reqId] || '';
    try {
      await axios.patch(`/api/procurement/requisitions/${reqId}/recommend`, { recommend, comments });
      alert(recommend ? 'Material request recommended to CEO.' : 'Material request rejected by CTO.');
      setReviewComments({ ...reviewComments, [reqId]: '' });
      fetchProcurementData();
    } catch (err) {
      alert('Failed to update recommendation');
    }
  };

  // CEO Review (Approve or Reject)
  const handleCeoApprove = async (reqId, approve) => {
    const comments = reviewComments[reqId] || '';
    try {
      await axios.patch(`/api/procurement/requisitions/${reqId}/approve`, { approve, comments });
      alert(approve ? 'Material request approved by CEO.' : 'Material request rejected by CEO.');
      setReviewComments({ ...reviewComments, [reqId]: '' });
      fetchProcurementData();
    } catch (err) {
      alert('Failed to update approval');
    }
  };

  // Secondary: Issue LPO
  const handleIssueLpo = async (e) => {
    e.preventDefault();
    if (!selectedReq || !vendorName) return;
    setSubmittingLpo(true);
    try {
      await axios.post('/api/procurement/lpos', {
        requisition_id: selectedReq.id,
        project_id: selectedReq.project_id,
        vendor_name: vendorName,
        total_amount: selectedReq.estimated_cost || 0
      });
      alert(`Purchase Order (LPO) issued to ${vendorName}`);
      setSelectedReq(null);
      setVendorName('');
      fetchProcurementData();
    } catch (err) {
      alert('Failed to issue LPO');
    } finally {
      setSubmittingLpo(false);
    }
  };

  // Secondary: GRN Delivery
  const handleOpenGrnForm = (lpo) => {
    setSelectedLpo(lpo);
    const preparedItems = (lpo.item_details || []).map(item => ({
      item_desc: item.item_desc,
      ordered_qty: item.qty,
      received_qty: item.qty,
      discrep_notes: ''
    }));
    setGrnItems(preparedItems);
  };

  const handleCreateGrn = async (e) => {
    e.preventDefault();
    if (!selectedLpo) return;
    setSubmittingGrn(true);
    try {
      await axios.post('/api/procurement/grns', {
        lpo_id: selectedLpo.id,
        project_id: selectedLpo.project_id,
        delivery_details: grnItems,
        delivery_note_ref: deliveryNoteRef,
        status: 'fully_received'
      });
      alert('Delivery (GRN) recorded successfully.');
      setSelectedLpo(null);
      setDeliveryNoteRef('');
      fetchProcurementData();
    } catch (err) {
      alert('Failed to record delivery');
    } finally {
      setSubmittingGrn(false);
    }
  };

  const getStatusBadge = (status) => {
    const base = 'text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full border ';
    switch (status) {
      case 'approved':
        return base + 'bg-green-50 text-green-700 border-green-200 dark:bg-green-950/40 dark:text-green-300';
      case 'cto_recommended':
        return base + 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300';
      case 'cto_rejected':
      case 'rejected':
        return base + 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/40 dark:text-red-300';
      case 'pending_approval':
      default:
        return base + 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'approved': return 'Approved by CEO';
      case 'cto_recommended': return 'Recommended by CTO';
      case 'cto_rejected': return 'Rejected by CTO';
      case 'rejected': return 'Rejected by CEO';
      case 'pending_approval':
      default: return 'Pending Review';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20 flex-col items-center">
        <div className="w-10 h-10 border-4 border-brand-navy border-t-brand-gold rounded-full animate-spin"></div>
        <p className="mt-3 text-xs font-bold text-brand-navy/60 dark:text-white/60 uppercase tracking-widest">Loading Requests...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn pb-16">
      {/* Page Header */}
      <div>
        <h2 className="font-outfit font-extrabold text-2xl text-brand-navy dark:text-white uppercase tracking-wider">
          Material Requests & Approvals
        </h2>
        <p className="text-xs text-brand-navy/60 dark:text-white/60 font-semibold mt-1">
          Simple site material request chain: Site Supervisor submits &rarr; CTO recommends &rarr; CEO approves.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-brand-navy/5 dark:border-white/5 gap-2 no-print">
        <button
          onClick={() => setActiveTab('requisitions')}
          className={`px-5 py-2.5 font-extrabold text-xs uppercase tracking-wider border-b-2 transition-all ${
            activeTab === 'requisitions'
              ? 'border-brand-gold text-brand-navy dark:text-white'
              : 'border-transparent text-brand-navy/40 dark:text-white/40 hover:text-brand-navy/60 dark:hover:text-white/60'
          }`}
        >
          Material Requests ({requisitions.length})
        </button>
        <button
          onClick={() => setActiveTab('lpos')}
          className={`px-5 py-2.5 font-extrabold text-xs uppercase tracking-wider border-b-2 transition-all ${
            activeTab === 'lpos'
              ? 'border-brand-gold text-brand-navy dark:text-white'
              : 'border-transparent text-brand-navy/40 dark:text-white/40 hover:text-brand-navy/60 dark:hover:text-white/60'
          }`}
        >
          Purchase Orders ({lpos.length})
        </button>
        <button
          onClick={() => setActiveTab('grns')}
          className={`px-5 py-2.5 font-extrabold text-xs uppercase tracking-wider border-b-2 transition-all ${
            activeTab === 'grns'
              ? 'border-brand-gold text-brand-navy dark:text-white'
              : 'border-transparent text-brand-navy/40 dark:text-white/40 hover:text-brand-navy/60 dark:hover:text-white/60'
          }`}
        >
          Deliveries ({grns.length})
        </button>
      </div>

      {/* Main Material Requests Tab */}
      {activeTab === 'requisitions' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          
          {/* Left: Short Request Form — hidden for CEO (CEO only approves) */}
          {user?.role !== 'ceo' && (
          <div className="lg:col-span-1 bg-white dark:bg-brand-surface border border-brand-navy/5 dark:border-white/10 rounded-[28px] p-6 shadow-sm space-y-4 hover:shadow-md transition-all no-print">
            <div className="flex items-center gap-2 border-b border-brand-navy/5 dark:border-white/10 pb-3">
              <ShoppingBag className="text-brand-gold" size={18} />
              <h3 className="font-outfit font-extrabold text-sm text-brand-navy dark:text-white uppercase tracking-wider">
                New Material Request
              </h3>
            </div>

            <form onSubmit={handleCreateRequisition} className="space-y-3.5 text-xs font-semibold">
              <div className="space-y-1">
                <label className="text-[10px] font-extrabold uppercase tracking-wider text-brand-navy/50 dark:text-white/50 block">Project Site</label>
                <select
                  value={reqProjectId}
                  onChange={(e) => setReqProjectId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-brand-navy/10 dark:border-white/10 bg-white dark:bg-brand-dark text-brand-navy dark:text-white text-xs font-bold"
                  required
                >
                  <option value="" disabled>Select project site...</option>
                  {projects.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-extrabold uppercase tracking-wider text-brand-navy/50 dark:text-white/50 block">Material Description</label>
                <input
                  type="text"
                  placeholder="e.g. Dangote Cement 42.5R"
                  value={reqMaterial}
                  onChange={(e) => setReqMaterial(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-brand-navy/10 dark:border-white/10 bg-white dark:bg-brand-dark text-brand-navy dark:text-white text-xs font-medium"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-[10px] font-extrabold uppercase tracking-wider text-brand-navy/50 dark:text-white/50 block">Quantity</label>
                  <input
                    type="number"
                    placeholder="e.g. 50"
                    value={reqQuantity}
                    onChange={(e) => setReqQuantity(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-brand-navy/10 dark:border-white/10 bg-white dark:bg-brand-dark text-brand-navy dark:text-white text-xs font-medium"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-extrabold uppercase tracking-wider text-brand-navy/50 dark:text-white/50 block">Unit</label>
                  <input
                    type="text"
                    placeholder="e.g. bags, tons, pcs"
                    value={reqUnit}
                    onChange={(e) => setReqUnit(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-brand-navy/10 dark:border-white/10 bg-white dark:bg-brand-dark text-brand-navy dark:text-white text-xs font-medium"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-extrabold uppercase tracking-wider text-brand-navy/50 dark:text-white/50 block">Purpose / Usage</label>
                <textarea
                  rows="2"
                  placeholder="e.g. Foundation slab casting for Sector B"
                  value={reqPurpose}
                  onChange={(e) => setReqPurpose(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-brand-navy/10 dark:border-white/10 bg-white dark:bg-brand-dark text-brand-navy dark:text-white text-xs font-medium resize-none"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={submittingReq}
                className="w-full py-2.5 bg-brand-gold text-brand-dark hover:bg-white font-extrabold text-xs uppercase tracking-wider rounded-xl transition-all shadow-sm cursor-pointer"
              >
                {submittingReq ? 'Submitting...' : 'Submit Material Request'}
              </button>
            </form>
          </div>
          )} {/* end: hidden for CEO */}

          {/* Right: Material Requests List — full width for CEO */}
          <div className={`bg-white dark:bg-brand-surface border border-brand-navy/5 dark:border-white/10 rounded-[28px] p-6 shadow-sm hover:shadow-md transition-all space-y-4 ${user?.role === 'ceo' ? 'lg:col-span-3' : 'lg:col-span-2'}`}>
            <div className="flex justify-between items-center border-b border-brand-navy/5 dark:border-white/10 pb-3">
              <h3 className="font-outfit font-extrabold text-sm text-brand-navy dark:text-white uppercase tracking-wider">
                Submitted Requests & Approvals
              </h3>
              <span className="text-[10px] text-brand-navy/40 dark:text-white/40 font-bold uppercase">
                {requisitions.length} Total
              </span>
            </div>

            {requisitions.length === 0 ? (
              <div className="text-center py-12 text-xs text-brand-navy/40 dark:text-white/40 font-bold uppercase tracking-wider">
                No material requests submitted yet.
              </div>
            ) : (
              <div className="space-y-4">
                {requisitions.map(r => (
                  <div key={r.id} className="p-4 border border-brand-navy/5 dark:border-white/10 rounded-2xl bg-brand-beige/10 dark:bg-brand-dark/40 space-y-3 hover:border-brand-gold/30 transition-all">
                    
                    {/* Top Row: ID, Project, Status Badge */}
                    <div className="flex flex-wrap justify-between items-center gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono font-extrabold text-brand-gold bg-brand-gold/10 px-2 py-0.5 rounded">
                          #REQ-{r.id}
                        </span>
                        <span className="font-bold text-brand-navy dark:text-white text-xs">
                          {r.project_name}
                        </span>
                      </div>
                      <span className={getStatusBadge(r.status)}>
                        {getStatusLabel(r.status)}
                      </span>
                    </div>

                    {/* Material & Details */}
                    <div className="text-xs space-y-1 bg-white dark:bg-brand-surface p-3 rounded-xl border border-brand-navy/5 dark:border-white/5">
                      <div className="flex justify-between items-center">
                        <span className="font-extrabold text-sm text-brand-navy dark:text-white">
                          {r.material || r.item_details?.[0]?.item_desc || 'Construction Material'}
                        </span>
                        <span className="font-bold text-brand-gold text-xs">
                          {r.quantity || r.item_details?.[0]?.qty || 1} {r.unit || r.item_details?.[0]?.unit || 'units'}
                        </span>
                      </div>

                      {r.purpose && (
                        <p className="text-brand-navy/70 dark:text-white/70 text-xs pt-1">
                          <strong className="text-[9px] uppercase tracking-wider text-brand-navy/40 dark:text-white/40 block">Purpose:</strong>
                          {r.purpose}
                        </p>
                      )}

                      <div className="flex flex-wrap gap-x-4 text-[9px] text-brand-navy/40 dark:text-white/40 font-bold uppercase pt-1 border-t border-brand-navy/5 dark:border-white/5 mt-1">
                        <span>Requested By: {r.requested_by_name}</span>
                        <span>Date: {new Date(r.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>

                    {/* Remarks Section */}
                    {(r.cto_comments || r.ceo_comments) && (
                      <div className="p-3 rounded-xl bg-white dark:bg-brand-surface border border-brand-navy/5 dark:border-white/5 text-xs space-y-1.5">
                        {r.cto_comments && (
                          <div className="text-xs">
                            <span className="text-[9px] font-extrabold text-blue-600 dark:text-blue-400 uppercase tracking-wider block">CTO Remarks:</span>
                            <span className="text-brand-navy/80 dark:text-white/80">{r.cto_comments}</span>
                          </div>
                        )}
                        {r.ceo_comments && (
                          <div className="text-xs pt-1 border-t border-brand-navy/5 dark:border-white/5">
                            <span className="text-[9px] font-extrabold text-green-600 dark:text-green-400 uppercase tracking-wider block">CEO Remarks:</span>
                            <span className="text-brand-navy/80 dark:text-white/80">{r.ceo_comments}</span>
                          </div>
                        )}
                      </div>
                    )}

                    {/* CTO Review Action Box */}
                    {user.role === 'cto' && r.status === 'pending_approval' && (
                      <div className="p-3 rounded-xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200/60 dark:border-blue-800/40 space-y-2">
                        <span className="text-[9px] font-extrabold uppercase tracking-wider text-blue-700 dark:text-blue-300 block">
                          CTO Review & Recommendation
                        </span>
                        <input
                          type="text"
                          placeholder="CTO remarks (e.g. Checked against structural specifications)..."
                          value={reviewComments[r.id] || ''}
                          onChange={(e) => setReviewComments({ ...reviewComments, [r.id]: e.target.value })}
                          className="w-full px-3 py-1.5 rounded-lg border border-blue-200 dark:border-blue-900 bg-white dark:bg-brand-dark text-xs text-brand-navy dark:text-white"
                        />
                        <div className="flex gap-2 justify-end">
                          <button
                            onClick={() => handleCtoRecommend(r.id, false)}
                            className="px-3.5 py-1.5 border border-red-200 text-red-600 hover:bg-red-50 text-[10px] font-extrabold uppercase rounded-lg cursor-pointer"
                          >
                            Reject
                          </button>
                          <button
                            onClick={() => handleCtoRecommend(r.id, true)}
                            className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-extrabold uppercase rounded-lg shadow-sm cursor-pointer"
                          >
                            Recommend to CEO
                          </button>
                        </div>
                      </div>
                    )}

                    {/* CEO Approval Action Box */}
                    {user.role === 'ceo' && (r.status === 'cto_recommended' || r.status === 'pending_approval') && (
                      <div className="p-3 rounded-xl bg-green-50/50 dark:bg-green-950/20 border border-green-200/60 dark:border-green-800/40 space-y-2">
                        <span className="text-[9px] font-extrabold uppercase tracking-wider text-green-700 dark:text-green-300 block">
                          CEO Final Authorization
                        </span>
                        <input
                          type="text"
                          placeholder="CEO approval remarks (e.g. Approved within site budget)..."
                          value={reviewComments[r.id] || ''}
                          onChange={(e) => setReviewComments({ ...reviewComments, [r.id]: e.target.value })}
                          className="w-full px-3 py-1.5 rounded-lg border border-green-200 dark:border-green-900 bg-white dark:bg-brand-dark text-xs text-brand-navy dark:text-white"
                        />
                        <div className="flex gap-2 justify-end">
                          <button
                            onClick={() => handleCeoApprove(r.id, false)}
                            className="px-3.5 py-1.5 border border-red-200 text-red-600 hover:bg-red-50 text-[10px] font-extrabold uppercase rounded-lg cursor-pointer"
                          >
                            Reject
                          </button>
                          <button
                            onClick={() => handleCeoApprove(r.id, true)}
                            className="px-3.5 py-1.5 bg-green-600 hover:bg-green-700 text-white text-[10px] font-extrabold uppercase rounded-lg shadow-sm cursor-pointer"
                          >
                            Approve Request
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Approved Actions (Export PDF) */}
                    {r.status === 'approved' && (
                      <div className="flex justify-end pt-1">
                        <button
                          onClick={() => { setSelectedDetailObject(r); setDetailType('requisition'); }}
                          className="inline-flex items-center gap-1.5 px-3 py-1 text-[10px] font-extrabold uppercase rounded-lg bg-brand-gold/15 text-brand-navy dark:text-white hover:bg-brand-gold/25 cursor-pointer"
                        >
                          <Printer size={12} /> Print Approved Form
                        </button>
                      </div>
                    )}

                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      )}

      {/* Secondary: Purchase Orders (LPO) Tab */}
      {activeTab === 'lpos' && (
        <div className="bg-white dark:bg-brand-surface border border-brand-navy/5 dark:border-white/10 rounded-[28px] p-6 shadow-sm space-y-4">
          <div className="flex justify-between items-center border-b border-brand-navy/5 dark:border-white/10 pb-3">
            <div>
              <h3 className="font-outfit font-extrabold text-sm text-brand-navy dark:text-white uppercase tracking-wider">
                Local Purchase Orders (LPO)
              </h3>
              <p className="text-[10px] text-brand-navy/50 dark:text-white/50 font-medium">
                Official procurement orders issued to external construction vendors.
              </p>
            </div>
            <span className="text-[10px] text-brand-navy/40 dark:text-white/40 font-bold uppercase">{lpos.length} Orders</span>
          </div>

          {lpos.length === 0 ? (
            <p className="text-center py-12 text-xs text-brand-navy/40 dark:text-white/40 font-bold uppercase tracking-wider">No purchase orders issued yet.</p>
          ) : (
            <div className="space-y-3">
              {lpos.map(l => (
                <div key={l.id} className="p-4 border border-brand-navy/5 dark:border-white/10 rounded-2xl bg-brand-beige/10 dark:bg-brand-dark/40 flex flex-col sm:flex-row justify-between sm:items-center gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono font-bold text-brand-gold">{l.lpo_number}</span>
                      <span className="text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">{l.status}</span>
                    </div>
                    <span className="font-bold text-brand-navy dark:text-white text-xs block mt-1">Vendor: {l.vendor_name}</span>
                    <span className="text-[9px] text-brand-navy/40 dark:text-white/40">Issued: {new Date(l.created_at).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-black text-brand-navy dark:text-white">₦{Number(l.total_amount || 0).toLocaleString()}</span>
                    <button
                      onClick={() => { setSelectedDetailObject(l); setDetailType('lpo'); }}
                      className="px-3 py-1.5 bg-brand-navy dark:bg-white/10 text-white rounded-lg text-[10px] font-bold uppercase hover:bg-brand-gold hover:text-brand-dark cursor-pointer"
                    >
                      View Order
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Secondary: Deliveries (GRN) Tab */}
      {activeTab === 'grns' && (
        <div className="bg-white dark:bg-brand-surface border border-brand-navy/5 dark:border-white/10 rounded-[28px] p-6 shadow-sm space-y-4">
          <div className="flex justify-between items-center border-b border-brand-navy/5 dark:border-white/10 pb-3">
            <div>
              <h3 className="font-outfit font-extrabold text-sm text-brand-navy dark:text-white uppercase tracking-wider">
                Goods Received Notes (GRN)
              </h3>
              <p className="text-[10px] text-brand-navy/50 dark:text-white/50 font-medium">
                Audited deliveries verified at the site entrance gate.
              </p>
            </div>
            <span className="text-[10px] text-brand-navy/40 dark:text-white/40 font-bold uppercase">{grns.length} Deliveries</span>
          </div>

          {grns.length === 0 ? (
            <p className="text-center py-12 text-xs text-brand-navy/40 dark:text-white/40 font-bold uppercase tracking-wider">No site deliveries logged yet.</p>
          ) : (
            <div className="space-y-3">
              {grns.map(g => (
                <div key={g.id} className="p-4 border border-brand-navy/5 dark:border-white/10 rounded-2xl bg-brand-beige/10 dark:bg-brand-dark/40 flex flex-col sm:flex-row justify-between sm:items-center gap-3">
                  <div>
                    <span className="text-[10px] font-mono font-bold text-brand-gold">Delivery Ref: {g.delivery_note_ref}</span>
                    <span className="font-bold text-brand-navy dark:text-white text-xs block mt-1">Received by: {g.received_by_name}</span>
                    <span className="text-[9px] text-brand-navy/40 dark:text-white/40">Logged: {new Date(g.created_at).toLocaleDateString()}</span>
                  </div>
                  <button
                    onClick={() => { setSelectedDetailObject(g); setDetailType('grn'); }}
                    className="px-3 py-1.5 bg-brand-navy dark:bg-white/10 text-white rounded-lg text-[10px] font-bold uppercase hover:bg-brand-gold hover:text-brand-dark cursor-pointer self-start sm:self-auto"
                  >
                    Audit Details
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Details Viewer & Print Modal */}
      {selectedDetailObject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-brand-dark/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-brand-surface border border-brand-navy/10 dark:border-white/10 w-full max-w-lg rounded-[28px] p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-brand-navy/5 dark:border-white/10 pb-3">
              <h3 className="font-outfit font-extrabold text-sm text-brand-navy dark:text-white uppercase tracking-wider">
                {detailType.toUpperCase()} Record
              </h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-brand-gold text-brand-dark rounded-xl font-extrabold text-[10px] uppercase tracking-wider hover:bg-white transition-all shadow-sm cursor-pointer"
                >
                  <Printer size={13} /> Export PDF
                </button>
                <button 
                  onClick={() => setSelectedDetailObject(null)} 
                  className="text-xs font-bold text-brand-navy/50 dark:text-white/50 hover:text-brand-navy dark:hover:text-white uppercase tracking-wider cursor-pointer ml-2"
                >
                  Close
                </button>
              </div>
            </div>

            <div className="space-y-3 max-h-[300px] overflow-y-auto text-xs pr-1">
              <div className="p-3 bg-brand-beige/20 dark:bg-brand-dark rounded-xl space-y-1">
                <span className="font-bold text-brand-navy dark:text-white block">Project: {selectedDetailObject.project_name || 'Site Project'}</span>
                <span className="text-[10px] text-brand-navy/50 dark:text-white/50 block">Status: {getStatusLabel(selectedDetailObject.status)}</span>
                {selectedDetailObject.purpose && (
                  <span className="text-[10px] text-brand-navy/70 dark:text-white/70 block">Purpose: {selectedDetailObject.purpose}</span>
                )}
              </div>

              {/* Items */}
              {(selectedDetailObject.item_details || []).map((item, idx) => (
                <div key={idx} className="p-3 border border-brand-navy/5 dark:border-white/10 bg-brand-beige/10 dark:bg-brand-dark rounded-xl flex justify-between items-center">
                  <div>
                    <span className="font-bold text-brand-navy dark:text-white block">{item.item_desc}</span>
                    <span className="text-[10px] text-brand-navy/50 dark:text-white/50 font-bold">{item.qty} {item.unit}</span>
                  </div>
                  {item.est_rate > 0 && (
                    <span className="font-bold text-brand-navy dark:text-white">₦{item.est_rate}/ea</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
