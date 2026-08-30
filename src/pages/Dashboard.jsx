import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { HardHat, AlertTriangle } from 'lucide-react';

// Modular Dashboard Views
import CeoDashboard from '../components/dashboard/CeoDashboard';
import CtoDashboard from '../components/dashboard/CtoDashboard';
import HrDashboard from '../components/dashboard/HrDashboard';
import ItDashboard from '../components/dashboard/ItDashboard';
import SupervisorDashboard from '../components/dashboard/SupervisorDashboard';
import EngineerDashboard from '../components/dashboard/EngineerDashboard';
import WorkerDashboard from '../components/dashboard/WorkerDashboard';

export default function Dashboard() {
  const { user, isCeo, isCto, isHr, isIt, isSupervisor, isEngineer, isWorker } = useAuth();
  
  // Dashboard overall states
  const [stats, setStats] = useState(null);
  const [projects, setProjects] = useState([]);
  const [requisitions, setRequisitions] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [leaves, setLeaves] = useState([]);
  const [vacancies, setVacancies] = useState([]);
  const [interviews, setInterviews] = useState([]);
  
  const [myTasks, setMyTasks] = useState([]);
  const [myAttendance, setMyAttendance] = useState([]);
  const [attendanceToday, setAttendanceToday] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  // Comments mapping state
  const [ceoComments, setCeoComments] = useState({});
  const [ctoComments, setCtoComments] = useState({});

  // HR Tab Control
  const [activeHrTab, setActiveHrTab] = useState('employees');
  
  // HR Form states
  const [showAddEmpModal, setShowAddEmpModal] = useState(false);
  const [selectedEmp, setSelectedEmp] = useState(null);
  const [empForm, setEmpForm] = useState({
    name: '', email: '', phone: '', role: 'worker', position: 'Laborer',
    department: 'Site Labor', address: '', emergency_contact: '', salary: 150000, joined_date: ''
  });
  
  const [showAddVacModal, setShowAddVacModal] = useState(false);
  const [vacForm, setVacForm] = useState({ title: '', department: '' });
  
  const [showAddIntModal, setShowAddIntModal] = useState(false);
  const [intForm, setIntForm] = useState({ candidate_name: '', vacancy_title: '', date: '' });
  
  const [perfForm, setPerfForm] = useState({ user_id: '', type: 'commendation', notes: '' });

  // IT Form states
  const [showAddProjModal, setShowAddProjModal] = useState(false);
  const [projForm, setProjForm] = useState({
    name: '', description: '', location: '', client_name: '', start_date: '', end_date: '', budget: 150000.00
  });
  const [itUserRoles, setItUserRoles] = useState({});

  // Supervisor Form states
  const [weatherAM, setWeatherAM] = useState('');
  const [weatherPM, setWeatherPM] = useState('');
  const [showReqModal, setShowReqModal] = useState(false);
  const [reqForm, setReqForm] = useState({
    project_id: '', requisition_type: 'material', item_name: '', estimated_cost: '', quantity: 1, remarks: ''
  });
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportForm, setReportForm] = useState({
    project_id: '', weather_am: '', weather_pm: '',
    masons: 0, steel_fixers: 0, plumbers: 0, concrete_mix: 0, tower_crane: 0, materials: '', log_date: ''
  });

  // Engineer Form states
  const [showInspectionModal, setShowInspectionModal] = useState(false);
  const [inspectForm, setInspectForm] = useState({ project_id: '', description: '', defect_type: 'Structural Slab' });
  const [showSlumpModal, setShowSlumpModal] = useState(false);
  const [slumpForm, setSlumpForm] = useState({ project_id: '', value: '', status: 'Passed' });

  // Worker Clock notes
  const [clockInNotes, setClockInNotes] = useState('');

  // ==========================================
  // DATA FETCHING
  // ==========================================
  const fetchDashboardData = async () => {
    if (!user) return;
    try {
      setLoading(true);
      setError('');

      if (!isWorker) {
        const statsRes = await axios.get('/api/projects/dashboard/stats');
        setStats(statsRes.data);
      }

      if (['ceo', 'cto', 'it', 'supervisor', 'engineer'].includes(user.role)) {
        const projRes = await axios.get('/api/projects');
        setProjects(projRes.data);
        const reqRes = await axios.get('/api/procurement/requisitions');
        setRequisitions(reqRes.data);
      }

      if (['hr', 'it', 'ceo'].includes(user.role)) {
        const empRes = await axios.get('/api/workers');
        setEmployees(empRes.data);
      }

      if (isHr) {
        const leaveRes = await axios.get('/api/hr/leaves');
        setLeaves(leaveRes.data);
        const vacRes = await axios.get('/api/hr/vacancies');
        setVacancies(vacRes.data);
        const intRes = await axios.get('/api/hr/interviews');
        setInterviews(intRes.data);
      }

      if (isWorker || isSupervisor || isEngineer) {
        const taskRes = await axios.get('/api/tasks');
        setMyTasks(taskRes.data);
        const attRes = await axios.get('/api/attendance/my');
        setMyAttendance(attRes.data);
        const todayStr = new Date().toISOString().split('T')[0];
        const todayRecord = attRes.data.find(rec => rec.date.startsWith(todayStr));
        setAttendanceToday(todayRecord || null);
      }
    } catch (err) {
      console.error(err);
      setError('Failed to fetch dashboard telemetry metrics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [user]);

  // ==========================================
  // ACTION HANDLERS
  // ==========================================

  // Attendance Clock actions
  const handleClockIn = async () => {
    setActionLoading(true);
    try {
      await axios.post('/api/attendance/check-in', { notes: clockInNotes || 'Check in' });
      setClockInNotes('');
      await fetchDashboardData();
    } catch (err) {
      alert(err.response?.data?.message || 'Check-in failed');
    } finally {
      setActionLoading(false);
    }
  };

  const handleClockOut = async () => {
    setActionLoading(true);
    try {
      await axios.post('/api/attendance/check-out');
      await fetchDashboardData();
    } catch (err) {
      alert(err.response?.data?.message || 'Check-out failed');
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdateTaskStatus = async (taskId, currentStatus) => {
    const nextStatus = currentStatus === 'pending' ? 'in_progress' : 'completed';
    try {
      await axios.patch(`/api/tasks/${taskId}/status`, { status: nextStatus });
      await fetchDashboardData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update task status');
    }
  };

  // CEO Requisition Actions
  const handleCeoApproveReq = async (reqId, approve) => {
    const comments = ceoComments[reqId] || '';
    setActionLoading(true);
    try {
      await axios.patch(`/api/procurement/requisitions/${reqId}/approve`, { approve, comments });
      alert(approve ? 'Requisition approved successfully!' : 'Requisition rejected.');
      await fetchDashboardData();
    } catch (err) {
      alert('Failed to authorize requisition');
    } finally {
      setActionLoading(false);
    }
  };

  // CTO Requisition Action
  const handleCtoRecommendReq = async (reqId, recommend) => {
    const comments = ctoComments[reqId] || '';
    setActionLoading(true);
    try {
      await axios.patch(`/api/procurement/requisitions/${reqId}/recommend`, { recommend, comments });
      alert(recommend ? 'Approval recommendation submitted to CEO' : 'Rejection recommendation filed.');
      await fetchDashboardData();
    } catch (err) {
      alert('Failed to submit CTO operations review');
    } finally {
      setActionLoading(false);
    }
  };

  // HR Actions
  const handleAddEmployee = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      await axios.post('/api/workers', empForm);
      alert('New staff registered successfully!');
      setShowAddEmpModal(false);
      setEmpForm({
        name: '', email: '', phone: '', role: 'worker', position: 'Laborer',
        department: 'Site Labor', address: '', emergency_contact: '', salary: 150000, joined_date: ''
      });
      await fetchDashboardData();
    } catch (err) {
      alert('Failed to create worker account');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeactivateEmployee = async (empId, active) => {
    const status = active ? 'deactive' : 'active';
    try {
      await axios.put(`/api/workers/${empId}`, { status });
      alert(`Staff account status changed to: ${status}`);
      await fetchDashboardData();
    } catch (err) {
      alert('Failed to update employee status');
    }
  };

  const handleApproveLeave = async (leaveId, approve) => {
    try {
      await axios.patch(`/api/hr/leaves/${leaveId}/approve`, { approve });
      alert(approve ? 'Leave request approved!' : 'Leave request rejected.');
      await fetchDashboardData();
    } catch (err) {
      alert('Failed to update leave status');
    }
  };

  const handleCreateVacancy = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/hr/vacancies', vacForm);
      alert('Vacancy published!');
      setShowAddVacModal(false);
      setVacForm({ title: '', department: '' });
      await fetchDashboardData();
    } catch (err) {
      alert('Failed to create vacancy');
    }
  };

  const handleScheduleInterview = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/hr/interviews', intForm);
      alert('Interview scheduled!');
      setShowAddIntModal(false);
      setIntForm({ candidate_name: '', vacancy_title: '', date: '' });
      await fetchDashboardData();
    } catch (err) {
      alert('Failed to schedule interview');
    }
  };

  const handleSubmitPerformanceReview = async (e) => {
    e.preventDefault();
    if (!perfForm.user_id || !perfForm.notes) return;
    try {
      const worker = employees.find(u => u.id === parseInt(perfForm.user_id));
      if (worker) {
        const existingNotes = worker.perf_notes || [];
        const newRecord = {
          type: perfForm.type,
          notes: perfForm.notes,
          date: new Date().toISOString().split('T')[0]
        };
        await axios.put(`/api/workers/${worker.id}`, {
          perf_notes: [...existingNotes, newRecord]
        });
        alert('Performance review record added to employee profile!');
        setPerfForm({ user_id: '', type: 'commendation', notes: '' });
        await fetchDashboardData();
      }
    } catch (err) {
      alert('Failed to save performance record');
    }
  };

  // IT Actions
  const handleCreateProject = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      await axios.post('/api/projects', projForm);
      alert('Project created successfully!');
      setShowAddProjModal(false);
      setProjForm({
        name: '', description: '', location: '', client_name: '', start_date: '', end_date: '', budget: 150000.00
      });
      await fetchDashboardData();
    } catch (err) {
      alert('Failed to create project');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteProject = async (projId) => {
    if (!window.confirm('Delete this project and all associated tasks? This action is permanent.')) return;
    try {
      await axios.delete(`/api/projects/${projId}`);
      alert('Project deleted successfully.');
      await fetchDashboardData();
    } catch (err) {
      alert('Failed to delete project');
    }
  };

  const handleUpdateUserRole = async (userId, newRole) => {
    try {
      await axios.put(`/api/workers/${userId}`, { role: newRole });
      alert(`User role updated to ${newRole}`);
      await fetchDashboardData();
    } catch (err) {
      alert('Failed to change user permission role');
    }
  };

  const handleResetUserPassword = async (userId) => {
    try {
      await axios.put(`/api/workers/${userId}`, { password: 'tempPass2026!' });
      alert('Password reset to temporary password. User should change on next login.');
    } catch (err) {
      alert('Failed to reset user password');
    }
  };

  // Supervisor Actions
  const handleSubmitRequisition = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      await axios.post('/api/procurement/requisitions', {
        project_id: parseInt(reqForm.project_id),
        requisition_type: reqForm.requisition_type,
        item_name: reqForm.item_name,
        estimated_cost: parseFloat(reqForm.estimated_cost),
        quantity: parseInt(reqForm.quantity),
        remarks: reqForm.remarks
      });
      alert('Procurement requisition submitted to approval queue!');
      setShowReqModal(false);
      setReqForm({
        project_id: '', requisition_type: 'material', item_name: '', estimated_cost: '', quantity: 1, remarks: ''
      });
      await fetchDashboardData();
    } catch (err) {
      alert('Failed to submit requisition');
    } finally {
      setActionLoading(false);
    }
  };

  const handleSubmitDailyReport = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      await axios.post('/api/daily-logs', {
        project_id: parseInt(reportForm.project_id),
        log_date: reportForm.log_date || new Date().toISOString().split('T')[0],
        weather_am: reportForm.weather_am,
        weather_pm: reportForm.weather_pm,
        labor_details: {
          'Masons': parseInt(reportForm.masons),
          'Steel Fixers': parseInt(reportForm.steel_fixers),
          'Plumbers': parseInt(reportForm.plumbers)
        },
        equipment_details: {
          'Concrete Mixer': parseFloat(reportForm.concrete_mix),
          'Tower Crane': parseFloat(reportForm.tower_crane)
        },
        materials_received: reportForm.materials
      });
      alert('Daily site diary log filed successfully!');
      setShowReportModal(false);
      setReportForm({
        project_id: '', weather_am: '', weather_pm: '',
        masons: 0, steel_fixers: 0, plumbers: 0, concrete_mix: 0, tower_crane: 0, materials: '', log_date: ''
      });
      await fetchDashboardData();
    } catch (err) {
      alert('Failed to file site report');
    } finally {
      setActionLoading(false);
    }
  };

  // Engineer Actions
  const handleSubmitInspection = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/snags', {
        project_id: parseInt(inspectForm.project_id),
        description: inspectForm.description,
        defect_type: inspectForm.defect_type,
        assigned_to: 13,
        pin_x: 50.00,
        pin_y: 50.00
      });
      alert('Technical observation logged successfully!');
      setShowInspectionModal(false);
      setInspectForm({ project_id: '', description: '', defect_type: 'Structural Slab' });
    } catch (err) {
      alert('Failed to submit inspection report');
    }
  };

  // ==========================================
  // RENDER GUARDS
  // ==========================================
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] flex-col">
        <div className="w-12 h-12 border-4 border-brand-navy dark:border-white border-t-brand-gold rounded-full animate-spin"></div>
        <p className="mt-4 text-xs font-extrabold text-brand-navy/60 dark:text-white/60 uppercase tracking-widest animate-pulse">Syncing Portal Telemetry...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 rounded-3xl bg-white dark:bg-brand-surface border border-red-100 dark:border-red-950/40 text-center max-w-md mx-auto shadow-xl animate-fadeIn">
        <AlertTriangle className="mx-auto mb-4 text-red-500 animate-bounce" size={40} />
        <h3 className="font-outfit font-extrabold text-brand-navy dark:text-white text-lg uppercase tracking-wider">Sync Error</h3>
        <p className="text-xs text-brand-navy/60 dark:text-white/60 mt-2 font-medium">{error}</p>
        <button 
          onClick={fetchDashboardData} 
          className="mt-6 px-6 py-3 bg-brand-navy hover:bg-brand-navy-light text-white rounded-xl font-bold text-xs uppercase tracking-widest shadow-md transition-colors"
        >
          Re-initialize Sync
        </button>
      </div>
    );
  }

  // ==========================================
  // MAIN RENDER
  // ==========================================
  return (
    <div className="space-y-8">
      {/* Welcome Title */}
      <div className="border-b border-brand-navy/5 dark:border-white/5 pb-4">
        <span className="text-[9px] font-extrabold text-brand-gold uppercase tracking-widest block">
          Welcome back to Archillery Portal
        </span>
        <h2 className="font-outfit font-black text-2xl md:text-3xl text-brand-navy dark:text-white uppercase tracking-wider mt-1">
          {user?.name}
        </h2>
        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/40 dark:bg-white/5 border border-brand-navy/5 dark:border-white/5 text-[9px] font-black uppercase text-brand-navy/50 dark:text-white/50 rounded-xl mt-2 tracking-wider">
          <HardHat size={12} className="text-brand-gold" /> Role: {user?.role}
        </span>
      </div>

      {/* Role-based Dashboard View Dispatcher */}
      {user?.role === 'ceo' && (
        <CeoDashboard
          stats={stats}
          requisitions={requisitions}
          projects={projects}
          ceoComments={ceoComments}
          setCeoComments={setCeoComments}
          handleCeoApproveReq={handleCeoApproveReq}
          actionLoading={actionLoading}
        />
      )}

      {user?.role === 'cto' && (
        <CtoDashboard
          stats={stats}
          requisitions={requisitions}
          projects={projects}
          ctoComments={ctoComments}
          setCtoComments={setCtoComments}
          handleCtoRecommendReq={handleCtoRecommendReq}
          actionLoading={actionLoading}
        />
      )}

      {user?.role === 'hr' && (
        <HrDashboard
          employees={employees}
          leaves={leaves}
          vacancies={vacancies}
          interviews={interviews}
          activeHrTab={activeHrTab}
          setActiveHrTab={setActiveHrTab}
          perfForm={perfForm}
          setPerfForm={setPerfForm}
          setShowAddEmpModal={setShowAddEmpModal}
          setSelectedEmp={setSelectedEmp}
          handleDeactivateEmployee={handleDeactivateEmployee}
          handleApproveLeave={handleApproveLeave}
          setShowAddVacModal={setShowAddVacModal}
          setShowAddIntModal={setShowAddIntModal}
          handleSubmitPerformanceReview={handleSubmitPerformanceReview}
        />
      )}

      {user?.role === 'it' && (
        <ItDashboard
          projects={projects}
          employees={employees}
          itUserRoles={itUserRoles}
          setItUserRoles={setItUserRoles}
          setShowAddProjModal={setShowAddProjModal}
          handleDeleteProject={handleDeleteProject}
          handleUpdateUserRole={handleUpdateUserRole}
          handleResetUserPassword={handleResetUserPassword}
        />
      )}

      {user?.role === 'supervisor' && (
        <SupervisorDashboard
          myTasks={myTasks}
          requisitions={requisitions}
          attendanceToday={attendanceToday}
          actionLoading={actionLoading}
          clockInNotes={clockInNotes}
          setClockInNotes={setClockInNotes}
          weatherAM={weatherAM}
          setWeatherAM={setWeatherAM}
          weatherPM={weatherPM}
          setWeatherPM={setWeatherPM}
          handleClockIn={handleClockIn}
          handleClockOut={handleClockOut}
          handleUpdateTaskStatus={handleUpdateTaskStatus}
          setShowReqModal={setShowReqModal}
          setShowReportModal={setShowReportModal}
        />
      )}

      {user?.role === 'engineer' && (
        <EngineerDashboard
          attendanceToday={attendanceToday}
          handleClockIn={handleClockIn}
          setShowInspectionModal={setShowInspectionModal}
          setShowSlumpModal={setShowSlumpModal}
        />
      )}

      {user?.role === 'worker' && (
        <WorkerDashboard
          myTasks={myTasks}
          attendanceToday={attendanceToday}
          actionLoading={actionLoading}
          clockInNotes={clockInNotes}
          setClockInNotes={setClockInNotes}
          handleClockIn={handleClockIn}
          handleClockOut={handleClockOut}
          handleUpdateTaskStatus={handleUpdateTaskStatus}
        />
      )}

      {/* ========================================================== */}
      {/* MODALS SECTION */}
      {/* ========================================================== */}

      {/* 1. HR Add Staff Modal */}
      {showAddEmpModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-brand-dark/70 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-white dark:bg-brand-surface p-6 rounded-3xl border border-brand-navy/5 dark:border-white/5 shadow-2xl space-y-4">
            <h3 className="font-outfit font-extrabold text-lg text-brand-navy dark:text-white uppercase tracking-wider">Register New Employee</h3>
            <form onSubmit={handleAddEmployee} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[8px] font-extrabold uppercase tracking-wider text-brand-navy/50 dark:text-white/50">Full Name</label>
                  <input type="text" value={empForm.name} onChange={(e) => setEmpForm({ ...empForm, name: e.target.value })} className="w-full px-3 py-2 rounded-xl bg-brand-beige/25 dark:bg-brand-dark border border-brand-navy/10 dark:border-white/10 text-brand-navy dark:text-white text-xs font-bold" placeholder="Firstname Lastname" required />
                </div>
                <div className="space-y-1">
                  <label className="text-[8px] font-extrabold uppercase tracking-wider text-brand-navy/50 dark:text-white/50">Email</label>
                  <input type="email" value={empForm.email} onChange={(e) => setEmpForm({ ...empForm, email: e.target.value })} className="w-full px-3 py-2 rounded-xl bg-brand-beige/25 dark:bg-brand-dark border border-brand-navy/10 dark:border-white/10 text-brand-navy dark:text-white text-xs font-bold" placeholder="staff@archillery.com" required />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[8px] font-extrabold uppercase tracking-wider text-brand-navy/50 dark:text-white/50">Phone</label>
                  <input type="text" value={empForm.phone} onChange={(e) => setEmpForm({ ...empForm, phone: e.target.value })} className="w-full px-3 py-2 rounded-xl bg-brand-beige/25 dark:bg-brand-dark border border-brand-navy/10 dark:border-white/10 text-brand-navy dark:text-white text-xs font-bold" placeholder="+234..." required />
                </div>
                <div className="space-y-1">
                  <label className="text-[8px] font-extrabold uppercase tracking-wider text-brand-navy/50 dark:text-white/50">Position</label>
                  <input type="text" value={empForm.position} onChange={(e) => setEmpForm({ ...empForm, position: e.target.value })} className="w-full px-3 py-2 rounded-xl bg-brand-beige/25 dark:bg-brand-dark border border-brand-navy/10 dark:border-white/10 text-brand-navy dark:text-white text-xs font-bold" placeholder="e.g. Land Surveyor" required />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[8px] font-extrabold uppercase tracking-wider text-brand-navy/50 dark:text-white/50">Department</label>
                  <input type="text" value={empForm.department} onChange={(e) => setEmpForm({ ...empForm, department: e.target.value })} className="w-full px-3 py-2 rounded-xl bg-brand-beige/25 dark:bg-brand-dark border border-brand-navy/10 dark:border-white/10 text-brand-navy dark:text-white text-xs font-bold" placeholder="e.g. Engineering" required />
                </div>
                <div className="space-y-1">
                  <label className="text-[8px] font-extrabold uppercase tracking-wider text-brand-navy/50 dark:text-white/50">System Role</label>
                  <select value={empForm.role} onChange={(e) => setEmpForm({ ...empForm, role: e.target.value })} className="w-full px-3 py-2 rounded-xl bg-brand-beige/25 dark:bg-brand-dark border border-brand-navy/10 dark:border-white/10 text-brand-navy dark:text-white text-xs font-bold">
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
                  <label className="text-[8px] font-extrabold uppercase tracking-wider text-brand-navy/50 dark:text-white/50">Monthly Salary (₦)</label>
                  <input type="number" value={empForm.salary} onChange={(e) => setEmpForm({ ...empForm, salary: e.target.value })} className="w-full px-3 py-2 rounded-xl bg-brand-beige/25 dark:bg-brand-dark border border-brand-navy/10 dark:border-white/10 text-brand-navy dark:text-white text-xs font-bold" required />
                </div>
                <div className="space-y-1">
                  <label className="text-[8px] font-extrabold uppercase tracking-wider text-brand-navy/50 dark:text-white/50">Emergency Contact</label>
                  <input type="text" value={empForm.emergency_contact} onChange={(e) => setEmpForm({ ...empForm, emergency_contact: e.target.value })} className="w-full px-3 py-2 rounded-xl bg-brand-beige/25 dark:bg-brand-dark border border-brand-navy/10 dark:border-white/10 text-brand-navy dark:text-white text-xs font-bold" placeholder="Name & phone" required />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[8px] font-extrabold uppercase tracking-wider text-brand-navy/50 dark:text-white/50">Residential Address</label>
                <input type="text" value={empForm.address} onChange={(e) => setEmpForm({ ...empForm, address: e.target.value })} className="w-full px-3 py-2 rounded-xl bg-brand-beige/25 dark:bg-brand-dark border border-brand-navy/10 dark:border-white/10 text-brand-navy dark:text-white text-xs font-bold" placeholder="Street and house number" required />
              </div>
              <div className="flex gap-2 pt-2">
                <button type="submit" className="flex-1 py-3 bg-brand-gold text-brand-dark font-extrabold text-[10px] uppercase tracking-wider rounded-xl cursor-pointer">Save Account</button>
                <button type="button" onClick={() => setShowAddEmpModal(false)} className="flex-1 py-3 bg-brand-beige/40 dark:bg-white/5 text-brand-navy dark:text-white border border-brand-navy/5 dark:border-white/5 font-extrabold text-[10px] uppercase tracking-wider rounded-xl cursor-pointer">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. Employee Profile Detail Modal */}
      {selectedEmp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-brand-dark/70 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white dark:bg-brand-surface p-6 rounded-3xl border border-brand-navy/5 dark:border-white/5 shadow-2xl space-y-6">
            <div className="flex gap-4 items-center border-b border-brand-navy/5 dark:border-white/5 pb-4">
              <div className="w-16 h-16 rounded-full overflow-hidden bg-brand-navy/5 border border-brand-navy/10 shrink-0">
                <img src={selectedEmp.photo || '/default-avatar.svg'} alt={selectedEmp.name} className="w-full h-full object-cover" onError={(e) => { e.target.src = '/default-avatar.svg'; }} />
              </div>
              <div>
                <h3 className="font-outfit font-black text-base text-brand-navy dark:text-white">{selectedEmp.name}</h3>
                <span className="text-[10px] text-brand-gold font-extrabold tracking-wider uppercase block">{selectedEmp.position}</span>
                <span className="text-[9px] text-brand-navy/50 dark:text-white/55 block font-bold uppercase">{selectedEmp.employee_id}</span>
              </div>
            </div>
            <div className="space-y-3 text-xs text-brand-navy dark:text-white">
              <div className="grid grid-cols-2 gap-4">
                <div><span className="text-[8px] font-bold text-brand-navy/40 dark:text-white/40 block uppercase">Department</span><span className="font-bold">{selectedEmp.department || 'Operations'}</span></div>
                <div><span className="text-[8px] font-bold text-brand-navy/40 dark:text-white/40 block uppercase">Joined Date</span><span className="font-bold">{selectedEmp.joined_date || '2024-01-01'}</span></div>
              </div>
              <div><span className="text-[8px] font-bold text-brand-navy/40 dark:text-white/40 block uppercase">Contact Details</span><span className="font-bold">{selectedEmp.phone} | {selectedEmp.email}</span></div>
              <div><span className="text-[8px] font-bold text-brand-navy/40 dark:text-white/40 block uppercase">Residential Address</span><span className="font-medium text-brand-navy/80 dark:text-white/80">{selectedEmp.address || 'Abuja Site Dormitories'}</span></div>
              <div><span className="text-[8px] font-bold text-brand-navy/40 dark:text-white/40 block uppercase">Emergency Contact</span><span className="font-bold text-brand-gold">{selectedEmp.emergency_contact || 'None Listed'}</span></div>
              <div className="grid grid-cols-2 gap-4 pt-2 border-t border-brand-navy/5 dark:border-white/5">
                <div><span className="text-[8px] font-bold text-brand-navy/40 dark:text-white/40 block uppercase">Monthly Salary</span><span className="font-black text-brand-gold">₦{selectedEmp.salary?.toLocaleString()}</span></div>
                <div><span className="text-[8px] font-bold text-brand-navy/40 dark:text-white/40 block uppercase">Leave Balance</span><span className="font-bold">{selectedEmp.leave_balance || 15} days</span></div>
              </div>
            </div>
            <button onClick={() => setSelectedEmp(null)} className="w-full py-2 bg-brand-navy hover:bg-brand-navy-light text-white font-extrabold text-[10px] uppercase tracking-wider rounded-xl cursor-pointer block text-center">Close Profile</button>
          </div>
        </div>
      )}

      {/* 3. HR Add Vacancy Modal */}
      {showAddVacModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-brand-dark/70 backdrop-blur-sm">
          <div className="w-full max-w-sm bg-white dark:bg-brand-surface p-6 rounded-3xl border border-brand-navy/5 dark:border-white/5 shadow-2xl space-y-4">
            <h3 className="font-outfit font-extrabold text-sm text-brand-navy dark:text-white uppercase tracking-wider">Publish Vacancy</h3>
            <form onSubmit={handleCreateVacancy} className="space-y-4">
              <div className="space-y-1"><label className="text-[8px] font-extrabold uppercase block text-brand-navy/40 dark:text-white/40">Vacancy Title</label><input type="text" value={vacForm.title} onChange={(e) => setVacForm({ ...vacForm, title: e.target.value })} className="w-full px-3 py-2 rounded-xl bg-brand-beige/25 dark:bg-brand-dark border border-brand-navy/10 dark:border-white/10 text-brand-navy dark:text-white text-xs font-bold" placeholder="e.g. Structural Surveyor" required /></div>
              <div className="space-y-1"><label className="text-[8px] font-extrabold uppercase block text-brand-navy/40 dark:text-white/40">Department</label><input type="text" value={vacForm.department} onChange={(e) => setVacForm({ ...vacForm, department: e.target.value })} className="w-full px-3 py-2 rounded-xl bg-brand-beige/25 dark:bg-brand-dark border border-brand-navy/10 dark:border-white/10 text-brand-navy dark:text-white text-xs font-bold" placeholder="e.g. Engineering Operations" required /></div>
              <div className="flex gap-2 pt-2">
                <button type="submit" className="flex-1 py-2 bg-brand-gold text-brand-dark font-black text-[10px] uppercase rounded-xl">Save</button>
                <button type="button" onClick={() => setShowAddVacModal(false)} className="flex-1 py-2 bg-brand-beige/30 dark:bg-white/5 text-brand-navy dark:text-white text-[10px] font-black uppercase rounded-xl">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 4. HR Schedule Interview Modal */}
      {showAddIntModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-brand-dark/70 backdrop-blur-sm">
          <div className="w-full max-w-sm bg-white dark:bg-brand-surface p-6 rounded-3xl border border-brand-navy/5 dark:border-white/5 shadow-2xl space-y-4">
            <h3 className="font-outfit font-extrabold text-sm text-brand-navy dark:text-white uppercase tracking-wider">Schedule Candidate Interview</h3>
            <form onSubmit={handleScheduleInterview} className="space-y-4">
              <div className="space-y-1"><label className="text-[8px] font-extrabold uppercase block text-brand-navy/40 dark:text-white/40">Candidate Name</label><input type="text" value={intForm.candidate_name} onChange={(e) => setIntForm({ ...intForm, candidate_name: e.target.value })} className="w-full px-3 py-2 rounded-xl bg-brand-beige/25 dark:bg-brand-dark border border-brand-navy/10 dark:border-white/10 text-brand-navy dark:text-white text-xs font-bold" placeholder="e.g. Joshua Audu" required /></div>
              <div className="space-y-1"><label className="text-[8px] font-extrabold uppercase block text-brand-navy/40 dark:text-white/40">Vacancy / Position</label><input type="text" value={intForm.vacancy_title} onChange={(e) => setIntForm({ ...intForm, vacancy_title: e.target.value })} className="w-full px-3 py-2 rounded-xl bg-brand-beige/25 dark:bg-brand-dark border border-brand-navy/10 dark:border-white/10 text-brand-navy dark:text-white text-xs font-bold" placeholder="e.g. Assistant Site Engineer" required /></div>
              <div className="space-y-1"><label className="text-[8px] font-extrabold uppercase block text-brand-navy/40 dark:text-white/40">Interview Date & Time</label><input type="datetime-local" value={intForm.date} onChange={(e) => setIntForm({ ...intForm, date: e.target.value })} className="w-full px-3 py-2 rounded-xl bg-brand-beige/25 dark:bg-brand-dark border border-brand-navy/10 dark:border-white/10 text-brand-navy dark:text-white text-xs font-bold" required /></div>
              <div className="flex gap-2 pt-2">
                <button type="submit" className="flex-1 py-2 bg-brand-gold text-brand-dark font-black text-[10px] uppercase rounded-xl">Schedule</button>
                <button type="button" onClick={() => setShowAddIntModal(false)} className="flex-1 py-2 bg-brand-beige/30 dark:bg-white/5 text-brand-navy dark:text-white text-[10px] font-black uppercase rounded-xl">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 5. IT Create Project Modal */}
      {showAddProjModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-brand-dark/70 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white dark:bg-brand-surface p-6 rounded-3xl border border-brand-navy/5 dark:border-white/5 shadow-2xl space-y-4">
            <h3 className="font-outfit font-extrabold text-base text-brand-navy dark:text-white uppercase tracking-wider">Initialize Construction Project</h3>
            <form onSubmit={handleCreateProject} className="space-y-4">
              <div className="space-y-1"><label className="text-[8px] font-extrabold uppercase block text-brand-navy/40 dark:text-white/40">Project Name</label><input type="text" value={projForm.name} onChange={(e) => setProjForm({ ...projForm, name: e.target.value })} className="w-full px-3 py-2 rounded-xl bg-brand-beige/25 dark:bg-brand-dark border border-brand-navy/10 dark:border-white/10 text-brand-navy dark:text-white text-xs font-bold" placeholder="e.g. Asokoro Smart Villa" required /></div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1"><label className="text-[8px] font-extrabold uppercase block text-brand-navy/40 dark:text-white/40">Client Name</label><input type="text" value={projForm.client_name} onChange={(e) => setProjForm({ ...projForm, client_name: e.target.value })} className="w-full px-3 py-2 rounded-xl bg-brand-beige/25 dark:bg-brand-dark border border-brand-navy/10 dark:border-white/10 text-brand-navy dark:text-white text-xs font-bold" placeholder="e.g. Federal Ministry" required /></div>
                <div className="space-y-1"><label className="text-[8px] font-extrabold uppercase block text-brand-navy/40 dark:text-white/40">Location</label><input type="text" value={projForm.location} onChange={(e) => setProjForm({ ...projForm, location: e.target.value })} className="w-full px-3 py-2 rounded-xl bg-brand-beige/25 dark:bg-brand-dark border border-brand-navy/10 dark:border-white/10 text-brand-navy dark:text-white text-xs font-bold" placeholder="e.g. Asokoro, Abuja" required /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1"><label className="text-[8px] font-extrabold uppercase block text-brand-navy/40 dark:text-white/40">Start Date</label><input type="date" value={projForm.start_date} onChange={(e) => setProjForm({ ...projForm, start_date: e.target.value })} className="w-full px-3 py-2 rounded-xl bg-brand-beige/25 dark:bg-brand-dark border border-brand-navy/10 dark:border-white/10 text-brand-navy dark:text-white text-xs font-bold" required /></div>
                <div className="space-y-1"><label className="text-[8px] font-extrabold uppercase block text-brand-navy/40 dark:text-white/40">Completion Date</label><input type="date" value={projForm.end_date} onChange={(e) => setProjForm({ ...projForm, end_date: e.target.value })} className="w-full px-3 py-2 rounded-xl bg-brand-beige/25 dark:bg-brand-dark border border-brand-navy/10 dark:border-white/10 text-brand-navy dark:text-white text-xs font-bold" required /></div>
              </div>
              <div className="space-y-1"><label className="text-[8px] font-extrabold uppercase block text-brand-navy/40 dark:text-white/40">Baseline Budget (₦)</label><input type="number" value={projForm.budget} onChange={(e) => setProjForm({ ...projForm, budget: e.target.value })} className="w-full px-3 py-2 rounded-xl bg-brand-beige/25 dark:bg-brand-dark border border-brand-navy/10 dark:border-white/10 text-brand-navy dark:text-white text-xs font-bold" required /></div>
              <div className="space-y-1"><label className="text-[8px] font-extrabold uppercase block text-brand-navy/40 dark:text-white/40">Project Description</label><textarea rows="2" value={projForm.description} onChange={(e) => setProjForm({ ...projForm, description: e.target.value })} className="w-full px-3 py-2 rounded-xl bg-brand-beige/25 dark:bg-brand-dark border border-brand-navy/10 dark:border-white/10 text-brand-navy dark:text-white text-xs font-bold resize-none" placeholder="Structural reinforcement parameters..." /></div>
              <div className="flex gap-2 pt-2">
                <button type="submit" className="flex-1 py-2.5 bg-brand-gold text-brand-dark font-black text-[10px] uppercase rounded-xl">Create</button>
                <button type="button" onClick={() => setShowAddProjModal(false)} className="flex-1 py-2.5 bg-brand-beige/30 dark:bg-white/5 text-brand-navy dark:text-white text-[10px] font-black uppercase rounded-xl">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 6. Supervisor Requisition Request Modal */}
      {showReqModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-brand-dark/70 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white dark:bg-brand-surface p-6 rounded-3xl border border-brand-navy/5 dark:border-white/5 shadow-2xl space-y-4">
            <h3 className="font-outfit font-extrabold text-base text-brand-navy dark:text-white uppercase tracking-wider">Submit Procurement Requisition</h3>
            <form onSubmit={handleSubmitRequisition} className="space-y-4">
              <div className="space-y-1"><label className="text-[8px] font-extrabold uppercase block text-brand-navy/40 dark:text-white/40">Select Project Location</label><select value={reqForm.project_id} onChange={(e) => setReqForm({ ...reqForm, project_id: e.target.value })} className="w-full px-3 py-2 rounded-xl bg-brand-beige/25 dark:bg-brand-dark border border-brand-navy/10 dark:border-white/10 text-brand-navy dark:text-white text-xs" required><option value="">-- Choose Project --</option>{projects.map(p => (<option key={p.id} value={p.id}>{p.name}</option>))}</select></div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1"><label className="text-[8px] font-extrabold uppercase block text-brand-navy/40 dark:text-white/40">Request Type</label><select value={reqForm.requisition_type} onChange={(e) => setReqForm({ ...reqForm, requisition_type: e.target.value })} className="w-full px-3 py-2 rounded-xl bg-brand-beige/25 dark:bg-brand-dark border border-brand-navy/10 dark:border-white/10 text-brand-navy dark:text-white text-xs"><option value="material">Material</option><option value="labor">Labour Payment</option><option value="equipment">Equipment</option><option value="fuel">Fuel</option><option value="transport">Transport</option><option value="site_expense">Site Expense</option></select></div>
                <div className="space-y-1"><label className="text-[8px] font-extrabold uppercase block text-brand-navy/40 dark:text-white/40">Quantity</label><input type="number" value={reqForm.quantity} onChange={(e) => setReqForm({ ...reqForm, quantity: e.target.value })} className="w-full px-3 py-2 rounded-xl bg-brand-beige/25 dark:bg-brand-dark border border-brand-navy/10 dark:border-white/10 text-brand-navy dark:text-white text-xs font-bold" required /></div>
              </div>
              <div className="space-y-1"><label className="text-[8px] font-extrabold uppercase block text-brand-navy/40 dark:text-white/40">Line Item Description</label><input type="text" value={reqForm.item_name} onChange={(e) => setReqForm({ ...reqForm, item_name: e.target.value })} className="w-full px-3 py-2 rounded-xl bg-brand-beige/25 dark:bg-brand-dark border border-brand-navy/10 dark:border-white/10 text-brand-navy dark:text-white text-xs font-bold" placeholder="e.g. 50 tons high-tensile rebars" required /></div>
              <div className="space-y-1"><label className="text-[8px] font-extrabold uppercase block text-brand-navy/40 dark:text-white/40">Estimated Unit Cost (₦)</label><input type="number" value={reqForm.estimated_cost} onChange={(e) => setReqForm({ ...reqForm, estimated_cost: e.target.value })} className="w-full px-3 py-2 rounded-xl bg-brand-beige/25 dark:bg-brand-dark border border-brand-navy/10 dark:border-white/10 text-brand-navy dark:text-white text-xs font-bold" required /></div>
              <div className="space-y-1"><label className="text-[8px] font-extrabold uppercase block text-brand-navy/40 dark:text-white/40">Purpose / Remarks</label><textarea rows="2" value={reqForm.remarks} onChange={(e) => setReqForm({ ...reqForm, remarks: e.target.value })} className="w-full px-3 py-2 rounded-xl bg-brand-beige/25 dark:bg-brand-dark border border-brand-navy/10 dark:border-white/10 text-brand-navy dark:text-white text-xs font-bold resize-none" placeholder="Vetted calculations reference..." /></div>
              <div className="flex gap-2 pt-2">
                <button type="submit" className="flex-1 py-2.5 bg-brand-gold text-brand-dark font-black text-[10px] uppercase rounded-xl">Submit</button>
                <button type="button" onClick={() => setShowReqModal(false)} className="flex-1 py-2.5 bg-brand-beige/30 dark:bg-white/5 text-brand-navy dark:text-white text-[10px] font-black uppercase rounded-xl">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 7. Supervisor Daily Site Diary Modal */}
      {showReportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-brand-dark/70 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white dark:bg-brand-surface p-6 rounded-3xl border border-brand-navy/5 dark:border-white/5 shadow-2xl space-y-4">
            <h3 className="font-outfit font-extrabold text-base text-brand-navy dark:text-white uppercase tracking-wider">File Site Diary Log</h3>
            <form onSubmit={handleSubmitDailyReport} className="space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1"><label className="text-[8px] font-extrabold uppercase block text-brand-navy/40 dark:text-white/40">Project</label><select value={reportForm.project_id} onChange={(e) => setReportForm({ ...reportForm, project_id: e.target.value })} className="w-full px-2 py-1.5 rounded-lg bg-brand-beige/25 dark:bg-brand-dark border border-brand-navy/10 dark:border-white/10 text-brand-navy dark:text-white text-[10px]" required><option value="">-- Select --</option>{projects.map(p => (<option key={p.id} value={p.id}>{p.name}</option>))}</select></div>
                <div className="space-y-1"><label className="text-[8px] font-extrabold uppercase block text-brand-navy/40 dark:text-white/40">Log Date</label><input type="date" value={reportForm.log_date} onChange={(e) => setReportForm({ ...reportForm, log_date: e.target.value })} className="w-full px-2 py-1.5 rounded-lg bg-brand-beige/25 dark:bg-brand-dark border border-brand-navy/10 dark:border-white/10 text-brand-navy dark:text-white text-[10px]" required /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1"><label className="text-[8px] font-extrabold uppercase block text-brand-navy/40 dark:text-white/40">AM Weather</label><input type="text" value={reportForm.weather_am} onChange={(e) => setReportForm({ ...reportForm, weather_am: e.target.value })} className="w-full px-2 py-1.5 rounded-lg bg-brand-beige/25 dark:bg-brand-dark border border-brand-navy/10 dark:border-white/10 text-brand-navy dark:text-white text-[10px]" /></div>
                <div className="space-y-1"><label className="text-[8px] font-extrabold uppercase block text-brand-navy/40 dark:text-white/40">PM Weather</label><input type="text" value={reportForm.weather_pm} onChange={(e) => setReportForm({ ...reportForm, weather_pm: e.target.value })} className="w-full px-2 py-1.5 rounded-lg bg-brand-beige/25 dark:bg-brand-dark border border-brand-navy/10 dark:border-white/10 text-brand-navy dark:text-white text-[10px]" /></div>
              </div>
              <div className="p-3 bg-brand-beige/20 dark:bg-white/5 rounded-xl border border-brand-navy/5 dark:border-white/5 space-y-2">
                <span className="text-[8px] font-bold text-brand-navy/40 dark:text-white/40 uppercase block">Labor Roster counts</span>
                <div className="grid grid-cols-3 gap-2">
                  <div><label className="text-[7px] font-bold block text-brand-navy dark:text-white">Masons</label><input type="number" value={reportForm.masons} onChange={(e) => setReportForm({ ...reportForm, masons: e.target.value })} className="w-full p-1 bg-white dark:bg-brand-surface border border-brand-navy/10 dark:border-white/10 text-[10px] text-brand-navy dark:text-white rounded" /></div>
                  <div><label className="text-[7px] font-bold block text-brand-navy dark:text-white">Steel Fixers</label><input type="number" value={reportForm.steel_fixers} onChange={(e) => setReportForm({ ...reportForm, steel_fixers: e.target.value })} className="w-full p-1 bg-white dark:bg-brand-surface border border-brand-navy/10 dark:border-white/10 text-[10px] text-brand-navy dark:text-white rounded" /></div>
                  <div><label className="text-[7px] font-bold block text-brand-navy dark:text-white">Plumbers</label><input type="number" value={reportForm.plumbers} onChange={(e) => setReportForm({ ...reportForm, plumbers: e.target.value })} className="w-full p-1 bg-white dark:bg-brand-surface border border-brand-navy/10 dark:border-white/10 text-[10px] text-brand-navy dark:text-white rounded" /></div>
                </div>
              </div>
              <div className="space-y-1"><label className="text-[8px] font-extrabold uppercase block text-brand-navy/40 dark:text-white/40">Materials Received</label><textarea rows="2" value={reportForm.materials} onChange={(e) => setReportForm({ ...reportForm, materials: e.target.value })} className="w-full px-2 py-1.5 rounded-lg bg-brand-beige/25 dark:bg-brand-dark border border-brand-navy/10 dark:border-white/10 text-brand-navy dark:text-white text-[10px] resize-none" placeholder="LPO details and tons received..." /></div>
              <div className="flex gap-2 pt-2">
                <button type="submit" className="flex-1 py-2 bg-brand-gold text-brand-dark font-black text-[10px] uppercase rounded-xl">Save Diary</button>
                <button type="button" onClick={() => setShowReportModal(false)} className="flex-1 py-2 bg-brand-beige/30 dark:bg-white/5 text-brand-navy dark:text-white text-[10px] font-black uppercase rounded-xl">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 8. Engineer Log Observation Modal */}
      {showInspectionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-brand-dark/70 backdrop-blur-sm">
          <div className="w-full max-w-sm bg-white dark:bg-brand-surface p-6 rounded-3xl border border-brand-navy/5 dark:border-white/5 shadow-2xl space-y-4">
            <h3 className="font-outfit font-extrabold text-base text-brand-navy dark:text-white uppercase tracking-wider">Log Concrete Slump Inspection</h3>
            <form onSubmit={handleSubmitInspection} className="space-y-4">
              <div className="space-y-1"><label className="text-[8px] font-extrabold uppercase block text-brand-navy/40 dark:text-white/40">Select Project Location</label><select value={inspectForm.project_id} onChange={(e) => setInspectForm({ ...inspectForm, project_id: e.target.value })} className="w-full px-3 py-2 rounded-xl bg-brand-beige/25 dark:bg-brand-dark border border-brand-navy/10 dark:border-white/10 text-brand-navy dark:text-white text-xs" required><option value="">-- Choose Project --</option>{projects.map(p => (<option key={p.id} value={p.id}>{p.name}</option>))}</select></div>
              <div className="space-y-1"><label className="text-[8px] font-extrabold uppercase block text-brand-navy/40 dark:text-white/40">Component / Defect Type</label><select value={inspectForm.defect_type} onChange={(e) => setInspectForm({ ...inspectForm, defect_type: e.target.value })} className="w-full px-3 py-2 rounded-xl bg-brand-beige/25 dark:bg-brand-dark border border-brand-navy/10 dark:border-white/10 text-brand-navy dark:text-white text-xs"><option value="Structural Slab">Structural Slab</option><option value="Concrete Void Work">Concrete Void Work</option><option value="Electrical Partitions">Electrical Partitions</option><option value="Waterproof Membrane">Waterproof Membrane</option></select></div>
              <div className="space-y-1"><label className="text-[8px] font-extrabold uppercase block text-brand-navy/40 dark:text-white/40">QC Observations Remarks</label><textarea rows="3" value={inspectForm.description} onChange={(e) => setInspectForm({ ...inspectForm, description: e.target.value })} className="w-full px-3 py-2 rounded-xl bg-brand-beige/25 dark:bg-brand-dark border border-brand-navy/10 dark:border-white/10 text-brand-navy dark:text-white text-xs font-bold resize-none" placeholder="Describe reinforcement alignments, concrete slump indices, etc..." required /></div>
              <div className="flex gap-2 pt-2">
                <button type="submit" className="flex-1 py-2.5 bg-brand-gold text-brand-dark font-black text-[10px] uppercase rounded-xl font-outfit">Log</button>
                <button type="button" onClick={() => setShowInspectionModal(false)} className="flex-1 py-2.5 bg-brand-beige/30 dark:bg-white/5 text-brand-navy dark:text-white text-[10px] font-black uppercase rounded-xl font-outfit">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 9. Engineer Slump Test Modal */}
      {showSlumpModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-brand-dark/70 backdrop-blur-sm">
          <div className="w-full max-w-sm bg-white dark:bg-brand-surface p-6 rounded-3xl border border-brand-navy/5 dark:border-white/5 shadow-2xl space-y-4">
            <h3 className="font-outfit font-extrabold text-base text-brand-navy dark:text-white uppercase tracking-wider">Concrete Slump Test Index</h3>
            <form onSubmit={(e) => { e.preventDefault(); alert(`Concrete slump index recorded: ${slumpForm.value} - status ${slumpForm.status}`); setShowSlumpModal(false); }} className="space-y-4">
              <div className="space-y-1"><label className="text-[8px] font-extrabold uppercase block text-brand-navy/40 dark:text-white/40">Slump Range Value</label><input type="text" value={slumpForm.value} onChange={(e) => setSlumpForm({ ...slumpForm, value: e.target.value })} className="w-full px-3 py-2 rounded-xl bg-brand-beige/25 dark:bg-brand-dark border border-brand-navy/10 dark:border-white/10 text-brand-navy dark:text-white text-xs font-bold" placeholder="e.g. 75mm" required /></div>
              <div className="space-y-1"><label className="text-[8px] font-extrabold uppercase block text-brand-navy/40 dark:text-white/40">Status</label><select value={slumpForm.status} onChange={(e) => setSlumpForm({ ...slumpForm, status: e.target.value })} className="w-full px-3 py-2 rounded-xl bg-brand-beige/25 dark:bg-brand-dark border border-brand-navy/10 dark:border-white/10 text-brand-navy dark:text-white text-xs"><option value="Passed">Passed (Complies with BS EN 12350-2)</option><option value="Failed">Failed (Slump void exceedance)</option></select></div>
              <div className="flex gap-2 pt-2">
                <button type="submit" className="flex-1 py-2.5 bg-brand-gold text-brand-dark font-black text-[10px] uppercase rounded-xl">Save Test</button>
                <button type="button" onClick={() => setShowSlumpModal(false)} className="flex-1 py-2.5 bg-brand-beige/30 dark:bg-white/5 text-brand-navy dark:text-white text-[10px] font-black uppercase rounded-xl">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
