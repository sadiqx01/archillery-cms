import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { 
  Users, 
  Plus, 
  Mail, 
  Phone, 
  UserCheck, 
  Trash2, 
  X,
  Search,
  CheckCircle,
  Briefcase,
  MapPin,
  Calendar,
  DollarSign,
  Edit2,
  CalendarDays,
  Check,
  AlertCircle
} from 'lucide-react';

export default function Workers() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('directory'); // directory | leaves
  const [workers, setWorkers] = useState([]);
  const [leaves, setLeaves] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredWorkers, setFilteredWorkers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Create Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    position: 'Site Mason',
    department: 'Site Operations',
    salary: 150000,
    address: '',
    emergency_contact: '',
    joined_date: new Date().toISOString().split('T')[0],
    status: 'active'
  });

  // Edit Modal
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingEmp, setEditingEmp] = useState(null);
  const [editFormData, setEditFormData] = useState({});

  // View Modal
  const [selectedEmp, setSelectedEmp] = useState(null);

  const fetchWorkersAndLeaves = async () => {
    try {
      setLoading(true);
      const [workerRes, leaveRes] = await Promise.all([
        axios.get('/api/workers'),
        axios.get('/api/hr/leaves').catch(() => ({ data: [] }))
      ]);
      setWorkers(workerRes.data);
      setFilteredWorkers(workerRes.data);
      setLeaves(leaveRes.data || []);
    } catch (err) {
      console.error(err);
      alert('Failed to fetch staff records');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkersAndLeaves();
  }, []);

  // Filter Search
  useEffect(() => {
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      const result = workers.filter(w => 
        w.name?.toLowerCase().includes(q) ||
        w.email?.toLowerCase().includes(q) ||
        w.department?.toLowerCase().includes(q) ||
        w.position?.toLowerCase().includes(q)
      );
      setFilteredWorkers(result);
    } else {
      setFilteredWorkers(workers);
    }
  }, [searchTerm, workers]);

  const handleOpenCreateModal = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      position: 'Site Mason',
      department: 'Site Operations',
      salary: 150000,
      address: '',
      emergency_contact: '',
      joined_date: new Date().toISOString().split('T')[0],
      status: 'active'
    });
    setFormError('');
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email) {
      setFormError('Name and email are required.');
      return;
    }
    setFormLoading(true);
    setFormError('');
    try {
      await axios.post('/api/workers', formData);
      setIsModalOpen(false);
      alert('Staff record added successfully!');
      fetchWorkersAndLeaves();
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to enroll staff member');
    } finally {
      setFormLoading(false);
    }
  };

  const handleOpenEditModal = (worker) => {
    setEditingEmp(worker);
    setEditFormData({
      name: worker.name || '',
      email: worker.email || '',
      phone: worker.phone || '',
      position: worker.position || '',
      department: worker.department || '',
      salary: worker.salary || '',
      address: worker.address || '',
      emergency_contact: worker.emergency_contact || '',
      status: worker.status || 'active'
    });
    setIsEditModalOpen(true);
  };

  const handleEditFormSubmit = async (e) => {
    e.preventDefault();
    if (!editingEmp) return;
    setFormLoading(true);
    try {
      await axios.put(`/api/workers/${editingEmp.id}`, editFormData);
      setIsEditModalOpen(false);
      setEditingEmp(null);
      alert('Staff record updated successfully!');
      fetchWorkersAndLeaves();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update staff record');
    } finally {
      setFormLoading(false);
    }
  };

  const handleToggleStatus = async (id, currentStatus) => {
    const nextStatus = currentStatus === 'active' ? 'suspended' : 'active';
    try {
      await axios.put(`/api/workers/${id}`, { status: nextStatus });
      fetchWorkersAndLeaves();
    } catch (err) {
      alert(err.response?.data?.message || 'Status update failed');
    }
  };

  const handleApproveLeave = async (leaveId, approve) => {
    try {
      await axios.patch(`/api/hr/leaves/${leaveId}/approve`, { approve });
      alert(approve ? 'Leave request approved!' : 'Leave request rejected.');
      fetchWorkersAndLeaves();
    } catch (err) {
      alert('Failed to update leave status');
    }
  };

  const canManage = ['hr', 'it', 'ceo'].includes(user?.role);
  const isHRorExec = ['hr', 'ceo'].includes(user?.role);

  return (
    <div className="space-y-6 animate-fadeIn min-h-screen pb-16">
      
      {/* Header Panel */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-brand-navy/5 dark:border-white/10 pb-4">
        <div className="space-y-0.5">
          <h2 className="text-xl font-bold font-outfit text-brand-navy dark:text-white uppercase tracking-wider">
            Staff & Personnel Management
          </h2>
          <p className="text-xs text-brand-navy/50 dark:text-white/50 font-semibold uppercase tracking-wider">
            Maintain staff records, track departments, and review employee leave requests.
          </p>
        </div>

        {canManage && (
          <button
            onClick={handleOpenCreateModal}
            className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-brand-gold hover:bg-white text-brand-dark font-extrabold text-xs uppercase tracking-wider shadow-sm transition-all border border-brand-gold cursor-pointer"
          >
            <Plus size={14} />
            Add Staff Record
          </button>
        )}
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-brand-navy/5 dark:border-white/5 gap-2 no-print">
        <button
          onClick={() => setActiveTab('directory')}
          className={`px-5 py-2.5 font-extrabold text-xs uppercase tracking-wider border-b-2 transition-all cursor-pointer ${
            activeTab === 'directory'
              ? 'border-brand-gold text-brand-navy dark:text-white'
              : 'border-transparent text-brand-navy/40 dark:text-white/40 hover:text-brand-navy/60 dark:hover:text-white/60'
          }`}
        >
          Staff Directory ({filteredWorkers.length})
        </button>
        <button
          onClick={() => setActiveTab('leaves')}
          className={`px-5 py-2.5 font-extrabold text-xs uppercase tracking-wider border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'leaves'
              ? 'border-brand-gold text-brand-navy dark:text-white'
              : 'border-transparent text-brand-navy/40 dark:text-white/40 hover:text-brand-navy/60 dark:hover:text-white/60'
          }`}
        >
          <CalendarDays size={13} />
          Leave Requests ({leaves.length})
        </button>
      </div>

      {/* TAB 1: Staff Directory */}
      {activeTab === 'directory' && (
        <div className="space-y-4">
          {/* Search Bar */}
          <div className="relative p-3 bg-white dark:bg-brand-surface border border-brand-navy/5 dark:border-white/10 rounded-2xl shadow-sm flex items-center">
            <Search size={15} className="absolute left-6 text-brand-navy/40 dark:text-white/40" />
            <input
              type="text"
              placeholder="Search by staff name, department, or job position..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-brand-beige/25 dark:bg-brand-dark border border-brand-navy/10 dark:border-white/10 text-brand-navy dark:text-white focus:outline-none focus:border-brand-gold text-xs font-semibold"
            />
          </div>

          {loading ? (
            <div className="flex justify-center py-16">
              <div className="w-8 h-8 border-4 border-brand-navy border-t-brand-gold rounded-full animate-spin"></div>
            </div>
          ) : filteredWorkers.length === 0 ? (
            <div className="text-center py-16 bg-white dark:bg-brand-surface border border-brand-navy/5 dark:border-white/10 rounded-3xl shadow-sm">
              <Users className="mx-auto mb-3 text-brand-navy/20 dark:text-white/20" size={36} />
              <h3 className="font-bold text-brand-navy dark:text-white">No Staff Records Found</h3>
              <p className="text-xs text-brand-navy/50 dark:text-white/50 mt-1">Try another search term or click Add Staff Record.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredWorkers.map(worker => (
                <div 
                  key={worker.id}
                  className="bg-white dark:bg-brand-surface border border-brand-navy/5 dark:border-white/10 rounded-[24px] p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-3">
                    {/* Status & Department */}
                    <div className="flex items-center justify-between border-b border-brand-navy/5 dark:border-white/10 pb-2.5">
                      <span className={`text-[9px] font-extrabold uppercase px-2.5 py-0.5 rounded-full border ${
                        worker.status === 'active' 
                          ? 'bg-green-50 text-green-700 border-green-200 dark:bg-green-950/40 dark:text-green-300' 
                          : 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/40 dark:text-red-300'
                      }`}>
                        {worker.status || 'active'}
                      </span>
                      <span className="text-[10px] font-bold text-brand-navy/60 dark:text-white/60 uppercase">
                        {worker.department || 'Operations'}
                      </span>
                    </div>

                    {/* Name & Position */}
                    <div>
                      <h3 className="font-outfit font-extrabold text-sm text-brand-navy dark:text-white">
                        {worker.name}
                      </h3>
                      <span className="text-xs font-bold text-brand-gold block mt-0.5">
                        {worker.position}
                      </span>
                      <span className="text-[9px] font-mono text-brand-navy/40 dark:text-white/40 block mt-0.5">
                        {worker.employee_id || `ID: EMP-${worker.id}`}
                      </span>
                    </div>

                    {/* Contact */}
                    <div className="space-y-1 text-xs text-brand-navy/70 dark:text-white/70 pt-2 border-t border-brand-navy/5 dark:border-white/5">
                      <div className="flex items-center gap-2">
                        <Mail size={12} className="text-brand-gold shrink-0" />
                        <span className="truncate">{worker.email}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone size={12} className="text-brand-gold shrink-0" />
                        <span>{worker.phone || 'No phone'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="pt-3 border-t border-brand-navy/5 dark:border-white/10 flex items-center justify-between gap-2">
                    <button
                      onClick={() => setSelectedEmp(worker)}
                      className="px-3 py-1.5 bg-brand-beige/30 dark:bg-brand-dark text-brand-navy dark:text-white font-bold text-[10px] uppercase tracking-wider rounded-lg hover:bg-brand-gold hover:text-brand-dark transition-all cursor-pointer"
                    >
                      View
                    </button>

                    {canManage && (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleOpenEditModal(worker)}
                          className="px-3 py-1.5 bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-300 border border-blue-200 dark:border-blue-800 font-extrabold text-[10px] uppercase rounded-lg hover:bg-blue-600 hover:text-white transition-all cursor-pointer flex items-center gap-1"
                        >
                          <Edit2 size={11} /> Edit
                        </button>
                        <button
                          onClick={() => handleToggleStatus(worker.id, worker.status)}
                          className={`px-2.5 py-1.5 text-[10px] font-extrabold uppercase rounded-lg border transition-all cursor-pointer ${
                            worker.status === 'active'
                              ? 'border-amber-200 text-amber-600 hover:bg-amber-50'
                              : 'border-green-200 text-green-600 hover:bg-green-50'
                          }`}
                        >
                          {worker.status === 'active' ? 'Suspend' : 'Activate'}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: Leave Requests */}
      {activeTab === 'leaves' && (
        <div className="bg-white dark:bg-brand-surface border border-brand-navy/5 dark:border-white/10 rounded-[28px] p-6 shadow-sm space-y-4">
          <div className="flex justify-between items-center border-b border-brand-navy/5 dark:border-white/10 pb-3">
            <div>
              <h3 className="font-outfit font-extrabold text-sm text-brand-navy dark:text-white uppercase tracking-wider">
                Staff Leave Applications
              </h3>
              <p className="text-[10px] text-brand-navy/50 dark:text-white/50 font-medium">
                Review submitted staff time-off requests and approve or reject applications.
              </p>
            </div>
            <span className="text-[10px] text-brand-navy/40 dark:text-white/40 font-bold uppercase">{leaves.length} Applications</span>
          </div>

          {leaves.length === 0 ? (
            <p className="text-center py-12 text-xs text-brand-navy/40 dark:text-white/40 font-bold uppercase tracking-wider">
              No leave applications submitted.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-brand-navy/10 dark:border-white/10 text-[9px] text-brand-navy/50 dark:text-white/50 uppercase tracking-widest bg-brand-beige/20 dark:bg-brand-dark">
                    <th className="py-3 px-4">Employee</th>
                    <th className="py-3 px-4">Leave Duration</th>
                    <th className="py-3 px-4">Reason / Type</th>
                    <th className="py-3 px-4 text-center">Status</th>
                    {isHRorExec && <th className="py-3 px-4 text-right">Actions</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-brand-navy/5 dark:divide-white/10">
                  {leaves.map(l => (
                    <tr key={l.id} className="hover:bg-brand-beige/10 dark:hover:bg-brand-dark/20">
                      <td className="py-3.5 px-4">
                        <span className="font-bold text-brand-navy dark:text-white block">{l.name}</span>
                        <span className="text-[10px] text-brand-navy/40 dark:text-white/40">{l.position}</span>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-[11px] text-brand-navy/70 dark:text-white/70">
                        {l.start_date} to {l.end_date}
                      </td>
                      <td className="py-3.5 px-4 text-brand-navy/80 dark:text-white/80">
                        {l.reason || 'Annual Leave'}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span className={`text-[9px] font-extrabold uppercase px-2.5 py-0.5 rounded-full border ${
                          l.status === 'approved' 
                            ? 'bg-green-50 text-green-700 border-green-200' 
                            : l.status === 'rejected' 
                            ? 'bg-red-50 text-red-700 border-red-200' 
                            : 'bg-amber-50 text-amber-700 border-amber-200'
                        }`}>
                          {l.status}
                        </span>
                      </td>
                      {isHRorExec && (
                        <td className="py-3.5 px-4 text-right">
                          {l.status === 'pending' ? (
                            <div className="flex gap-2 justify-end">
                              <button
                                onClick={() => handleApproveLeave(l.id, true)}
                                className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-[10px] font-extrabold uppercase shadow-sm cursor-pointer"
                              >
                                Approve
                              </button>
                              <button
                                onClick={() => handleApproveLeave(l.id, false)}
                                className="px-3 py-1 border border-red-200 text-red-600 hover:bg-red-50 rounded text-[10px] font-extrabold uppercase cursor-pointer"
                              >
                                Reject
                              </button>
                            </div>
                          ) : (
                            <span className="text-[10px] text-brand-navy/40 dark:text-white/40 font-bold uppercase">Decided</span>
                          )}
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Add Staff Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-brand-dark/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-brand-surface border border-brand-navy/10 dark:border-white/10 w-full max-w-lg rounded-[28px] p-6 shadow-2xl relative">
            <button 
              onClick={() => setIsModalOpen(false)}
              className="absolute top-5 right-5 text-brand-navy/40 dark:text-white/40 hover:text-brand-navy dark:hover:text-white cursor-pointer"
            >
              <X size={18} />
            </button>

            <h3 className="font-outfit font-extrabold text-base text-brand-navy dark:text-white uppercase tracking-wider mb-1">
              Add New Staff Record
            </h3>
            <p className="text-[11px] text-brand-navy/50 dark:text-white/50 mb-4">
              Enter employee personnel details. System login accounts and permissions are managed by IT.
            </p>

            {formError && (
              <div className="p-2.5 rounded-lg bg-red-50 text-red-600 text-xs mb-3 font-semibold">
                {formError}
              </div>
            )}

            <form onSubmit={handleFormSubmit} className="space-y-3 text-xs font-semibold">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[9px] uppercase text-brand-navy/50 dark:text-white/50 block mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ibrahim Aliyu"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-brand-navy/10 dark:border-white/10 bg-white dark:bg-brand-dark text-brand-navy dark:text-white"
                  />
                </div>
                <div>
                  <label className="text-[9px] uppercase text-brand-navy/50 dark:text-white/50 block mb-1">Email Address</label>
                  <input
                    type="email"
                    required
                    placeholder="e.g. ibrahim.aliyu@archillery.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-brand-navy/10 dark:border-white/10 bg-white dark:bg-brand-dark text-brand-navy dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[9px] uppercase text-brand-navy/50 dark:text-white/50 block mb-1">Job Position</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Site Supervisor"
                    value={formData.position}
                    onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-brand-navy/10 dark:border-white/10 bg-white dark:bg-brand-dark text-brand-navy dark:text-white"
                  />
                </div>
                <div>
                  <label className="text-[9px] uppercase text-brand-navy/50 dark:text-white/50 block mb-1">Department</label>
                  <select
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-brand-navy/10 dark:border-white/10 bg-white dark:bg-brand-dark text-brand-navy dark:text-white"
                  >
                    <option value="Site Operations">Site Operations</option>
                    <option value="Structural Engineering">Structural Engineering</option>
                    <option value="Human Resources">Human Resources</option>
                    <option value="Information Technology">Information Technology</option>
                    <option value="Executive Management">Executive Management</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[9px] uppercase text-brand-navy/50 dark:text-white/50 block mb-1">Phone Number</label>
                  <input
                    type="text"
                    placeholder="+234..."
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-brand-navy/10 dark:border-white/10 bg-white dark:bg-brand-dark text-brand-navy dark:text-white"
                  />
                </div>
                <div>
                  <label className="text-[9px] uppercase text-brand-navy/50 dark:text-white/50 block mb-1">Monthly Salary (₦)</label>
                  <input
                    type="number"
                    value={formData.salary}
                    onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-brand-navy/10 dark:border-white/10 bg-white dark:bg-brand-dark text-brand-navy dark:text-white"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-brand-navy/5 dark:border-white/10">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-brand-navy/10 dark:border-white/10 rounded-xl text-xs font-bold text-brand-navy/60 dark:text-white/60 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formLoading}
                  className="px-5 py-2 bg-brand-gold text-brand-dark hover:bg-white rounded-xl text-xs font-extrabold uppercase shadow-sm cursor-pointer"
                >
                  {formLoading ? 'Saving...' : 'Save Staff Record'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Staff Record Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-brand-dark/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-brand-surface border border-brand-navy/10 dark:border-white/10 w-full max-w-lg rounded-[28px] p-6 shadow-2xl relative">
            <button 
              onClick={() => setIsEditModalOpen(false)}
              className="absolute top-5 right-5 text-brand-navy/40 dark:text-white/40 hover:text-brand-navy dark:hover:text-white cursor-pointer"
            >
              <X size={18} />
            </button>

            <h3 className="font-outfit font-extrabold text-base text-brand-navy dark:text-white uppercase tracking-wider mb-1">
              Edit Staff Record
            </h3>
            <p className="text-[11px] text-brand-navy/50 dark:text-white/50 mb-4">
              Update employment status, job title, department, or contact details for {editingEmp?.name}.
            </p>

            <form onSubmit={handleEditFormSubmit} className="space-y-3 text-xs font-semibold">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[9px] uppercase text-brand-navy/50 dark:text-white/50 block mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={editFormData.name || ''}
                    onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-brand-navy/10 dark:border-white/10 bg-white dark:bg-brand-dark text-brand-navy dark:text-white"
                  />
                </div>
                <div>
                  <label className="text-[9px] uppercase text-brand-navy/50 dark:text-white/50 block mb-1">Employment Status</label>
                  <select
                    value={editFormData.status || 'active'}
                    onChange={(e) => setEditFormData({ ...editFormData, status: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-brand-navy/10 dark:border-white/10 bg-white dark:bg-brand-dark text-brand-navy dark:text-white font-bold"
                  >
                    <option value="active">Active</option>
                    <option value="on_leave">On Leave</option>
                    <option value="suspended">Suspended</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[9px] uppercase text-brand-navy/50 dark:text-white/50 block mb-1">Job Position</label>
                  <input
                    type="text"
                    required
                    value={editFormData.position || ''}
                    onChange={(e) => setEditFormData({ ...editFormData, position: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-brand-navy/10 dark:border-white/10 bg-white dark:bg-brand-dark text-brand-navy dark:text-white"
                  />
                </div>
                <div>
                  <label className="text-[9px] uppercase text-brand-navy/50 dark:text-white/50 block mb-1">Department</label>
                  <select
                    value={editFormData.department || 'Site Operations'}
                    onChange={(e) => setEditFormData({ ...editFormData, department: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-brand-navy/10 dark:border-white/10 bg-white dark:bg-brand-dark text-brand-navy dark:text-white"
                  >
                    <option value="Site Operations">Site Operations</option>
                    <option value="Structural Engineering">Structural Engineering</option>
                    <option value="Human Resources">Human Resources</option>
                    <option value="Information Technology">Information Technology</option>
                    <option value="Executive Management">Executive Management</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[9px] uppercase text-brand-navy/50 dark:text-white/50 block mb-1">Phone Number</label>
                  <input
                    type="text"
                    value={editFormData.phone || ''}
                    onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-brand-navy/10 dark:border-white/10 bg-white dark:bg-brand-dark text-brand-navy dark:text-white"
                  />
                </div>
                <div>
                  <label className="text-[9px] uppercase text-brand-navy/50 dark:text-white/50 block mb-1">Monthly Salary (₦)</label>
                  <input
                    type="number"
                    value={editFormData.salary || ''}
                    onChange={(e) => setEditFormData({ ...editFormData, salary: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-brand-navy/10 dark:border-white/10 bg-white dark:bg-brand-dark text-brand-navy dark:text-white"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-brand-navy/5 dark:border-white/10">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 border border-brand-navy/10 dark:border-white/10 rounded-xl text-xs font-bold text-brand-navy/60 dark:text-white/60 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formLoading}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-extrabold uppercase shadow-sm cursor-pointer"
                >
                  {formLoading ? 'Saving...' : 'Update Record'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Staff Profile Modal */}
      {selectedEmp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-brand-dark/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-brand-surface border border-brand-navy/10 dark:border-white/10 w-full max-w-md rounded-[28px] p-6 shadow-2xl relative space-y-4">
            <button 
              onClick={() => setSelectedEmp(null)}
              className="absolute top-5 right-5 text-brand-navy/40 dark:text-white/40 hover:text-brand-navy dark:hover:text-white cursor-pointer"
            >
              <X size={18} />
            </button>

            <div>
              <span className="text-[9px] font-extrabold uppercase tracking-widest text-brand-gold">Employee Profile</span>
              <h3 className="font-outfit font-extrabold text-base text-brand-navy dark:text-white">{selectedEmp.name}</h3>
              <span className="text-xs font-bold text-brand-gold">{selectedEmp.position} • {selectedEmp.department}</span>
            </div>

            <div className="p-4 bg-brand-beige/20 dark:bg-brand-dark rounded-2xl space-y-2 text-xs">
              <div className="flex justify-between border-b border-brand-navy/5 dark:border-white/5 pb-1.5">
                <span className="text-brand-navy/50 dark:text-white/50">Employee ID</span>
                <span className="font-bold text-brand-navy dark:text-white">{selectedEmp.employee_id || `EMP-${selectedEmp.id}`}</span>
              </div>
              <div className="flex justify-between border-b border-brand-navy/5 dark:border-white/5 pb-1.5">
                <span className="text-brand-navy/50 dark:text-white/50">Employment Status</span>
                <span className="font-bold uppercase text-green-600 dark:text-green-400">{selectedEmp.status || 'Active'}</span>
              </div>
              <div className="flex justify-between border-b border-brand-navy/5 dark:border-white/5 pb-1.5">
                <span className="text-brand-navy/50 dark:text-white/50">Email</span>
                <span className="font-bold text-brand-navy dark:text-white">{selectedEmp.email}</span>
              </div>
              <div className="flex justify-between border-b border-brand-navy/5 dark:border-white/5 pb-1.5">
                <span className="text-brand-navy/50 dark:text-white/50">Phone</span>
                <span className="font-bold text-brand-navy dark:text-white">{selectedEmp.phone || 'N/A'}</span>
              </div>
              <div className="flex justify-between border-b border-brand-navy/5 dark:border-white/5 pb-1.5">
                <span className="text-brand-navy/50 dark:text-white/50">Monthly Compensation</span>
                <span className="font-bold text-brand-navy dark:text-white">₦{Number(selectedEmp.salary || 0).toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-brand-navy/50 dark:text-white/50">Emergency Contact</span>
                <span className="font-bold text-brand-navy dark:text-white">{selectedEmp.emergency_contact || 'N/A'}</span>
              </div>
            </div>

            <div className="flex justify-end pt-1">
              <button
                onClick={() => setSelectedEmp(null)}
                className="px-4 py-2 bg-brand-navy dark:bg-white/10 text-white rounded-xl text-xs font-bold uppercase cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
