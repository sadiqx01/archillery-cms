import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { 
  Briefcase, 
  MapPin, 
  User as UserIcon, 
  Calendar, 
  DollarSign, 
  Plus, 
  Edit2, 
  Trash2, 
  Search,
  Filter,
  X,
  ChevronRight
} from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Projects() {
  const { isAdmin } = useAuth();
  const [projects, setProjects] = useState([]);
  const [filteredProjects, setFilteredProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Search / Filter
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    location: '',
    client_name: '',
    start_date: '',
    end_date: '',
    budget: '',
    status: 'planning'
  });

  const [formError, setFormError] = useState('');
  const [formLoading, setFormLoading] = useState(false);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/api/projects');
      setProjects(res.data);
      setFilteredProjects(res.data);
    } catch (err) {
      console.error(err);
      alert('Failed to retrieve projects list');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  // Handle Search and Filter
  useEffect(() => {
    let result = projects;

    if (searchTerm) {
      result = result.filter(proj => 
        proj.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        proj.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
        proj.client_name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      result = result.filter(proj => proj.status === statusFilter);
    }

    setFilteredProjects(result);
  }, [searchTerm, statusFilter, projects]);

  const handleOpenCreateModal = () => {
    setEditId(null);
    setFormData({
      name: '',
      description: '',
      location: '',
      client_name: '',
      start_date: '',
      end_date: '',
      budget: '',
      status: 'planning'
    });
    setFormError('');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (e, project) => {
    e.preventDefault();
    setEditId(project.id);
    setFormData({
      name: project.name,
      description: project.description || '',
      location: project.location || '',
      client_name: project.client_name || '',
      start_date: project.start_date ? project.start_date.split('T')[0] : '',
      end_date: project.end_date ? project.end_date.split('T')[0] : '',
      budget: project.budget || '',
      status: project.status
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
    if (!formData.name) {
      setFormError('Project title is required.');
      return;
    }

    setFormLoading(true);
    setFormError('');

    try {
      if (editId) {
        await axios.put(`/api/projects/${editId}`, formData);
      } else {
        await axios.post('/api/projects', formData);
      }
      setIsModalOpen(false);
      fetchProjects();
    } catch (err) {
      setFormError(err.response?.data?.message || 'Error occurred while saving project details.');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteProject = async (e, id, name) => {
    e.preventDefault();
    if (!window.confirm(`Permanently delete the project: "${name}"? This deletes all associated tasks and updates.`)) {
      return;
    }

    try {
      await axios.delete(`/api/projects/${id}`);
      fetchProjects();
    } catch (err) {
      alert(err.response?.data?.message || 'Delete operation failed');
    }
  };

  const getStatusBadgeClass = (status) => {
    const base = 'text-[9px] font-extrabold uppercase px-3 py-1 rounded-full border ';
    switch (status) {
      case 'active': return base + 'bg-green-50 text-green-700 border-green-200';
      case 'planning': return base + 'bg-brand-gold/15 text-brand-navy border-brand-gold/25';
      case 'completed': return base + 'bg-blue-50 text-blue-700 border-blue-200';
      case 'on_hold': return base + 'bg-red-50 text-red-700 border-red-200';
      default: return base + 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn grid-bg min-h-screen pb-16">
      
      {/* Header Panel */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-0.5">
          <h2 className="text-xl font-bold font-outfit text-brand-navy dark:text-white uppercase tracking-wider">Project Registry</h2>
          <p className="text-xs text-brand-navy/50 dark:text-white/50 font-semibold uppercase tracking-wider">Initialize and track active site coordinates.</p>
        </div>
        <button
          onClick={handleOpenCreateModal}
          className="inline-flex items-center gap-1.5 px-5 py-3.5 rounded-2xl bg-brand-navy hover:bg-brand-navy-light text-white font-extrabold text-xs uppercase tracking-wider shadow-md transition-colors"
        >
          <Plus size={16} />
          Create New Project
        </button>
      </div>

      {/* Filter and Search Bar Row */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 bg-white dark:bg-brand-surface border border-brand-navy/5 dark:border-white/10 rounded-[20px] shadow-sm">
        
        {/* Search Input */}
        <div className="relative flex-1">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-navy/40 dark:text-white/40" />
          <input
            type="text"
            placeholder="Search project title, client name, location..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-11 pr-4 py-2.5 rounded-xl bg-brand-beige/40 dark:bg-brand-dark border border-brand-navy/10 dark:border-white/10 focus:outline-none focus:border-brand-gold text-xs font-semibold dark:text-white"
          />
        </div>

        {/* Filter Dropdown */}
        <div className="flex items-center gap-2.5">
          <Filter size={14} className="text-brand-navy/40 dark:text-white/40" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2.5 rounded-xl bg-brand-beige/40 dark:bg-brand-dark border border-brand-navy/10 dark:border-white/10 focus:outline-none focus:border-brand-gold text-xs font-bold text-brand-navy dark:text-white uppercase tracking-wider"
          >
            <option value="all">All Statuses</option>
            <option value="planning">Planning</option>
            <option value="active">Active Sites</option>
            <option value="completed">Completed</option>
            <option value="on_hold">On Hold</option>
          </select>
        </div>

      </div>

      {/* Projects Grid */}
      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-8 h-8 border-4 border-brand-navy dark:border-white border-t-brand-gold rounded-full animate-spin"></div>
        </div>
      ) : filteredProjects.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-brand-surface border border-brand-navy/5 dark:border-white/10 rounded-3xl shadow-sm">
          <Briefcase className="mx-auto mb-3 text-brand-navy/20 dark:text-white/20 animate-pulse" size={36} />
          <h3 className="font-bold text-brand-navy dark:text-white">No Project Records</h3>
          <p className="text-xs text-brand-navy/50 dark:text-white/50 mt-1">Try modifying search inputs or register a new project.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project) => (
            <Link 
              key={project.id}
              to={`/projects/${project.id}`}
              className="bg-white dark:bg-brand-surface border border-brand-navy/5 dark:border-white/10 rounded-[28px] p-6 shadow-sm hover:shadow-xl hover:scale-[1.01] hover:-translate-y-0.5 transition-all duration-300 flex flex-col justify-between group relative overflow-hidden"
            >
              {/* Running Gold accent top border */}
              <div className="absolute top-0 left-0 h-[4px] bg-brand-gold w-0 group-hover:w-full transition-all duration-500 ease-out z-20" />
              
              {project.cover_image && (
                <div className="h-40 w-full overflow-hidden rounded-2xl mb-2 relative z-10 border border-brand-navy/5 dark:border-white/10">
                  <img src={project.cover_image} alt={project.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                </div>
              )}
              
              <div className="space-y-4">
                {/* Status and Actions */}
                <div className="flex items-center justify-between gap-2 border-b border-brand-navy/5 dark:border-white/10 pb-3">
                  <span className={getStatusBadgeClass(project.status)}>
                    {project.status.replace('_', ' ')}
                  </span>
                  <div className="flex items-center gap-1.5 no-print">
                    <button
                      onClick={(e) => handleOpenEditModal(e, project)}
                      className="p-1.5 text-brand-navy/40 dark:text-white/40 hover:text-brand-navy dark:hover:text-white hover:bg-brand-navy/5 dark:hover:bg-white/5 rounded-lg transition-all"
                      title="Edit project details"
                    >
                      <Edit2 size={12} />
                    </button>
                    {isAdmin && (
                      <button
                        onClick={(e) => handleDeleteProject(e, project.id, project.name)}
                        className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                        title="Delete project"
                      >
                        <Trash2 size={12} />
                      </button>
                    )}
                  </div>
                </div>

                <div className="space-y-1">
                  <h3 className="font-outfit font-extrabold text-base md:text-lg text-brand-navy dark:text-white group-hover:text-brand-gold transition-colors line-clamp-1">
                    {project.name}
                  </h3>
                  <p className="text-xs text-brand-navy/60 dark:text-white/60 line-clamp-2 leading-relaxed font-medium">
                    {project.description || 'No description supplied.'}
                  </p>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-brand-navy/5 dark:border-white/10 space-y-2 text-xs text-brand-navy/70 dark:text-white/70 font-semibold">
                {/* Coordinates details */}
                <div className="flex items-center gap-2">
                  <MapPin size={13} className="text-brand-gold shrink-0" />
                  <span className="truncate">{project.location || 'Not Specified'}</span>
                </div>

                <div className="flex items-center gap-2">
                  <UserIcon size={13} className="text-brand-gold shrink-0" />
                  <span className="truncate">{project.client_name || 'Generic Client'}</span>
                </div>

                <div className="flex items-center gap-2">
                  <DollarSign size={13} className="text-brand-gold shrink-0" />
                  <span>₦{Number(project.budget || 0).toLocaleString()}</span>
                </div>

                <div className="flex items-center gap-2">
                  <Calendar size={13} className="text-brand-gold shrink-0" />
                  <span className="text-[10px] text-brand-navy/60 dark:text-white/60 font-medium">
                    {project.start_date ? new Date(project.start_date).toLocaleDateString() : 'N/A'} - {project.end_date ? new Date(project.end_date).toLocaleDateString() : 'N/A'}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Creation/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-brand-dark/55 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-brand-surface border border-brand-navy/10 dark:border-white/10 w-full max-w-xl rounded-[28px] p-6 md:p-8 shadow-2xl relative animate-scaleIn max-h-[90vh] overflow-y-auto">
            
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-5 right-5 p-2 text-brand-navy/40 dark:text-white/40 hover:text-brand-navy dark:hover:text-white hover:bg-brand-navy/5 dark:hover:bg-white/5 rounded-xl transition-colors"
            >
              <X size={16} />
            </button>

            <h3 className="font-outfit font-extrabold text-base md:text-lg text-brand-navy dark:text-white mb-1 uppercase tracking-wider">
              {editId ? 'Edit Project Coordinates' : 'Register New Project'}
            </h3>
            <p className="text-xs text-brand-navy/50 dark:text-white/50 mb-6 font-semibold uppercase tracking-wider">Ensure budgeting coordinates are validated.</p>

            {formError && (
              <div className="mb-5 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold">
                {formError}
              </div>
            )}

            <form onSubmit={handleFormSubmit} className="space-y-4">
              
              {/* Project Name */}
              <div className="space-y-1">
                <label className="text-[9px] font-extrabold uppercase tracking-widest text-brand-navy/50 dark:text-white/50 block ml-1">Project Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="e.g. Archillery Luxury Villa A1"
                  className="w-full px-4 py-2.5 rounded-xl border border-brand-navy/10 dark:border-white/10 focus:outline-none focus:border-brand-gold text-xs font-medium dark:bg-brand-dark dark:text-white"
                  required
                />
              </div>

              {/* Description */}
              <div className="space-y-1">
                <label className="text-[9px] font-extrabold uppercase tracking-widest text-brand-navy/50 dark:text-white/50 block ml-1">Scope Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows="3"
                  placeholder="Concrete specifications, floor layouts, foundation structures..."
                  className="w-full px-4 py-2.5 rounded-xl border border-brand-navy/10 dark:border-white/10 focus:outline-none focus:border-brand-gold text-xs font-medium dark:bg-brand-dark dark:text-white"
                />
              </div>

              {/* Location and Client */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[9px] font-extrabold uppercase tracking-widest text-brand-navy/50 dark:text-white/50 block ml-1">Site Location</label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    placeholder="e.g. Abuja, FCT"
                    className="w-full px-4 py-2.5 rounded-xl border border-brand-navy/10 dark:border-white/10 focus:outline-none focus:border-brand-gold text-xs font-medium dark:bg-brand-dark dark:text-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-extrabold uppercase tracking-widest text-brand-navy/50 dark:text-white/50 block ml-1">Client Name</label>
                  <input
                    type="text"
                    name="client_name"
                    value={formData.client_name}
                    onChange={handleInputChange}
                    placeholder="e.g. Alhaji Ibrahim"
                    className="w-full px-4 py-2.5 rounded-xl border border-brand-navy/10 dark:border-white/10 focus:outline-none focus:border-brand-gold text-xs font-medium dark:bg-brand-dark dark:text-white"
                  />
                </div>
              </div>

              {/* Dates */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[9px] font-extrabold uppercase tracking-widest text-brand-navy/50 dark:text-white/50 block ml-1">Commence Date</label>
                  <input
                    type="date"
                    name="start_date"
                    value={formData.start_date}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 rounded-xl border border-brand-navy/10 dark:border-white/10 focus:outline-none focus:border-brand-gold text-xs font-medium text-brand-navy dark:text-white dark:bg-brand-dark"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-extrabold uppercase tracking-widest text-brand-navy/50 dark:text-white/50 block ml-1">Target Delivery</label>
                  <input
                    type="date"
                    name="end_date"
                    value={formData.end_date}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 rounded-xl border border-brand-navy/10 dark:border-white/10 focus:outline-none focus:border-brand-gold text-xs font-medium text-brand-navy dark:text-white dark:bg-brand-dark"
                  />
                </div>
              </div>

              {/* Budget and Status */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[9px] font-extrabold uppercase tracking-widest text-brand-navy/50 dark:text-white/50 block ml-1">Budget (₦)</label>
                  <input
                    type="number"
                    name="budget"
                    value={formData.budget}
                    onChange={handleInputChange}
                    placeholder="e.g. 150000"
                    className="w-full px-4 py-2.5 rounded-xl border border-brand-navy/10 dark:border-white/10 focus:outline-none focus:border-brand-gold text-xs font-medium dark:bg-brand-dark dark:text-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-extrabold uppercase tracking-widest text-brand-navy/50 dark:text-white/50 block ml-1">Workflow Status</label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 rounded-xl border border-brand-navy/10 dark:border-white/10 focus:outline-none focus:border-brand-gold text-xs font-bold text-brand-navy dark:text-white dark:bg-brand-dark uppercase tracking-wider"
                  >
                    <option value="planning">Planning</option>
                    <option value="active">Active Site</option>
                    <option value="completed">Completed</option>
                    <option value="on_hold">On Hold</option>
                  </select>
                </div>
              </div>

              {/* Buttons */}
              <div className="flex justify-end gap-3 pt-6 border-t border-brand-navy/5 dark:border-white/10">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl border border-brand-navy/10 dark:border-white/10 text-brand-navy dark:text-white font-bold text-xs uppercase tracking-wider hover:bg-brand-beige dark:hover:bg-brand-dark"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formLoading}
                  className="px-5 py-2.5 rounded-xl bg-brand-navy text-white hover:bg-brand-navy-light font-bold text-xs uppercase tracking-wider transition-colors"
                >
                  {formLoading ? 'Saving...' : editId ? 'Save Changes' : 'Register Project'}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
}
