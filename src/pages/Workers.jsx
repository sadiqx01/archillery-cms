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
  DollarSign
} from 'lucide-react';

export default function Workers() {
  const { user } = useAuth();
  const [workers, setWorkers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredWorkers, setFilteredWorkers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEmp, setSelectedEmp] = useState(null);
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState('');
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    role: 'worker',
    position: 'Field Laborer',
    department: 'Operations',
    salary: 150000,
    address: '',
    emergency_contact: '',
    joined_date: new Date().toISOString().split('T')[0],
    status: 'active'
  });

  const fetchWorkers = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/api/workers');
      setWorkers(res.data);
      setFilteredWorkers(res.data);
    } catch (err) {
      console.error(err);
      alert('Failed to fetch staff registry records');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkers();
  }, []);

  // Handle Search filtering
  useEffect(() => {
    if (searchTerm) {
      const result = workers.filter(w => 
        w.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        w.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        w.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
        w.position.toLowerCase().includes(searchTerm.toLowerCase())
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
      password: '',
      phone: '',
      role: 'worker',
      position: 'Field Laborer',
      department: 'Operations',
      salary: 150000,
      address: '',
      emergency_contact: '',
      joined_date: new Date().toISOString().split('T')[0],
      status: 'active'
    });
    setFormError('');
    setIsModalOpen(true);
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email) {
      setFormError('Please complete name and email coordinates.');
      return;
    }

    setFormLoading(true);
    setFormError('');

    try {
      await axios.post('/api/workers', formData);
      setIsModalOpen(false);
      fetchWorkers();
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to enroll worker');
    } finally {
      setFormLoading(false);
    }
  };

  const handleToggleStatus = async (id, currentStatus) => {
    const nextStatus = currentStatus === 'active' ? 'suspended' : 'active';
    try {
      await axios.put(`/api/workers/${id}`, { status: nextStatus });
      fetchWorkers();
    } catch (err) {
      alert(err.response?.data?.message || 'Status toggle failed');
    }
  };

  const handleDeleteWorker = async (id, name) => {
    if (!window.confirm(`Permanently discharge "${name}" from the staff registry?`)) {
      return;
    }

    try {
      await axios.delete(`/api/workers/${id}`);
      fetchWorkers();
    } catch (err) {
      alert(err.response?.data?.message || 'Delete operation failed');
    }
  };

  const roleLabels = {
    ceo: 'CEO / Executive',
    cto: 'CTO / Director',
    hr: 'HR Manager',
    it: 'Head of IT / Admin',
    supervisor: 'Site Supervisor',
    engineer: 'Site Engineer',
    worker: 'Field Worker'
  };

  const canManage = ['hr', 'it', 'ceo'].includes(user?.role);

  return (
    <div className="space-y-6 animate-fadeIn min-h-screen pb-16">
      
      {/* Header Panel */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-brand-navy/5 dark:border-white/10 pb-4">
        <div className="space-y-0.5">
          <h2 className="text-xl font-bold font-outfit text-brand-navy dark:text-white uppercase tracking-wider">Staff Registry</h2>
          <p className="text-xs text-brand-navy/50 dark:text-white/50 font-semibold uppercase tracking-wider">Manage system operators and employee credentials.</p>
        </div>

        {canManage && (
          <button
            onClick={handleOpenCreateModal}
            className="inline-flex items-center gap-1.5 px-5 py-3 rounded-xl bg-brand-gold hover:bg-white dark:hover:bg-brand-surface text-brand-dark font-extrabold text-[10px] uppercase tracking-wider shadow-sm transition-all border border-brand-gold cursor-pointer"
          >
            <Plus size={14} />
            Enroll Staff Member
          </button>
        )}
      </div>

      {/* Search Input Filter */}
      <div className="relative p-4 bg-white dark:bg-brand-surface border border-brand-navy/5 dark:border-white/10 rounded-2xl shadow-sm flex items-center">
        <Search size={15} className="absolute left-8 text-brand-navy/40 dark:text-white/40" />
        <input
          type="text"
          placeholder="Search staff members by name, email, role, position..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-12 pr-4 py-2.5 rounded-xl bg-brand-beige/25 dark:bg-brand-dark border border-brand-navy/10 dark:border-white/10 text-brand-navy dark:text-white focus:outline-none focus:border-brand-gold text-xs font-semibold"
        />
      </div>

      {/* Registry Grid */}
      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-8 h-8 border-4 border-brand-navy dark:border-white/20 border-t-brand-gold rounded-full animate-spin"></div>
        </div>
      ) : filteredWorkers.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-brand-surface border border-brand-navy/5 dark:border-white/10 rounded-3xl shadow-sm">
          <Users className="mx-auto mb-3 text-brand-navy/20 dark:text-white/20 animate-pulse" size={36} />
          <h3 className="font-bold text-brand-navy dark:text-white">No Staff Registered</h3>
          <p className="text-xs text-brand-navy/50 dark:text-white/50 mt-1">Try modifying search inputs or register a new staff member.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredWorkers.map(worker => (
            <div 
              key={worker.id}
              className="bg-white dark:bg-brand-surface border border-brand-navy/5 dark:border-white/10 rounded-[28px] p-6 shadow-sm hover:shadow-xl hover:scale-[1.01] transition-all duration-300 flex flex-col justify-between group relative overflow-hidden"
            >
              {/* Running Gold accent bar */}
              <div className="absolute top-0 left-0 h-[4px] bg-brand-gold w-0 group-hover:w-full transition-all duration-500 ease-out z-20" />

              <div className="space-y-5">
                {/* Header status & role */}
                <div className="flex items-center justify-between border-b border-brand-navy/5 dark:border-white/10 pb-3">
                  <span className={`text-[9px] font-extrabold uppercase px-3 py-1 rounded-full border ${
                    worker.status === 'active' 
                      ? 'bg-[#00bf63]/10 text-[#00bf63] border-[#00bf63]/25' 
                      : 'bg-red-500/10 text-red-500 border-red-500/25'
                  }`}>
                    {worker.status}
                  </span>
                  
                  <span className="text-[10px] font-extrabold bg-brand-gold/15 text-brand-gold px-3 py-1 rounded-full border border-brand-gold/20 uppercase tracking-wider">
                    {roleLabels[worker.role] || worker.role}
                  </span>
                </div>

                {/* Profile Card */}
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full overflow-hidden bg-brand-gold/15 border border-brand-gold/25 flex items-center justify-center font-bold text-brand-gold uppercase text-base shrink-0">
                    <img 
                      src={worker.photo || '/default-avatar.svg'} 
                      alt={worker.name} 
                      className="w-full h-full object-cover"
                      onError={(e) => { e.target.src = '/default-avatar.svg'; }}
                    />
                  </div>
                  <div className="overflow-hidden">
                    <h3 className="font-outfit font-extrabold text-xs md:text-sm text-brand-navy dark:text-white truncate">{worker.name}</h3>
                    <span className="text-[10px] font-extrabold text-brand-gold block mt-0.5 uppercase">{worker.position}</span>
                    <span className="text-[9px] font-extrabold text-brand-navy/40 dark:text-white/40 uppercase block">{worker.employee_id || `EMP-ID: #${worker.id}`}</span>
                  </div>
                </div>

                {/* Contact Coordinates */}
                <div className="space-y-2 pt-2 text-xs font-semibold text-brand-navy/70 dark:text-white/70 border-t border-brand-navy/5 dark:border-white/10">
                  <div className="flex items-center gap-2">
                    <Mail size={13} className="text-brand-gold shrink-0" />
                    <span className="truncate">{worker.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone size={13} className="text-brand-gold shrink-0" />
                    <span>{worker.phone || 'No Phone Logged'}</span>
                  </div>
                </div>
              </div>

              {/* Action Coordinates */}
              <div className="mt-6 pt-4 border-t border-brand-navy/5 dark:border-white/10 flex items-center justify-between gap-2">
                <button
                  onClick={() => setSelectedEmp(worker)}
                  className="px-3 py-1.5 bg-brand-beige/40 dark:bg-brand-dark hover:bg-brand-gold/10 text-brand-navy dark:text-white font-bold text-[9px] uppercase tracking-wider rounded-lg border border-brand-navy/5 dark:border-white/10 transition-all cursor-pointer"
                >
                  View Profile
                </button>

                {canManage && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleToggleStatus(worker.id, worker.status)}
                      className={`py-1.5 px-3 text-[9px] font-extrabold uppercase tracking-wider rounded-lg transition-all border shadow-sm cursor-pointer ${
                        worker.status === 'active' 
                          ? 'bg-amber-500/10 text-amber-500 border-amber-500/25 hover:bg-amber-500 hover:text-white' 
                          : 'bg-green-500/10 text-[#00bf63] border-green-500/25 hover:bg-green-500 hover:text-white'
                      }`}
                    >
                      {worker.status === 'active' ? 'Suspend' : 'Reinstate'}
                    </button>
                    <button
                      onClick={() => handleDeleteWorker(worker.id, worker.name)}
                      className="p-2 border border-red-500/25 text-red-500 hover:text-white hover:bg-red-500 rounded-lg transition-all cursor-pointer"
                      title="Discharge staff member"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Profile Detail Modal */}
      {selectedEmp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-brand-dark/70 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white dark:bg-brand-surface p-6 rounded-3xl border border-brand-navy/5 dark:border-white/10 shadow-2xl space-y-6 animate-scaleIn">
            <div className="flex gap-4 items-center border-b border-brand-navy/5 dark:border-white/10 pb-4">
              <div className="w-16 h-16 rounded-full overflow-hidden bg-brand-navy/5 dark:bg-white/5 border border-brand-navy/10 dark:border-white/10 shrink-0">
                <img 
                  src={selectedEmp.photo || '/default-avatar.svg'} 
                  alt={selectedEmp.name} 
                  className="w-full h-full object-cover"
                  onError={(e) => { e.target.src = '/default-avatar.svg'; }}
                />
              </div>
              <div>
                <h3 className="font-outfit font-black text-base text-brand-navy dark:text-white">{selectedEmp.name}</h3>
                <span className="text-[10px] text-brand-gold font-extrabold tracking-wider uppercase block">{selectedEmp.position}</span>
                <span className="text-[9px] text-brand-navy/50 dark:text-white/50 block font-bold uppercase">{selectedEmp.employee_id || `EMP-ID: #${selectedEmp.id}`}</span>
              </div>
            </div>

            <div className="space-y-3 text-xs text-brand-navy dark:text-white">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-[8px] font-bold text-brand-navy/40 dark:text-white/40 block uppercase">Department</span>
                  <span className="font-bold">{selectedEmp.department || 'Operations'}</span>
                </div>
                <div>
                  <span className="text-[8px] font-bold text-brand-navy/40 dark:text-white/40 block uppercase">Joined Date</span>
                  <span className="font-bold">{selectedEmp.joined_date || '2024-01-01'}</span>
                </div>
              </div>

              <div>
                <span className="text-[8px] font-bold text-brand-navy/40 dark:text-white/40 block uppercase">Contact Details</span>
                <span className="font-bold">{selectedEmp.phone} | {selectedEmp.email}</span>
              </div>

              <div>
                <span className="text-[8px] font-bold text-brand-navy/40 dark:text-white/40 block uppercase">Residential Address</span>
                <span className="font-medium text-brand-navy/85 dark:text-white/85">{selectedEmp.address || 'Abuja Site Dormitories'}</span>
              </div>

              <div>
                <span className="text-[8px] font-bold text-brand-navy/40 dark:text-white/40 block uppercase">Emergency Contact</span>
                <span className="font-bold text-brand-gold">{selectedEmp.emergency_contact || 'None Listed'}</span>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-2 border-t border-brand-navy/5 dark:border-white/10">
                <div>
                  <span className="text-[8px] font-bold text-brand-navy/40 dark:text-white/40 block uppercase">Monthly Salary</span>
                  <span className="font-black text-brand-gold">₦{selectedEmp.salary?.toLocaleString()}</span>
                </div>
                <div>
                  <span className="text-[8px] font-bold text-brand-navy/40 dark:text-white/40 block uppercase">Leave Balance</span>
                  <span className="font-bold">{selectedEmp.leave_balance || 15} days</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => setSelectedEmp(null)}
              className="w-full py-2.5 bg-brand-navy hover:bg-brand-navy-light text-white font-extrabold text-[10px] uppercase tracking-wider rounded-xl cursor-pointer block text-center"
            >
              Close Profile
            </button>
          </div>
        </div>
      )}

      {/* Creation Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-brand-dark/55 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-brand-surface border border-brand-navy/10 dark:border-white/10 w-full max-w-lg rounded-[28px] p-6 md:p-8 shadow-2xl relative animate-scaleIn max-h-[90vh] overflow-y-auto">
            
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-5 right-5 p-2 text-brand-navy/40 dark:text-white/40 hover:text-brand-navy dark:hover:text-white hover:bg-brand-navy/5 dark:hover:bg-white/5 rounded-xl transition-colors"
            >
              <X size={16} />
            </button>

            <h3 className="font-outfit font-extrabold text-base md:text-lg text-brand-navy dark:text-white mb-1 uppercase tracking-wider">
              Register Staff Member
            </h3>
            <p className="text-xs text-brand-navy/50 dark:text-white/50 mb-6 font-semibold uppercase tracking-wider">Configure employment and login parameters.</p>

            {formError && (
              <div className="mb-5 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold">
                {formError}
              </div>
            )}

            <form onSubmit={handleFormSubmit} className="space-y-4">
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[9px] font-extrabold uppercase tracking-widest text-brand-navy/50 dark:text-white/50 block ml-1">Full Legal Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="e.g. Samuel Archillery"
                    className="w-full px-4 py-2.5 rounded-xl bg-brand-beige/25 dark:bg-brand-dark border border-brand-navy/10 dark:border-white/10 text-brand-navy dark:text-white focus:outline-none focus:border-brand-gold text-xs font-semibold"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-extrabold uppercase tracking-widest text-brand-navy/50 dark:text-white/50 block ml-1">Authorized Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="samuel@archillery.com"
                    className="w-full px-4 py-2.5 rounded-xl bg-brand-beige/25 dark:bg-brand-dark border border-brand-navy/10 dark:border-white/10 text-brand-navy dark:text-white focus:outline-none focus:border-brand-gold text-xs font-semibold"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[9px] font-extrabold uppercase tracking-widest text-brand-navy/50 dark:text-white/50 block ml-1">Job Position</label>
                  <input
                    type="text"
                    name="position"
                    value={formData.position}
                    onChange={handleInputChange}
                    placeholder="e.g. Assistant Engineer"
                    className="w-full px-4 py-2.5 rounded-xl bg-brand-beige/25 dark:bg-brand-dark border border-brand-navy/10 dark:border-white/10 text-brand-navy dark:text-white focus:outline-none focus:border-brand-gold text-xs font-semibold"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-extrabold uppercase tracking-widest text-brand-navy/50 dark:text-white/50 block ml-1">Department</label>
                  <input
                    type="text"
                    name="department"
                    value={formData.department}
                    onChange={handleInputChange}
                    placeholder="e.g. Structural Engineering"
                    className="w-full px-4 py-2.5 rounded-xl bg-brand-beige/25 dark:bg-brand-dark border border-brand-navy/10 dark:border-white/10 text-brand-navy dark:text-white focus:outline-none focus:border-brand-gold text-xs font-semibold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[9px] font-extrabold uppercase tracking-widest text-brand-navy/50 dark:text-white/50 block ml-1">Contact Phone</label>
                  <input
                    type="text"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="+234 706..."
                    className="w-full px-4 py-2.5 rounded-xl bg-brand-beige/25 dark:bg-brand-dark border border-brand-navy/10 dark:border-white/10 text-brand-navy dark:text-white focus:outline-none focus:border-brand-gold text-xs font-semibold"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-extrabold uppercase tracking-widest text-brand-navy/50 dark:text-white/50 block ml-1">System Privilege Role</label>
                  <select
                    name="role"
                    value={formData.role}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 rounded-xl bg-brand-beige/25 dark:bg-brand-dark border border-brand-navy/10 dark:border-white/10 text-brand-navy dark:text-white focus:outline-none focus:border-brand-gold text-xs font-bold uppercase tracking-wider"
                  >
                    <option value="ceo">CEO</option>
                    <option value="cto">CTO</option>
                    <option value="hr">HR</option>
                    <option value="it">Head of IT</option>
                    <option value="supervisor">Supervisor</option>
                    <option value="engineer">Engineer</option>
                    <option value="worker">Worker</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[9px] font-extrabold uppercase tracking-widest text-brand-navy/50 dark:text-white/50 block ml-1">Monthly Salary (₦)</label>
                  <input
                    type="number"
                    name="salary"
                    value={formData.salary}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 rounded-xl bg-brand-beige/25 dark:bg-brand-dark border border-brand-navy/10 dark:border-white/10 text-brand-navy dark:text-white focus:outline-none focus:border-brand-gold text-xs font-semibold"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-extrabold uppercase tracking-widest text-brand-navy/50 dark:text-white/50 block ml-1">Emergency Contact</label>
                  <input
                    type="text"
                    name="emergency_contact"
                    value={formData.emergency_contact}
                    onChange={handleInputChange}
                    placeholder="Name & contact phone"
                    className="w-full px-4 py-2.5 rounded-xl bg-brand-beige/25 dark:bg-brand-dark border border-brand-navy/10 dark:border-white/10 text-brand-navy dark:text-white focus:outline-none focus:border-brand-gold text-xs font-semibold"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-extrabold uppercase tracking-widest text-brand-navy/50 dark:text-white/50 block ml-1">Residential Address</label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  placeholder="Street and house number"
                  className="w-full px-4 py-2.5 rounded-xl bg-brand-beige/25 dark:bg-brand-dark border border-brand-navy/10 dark:border-white/10 text-brand-navy dark:text-white focus:outline-none focus:border-brand-gold text-xs font-semibold"
                />
              </div>

              {/* Buttons */}
              <div className="flex justify-end gap-3 pt-6 border-t border-brand-navy/5 dark:border-white/10">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl border border-brand-navy/10 dark:border-white/10 text-brand-navy dark:text-white font-bold text-xs uppercase tracking-wider hover:bg-brand-beige/20 dark:hover:bg-white/5 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formLoading}
                  className="px-5 py-2.5 rounded-xl bg-brand-navy text-white hover:bg-brand-navy-light font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer"
                >
                  {formLoading ? 'Enrolling...' : 'Enroll Operator'}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
}
