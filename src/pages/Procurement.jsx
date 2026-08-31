import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ShoppingBag, FileText, CheckCircle, PlusCircle, Trash, List, Eye, AlertTriangle, Printer } from 'lucide-react';
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

  // 1. Material Requisition Form states
  const [reqProjectId, setReqProjectId] = useState('');
  const [itemsList, setItemsList] = useState([]);
  const [itemDesc, setItemDesc] = useState('');
  const [itemQty, setItemQty] = useState('');
  const [itemUnit, setItemUnit] = useState('');
  const [itemRate, setItemRate] = useState('');
  const [submittingReq, setSubmittingReq] = useState(false);

  // 2. Issue LPO states
  const [selectedReq, setSelectedReq] = useState(null);
  const [vendorName, setVendorName] = useState('');
  const [submittingLpo, setSubmittingLpo] = useState(false);

  // 3. Log GRN states
  const [selectedLpo, setSelectedLpo] = useState(null);
  const [deliveryNoteRef, setDeliveryNoteRef] = useState('');
  const [grnItems, setGrnItems] = useState([]); // Array mirroring LPO items with received quantities
  const [submittingGrn, setSubmittingGrn] = useState(false);

  // View details modal
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
      setError('Failed to fetch procurement registers.');
    } finally {
      setLoading(false);
    }
  };

  // Requisition Form Items List helpers
  const handleAddItemToReq = () => {
    if (!itemDesc || !itemQty || !itemRate) return;
    const newItem = {
      item_desc: itemDesc,
      qty: parseFloat(itemQty),
      unit: itemUnit || 'pcs',
      est_rate: parseFloat(itemRate)
    };
    setItemsList([...itemsList, newItem]);
    setItemDesc('');
    setItemQty('');
    setItemUnit('');
    setItemRate('');
  };

  const handleRemoveItemFromReq = (idx) => {
    setItemsList(itemsList.filter((_, i) => i !== idx));
  };

  const handleCreateRequisition = async (e) => {
    e.preventDefault();
    if (!reqProjectId || itemsList.length === 0) {
      alert('Please select a project site and add at least one material item.');
      return;
    }
    setSubmittingReq(true);
    try {
      const estimatedCost = itemsList.reduce((acc, curr) => acc + (curr.qty * curr.est_rate), 0);
      await axios.post('/api/procurement/requisitions', {
        project_id: reqProjectId,
        item_details: itemsList,
        estimated_cost: estimatedCost
      });
      alert('Material Requisition submitted to matrix!');
      setReqProjectId('');
      setItemsList([]);
      fetchProcurementData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to submit requisition');
    } finally {
      setSubmittingReq(false);
    }
  };

  // Approval Matrix handles
  const handleApproveRequisition = async (reqId, approve) => {
    try {
      await axios.patch(`/api/procurement/requisitions/${reqId}/approve`, { approve });
      alert(`Requisition ${approve ? 'approved' : 'rejected'} successfully.`);
      fetchProcurementData();
    } catch (err) {
      alert(err.response?.data?.message || 'Action failed');
    }
  };

  // Issue LPO handles
  const handleIssueLpo = async (e) => {
    e.preventDefault();
    if (!selectedReq || !vendorName) return;
    setSubmittingLpo(true);
    try {
      await axios.post('/api/procurement/lpos', {
        requisition_id: selectedReq.id,
        project_id: selectedReq.project_id,
        vendor_name: vendorName,
        total_amount: selectedReq.estimated_cost
      });
      alert(`LPO successfully issued to ${vendorName}`);
      setSelectedReq(null);
      setVendorName('');
      fetchProcurementData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to issue LPO');
    } finally {
      setSubmittingLpo(false);
    }
  };

  // Log GRN handles
  const handleOpenGrnForm = (lpo) => {
    setSelectedLpo(lpo);
    // Prepare GRN items with matching ordered quantities
    const preparedItems = lpo.item_details.map(item => ({
      item_desc: item.item_desc,
      ordered_qty: item.qty,
      received_qty: item.qty, // default received matches ordered
      discrep_notes: ''
    }));
    setGrnItems(preparedItems);
  };

  const handleUpdateGrnItemQty = (idx, val) => {
    const updated = [...grnItems];
    updated[idx].received_qty = parseFloat(val) || 0;
    setGrnItems(updated);
  };

  const handleUpdateGrnItemNotes = (idx, val) => {
    const updated = [...grnItems];
    updated[idx].discrep_notes = val;
    setGrnItems(updated);
  };

  const handleCreateGrn = async (e) => {
    e.preventDefault();
    if (!selectedLpo) return;
    setSubmittingGrn(true);
    try {
      // Determine delivery status
      let hasDiscrepancy = false;
      let hasReceivedSome = false;
      grnItems.forEach(item => {
        if (item.received_qty !== item.ordered_qty) hasDiscrepancy = true;
        if (item.received_qty > 0) hasReceivedSome = true;
      });

      let grnStatus = 'fully_received';
      if (hasDiscrepancy) {
        grnStatus = hasReceivedSome ? 'partially_received' : 'discrepancy';
      }

      await axios.post('/api/procurement/grns', {
        lpo_id: selectedLpo.id,
        project_id: selectedLpo.project_id,
        delivery_details: grnItems,
        delivery_note_ref: deliveryNoteRef,
        status: grnStatus
      });

      alert(`GRN logged successfully. Status: ${grnStatus.replace('_', ' ')}`);
      setSelectedLpo(null);
      setDeliveryNoteRef('');
      setGrnItems([]);
      fetchProcurementData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to submit GRN note');
    } finally {
      setSubmittingGrn(false);
    }
  };

  const getStatusBadge = (status) => {
    const base = 'text-[9px] font-extrabold uppercase px-2 py-0.5 rounded border ';
    switch (status) {
      // Requisition statuses
      case 'pending_approval': return base + 'bg-amber-50 text-amber-700 border-amber-200';
      case 'approved': return base + 'bg-green-50 text-green-700 border-green-200';
      case 'rejected': return base + 'bg-red-50 text-red-700 border-red-200';
      case 'lpo_generated': return base + 'bg-blue-50 text-blue-700 border-blue-200';
      // LPO statuses
      case 'issued': return base + 'bg-blue-50 text-blue-700 border-blue-200';
      case 'delivered': return base + 'bg-green-50 text-green-700 border-green-200';
      // GRN statuses
      case 'fully_received': return base + 'bg-green-50 text-green-700 border-green-200';
      case 'partially_received': return base + 'bg-amber-50 text-amber-700 border-amber-200';
      case 'discrepancy': return base + 'bg-red-50 text-red-700 border-red-200';
      default: return base + 'bg-gray-50 text-gray-700 border-gray-200';
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
      
      {/* Header */}
      <div>
        <h2 className="font-outfit font-extrabold text-2xl text-brand-navy dark:text-white uppercase tracking-wider">Procurement & Site Requisitions</h2>
        <p className="text-xs text-brand-navy/60 dark:text-white/60 font-semibold mt-1">Authorized workflows governing site procurement matrices, from initial material logs to delivery check-offs.</p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-brand-navy/5 dark:border-white/5 gap-2 no-print">
        {['requisitions', 'lpos', 'grns'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-6 py-3 font-extrabold text-xs uppercase tracking-wider border-b-2 transition-all ${
              activeTab === tab 
                ? 'border-brand-gold text-brand-navy dark:text-white' 
                : 'border-transparent text-brand-navy/40 dark:text-white/40 hover:text-brand-navy/60 dark:hover:text-white/60'
            }`}
          >
            {tab.replace('_', ' ')}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Form & Actions Desk (col-span-1) */}
        <div className="lg:col-span-1 space-y-8 no-print">
          
          {/* Requisition Submission Form (Only visible to site supervisors, engineers, and field workers) */}
          {activeTab === 'requisitions' && !selectedReq && ['supervisor', 'engineer', 'worker'].includes(user.role) && (
            <div className="bg-white dark:bg-brand-surface border border-brand-navy/5 dark:border-white/10 rounded-[28px] p-6 shadow-sm space-y-4 hover:shadow-md transition-all">
              <div className="flex items-center gap-2 border-b border-brand-navy/5 dark:border-white/10 pb-3">
                <ShoppingBag className="text-brand-gold" size={18} />
                <h3 className="font-outfit font-extrabold text-sm text-brand-navy dark:text-white uppercase tracking-wider">Submit Requisition</h3>
              </div>

              <form onSubmit={handleCreateRequisition} className="space-y-4 text-xs font-semibold">
                <div className="space-y-1">
                  <label className="text-[9px] font-extrabold uppercase tracking-widest text-brand-navy/50 dark:text-white/50 block ml-1">Select Project</label>
                  <select
                    value={reqProjectId}
                    onChange={(e) => setReqProjectId(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-brand-navy/10 dark:border-white/10 bg-white dark:bg-brand-dark focus:outline-none focus:border-brand-gold font-bold text-brand-navy dark:text-white uppercase tracking-wider"
                    required
                  >
                    <option value="" disabled className="dark:text-white">Select project site...</option>
                    {projects.map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>

                {/* Add Item fields */}
                <div className="p-4 border border-brand-navy/5 dark:border-white/10 bg-brand-beige/10 dark:bg-brand-dark rounded-2xl space-y-3.5">
                  <h4 className="text-[9px] font-extrabold text-brand-navy/40 dark:text-white/40 uppercase tracking-widest">Append Item details</h4>
                  <input
                    type="text"
                    placeholder="Item description (e.g. Dangote Cement 42.5R)"
                    value={itemDesc}
                    onChange={(e) => setItemDesc(e.target.value)}
                    className="w-full px-4 py-2 rounded-xl border border-brand-navy/10 dark:border-white/10 bg-white dark:bg-brand-dark focus:outline-none focus:border-brand-gold font-medium text-brand-navy dark:text-white"
                  />
                  <div className="grid grid-cols-3 gap-2">
                    <input
                      type="number"
                      placeholder="Qty"
                      value={itemQty}
                      onChange={(e) => setItemQty(e.target.value)}
                      className="px-4 py-2 rounded-xl border border-brand-navy/10 dark:border-white/10 bg-white dark:bg-brand-dark text-brand-navy dark:text-white focus:outline-none focus:border-brand-gold font-medium"
                    />
                    <input
                      type="text"
                      placeholder="Unit"
                      value={itemUnit}
                      onChange={(e) => setItemUnit(e.target.value)}
                      className="px-4 py-2 rounded-xl border border-brand-navy/10 dark:border-white/10 bg-white dark:bg-brand-dark text-brand-navy dark:text-white focus:outline-none focus:border-brand-gold font-medium"
                    />
                    <input
                      type="number"
                      placeholder="Rate (₦)"
                      value={itemRate}
                      onChange={(e) => setItemRate(e.target.value)}
                      className="px-4 py-2 rounded-xl border border-brand-navy/10 dark:border-white/10 bg-white dark:bg-brand-dark text-brand-navy dark:text-white focus:outline-none focus:border-brand-gold font-medium"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleAddItemToReq}
                    className="px-4 py-1.5 bg-brand-gold/15 hover:bg-brand-gold/25 text-brand-navy dark:text-white font-bold rounded-xl transition-all w-full uppercase tracking-wider text-[9px]"
                  >
                    Append to Request List
                  </button>
                </div>

                {/* Items Queue list */}
                {itemsList.length > 0 && (
                  <div className="space-y-2 border-t border-brand-navy/5 dark:border-white/10 pt-3">
                    <h4 className="text-[9px] font-extrabold text-brand-navy/40 dark:text-white/40 uppercase tracking-widest">Requisition List</h4>
                    <div className="space-y-1.5 max-h-[150px] overflow-y-auto pr-1">
                      {itemsList.map((item, idx) => (
                        <div key={idx} className="flex justify-between items-center bg-brand-beige/20 dark:bg-brand-dark p-2.5 rounded-xl border border-brand-navy/5 dark:border-white/10">
                          <div>
                            <span className="font-bold text-brand-navy dark:text-white block">{item.item_desc}</span>
                            <span className="text-[9px] text-brand-navy/55 dark:text-white/50">{item.qty} {item.unit} @ ₦{item.est_rate}/ea</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemoveItemFromReq(idx)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <Trash size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={submittingReq || itemsList.length === 0}
                  className="w-full py-2.5 bg-brand-navy hover:bg-brand-navy-light text-white font-extrabold text-xs uppercase tracking-widest rounded-xl transition-all shadow-md"
                >
                  {submittingReq ? 'Submitting...' : 'Submit Requisition'}
                </button>
              </form>
            </div>
          )}

          {/* Issue LPO panel (Appears when a requisition is selected) */}
          {activeTab === 'requisitions' && selectedReq && (
            <div className="bg-[#001026] text-white border border-white/5 rounded-[28px] p-6 shadow-sm space-y-4 hover:shadow-md transition-all relative overflow-hidden animate-fadeIn">
              <div className="absolute inset-0 grid-bg opacity-10 pointer-events-none" />
              <div className="flex items-center justify-between border-b border-white/10 pb-3 relative z-10">
                <h3 className="font-outfit font-extrabold text-sm text-brand-gold uppercase tracking-wider">Issue LPO Matrix</h3>
                <button onClick={() => setSelectedReq(null)} className="text-[9px] font-bold text-white/50 hover:text-white uppercase tracking-widest">Cancel</button>
              </div>

              <div className="space-y-4 text-xs font-semibold relative z-10">
                <div className="p-3 bg-white/5 border border-white/10 rounded-xl">
                  <span className="text-[8px] text-brand-gold font-extrabold uppercase block tracking-wider">REQUISITION ID: #{selectedReq.id}</span>
                  <span className="font-bold text-white block mt-1">{selectedReq.project_name}</span>
                  <span className="text-[10px] text-white/60 font-medium block">Valuation: ₦{selectedReq.estimated_cost.toLocaleString()}</span>
                </div>

                <form onSubmit={handleIssueLpo} className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-[9px] font-extrabold uppercase tracking-widest text-white/50 block ml-1">Supplier Vendor Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Dangote Industries Ltd"
                      value={vendorName}
                      onChange={(e) => setVendorName(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-white/10 bg-white/5 text-white focus:outline-none focus:border-brand-gold font-medium"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={submittingLpo}
                    className="w-full py-2.5 bg-brand-gold text-brand-dark hover:bg-white font-extrabold text-xs uppercase tracking-widest rounded-xl transition-all shadow-md"
                  >
                    {submittingLpo ? 'Generating...' : 'Release LPO'}
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* Log Goods Received Note (GRN) Form */}
          {activeTab === 'lpos' && selectedLpo && (
            <div className="bg-white dark:bg-brand-surface border border-brand-navy/5 dark:border-white/10 rounded-[28px] p-6 shadow-sm space-y-4 hover:shadow-md transition-all animate-fadeIn">
              <div className="flex items-center justify-between border-b border-brand-navy/5 dark:border-white/10 pb-3">
                <h3 className="font-outfit font-extrabold text-sm text-brand-navy dark:text-white uppercase tracking-wider">Log Goods Received Note</h3>
                <button onClick={() => setSelectedLpo(null)} className="text-[9px] font-bold text-brand-navy/50 dark:text-white/50 hover:text-brand-navy dark:hover:text-white uppercase tracking-widest">Cancel</button>
              </div>

              <form onSubmit={handleCreateGrn} className="space-y-4 text-xs font-semibold">
                <div className="space-y-1">
                  <label className="text-[9px] font-extrabold uppercase tracking-widest text-brand-navy/50 dark:text-white/50 block ml-1">LPO Number Reference</label>
                  <input
                    type="text"
                    value={selectedLpo.lpo_number}
                    className="w-full px-4 py-2.5 rounded-xl border border-brand-navy/5 dark:border-white/10 bg-brand-beige/20 dark:bg-brand-dark text-brand-navy dark:text-white font-bold block"
                    disabled
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-extrabold uppercase tracking-widest text-brand-navy/50 dark:text-white/50 block ml-1">Delivery note / Waybill ref</label>
                  <input
                    type="text"
                    placeholder="e.g. DN-2026-DAN"
                    value={deliveryNoteRef}
                    onChange={(e) => setDeliveryNoteRef(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-brand-navy/10 dark:border-white/10 bg-white dark:bg-brand-dark text-brand-navy dark:text-white focus:outline-none focus:border-brand-gold font-medium"
                    required
                  />
                </div>

                {/* Audit delivered vs ordered quantity inputs */}
                <div className="space-y-3.5 border-t border-brand-navy/5 dark:border-white/10 pt-3">
                  <h4 className="text-[9px] font-extrabold text-brand-navy/40 dark:text-white/40 uppercase tracking-widest mb-1.5">Delivered Qty Check-off</h4>
                  <div className="space-y-2.5 max-h-[220px] overflow-y-auto pr-1">
                    {grnItems.map((item, idx) => (
                      <div key={idx} className="p-3 border border-brand-navy/5 dark:border-white/10 bg-brand-beige/10 dark:bg-brand-dark rounded-2xl space-y-2">
                        <span className="font-bold text-brand-navy dark:text-white block">{item.item_desc}</span>
                        <div className="flex justify-between items-center text-[10px] text-brand-navy/50 dark:text-white/50 border-b border-brand-navy/5 dark:border-white/10 pb-1">
                          <span>Ordered Qty:</span>
                          <span className="font-bold">{item.ordered_qty}</span>
                        </div>
                        <div className="grid grid-cols-2 gap-2 pt-1 items-center">
                          <div className="space-y-1">
                            <label className="text-[8px] font-extrabold text-brand-navy/40 dark:text-white/40 uppercase">Received Qty</label>
                            <input
                              type="number"
                              value={item.received_qty}
                              onChange={(e) => handleUpdateGrnItemQty(idx, e.target.value)}
                              className="w-full px-2.5 py-1.5 rounded border border-brand-navy/10 dark:border-white/10 bg-white dark:bg-brand-dark text-brand-navy dark:text-white text-xs font-bold"
                              required
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[8px] font-extrabold text-brand-navy/40 dark:text-white/40 uppercase">Leakage notes</label>
                            <input
                              type="text"
                              placeholder="e.g. Missing 5 items"
                              value={item.discrep_notes}
                              onChange={(e) => handleUpdateGrnItemNotes(idx, e.target.value)}
                              className="w-full px-2.5 py-1.5 rounded border border-brand-navy/10 dark:border-white/10 bg-white dark:bg-brand-dark text-brand-navy dark:text-white text-xs font-medium"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={submittingGrn}
                  className="w-full py-2.5 bg-brand-navy hover:bg-brand-navy-light text-white font-extrabold text-xs uppercase tracking-widest rounded-xl transition-all shadow-md"
                >
                  {submittingGrn ? 'Logging Delivery...' : 'Log Delivery (GRN)'}
                </button>
              </form>
            </div>
          )}

        </div>

        {/* Right Column: Registers Ledger Lists */}
        <div className={`space-y-4 ${['supervisor', 'engineer', 'worker'].includes(user.role) ? 'lg:col-span-2' : 'lg:col-span-3'}`}>
          
          {/* Requisitions tab listing */}
          {activeTab === 'requisitions' && (
            <div className="bg-white dark:bg-brand-surface border border-brand-navy/5 dark:border-white/10 rounded-[28px] p-6 shadow-sm hover:shadow-md transition-all space-y-4">
              <h3 className="font-outfit font-extrabold text-sm text-brand-navy dark:text-white uppercase tracking-wider border-b border-brand-navy/5 dark:border-white/10 pb-3">Material Requisitions Matrix</h3>
              
              {requisitions.length === 0 ? (
                <p className="text-center py-16 text-xs text-brand-navy/40 dark:text-white/40 font-bold uppercase tracking-wider">No requisitions registered.</p>
              ) : (
                <div className="space-y-3.5">
                  {requisitions.map(r => (
                    <div key={r.id} className="p-4 border border-brand-navy/5 dark:border-white/10 rounded-2xl bg-white dark:bg-brand-surface space-y-3 hover:border-brand-gold transition-colors">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-extrabold text-brand-gold uppercase">#MR-00{r.id}</span>
                          <span className={getStatusBadge(r.status)}>{r.status.replace('_', ' ')}</span>
                        </div>
                        <span className="text-[10px] font-extrabold text-brand-navy/60 dark:text-white/60">₦{r.estimated_cost.toLocaleString()}</span>
                      </div>

                      <div className="text-xs">
                        <span className="font-bold text-brand-navy dark:text-white block uppercase">{r.project_name}</span>
                        <div className="flex flex-wrap items-center gap-x-4 text-[9px] text-brand-navy/40 dark:text-white/40 font-extrabold uppercase pt-0.5">
                          <span>Requested: {r.requested_by_name}</span>
                          <span>Approved: {r.approved_by_name}</span>
                          <span>Date: {new Date(r.created_at).toLocaleDateString()}</span>
                        </div>
                      </div>

                      {/* Items details toggle details */}
                      <div className="border-t border-brand-navy/5 dark:border-white/10 pt-2 flex justify-between items-center text-[10px] text-brand-navy/50 dark:text-white/50 font-bold">
                        <span>{r.item_details.length} material items logged</span>
                        <button
                          onClick={() => { setSelectedDetailObject(r); setDetailType('requisition'); }}
                          className="flex items-center gap-1 text-brand-gold hover:text-brand-navy dark:hover:text-white"
                        >
                          <Eye size={12} /> View Items Details
                        </button>
                      </div>

                      {/* Supervisor Actions */}
                      {user.role !== 'worker' && r.status === 'pending_approval' && (
                        <div className="flex gap-2 pt-2 border-t border-brand-navy/5 dark:border-white/10 justify-end">
                          <button
                            onClick={() => handleApproveRequisition(r.id, false)}
                            className="px-3.5 py-1.5 border border-red-200 text-red-600 hover:bg-red-50 text-[9px] font-extrabold uppercase rounded-lg transition-all"
                          >
                            Reject
                          </button>
                          <button
                            onClick={() => handleApproveRequisition(r.id, true)}
                            className="px-3.5 py-1.5 bg-green-600 hover:bg-green-700 text-white text-[9px] font-extrabold uppercase rounded-lg transition-all shadow-sm"
                          >
                            Approve Requisition
                          </button>
                        </div>
                      )}

                      {/* CFO/Admin Actions - Generate LPO */}
                      {user.role === 'admin' && r.status === 'approved' && (
                        <div className="flex pt-2 border-t border-brand-navy/5 dark:border-white/10 justify-end">
                          <button
                            onClick={() => setSelectedReq(r)}
                            className="px-4 py-1.5 bg-brand-navy hover:bg-brand-navy-light text-white text-[9px] font-extrabold uppercase rounded-lg transition-all shadow-sm flex items-center gap-1"
                          >
                            <PlusCircle size={12} /> Generate LPO
                          </button>
                        </div>
                      )}

                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* LPO Tab Listing */}
          {activeTab === 'lpos' && (
            <div className="bg-white dark:bg-brand-surface border border-brand-navy/5 dark:border-white/10 rounded-[28px] p-6 shadow-sm hover:shadow-md transition-all space-y-4">
              <h3 className="font-outfit font-extrabold text-sm text-brand-navy dark:text-white uppercase tracking-wider border-b border-brand-navy/5 dark:border-white/10 pb-3">Local Purchase Orders Ledger</h3>
              
              {lpos.length === 0 ? (
                <p className="text-center py-16 text-xs text-brand-navy/40 dark:text-white/40 font-bold uppercase tracking-wider">No LPOs generated.</p>
              ) : (
                <div className="space-y-3.5">
                  {lpos.map(l => (
                    <div key={l.id} className="p-4 border border-brand-navy/5 dark:border-white/10 rounded-2xl bg-white dark:bg-brand-surface space-y-3 hover:border-brand-gold transition-colors">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-extrabold text-brand-gold uppercase">{l.lpo_number}</span>
                          <span className={getStatusBadge(l.status)}>{l.status}</span>
                        </div>
                        <span className="text-xs font-bold text-brand-navy dark:text-white">₦{l.total_amount.toLocaleString()}</span>
                      </div>

                      <div className="text-xs">
                        <span className="font-bold text-brand-navy dark:text-white block uppercase">{l.project_name}</span>
                        <div className="flex flex-wrap items-center gap-x-4 text-[9px] text-brand-navy/40 dark:text-white/40 font-extrabold uppercase pt-0.5">
                          <span>Vendor: {l.vendor_name}</span>
                          <span>Issued by: {l.created_by_name}</span>
                          <span>Date: {new Date(l.created_at).toLocaleDateString()}</span>
                        </div>
                      </div>

                      <div className="border-t border-brand-navy/5 dark:border-white/10 pt-2 flex justify-between items-center text-[10px] text-brand-navy/50 dark:text-white/50 font-bold">
                        <span>Items linked from Requisition #{l.requisition_id}</span>
                        <button
                          onClick={() => { setSelectedDetailObject(l); setDetailType('lpo'); }}
                          className="flex items-center gap-1 text-brand-gold hover:text-brand-navy dark:hover:text-white"
                        >
                          <Eye size={12} /> View LPO Items
                        </button>
                      </div>

                      {/* Log Goods received note */}
                      {l.status === 'issued' && (
                        <div className="flex pt-2 border-t border-brand-navy/5 dark:border-white/10 justify-end">
                          <button
                            onClick={() => handleOpenGrnForm(l)}
                            className="px-4 py-1.5 bg-green-600 hover:bg-green-700 text-white text-[9px] font-extrabold uppercase rounded-lg transition-all shadow-sm"
                          >
                            Log Goods Received (GRN)
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* GRN Tab Listing */}
          {activeTab === 'grns' && (
            <div className="bg-white dark:bg-brand-surface border border-brand-navy/5 dark:border-white/10 rounded-[28px] p-6 shadow-sm hover:shadow-md transition-all space-y-4">
              <h3 className="font-outfit font-extrabold text-sm text-brand-navy dark:text-white uppercase tracking-wider border-b border-brand-navy/5 dark:border-white/10 pb-3">Goods Received Notes (GRN) Registry</h3>
              
              {grns.length === 0 ? (
                <p className="text-center py-16 text-xs text-brand-navy/40 dark:text-white/40 font-bold uppercase tracking-wider">No GRN logs logged.</p>
              ) : (
                <div className="space-y-3.5">
                  {grns.map(g => (
                    <div key={g.id} className="p-4 border border-brand-navy/5 dark:border-white/10 rounded-2xl bg-white dark:bg-brand-surface space-y-3 hover:border-brand-gold transition-colors">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-extrabold text-brand-gold uppercase">GRN-00{g.id}</span>
                          <span className={getStatusBadge(g.status)}>{g.status.replace('_', ' ')}</span>
                        </div>
                        <span className="text-[9px] text-brand-navy/50 dark:text-white/50 font-extrabold uppercase">LPO REF: {g.lpo_number}</span>
                      </div>

                      <div className="text-xs">
                        <span className="font-bold text-brand-navy dark:text-white block uppercase">{g.project_name}</span>
                        <div className="flex flex-wrap items-center gap-x-4 text-[9px] text-brand-navy/40 dark:text-white/40 font-extrabold uppercase pt-0.5">
                          <span>Vendor: {g.vendor_name}</span>
                          <span>Received by: {g.received_by_name}</span>
                          <span>Waybill Ref: {g.delivery_note_ref}</span>
                          <span>Date: {new Date(g.created_at).toLocaleDateString()}</span>
                        </div>
                      </div>

                      <div className="border-t border-brand-navy/5 dark:border-white/10 pt-2 flex justify-between items-center text-[10px] text-brand-navy/50 dark:text-white/50 font-bold">
                        <span>Delivered item discrepancies audited</span>
                        <button
                          onClick={() => { setSelectedDetailObject(g); setDetailType('grn'); }}
                          className="flex items-center gap-1 text-brand-gold hover:text-brand-navy dark:hover:text-white"
                        >
                          <Eye size={12} /> Audit Quantities
                        </button>
                      </div>

                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

        </div>

      </div>

      {/* Details Viewer Modal popup */}
      {selectedDetailObject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-brand-dark/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-brand-surface border border-brand-navy/5 dark:border-white/10 w-full max-w-lg rounded-[28px] p-6 shadow-xl space-y-5 animate-scaleUp">
            <div className="flex justify-between items-center border-b border-brand-navy/5 dark:border-white/10 pb-3">
              <h3 className="font-outfit font-extrabold text-sm text-brand-navy dark:text-white uppercase tracking-wider">
                {detailType.toUpperCase()} ITEMS DETAILS
              </h3>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => window.print()}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-brand-gold text-brand-dark rounded-xl font-extrabold text-[10px] uppercase tracking-wider hover:bg-white transition-all shadow-sm"
                >
                  <Printer size={13} /> Export PDF
                </button>
                <button 
                  onClick={() => setSelectedDetailObject(null)} 
                  className="text-xs font-bold text-brand-navy/50 dark:text-white/50 hover:text-brand-navy dark:hover:text-white uppercase tracking-wider"
                >
                  Close
                </button>
              </div>
            </div>

            <div className="space-y-4 max-h-[300px] overflow-y-auto text-xs pr-1">
              
              {/* Requisition or LPO rendering */}
              {(detailType === 'requisition' || detailType === 'lpo') && (
                <div className="space-y-2.5">
                  {selectedDetailObject.item_details.map((item, idx) => (
                    <div key={idx} className="p-3 border border-brand-navy/5 dark:border-white/10 bg-brand-beige/10 dark:bg-brand-dark rounded-xl flex justify-between items-center">
                      <div>
                        <span className="font-bold text-brand-navy dark:text-white block">{item.item_desc}</span>
                        <span className="text-[10px] text-brand-navy/50 dark:text-white/50 font-bold">Estimated Cost: ₦{item.est_rate}/ea</span>
                      </div>
                      <span className="font-bold text-brand-navy dark:text-white">{item.qty} {item.unit}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* GRN rendering */}
              {detailType === 'grn' && (
                <div className="space-y-3">
                  {selectedDetailObject.delivery_details.map((item, idx) => {
                    const diff = item.received_qty - item.ordered_qty;
                    return (
                      <div key={idx} className="p-3 border border-brand-navy/5 dark:border-white/10 bg-brand-beige/10 dark:bg-brand-dark rounded-xl space-y-1.5">
                        <span className="font-bold text-brand-navy dark:text-white block">{item.item_desc}</span>
                        <div className="flex justify-between text-[10px] text-brand-navy/50 dark:text-white/50">
                          <span>Ordered Qty: <strong className="text-brand-navy dark:text-white">{item.ordered_qty}</strong></span>
                          <span>Received Qty: <strong className="text-brand-navy dark:text-white">{item.received_qty}</strong></span>
                        </div>
                        {diff !== 0 && (
                          <div className="p-2 border border-red-200 bg-red-50/50 rounded flex items-start gap-1.5 text-[10px] text-red-700 mt-1">
                            <AlertTriangle size={14} className="shrink-0 mt-0.5" />
                            <div>
                              <span className="font-extrabold uppercase block text-[8px]">Procurement Discrepancy logged:</span>
                              <p className="font-semibold">{diff > 0 ? `Surplus of +${diff}` : `Shortage of ${diff}`} items. {item.discrep_notes || 'No leakage description notes supplied.'}</p>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

            </div>
          </div>
        </div>
      )}

    </div>
  );
}
