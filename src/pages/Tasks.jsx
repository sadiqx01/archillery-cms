import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { 
  CheckSquare, 
  Plus, 
  Calendar, 
  User as UserIcon, 
  Briefcase, 
  AlertCircle, 
  ChevronRight, 
  Clock, 
  ArrowLeftRight,
  Trash2,
  X
} from 'lucide-react';

export default function Tasks() {
  const { user, isAdmin, isSupervisor } = useAuth();
  
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState('');
  const [formData, setFormData] = useState({
    project_id: '',
    title: '',
    description: '',
    worker_id: '',
    priority: 'medium',
    due_date: ''
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [taskRes, projRes, workerRes] = await Promise.all([
        axios.get('/api/tasks'),
        user.role !== 'worker' ? axios.get('/api/projects') : Promise.resolve({ data: [] }),
        user.role !== 'worker' ? axios.get('/api/workers') : Promise.resolve({ data: [] })
      ]);

      setTasks(taskRes.data);
      if (user.role !== 'worker') {
        setProjects(projRes.data);
        setWorkers(workerRes.data);
      }
    } catch (err) {
      console.error(err);
      alert('Failed to retrieve task data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenCreateModal = () => {
    setFormData({
      project_id: projects[0]?.id || '',
      title: '',
      description: '',
      worker_id: workers[0]?.id || '',
      priority: 'medium',
      due_date: ''
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
    if (!formData.project_id || !formData.title || !formData.worker_id || !formData.due_date) {
      setFormError('Please fill in all required coordinates.');
      return;
    }

    setFormLoading(true);
    setFormError('');

    try {
      await axios.post('/api/tasks', formData);
      setIsModalOpen(false);
      fetchData();
    } catch (err) {
      setFormError(err.response?.data?.message || 'Error scheduling task allocation');
    } finally {
      setFormLoading(false);
    }
  };

  const handleAdvanceStatus = async (taskId, currentStatus) => {
    const nextStatus = currentStatus === 'pending' ? 'in_progress' : 'completed';
    try {
      await axios.patch(`/api/tasks/${taskId}/status`, { status: nextStatus });
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update task status');
    }
  };

  const handleRevertStatus = async (taskId, currentStatus) => {
    const prevStatus = currentStatus === 'completed' ? 'in_progress' : 'pending';
    try {
      await axios.patch(`/api/tasks/${taskId}/status`, { status: prevStatus });
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to revert task status');
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm('Delete this task assignment permanently?')) {
      return;
    }
    try {
      await axios.delete(`/api/tasks/${taskId}`);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete task');
    }
  };

  // Group tasks by status for Kanban Board
  const getTasksByStatus = (status) => {
    return tasks.filter(t => t.status === status);
  };

  const getPriorityBadgeClass = (priority) => {
    const base = 'text-[9px] font-extrabold uppercase px-2 py-0.5 rounded border ';
    switch (priority) {
      case 'high': return base + 'bg-red-50 text-red-600 border-red-200';
      case 'medium': return base + 'bg-amber-50 text-amber-600 border-amber-200';
      case 'low': return base + 'bg-blue-50 text-blue-600 border-blue-200';
      default: return base + 'bg-gray-50 text-gray-500 border-gray-200';
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn grid-bg min-h-screen pb-16">
      
      {/* Header Panel */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-0.5">
          <h2 className="text-xl font-bold font-outfit text-brand-navy dark:text-white uppercase tracking-wider">Task Allocation Board</h2>
          <p className="text-xs text-brand-navy/50 dark:text-white/50 font-semibold uppercase tracking-wider">Assign work coordinates and audit worker checkpoints.</p>
        </div>

        {(isAdmin || isSupervisor) && (
          <button
            onClick={handleOpenCreateModal}
            className="inline-flex items-center gap-1.5 px-5 py-3.5 rounded-2xl bg-brand-navy hover:bg-brand-navy-light text-white font-extrabold text-xs uppercase tracking-wider shadow-md transition-colors"
          >
            <Plus size={16} />
            Assign New Task
          </button>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-8 h-8 border-4 border-brand-navy border-t-brand-gold rounded-full animate-spin"></div>
        </div>
      ) : (
        /* Kanban Columns Grid */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          
          {/* Column 1: Pending */}
          <div className="bg-brand-beige dark:bg-brand-dark border border-brand-navy/5 dark:border-white/10 rounded-[28px] p-5 shadow-sm space-y-4 min-h-[50vh]">
            <div className="flex items-center justify-between border-b border-brand-navy/5 dark:border-white/10 pb-3">
              <span className="text-xs font-extrabold text-brand-navy dark:text-white uppercase tracking-wider">Pending Assignment</span>
              <span className="text-[10px] font-bold bg-gray-200 dark:bg-white/10 text-brand-navy dark:text-white px-2 py-0.5 rounded-full">
                {getTasksByStatus('pending').length}
              </span>
            </div>
            
            <div className="space-y-4">
              {getTasksByStatus('pending').map(task => (
                <div key={task.id} className="bg-white dark:bg-brand-surface border border-brand-navy/5 dark:border-white/10 p-5 rounded-2xl shadow-sm hover:shadow-md transition-all group relative overflow-hidden">
                  <div className="absolute top-0 left-0 h-full w-[4px] bg-brand-gold" />
                  
                  <div className="space-y-3 pl-2">
                    <div className="flex justify-between items-start gap-2">
                      <span className="text-[9px] font-extrabold text-brand-navy/40 dark:text-white/40 uppercase tracking-widest">{task.project_name}</span>
                      <span className={getPriorityBadgeClass(task.priority)}>{task.priority}</span>
                    </div>

                    <h4 className="font-bold text-brand-navy dark:text-white text-sm group-hover:text-brand-gold transition-colors">{task.title}</h4>
                    <p className="text-xs text-brand-navy/60 dark:text-white/60 leading-relaxed line-clamp-2">{task.description}</p>
                    
                    <div className="flex flex-wrap gap-2 text-[10px] text-brand-navy/50 dark:text-white/50 font-bold uppercase tracking-wider pt-1 border-t border-brand-navy/5 dark:border-white/10 mt-2">
                      <span className="flex items-center gap-1.5"><UserIcon size={12} /> {task.worker_name}</span>
                      <span className="flex items-center gap-1.5"><Clock size={12} /> Due {new Date(task.due_date).toLocaleDateString()}</span>
                    </div>

                    {/* Transition Actions */}
                    <div className="flex justify-between items-center pt-3 border-t border-brand-navy/5 dark:border-white/10 mt-3 no-print">
                      <button
                        onClick={() => handleAdvanceStatus(task.id, task.status)}
                        className="text-[9px] font-extrabold text-brand-navy dark:text-white uppercase tracking-wider flex items-center gap-1 hover:text-brand-gold"
                      >
                        Start Task
                        <ChevronRight size={13} />
                      </button>
                      {(isAdmin || isSupervisor) && (
                        <button
                          onClick={() => handleDeleteTask(task.id)}
                          className="text-red-400 hover:text-red-600 p-1"
                        >
                          <Trash2 size={12} />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              {getTasksByStatus('pending').length === 0 && (
                <p className="text-center py-10 text-xs text-brand-navy/30 dark:text-white/30 font-bold uppercase">No pending tasks</p>
              )}
            </div>
          </div>

          {/* Column 2: In Progress */}
          <div className="bg-brand-beige dark:bg-brand-dark border border-brand-navy/5 dark:border-white/10 rounded-[28px] p-5 shadow-sm space-y-4 min-h-[50vh]">
            <div className="flex items-center justify-between border-b border-brand-navy/5 dark:border-white/10 pb-3">
              <span className="text-xs font-extrabold text-brand-navy dark:text-white uppercase tracking-wider">Active In Progress</span>
              <span className="text-[10px] font-bold bg-brand-gold/20 text-brand-navy dark:text-white px-2 py-0.5 rounded-full">
                {getTasksByStatus('in_progress').length}
              </span>
            </div>

            <div className="space-y-4">
              {getTasksByStatus('in_progress').map(task => (
                <div key={task.id} className="bg-white dark:bg-brand-surface border border-brand-navy/5 dark:border-white/10 p-5 rounded-2xl shadow-sm hover:shadow-md transition-all group relative overflow-hidden">
                  <div className="absolute top-0 left-0 h-full w-[4px] bg-brand-navy" />

                  <div className="space-y-3 pl-2">
                    <div className="flex justify-between items-start gap-2">
                      <span className="text-[9px] font-extrabold text-brand-navy/40 dark:text-white/40 uppercase tracking-widest">{task.project_name}</span>
                      <span className={getPriorityBadgeClass(task.priority)}>{task.priority}</span>
                    </div>

                    <h4 className="font-bold text-brand-navy dark:text-white text-sm group-hover:text-brand-navy dark:group-hover:text-white transition-colors">{task.title}</h4>
                    <p className="text-xs text-brand-navy/60 dark:text-white/60 leading-relaxed line-clamp-2">{task.description}</p>
                    
                    <div className="flex flex-wrap gap-2 text-[10px] text-brand-navy/50 dark:text-white/50 font-bold uppercase tracking-wider pt-1 border-t border-brand-navy/5 dark:border-white/10 mt-2">
                      <span className="flex items-center gap-1.5"><UserIcon size={12} /> {task.worker_name}</span>
                      <span className="flex items-center gap-1.5"><Clock size={12} /> Due {new Date(task.due_date).toLocaleDateString()}</span>
                    </div>

                    {/* Transition Actions */}
                    <div className="flex justify-between items-center pt-3 border-t border-brand-navy/5 dark:border-white/10 mt-3 no-print">
                      <button
                        onClick={() => handleRevertStatus(task.id, task.status)}
                        className="text-[9px] font-bold text-brand-navy/45 dark:text-white/45 hover:text-brand-navy dark:hover:text-white uppercase tracking-wider"
                      >
                        Revert
                      </button>
                      <button
                        onClick={() => handleAdvanceStatus(task.id, task.status)}
                        className="text-[9px] font-extrabold text-brand-navy dark:text-white uppercase tracking-wider flex items-center gap-1 hover:text-brand-gold"
                      >
                        Complete
                        <ChevronRight size={13} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              {getTasksByStatus('in_progress').length === 0 && (
                <p className="text-center py-10 text-xs text-brand-navy/30 dark:text-white/30 font-bold uppercase">No active tasks</p>
              )}
            </div>
          </div>

          {/* Column 3: Completed */}
          <div className="bg-brand-beige dark:bg-brand-dark border border-brand-navy/5 dark:border-white/10 rounded-[28px] p-5 shadow-sm space-y-4 min-h-[50vh]">
            <div className="flex items-center justify-between border-b border-brand-navy/5 dark:border-white/10 pb-3">
              <span className="text-xs font-extrabold text-brand-navy dark:text-white uppercase tracking-wider">Completed Assignments</span>
              <span className="text-[10px] font-bold bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                {getTasksByStatus('completed').length}
              </span>
            </div>

            <div className="space-y-4">
              {getTasksByStatus('completed').map(task => (
                <div key={task.id} className="bg-white dark:bg-brand-surface border border-brand-navy/5 dark:border-white/10 p-5 rounded-2xl shadow-sm hover:shadow-md transition-all group relative overflow-hidden opacity-80">
                  <div className="absolute top-0 left-0 h-full w-[4px] bg-green-500" />

                  <div className="space-y-3 pl-2">
                    <div className="flex justify-between items-start gap-2">
                      <span className="text-[9px] font-extrabold text-brand-navy/40 dark:text-white/40 uppercase tracking-widest">{task.project_name}</span>
                      <span className={getPriorityBadgeClass(task.priority)}>{task.priority}</span>
                    </div>

                    <h4 className="font-bold text-brand-navy dark:text-white text-sm line-through decoration-brand-navy/30 dark:decoration-white/30">{task.title}</h4>
                    <p className="text-xs text-brand-navy/50 dark:text-white/50 leading-relaxed line-clamp-2">{task.description}</p>
                    
                    <div className="flex flex-wrap gap-2 text-[10px] text-brand-navy/40 dark:text-white/40 font-bold uppercase tracking-wider pt-1 border-t border-brand-navy/5 dark:border-white/10 mt-2">
                      <span className="flex items-center gap-1.5"><UserIcon size={12} /> {task.worker_name}</span>
                      <span className="flex items-center gap-1.5"><Clock size={12} /> Completed</span>
                    </div>

                    {/* Transition Actions */}
                    <div className="flex justify-start pt-3 border-t border-brand-navy/5 dark:border-white/10 mt-3 no-print">
                      <button
                        onClick={() => handleRevertStatus(task.id, task.status)}
                        className="text-[9px] font-bold text-brand-navy/45 dark:text-white/45 hover:text-brand-navy dark:hover:text-white uppercase tracking-wider"
                      >
                        Reopen Task
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              {getTasksByStatus('completed').length === 0 && (
                <p className="text-center py-10 text-xs text-brand-navy/30 dark:text-white/30 font-bold uppercase">No completed tasks</p>
              )}
            </div>
          </div>

        </div>
      )}

      {/* Creation Modal */}
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
              Assign Task Allocation
            </h3>
            <p className="text-xs text-brand-navy/50 dark:text-white/50 mb-6 font-semibold uppercase tracking-wider">Dispatch a site assignment coordinates directly to a worker.</p>

            {formError && (
              <div className="mb-5 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold">
                {formError}
              </div>
            )}

            <form onSubmit={handleFormSubmit} className="space-y-4">
              
              {/* Project Coordinates */}
              <div className="space-y-1">
                <label className="text-[9px] font-extrabold uppercase tracking-widest text-brand-navy/50 dark:text-white/50 block ml-1">Project Site Coordinates</label>
                <select
                  name="project_id"
                  value={formData.project_id}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 rounded-xl border border-brand-navy/10 dark:border-white/10 focus:outline-none focus:border-brand-gold text-xs font-bold text-brand-navy dark:text-white dark:bg-brand-dark uppercase tracking-wider"
                  required
                >
                  <option value="" disabled>Select project site...</option>
                  {projects.map(proj => (
                    <option key={proj.id} value={proj.id}>{proj.name}</option>
                  ))}
                </select>
              </div>

              {/* Task Title */}
              <div className="space-y-1">
                <label className="text-[9px] font-extrabold uppercase tracking-widest text-brand-navy/50 dark:text-white/50 block ml-1">Task Title</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="e.g. Scaffolding Inspection Block B"
                  className="w-full px-4 py-2.5 rounded-xl border border-brand-navy/10 dark:border-white/10 focus:outline-none focus:border-brand-gold text-xs font-medium dark:bg-brand-dark dark:text-white"
                  required
                />
              </div>

              {/* Description */}
              <div className="space-y-1">
                <label className="text-[9px] font-extrabold uppercase tracking-widest text-brand-navy/50 dark:text-white/50 block ml-1">Task Details</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows="3"
                  placeholder="Task parameters, safety codes, and expectations..."
                  className="w-full px-4 py-2.5 rounded-xl border border-brand-navy/10 dark:border-white/10 focus:outline-none focus:border-brand-gold text-xs font-medium dark:bg-brand-dark dark:text-white"
                />
              </div>

              {/* Assign to Worker */}
              <div className="space-y-1">
                <label className="text-[9px] font-extrabold uppercase tracking-widest text-brand-navy/50 dark:text-white/50 block ml-1">Assign Operator</label>
                <select
                  name="worker_id"
                  value={formData.worker_id}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 rounded-xl border border-brand-navy/10 dark:border-white/10 focus:outline-none focus:border-brand-gold text-xs font-bold text-brand-navy dark:text-white dark:bg-brand-dark uppercase tracking-wider"
                  required
                >
                  <option value="" disabled>Select site worker...</option>
                  {workers.map(w => (
                    <option key={w.id} value={w.id}>{w.name} ({w.email})</option>
                  ))}
                </select>
              </div>

              {/* Priority and Due Date */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[9px] font-extrabold uppercase tracking-widest text-brand-navy/50 dark:text-white/50 block ml-1">Priority Coordinates</label>
                  <select
                    name="priority"
                    value={formData.priority}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 rounded-xl border border-brand-navy/10 dark:border-white/10 focus:outline-none focus:border-brand-gold text-xs font-bold text-brand-navy dark:text-white dark:bg-brand-dark uppercase tracking-wider"
                  >
                    <option value="low">Low Priority</option>
                    <option value="medium">Medium Priority</option>
                    <option value="high">High Priority</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-extrabold uppercase tracking-widest text-brand-navy/50 dark:text-white/50 block ml-1">Target Due Date</label>
                  <input
                    type="date"
                    name="due_date"
                    value={formData.due_date}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 rounded-xl border border-brand-navy/10 dark:border-white/10 focus:outline-none focus:border-brand-gold text-xs font-medium text-brand-navy dark:text-white dark:bg-brand-dark"
                    required
                  />
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
                  {formLoading ? 'Allocating...' : 'Schedule Task'}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
}
