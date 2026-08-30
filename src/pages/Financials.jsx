import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { DollarSign, ArrowLeft, PlusCircle, Import, Table, TrendingUp, AlertTriangle } from 'lucide-react';

export default function Financials() {
  const { id } = useParams();
  const [project, setProject] = useState(null);
  const [boqItems, setBoqItems] = useState([]);
  const [financials, setFinancials] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Manual BOQ Form
  const [itemCode, setItemCode] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [unit, setUnit] = useState('');
  const [quantity, setQuantity] = useState('');
  const [unitRate, setUnitRate] = useState('');
  const [submittingItem, setSubmittingItem] = useState(false);

  // Bulk Import
  const [bulkCsv, setBulkCsv] = useState('');
  const [importing, setImporting] = useState(false);
  const [showBulkImport, setShowBulkImport] = useState(false);

  useEffect(() => {
    fetchFinancialTelemetry();
  }, [id]);

  const fetchFinancialTelemetry = async () => {
    try {
      setLoading(true);
      setError('');
      const [projRes, boqRes, finRes] = await Promise.all([
        axios.get(`/api/projects/${id}`),
        axios.get(`/api/projects/${id}/boq`),
        axios.get(`/api/projects/${id}/financials`)
      ]);
      setProject(projRes.data);
      setBoqItems(boqRes.data);
      setFinancials(finRes.data);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch project financial registers.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddItem = async (e) => {
    e.preventDefault();
    if (!itemCode || !description || !quantity || !unitRate) return;
    setSubmittingItem(true);
    try {
      const newItem = {
        item_code: itemCode,
        description,
        category: category || 'General',
        unit: unit || 'pcs',
        quantity: parseFloat(quantity),
        unit_rate: parseFloat(unitRate)
      };
      await axios.post(`/api/projects/${id}/boq/import`, { items: [newItem] });
      alert('BOQ item registered successfully!');
      setItemCode('');
      setDescription('');
      setCategory('');
      setUnit('');
      setQuantity('');
      setUnitRate('');
      fetchFinancialTelemetry();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to register BOQ item');
    } finally {
      setSubmittingItem(false);
    }
  };

  const handleBulkImportSubmit = async (e) => {
    e.preventDefault();
    if (!bulkCsv.trim()) return;
    setImporting(true);
    try {
      // Parse CSV: itemCode,description,category,unit,quantity,unitRate
      const lines = bulkCsv.split('\n');
      const parsedItems = [];
      lines.forEach((line) => {
        const parts = line.split(',');
        if (parts.length >= 6) {
          parsedItems.push({
            item_code: parts[0].trim(),
            description: parts[1].trim(),
            category: parts[2].trim(),
            unit: parts[3].trim(),
            quantity: parseFloat(parts[4].trim()) || 0,
            unit_rate: parseFloat(parts[5].trim()) || 0
          });
        }
      });

      if (parsedItems.length === 0) {
        alert('Invalid CSV format. Please separate items by comma: itemCode,description,category,unit,quantity,unitRate');
        setImporting(false);
        return;
      }

      await axios.post(`/api/projects/${id}/boq/import`, { items: parsedItems });
      alert(`Successfully imported ${parsedItems.length} BOQ items!`);
      setBulkCsv('');
      setShowBulkImport(false);
      fetchFinancialTelemetry();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to import BOQ batch');
    } finally {
      setImporting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-navy dark:border-white" />
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="text-center py-16 bg-white dark:bg-brand-surface border border-brand-navy/5 dark:border-white/10 rounded-[32px] p-8 max-w-md mx-auto shadow-sm">
        <AlertTriangle className="mx-auto mb-4 text-red-400" size={32} />
        <h3 className="font-outfit font-extrabold text-brand-navy dark:text-white text-lg uppercase tracking-wider">Sync Error</h3>
        <p className="text-sm text-brand-navy/60 dark:text-white/60 mt-2 font-medium">{error || 'Project data record not found.'}</p>
        <Link 
          to="/projects" 
          className="mt-6 inline-flex items-center gap-1.5 px-6 py-3 bg-brand-navy text-white hover:bg-brand-navy-light rounded-xl font-bold text-xs uppercase tracking-wider transition-colors shadow-md"
        >
          Return to Registry
        </Link>
      </div>
    );
  }

  const baseline = financials?.baseline_budget || 0;
  const committed = financials?.committed_cost || 0;
  const actual = financials?.actual_spend || 0;

  // Percentage Calculations
  const committedPercent = baseline ? Math.min(100, (committed / baseline) * 100) : 0;
  const actualPercent = committed ? Math.min(100, (actual / committed) * 100) : 0;

  return (
    <div className="space-y-8 animate-fadeIn grid-bg min-h-screen pb-16">
      
      {/* Navigation Breadcrumb */}
      <div className="flex items-center justify-between border-b border-brand-navy/5 dark:border-white/10 pb-4">
        <Link 
          to={`/projects/${id}`} 
          className="inline-flex items-center gap-1.5 text-xs text-brand-navy/60 dark:text-white/60 font-bold hover:text-brand-gold transition-colors"
        >
          <ArrowLeft size={16} />
          Back to Project Details
        </Link>
        <span className="text-[10px] font-extrabold text-brand-navy/40 dark:text-white/40 uppercase tracking-widest">Financial Auditor</span>
      </div>

      {/* Title */}
      <div>
        <h2 className="font-outfit font-extrabold text-2xl text-brand-navy dark:text-white uppercase tracking-wider">Project BOQ & Financial Ledger</h2>
        <p className="text-xs text-brand-navy/60 dark:text-white/60 font-semibold mt-1">Project Site: <span className="text-brand-navy dark:text-white">{project.name}</span></p>
      </div>

      {/* Real-time Budget Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Baseline Budget Card */}
        <div className="bg-white dark:bg-brand-surface border border-brand-navy/5 dark:border-white/10 p-6 rounded-[24px] shadow-sm relative overflow-hidden">
          <div className="absolute top-0 left-0 h-[3px] bg-brand-navy w-full" />
          <div className="flex items-center gap-3.5">
            <div className="p-3.5 rounded-2xl bg-brand-navy/5 dark:bg-white/5 text-brand-navy dark:text-white">
              <DollarSign size={20} className="stroke-[2.5]" />
            </div>
            <div>
              <span className="text-[10px] font-extrabold text-brand-navy/40 dark:text-white/40 uppercase tracking-widest block">Baseline Budget (BOQ)</span>
              <span className="text-xl font-extrabold text-brand-navy dark:text-white mt-0.5 block">₦{baseline.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Committed Cost Card */}
        <div className="bg-white dark:bg-brand-surface border border-brand-navy/5 dark:border-white/10 p-6 rounded-[24px] shadow-sm relative overflow-hidden">
          <div className="absolute top-0 left-0 h-[3px] bg-brand-gold w-full" />
          <div className="flex items-center gap-3.5">
            <div className="p-3.5 rounded-2xl bg-brand-gold/10 text-brand-gold">
              <TrendingUp size={20} className="stroke-[2.5]" />
            </div>
            <div>
              <span className="text-[10px] font-extrabold text-brand-navy/40 dark:text-white/40 uppercase tracking-widest block">Committed Costs (LPOs)</span>
              <span className="text-xl font-extrabold text-brand-navy dark:text-white mt-0.5 block">₦{committed.toLocaleString()}</span>
              <div className="w-full bg-brand-beige dark:bg-brand-dark h-1.5 rounded-full overflow-hidden mt-2 border border-brand-navy/5 dark:border-white/10">
                <div style={{ width: `${committedPercent}%` }} className="h-full bg-brand-gold rounded-full transition-all" />
              </div>
              <span className="text-[8px] font-extrabold text-brand-navy/40 dark:text-white/40 block mt-1">{committedPercent.toFixed(1)}% of Baseline</span>
            </div>
          </div>
        </div>

        {/* Actual Spend Card */}
        <div className="bg-white dark:bg-brand-surface border border-brand-navy/5 dark:border-white/10 p-6 rounded-[24px] shadow-sm relative overflow-hidden">
          <div className="absolute top-0 left-0 h-[3px] bg-green-500 w-full" />
          <div className="flex items-center gap-3.5">
            <div className="p-3.5 rounded-2xl bg-green-50 text-green-600">
              <DollarSign size={20} className="stroke-[2.5]" />
            </div>
            <div>
              <span className="text-[10px] font-extrabold text-brand-navy/40 dark:text-white/40 uppercase tracking-widest block">Actual Spend (GRNs)</span>
              <span className="text-xl font-extrabold text-brand-navy dark:text-white mt-0.5 block">₦{actual.toLocaleString()}</span>
              <div className="w-full bg-brand-beige dark:bg-brand-dark h-1.5 rounded-full overflow-hidden mt-2 border border-brand-navy/5 dark:border-white/10">
                <div style={{ width: `${actualPercent}%` }} className="h-full bg-green-500 rounded-full transition-all" />
              </div>
              <span className="text-[8px] font-extrabold text-brand-navy/40 dark:text-white/40 block mt-1">{actualPercent.toFixed(1)}% of Committed</span>
            </div>
          </div>
        </div>

      </div>

      {/* Forms & Inputs Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Hand Form Controls (col-span-1) */}
        <div className="lg:col-span-1 space-y-8">
          
          {/* Add Line Item form */}
          <div className="bg-white dark:bg-brand-surface border border-brand-navy/5 dark:border-white/10 rounded-[28px] p-6 shadow-sm space-y-4 hover:shadow-md transition-all">
            <div className="flex items-center justify-between border-b border-brand-navy/5 dark:border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <PlusCircle className="text-brand-gold" size={18} />
                <h3 className="font-outfit font-extrabold text-sm text-brand-navy dark:text-white uppercase tracking-wider">Log BOQ Line Item</h3>
              </div>
              <button 
                onClick={() => setShowBulkImport(!showBulkImport)}
                className="text-[9px] font-extrabold uppercase tracking-widest text-brand-gold bg-brand-gold/10 px-2 py-1 rounded hover:bg-brand-gold/20"
              >
                {showBulkImport ? 'Log Single' : 'Bulk Import'}
              </button>
            </div>

            {!showBulkImport ? (
              <form onSubmit={handleAddItem} className="space-y-4 text-xs font-semibold">
                <div className="space-y-1">
                  <label className="text-[9px] font-extrabold uppercase tracking-widest text-brand-navy/50 dark:text-white/50 block ml-1">Item Code</label>
                  <input
                    type="text"
                    placeholder="e.g. SUB-03"
                    value={itemCode}
                    onChange={(e) => setItemCode(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-brand-navy/10 dark:border-white/10 dark:bg-brand-dark dark:text-white focus:outline-none focus:border-brand-gold font-bold text-brand-navy uppercase tracking-wider"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-extrabold uppercase tracking-widest text-brand-navy/50 dark:text-white/50 block ml-1">Work Description</label>
                  <input
                    type="text"
                    placeholder="e.g. Reinforcement rebar installation Sector A"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-brand-navy/10 dark:border-white/10 dark:bg-brand-dark dark:text-white focus:outline-none focus:border-brand-gold font-medium"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[9px] font-extrabold uppercase tracking-widest text-brand-navy/50 dark:text-white/50 block ml-1">Trade Category</label>
                    <input
                      type="text"
                      placeholder="e.g. Substructure"
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-brand-navy/10 dark:border-white/10 dark:bg-brand-dark dark:text-white focus:outline-none focus:border-brand-gold font-medium"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-extrabold uppercase tracking-widest text-brand-navy/50 dark:text-white/50 block ml-1">Unit</label>
                    <input
                      type="text"
                      placeholder="e.g. m3, sqm, tons"
                      value={unit}
                      onChange={(e) => setUnit(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-brand-navy/10 dark:border-white/10 dark:bg-brand-dark dark:text-white focus:outline-none focus:border-brand-gold font-medium"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[9px] font-extrabold uppercase tracking-widest text-brand-navy/50 dark:text-white/50 block ml-1">Quantity</label>
                    <input
                      type="number"
                      placeholder="e.g. 150"
                      value={quantity}
                      onChange={(e) => setQuantity(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-brand-navy/10 dark:border-white/10 dark:bg-brand-dark dark:text-white focus:outline-none focus:border-brand-gold font-medium"
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-extrabold uppercase tracking-widest text-brand-navy/50 dark:text-white/50 block ml-1">Unit Rate (₦)</label>
                    <input
                      type="number"
                      placeholder="e.g. 85"
                      value={unitRate}
                      onChange={(e) => setUnitRate(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-brand-navy/10 dark:border-white/10 dark:bg-brand-dark dark:text-white focus:outline-none focus:border-brand-gold font-medium"
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={submittingItem}
                  className="w-full py-2.5 bg-brand-navy hover:bg-brand-navy-light text-white font-extrabold text-xs uppercase tracking-widest rounded-xl transition-all shadow-md"
                >
                  {submittingItem ? 'Saving...' : 'Register Item'}
                </button>
              </form>
            ) : (
              <form onSubmit={handleBulkImportSubmit} className="space-y-4 text-xs font-semibold">
                <div className="space-y-1">
                  <label className="text-[9px] font-extrabold uppercase tracking-widest text-brand-navy/50 dark:text-white/50 block ml-1">CSV Format Input</label>
                  <span className="text-[8px] text-brand-navy/40 dark:text-white/40 font-bold block mb-1">itemCode,description,category,unit,quantity,unitRate</span>
                  <textarea
                    placeholder="MAS-02,Internal Block Work partition walls,Masonry,sqm,420,12"
                    value={bulkCsv}
                    onChange={(e) => setBulkCsv(e.target.value)}
                    rows="6"
                    className="w-full px-4 py-2.5 rounded-xl border border-brand-navy/10 dark:border-white/10 dark:bg-brand-dark dark:text-white focus:outline-none focus:border-brand-gold font-mono font-medium text-[10px]"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={importing}
                  className="w-full py-2.5 bg-brand-navy hover:bg-brand-navy-light text-white font-extrabold text-xs uppercase tracking-widest rounded-xl transition-all shadow-md"
                >
                  {importing ? 'Importing...' : 'Parse and Import Batch'}
                </button>
              </form>
            )}
          </div>

        </div>

        {/* Right Hand Column: BOQ ledger table (col-span-2) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white dark:bg-brand-surface border border-brand-navy/5 dark:border-white/10 rounded-[28px] p-6 shadow-sm hover:shadow-md transition-all space-y-4 overflow-hidden">
            <div className="flex items-center gap-2 border-b border-brand-navy/5 dark:border-white/10 pb-3">
              <Table className="text-brand-gold" size={18} />
              <h3 className="font-outfit font-extrabold text-sm text-brand-navy dark:text-white uppercase tracking-wider">Bill of Quantities (BOQ) Ledger</h3>
            </div>

            {boqItems.length === 0 ? (
              <p className="text-center py-16 text-xs text-brand-navy/40 dark:text-white/40 font-bold uppercase tracking-wider">No BOQ items loaded on this contract.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-semibold text-brand-navy/80 dark:text-white/80">
                  <thead className="bg-brand-beige/50 dark:bg-brand-dark text-brand-navy/55 dark:text-white/55 uppercase text-[9px] font-extrabold tracking-wider border-b border-brand-navy/5 dark:border-white/10">
                    <tr>
                      <th className="px-4 py-3">Code</th>
                      <th className="px-4 py-3">Description</th>
                      <th className="px-4 py-3">Category</th>
                      <th className="px-4 py-3 text-center">Unit</th>
                      <th className="px-4 py-3 text-right">Quantity</th>
                      <th className="px-4 py-3 text-right">Rate</th>
                      <th className="px-4 py-3 text-right">Total (₦)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-brand-navy/5 dark:divide-white/10">
                    {boqItems.map(item => (
                      <tr key={item.id} className="hover:bg-brand-beige/10 dark:hover:bg-white/5 transition-colors">
                        <td className="px-4 py-3 font-bold text-brand-navy dark:text-white">{item.item_code}</td>
                        <td className="px-4 py-3 max-w-[200px] truncate">{item.description}</td>
                        <td className="px-4 py-3 text-[10px] uppercase font-bold text-brand-navy/60 dark:text-white/60">{item.category}</td>
                        <td className="px-4 py-3 text-center text-brand-navy/50 dark:text-white/50">{item.unit}</td>
                        <td className="px-4 py-3 text-right">{Number(item.quantity).toLocaleString()}</td>
                        <td className="px-4 py-3 text-right">₦{Number(item.unit_rate).toLocaleString()}</td>
                        <td className="px-4 py-3 text-right font-bold text-brand-navy dark:text-white">₦{(item.quantity * item.unit_rate).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
