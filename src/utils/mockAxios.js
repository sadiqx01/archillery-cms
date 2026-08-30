import { initialMockData } from './initialMockData';

// Helper to initialize and retrieve our local Database from LocalStorage
const getDb = () => {
  let dbStr = localStorage.getItem('archillery_cms_db');
  if (!dbStr) {
    localStorage.setItem('archillery_cms_db', JSON.stringify(initialMockData));
    return initialMockData;
  }
  try {
    return JSON.parse(dbStr);
  } catch (e) {
    localStorage.setItem('archillery_cms_db', JSON.stringify(initialMockData));
    return initialMockData;
  }
};

const saveDb = (db) => {
  localStorage.setItem('archillery_cms_db', JSON.stringify(db));
};

// Simulated JWT parser to identify who is making the request
const getLoggedInUser = (db) => {
  const token = localStorage.getItem('token');
  if (!token) return null;
  // Simplistic lookup: we assume token is the email address of the authenticated user
  return db.users.find(u => u.email === token) || null;
};

// Response helper
const mockResponse = (data, status = 200) => {
  return Promise.resolve({
    data,
    status,
    statusText: 'OK',
    headers: {},
    config: {}
  });
};

const mockError = (message, status = 400) => {
  const err = new Error(message);
  err.response = {
    data: { message },
    status
  };
  return Promise.reject(err);
};

// Main Mock Axios Interface
const mockAxios = {
  defaults: {
    headers: {
      common: {}
    }
  },
  
  get: async (url, config = {}) => {
    const db = getDb();
    const currentUser = getLoggedInUser(db);
    
    // Parse URL safely to strip query parameters
    const parsedUrl = new URL(url, 'http://localhost');
    const pathname = parsedUrl.pathname;
    const searchParams = parsedUrl.searchParams;
    
    // 1. Auth Profile check
    if (pathname === '/api/auth/profile') {
      if (!currentUser) return mockError('Unauthorized', 401);
      return mockResponse(currentUser);
    }
    
    // 2. Dashboard Stats
    if (pathname === '/api/projects/dashboard/stats') {
      const active = db.projects.filter(p => p.status === 'active').length;
      const completed = db.projects.filter(p => p.status === 'completed').length;
      const planning = db.projects.filter(p => p.status === 'planning').length;
      const onHold = db.projects.filter(p => p.status === 'on_hold').length;
      const totalBudget = db.projects.reduce((sum, p) => sum + parseFloat(p.budget || 0), 0);
      
      const activeTasks = db.tasks.filter(t => t.status === 'in_progress').length;
      const pendingTasks = db.tasks.filter(t => t.status === 'pending').length;
      const completedTasks = db.tasks.filter(t => t.status === 'completed').length;
      
      const workers = db.users.filter(u => u.role === 'worker');
      
      const todayStr = new Date().toISOString().split('T')[0];
      const todayAttendance = db.attendance.filter(a => a.date === todayStr);
      let present = 0, absent = 0, late = 0, leave = 0;
      todayAttendance.forEach(a => {
        if (a.status === 'present') present++;
        else if (a.status === 'absent') absent++;
        else if (a.status === 'late') late++;
        else if (a.status === 'leave') leave++;
      });
      
      const recentUpdates = db.progress_updates.map(up => {
        const proj = db.projects.find(p => p.id === up.project_id);
        const user = db.users.find(u => u.id === up.updated_by);
        return {
          ...up,
          project_name: proj ? proj.name : 'Unknown Project',
          updater_name: user ? user.name : 'Supervisor'
        };
      }).sort((a, b) => b.id - a.id);
      
      return mockResponse({
        projectStats: {
          total: db.projects.length,
          active,
          completed,
          planning,
          onHold,
          budget: totalBudget
        },
        taskStats: {
          total: activeTasks + pendingTasks + completedTasks,
          active: activeTasks,
          pending: pendingTasks,
          completed: completedTasks
        },
        workerCount: workers.length,
        recentUpdates,
        attendanceStats: {
          totalLogged: todayAttendance.length,
          present,
          absent,
          late,
          leave
        }
      });
    }
    
    // 3. Fetch Projects
    if (pathname === '/api/projects') {
      return mockResponse(db.projects);
    }
    
    // 4. Fetch Single Project Detail
    const projectMatch = pathname.match(/^\/api\/projects\/(\d+)$/);
    if (projectMatch) {
      const projId = parseInt(projectMatch[1]);
      const proj = db.projects.find(p => p.id === projId);
      if (!proj) return mockError('Project not found', 404);
      
      const tasks = db.tasks.filter(t => t.project_id === projId).map(t => {
        const worker = db.users.find(u => u.id === t.assigned_to);
        return {
          ...t,
          assigned_to_name: worker ? worker.name : 'Unassigned'
        };
      });
      const progressUpdates = db.progress_updates.filter(p => p.project_id === projId).map(p => {
        const updater = db.users.find(u => u.id === p.updated_by);
        return {
          ...p,
          updater_name: updater ? updater.name : 'Supervisor'
        };
      });
      
      return mockResponse({
        ...proj,
        tasks,
        progressUpdates
      });
    }
    
    // 5. Fetch Tasks (projectId query filters)
    if (pathname === '/api/tasks') {
      let filtered = [...db.tasks];
      const projId = searchParams.get('projectId');
      if (projId) {
        filtered = filtered.filter(t => t.project_id === parseInt(projId));
      }
      // If the logged-in user is a worker, only return their tasks
      if (currentUser && currentUser.role === 'worker') {
        filtered = filtered.filter(t => t.assigned_to === currentUser.id);
      }
      filtered = filtered.map(t => {
        const worker = db.users.find(u => u.id === t.assigned_to);
        const proj = db.projects.find(p => p.id === t.project_id);
        return {
          ...t,
          assigned_to_name: worker ? worker.name : 'Unassigned',
          project_name: proj ? proj.name : 'Unknown Project'
        };
      });
      return mockResponse(filtered);
    }
    
    // 6. Fetch Workers
    if (pathname === '/api/workers') {
      return mockResponse(db.users);
    }
    
    // 7. Attendance
    if (pathname.startsWith('/api/attendance')) {
      if (pathname === '/api/attendance/logs') {
        const logs = db.attendance.map(a => {
          const w = db.users.find(u => u.id === a.user_id);
          return {
            ...a,
            worker_name: w ? w.name : 'Unknown Worker',
            worker_email: w ? w.email : 'Unknown Email'
          };
        }).sort((a, b) => new Date(b.date) - new Date(a.date));
        return mockResponse(logs);
      }
      
      if (pathname === '/api/attendance/my') {
        if (!currentUser) return mockError('Unauthorized', 401);
        const myLogs = db.attendance.filter(a => a.user_id === currentUser.id);
        return mockResponse(myLogs);
      }
      
      if (pathname === '/api/attendance/worker-stats') {
        const stats = db.users.filter(u => u.role === 'worker').map(w => {
          const myLogs = db.attendance.filter(a => a.user_id === w.id);
          return {
            user_id: w.id,
            worker_name: w.name,
            total_days: myLogs.length,
            present_days: myLogs.filter(a => a.status === 'present').length,
            late_days: myLogs.filter(a => a.status === 'late').length,
            absent_days: myLogs.filter(a => a.status === 'absent').length,
            leave_days: myLogs.filter(a => a.status === 'leave').length
          };
        });
        return mockResponse(stats);
      }
      
      const dateParam = searchParams.get('date');
      if (dateParam) {
        const searchDate = dateParam.split('T')[0];
        const records = db.attendance
          .filter(a => a.date === searchDate)
          .map(a => {
            const w = db.users.find(u => u.id === a.user_id);
            return {
              ...a,
              worker_name: w ? w.name : 'Unknown Worker',
              worker_email: w ? w.email : 'Unknown Email'
            };
          });
        return mockResponse(records);
      }
    }
    
    // 8. RFIs
    if (pathname === '/api/rfis') {
      const rfisList = db.rfis.map(r => {
        const proj = db.projects.find(p => p.id === r.project_id);
        const creator = db.users.find(u => u.id === r.created_by);
        const assignee = db.users.find(u => u.id === r.assigned_to);
        return {
          ...r,
          project_name: proj ? proj.name : 'Unknown Project',
          creator_name: creator ? creator.name : 'Supervisor',
          assignee_name: assignee ? assignee.name : 'Architect'
        };
      }).sort((a, b) => b.id - a.id);
      return mockResponse(rfisList);
    }
    
    // 9. Project BOQ Items
    const boqMatch = pathname.match(/^\/api\/projects\/(\d+)\/boq$/);
    if (boqMatch) {
      const projId = parseInt(boqMatch[1]);
      const items = db.boq_items.filter(item => item.project_id === projId);
      return mockResponse(items);
    }
    
    // 10. Project Financial Metrics
    const financialsMatch = pathname.match(/^\/api\/projects\/(\d+)\/financials$/);
    if (financialsMatch) {
      const projId = parseInt(financialsMatch[1]);
      const boqItems = db.boq_items.filter(item => item.project_id === projId);
      const baseline = boqItems.reduce((acc, curr) => acc + (curr.quantity * curr.unit_rate), 0);
      
      const lpos = db.lpos.filter(l => l.project_id === projId && l.status !== 'cancelled');
      const committed = lpos.reduce((acc, curr) => acc + curr.total_amount, 0);
      
      const grns = db.grns.filter(g => g.project_id === projId);
      const actual = grns.reduce((acc, curr) => {
        const matchedLpo = db.lpos.find(l => l.id === curr.lpo_id);
        return acc + (matchedLpo ? matchedLpo.total_amount : 0);
      }, 0);
      
      return mockResponse({
        baseline_budget: baseline,
        committed_cost: committed,
        actual_spend: actual
      });
    }
    
    // 11. Procurement Requisitions
    if (pathname === '/api/procurement/requisitions') {
      const requisitionsList = db.material_requisitions.map(r => {
        const proj = db.projects.find(p => p.id === r.project_id);
        const requester = db.users.find(u => u.id === r.requested_by);
        const approver = db.users.find(u => u.id === r.approved_by);
        return {
          ...r,
          project_name: proj ? proj.name : 'Unknown Project',
          requested_by_name: requester ? requester.name : 'Supervisor',
          approved_by_name: approver ? approver.name : 'Pending'
        };
      }).sort((a, b) => b.id - a.id);
      return mockResponse(requisitionsList);
    }
    
    // 12. Procurement LPOs
    if (pathname === '/api/procurement/lpos') {
      const lposList = db.lpos.map(l => {
        const proj = db.projects.find(p => p.id === l.project_id);
        const creator = db.users.find(u => u.id === l.created_by);
        const req = db.material_requisitions.find(r => r.id === l.requisition_id);
        return {
          ...l,
          project_name: proj ? proj.name : 'Unknown Project',
          created_by_name: creator ? creator.name : 'Accounts Lead',
          item_details: req ? req.item_details : []
        };
      }).sort((a, b) => b.id - a.id);
      return mockResponse(lposList);
    }
    
    // 13. Procurement GRNs
    if (pathname === '/api/procurement/grns') {
      const grnsList = db.grns.map(g => {
        const proj = db.projects.find(p => p.id === g.project_id);
        const receiver = db.users.find(u => u.id === g.received_by);
        const lpo = db.lpos.find(l => l.id === g.lpo_id);
        return {
          ...g,
          project_name: proj ? proj.name : 'Unknown Project',
          received_by_name: receiver ? receiver.name : 'Supervisor',
          vendor_name: lpo ? lpo.vendor_name : 'Unknown Vendor',
          lpo_number: lpo ? lpo.lpo_number : 'N/A'
        };
      }).sort((a, b) => b.id - a.id);
      return mockResponse(grnsList);
    }
    
    // 14. Snags
    if (pathname === '/api/snags') {
      let filtered = [...db.snags];
      const projId = searchParams.get('projectId');
      if (projId) {
        filtered = filtered.filter(s => s.project_id === parseInt(projId));
      }
      filtered = filtered.map(s => {
        const worker = db.users.find(u => u.id === s.assigned_to);
        const inspector = db.users.find(u => u.id === s.signed_off_by);
        return {
          ...s,
          assigned_to_name: worker ? worker.name : 'Subcontractor',
          signed_off_by_name: inspector ? inspector.name : 'Awaiting QC'
        };
      });
      return mockResponse(filtered);
    }
    
    // 15. Daily logs Site Diaries
    if (pathname === '/api/daily-logs') {
      const logsList = db.daily_logs.map(log => {
        const proj = db.projects.find(p => p.id === log.project_id);
        const supervisor = db.users.find(u => u.id === log.logged_by);
        return {
          ...log,
          project_name: proj ? proj.name : 'Unknown Project',
          logged_by_name: supervisor ? supervisor.name : 'Supervisor'
        };
      }).sort((a, b) => b.id - a.id);
      return mockResponse(logsList);
    }
    
    // 16. Consolidated Reports Dossier
    if (pathname === '/api/reports/consolidated') {
      return mockResponse({
        projects: db.projects,
        tasks: db.tasks,
        attendance: db.attendance,
        generatedBy: currentUser ? currentUser.name : 'Auditor',
        timestamp: new Date().toISOString()
      });
    }

    // 17. HR Leaves
    if (pathname === '/api/hr/leaves') {
      return mockResponse(db.leaves || []);
    }
    
    // 18. HR Vacancies
    if (pathname === '/api/hr/vacancies') {
      return mockResponse(db.vacancies || []);
    }
    
    // 19. HR Interviews
    if (pathname === '/api/hr/interviews') {
      return mockResponse(db.interviews || []);
    }

    return mockError(`GET route not mapped: ${pathname}`, 404);
  },

  post: async (url, data = {}, config = {}) => {
    const db = getDb();
    const currentUser = getLoggedInUser(db);
    
    const parsedUrl = new URL(url, 'http://localhost');
    const pathname = parsedUrl.pathname;
    
    // 1. Authentication Login
    if (pathname === '/api/auth/login') {
      const { email, password } = data;
      const matched = db.users.find(u => u.email === email && u.password === password);
      if (!matched) {
        return mockError('Invalid credentials or password mismatch', 400);
      }
      // Save token (which is the email for lookup)
      localStorage.setItem('token', matched.email);
      return mockResponse({
        token: matched.email,
        user: matched
      });
    }
    
    // 2. Create Project
    if (pathname === '/api/projects') {
      const newId = db.projects.length ? Math.max(...db.projects.map(p => p.id)) + 1 : 1;
      const newProject = {
        id: newId,
        name: data.name,
        description: data.description || '',
        location: data.location || '',
        client_name: data.client_name || '',
        start_date: data.start_date || new Date().toISOString().split('T')[0],
        end_date: data.end_date || new Date().toISOString().split('T')[0],
        budget: parseFloat(data.budget) || 0.00,
        status: data.status || 'planning',
        created_at: new Date()
      };
      db.projects.push(newProject);
      saveDb(db);
      return mockResponse(newProject, 201);
    }
    
    // 3. Append progress update to project
    const progressMatch = pathname.match(/^\/api\/projects\/(\d+)\/progress$/);
    if (progressMatch) {
      const projId = parseInt(progressMatch[1]);
      const newId = db.progress_updates.length ? Math.max(...db.progress_updates.map(p => p.id)) + 1 : 1;
      const newUpdate = {
        id: newId,
        project_id: projId,
        updated_by: currentUser ? currentUser.id : 1,
        description: data.description,
        image_url: null,
        update_date: new Date().toISOString().split('T')[0],
        created_at: new Date()
      };
      db.progress_updates.push(newUpdate);
      saveDb(db);
      return mockResponse(newUpdate, 201);
    }
    
    // 4. Create Task
    if (pathname === '/api/tasks') {
      const newId = db.tasks.length ? Math.max(...db.tasks.map(t => t.id)) + 1 : 1;
      const newTask = {
        id: newId,
        project_id: parseInt(data.project_id),
        assigned_to: parseInt(data.assigned_to),
        title: data.title,
        description: data.description || '',
        due_date: data.due_date || new Date().toISOString().split('T')[0],
        status: 'pending',
        priority: data.priority || 'medium',
        created_at: new Date()
      };
      db.tasks.push(newTask);
      saveDb(db);
      return mockResponse(newTask, 201);
    }
    
    // 5. Create Worker (Staff Account)
    if (pathname === '/api/workers') {
      const newId = db.users.length ? Math.max(...db.users.map(u => u.id)) + 1 : 1;
      const newUser = {
        id: newId,
        name: data.name,
        email: data.email,
        password: 'password123', // default password
        role: data.role || 'worker',
        phone: data.phone || '',
        status: 'active',
        employee_id: `EMP-2026-${Math.floor(1000 + Math.random() * 9000)}`,
        position: data.position || 'Staff',
        department: data.department || 'Operations',
        address: data.address || 'No 12 Wuse Site Dorms, Abuja',
        emergency_contact: data.emergency_contact || 'None Listed',
        salary: parseFloat(data.salary) || 150000,
        joined_date: data.joined_date || new Date().toISOString().split('T')[0],
        photo: '/default-avatar.svg',
        created_at: new Date()
      };
      db.users.push(newUser);
      saveDb(db);
      return mockResponse(newUser, 201);
    }
    
    // 6. Roster Check-In
    if (pathname === '/api/attendance/check-in') {
      const targetUserId = currentUser ? currentUser.id : data.user_id;
      const today = new Date().toISOString().split('T')[0];
      const timeNow = new Date().toTimeString().split(' ')[0];
      const status = timeNow > '08:30:00' ? 'late' : 'present';
      
      const newId = db.attendance.length ? Math.max(...db.attendance.map(a => a.id)) + 1 : 1;
      db.attendance.push({
        id: newId,
        user_id: targetUserId,
        date: today,
        status,
        check_in_time: timeNow,
        check_out_time: null,
        notes: data.notes || 'Arrived on-site',
        created_at: new Date()
      });
      saveDb(db);
      return mockResponse({ message: 'Checked in successfully' });
    }
    
    // 7. Roster Check-Out
    if (pathname === '/api/attendance/check-out') {
      const targetUserId = currentUser ? currentUser.id : data.user_id;
      const today = new Date().toISOString().split('T')[0];
      const timeNow = new Date().toTimeString().split(' ')[0];
      
      const record = db.attendance.find(a => a.user_id === targetUserId && a.date === today);
      if (record) {
        record.check_out_time = timeNow;
        saveDb(db);
        return mockResponse({ message: 'Checked out successfully' });
      }
      return mockError('No check-in record found for today', 400);
    }
    
    // 8. Manual Roster Log (Absences dispatch)
    if (pathname === '/api/attendance/manual') {
      const { user_id, date, status, notes } = data;
      const newId = db.attendance.length ? Math.max(...db.attendance.map(a => a.id)) + 1 : 1;
      db.attendance.push({
        id: newId,
        user_id: parseInt(user_id),
        date: date,
        status,
        check_in_time: null,
        check_out_time: null,
        notes: notes || '',
        created_at: new Date()
      });
      saveDb(db);
      return mockResponse({ message: 'Attendance record saved successfully' });
    }
    
    // 9. Dispatch RFI Submittal
    if (pathname === '/api/rfis') {
      const newId = db.rfis.length ? Math.max(...db.rfis.map(r => r.id)) + 1 : 1;
      const newRfi = {
        id: newId,
        project_id: parseInt(data.project_id),
        created_by: currentUser ? currentUser.id : 5,
        assigned_to: parseInt(data.assigned_to),
        subject: data.subject,
        question: data.question,
        answer: null,
        status: 'open',
        created_at: new Date()
      };
      db.rfis.push(newRfi);
      saveDb(db);
      return mockResponse(newRfi, 201);
    }
    
    // 10. Import BOQ sheet items
    const importBoqMatch = pathname.match(/^\/api\/projects\/(\d+)\/boq\/import$/);
    if (importBoqMatch) {
      const projId = parseInt(importBoqMatch[1]);
      const { items } = data;
      
      items.forEach(item => {
        const newId = db.boq_items.length ? Math.max(...db.boq_items.map(b => b.id)) + 1 : 1;
        db.boq_items.push({
          id: newId,
          project_id: projId,
          item_code: item.item_code,
          description: item.description,
          category: item.category || 'General',
          unit: item.unit || 'pcs',
          quantity: parseFloat(item.quantity) || 0,
          unit_rate: parseFloat(item.unit_rate) || 0
        });
      });
      saveDb(db);
      return mockResponse({ message: 'BOQ items imported successfully' });
    }
    
    // 11. Create Material Requisition
    if (pathname === '/api/procurement/requisitions') {
      const newId = db.material_requisitions.length ? Math.max(...db.material_requisitions.map(r => r.id)) + 1 : 1;
      const newReq = {
        id: newId,
        project_id: parseInt(data.project_id),
        requested_by: currentUser ? currentUser.id : 5,
        approved_by: null,
        item_details: data.item_details, // expects array
        estimated_cost: parseFloat(data.estimated_cost) || 0,
        status: 'pending_approval',
        created_at: new Date()
      };
      db.material_requisitions.push(newReq);
      saveDb(db);
      return mockResponse(newReq, 201);
    }
    
    // 12. Generate Local Purchase Order (LPO)
    if (pathname === '/api/procurement/lpos') {
      const newId = db.lpos.length ? Math.max(...db.lpos.map(l => l.id)) + 1 : 1;
      const newLpo = {
        id: newId,
        requisition_id: parseInt(data.requisition_id),
        project_id: parseInt(data.project_id),
        vendor_name: data.vendor_name,
        lpo_number: `LPO-2026-${Math.floor(1000 + Math.random() * 9000)}`,
        total_amount: parseFloat(data.total_amount) || 0,
        status: 'issued',
        created_by: currentUser ? currentUser.id : 4,
        created_at: new Date()
      };
      db.lpos.push(newLpo);
      
      // Update linked Requisition status
      const req = db.material_requisitions.find(r => r.id === parseInt(data.requisition_id));
      if (req) req.status = 'lpo_generated';
      
      saveDb(db);
      return mockResponse(newLpo, 201);
    }
    
    // 13. Log Goods Received Note (GRN)
    if (pathname === '/api/procurement/grns') {
      const newId = db.grns.length ? Math.max(...db.grns.map(g => g.id)) + 1 : 1;
      const newGrn = {
        id: newId,
        lpo_id: parseInt(data.lpo_id),
        project_id: parseInt(data.project_id),
        received_by: currentUser ? currentUser.id : 7,
        delivery_details: data.delivery_details, // expects array
        delivery_note_ref: data.delivery_note_ref,
        status: data.status || 'fully_received',
        created_at: new Date()
      };
      db.grns.push(newGrn);
      
      // Update LPO status to delivered
      const lpo = db.lpos.find(l => l.id === parseInt(data.lpo_id));
      if (lpo) lpo.status = 'delivered';
      
      saveDb(db);
      return mockResponse(newGrn, 201);
    }
    
    // 14. Log Snag Pin
    if (pathname === '/api/snags') {
      const newId = db.snags.length ? Math.max(...db.snags.map(s => s.id)) + 1 : 1;
      const newSnag = {
        id: newId,
        project_id: parseInt(data.project_id),
        floor_plan_ref: 'default_floorplan.jpg',
        pin_x: parseFloat(data.pin_x),
        pin_y: parseFloat(data.pin_y),
        description: data.description,
        defect_type: data.defect_type,
        assigned_to: parseInt(data.assigned_to),
        photo_url: null,
        status: 'open',
        signed_off_by: null,
        created_at: new Date()
      };
      db.snags.push(newSnag);
      saveDb(db);
      return mockResponse(newSnag, 201);
    }
    
    // 15. Create Daily Site Diary Log
    if (pathname === '/api/daily-logs') {
      const newId = db.daily_logs.length ? Math.max(...db.daily_logs.map(log => log.id)) + 1 : 1;
      const newDiary = {
        id: newId,
        project_id: parseInt(data.project_id),
        logged_by: currentUser ? currentUser.id : 6,
        log_date: data.log_date,
        weather_am: data.weather_am,
        weather_pm: data.weather_pm,
        labor_details: data.labor_details, // expects object
        equipment_details: data.equipment_details, // expects object
        materials_received: data.materials_received || '',
        created_at: new Date()
      };
      db.daily_logs.push(newDiary);
      saveDb(db);
      return mockResponse(newDiary, 201);
    }

    // 16. Create HR Leave Request
    if (pathname === '/api/hr/leaves') {
      const newId = db.leaves ? (db.leaves.length ? Math.max(...db.leaves.map(l => l.id)) + 1 : 1) : 1;
      const newLeaf = {
        id: newId,
        user_id: data.user_id || (currentUser ? currentUser.id : 13),
        name: data.name || (currentUser ? currentUser.name : 'Garba Musa'),
        position: data.position || (currentUser ? currentUser.position : 'Excavator Operator'),
        start_date: data.start_date,
        end_date: data.end_date,
        reason: data.reason,
        status: 'pending',
        type: data.type || 'annual',
        created_at: new Date()
      };
      if (!db.leaves) db.leaves = [];
      db.leaves.push(newLeaf);
      saveDb(db);
      return mockResponse(newLeaf, 201);
    }
    
    // 17. Create HR Vacancy
    if (pathname === '/api/hr/vacancies') {
      const newId = db.vacancies ? (db.vacancies.length ? Math.max(...db.vacancies.map(v => v.id)) + 1 : 1) : 1;
      const newVacancy = {
        id: newId,
        title: data.title,
        department: data.department,
        status: 'open',
        applicationsCount: 0,
        date_posted: new Date().toISOString().split('T')[0]
      };
      if (!db.vacancies) db.vacancies = [];
      db.vacancies.push(newVacancy);
      saveDb(db);
      return mockResponse(newVacancy, 201);
    }
    
    // 18. Create HR Interview
    if (pathname === '/api/hr/interviews') {
      const newId = db.interviews ? (db.interviews.length ? Math.max(...db.interviews.map(i => i.id)) + 1 : 1) : 1;
      const newInterview = {
        id: newId,
        candidate_name: data.candidate_name,
        vacancy_title: data.vacancy_title,
        date: data.date,
        status: 'scheduled'
      };
      if (!db.interviews) db.interviews = [];
      db.interviews.push(newInterview);
      saveDb(db);
      return mockResponse(newInterview, 201);
    }

    return mockError(`POST route not mapped: ${pathname}`, 404);
  },

  put: async (url, data = {}, config = {}) => {
    const db = getDb();
    
    const parsedUrl = new URL(url, 'http://localhost');
    const pathname = parsedUrl.pathname;
    
    // 1. Update Project
    const projectMatch = pathname.match(/^\/api\/projects\/(\d+)$/);
    if (projectMatch) {
      const projId = parseInt(projectMatch[1]);
      const proj = db.projects.find(p => p.id === projId);
      if (!proj) return mockError('Project not found', 404);
      
      proj.name = data.name;
      proj.description = data.description || '';
      proj.location = data.location || '';
      proj.client_name = data.client_name || '';
      proj.start_date = data.start_date;
      proj.end_date = data.end_date;
      proj.budget = parseFloat(data.budget) || 0;
      proj.status = data.status;
      
      saveDb(db);
      return mockResponse(proj);
    }
    
    // 2. Update Task Status & properties
    const taskMatch = pathname.match(/^\/api\/tasks\/(\d+)$/);
    if (taskMatch) {
      const taskId = parseInt(taskMatch[1]);
      const task = db.tasks.find(t => t.id === taskId);
      if (!task) return mockError('Task not found', 404);
      
      task.status = data.status || task.status;
      if (data.assigned_to) task.assigned_to = parseInt(data.assigned_to);
      if (data.priority) task.priority = data.priority;
      
      saveDb(db);
      return mockResponse(task);
    }
    
    // 3. Attendance status Override
    const attendanceMatch = pathname.match(/^\/api\/attendance\/(\d+)$/);
    if (attendanceMatch) {
      const attId = parseInt(attendanceMatch[1]);
      const record = db.attendance.find(a => a.id === attId);
      if (!record) return mockError('Attendance log not found', 404);
      
      record.status = data.status;
      record.notes = data.notes || null;
      
      saveDb(db);
      return mockResponse({ message: 'Attendance override successfully updated' });
    }

    // 4. Update Worker profile details (HR / IT action)
    const workerUpdateMatch = pathname.match(/^\/api\/workers\/(\d+)$/);
    if (workerUpdateMatch) {
      const workerId = parseInt(workerUpdateMatch[1]);
      const worker = db.users.find(u => u.id === workerId);
      if (!worker) return mockError('Employee record not found', 404);
      
      worker.name = data.name || worker.name;
      worker.email = data.email || worker.email;
      worker.phone = data.phone || worker.phone;
      worker.role = data.role || worker.role;
      worker.position = data.position || worker.position;
      worker.department = data.department || worker.department;
      worker.address = data.address || worker.address;
      worker.emergency_contact = data.emergency_contact || worker.emergency_contact;
      worker.salary = parseFloat(data.salary) || worker.salary;
      worker.joined_date = data.joined_date || worker.joined_date;
      worker.status = data.status || worker.status;
      
      saveDb(db);
      return mockResponse(worker);
    }

    return mockError(`PUT route not mapped: ${pathname}`, 404);
  },

  patch: async (url, data = {}, config = {}) => {
    const db = getDb();
    const currentUser = getLoggedInUser(db);
    
    const parsedUrl = new URL(url, 'http://localhost');
    const pathname = parsedUrl.pathname;
    
    // 1. Answer RFI
    const rfiMatch = pathname.match(/^\/api\/rfis\/(\d+)\/answer$/);
    if (rfiMatch) {
      const rfiId = parseInt(rfiMatch[1]);
      const rfi = db.rfis.find(r => r.id === rfiId);
      if (!rfi) return mockError('RFI not found', 404);
      
      rfi.answer = data.answer;
      rfi.status = 'answered';
      rfi.answered_at = new Date().toISOString();
      
      saveDb(db);
      return mockResponse({ message: 'RFI clarification submitted successfully' });
    }
    
    // 2. Approve Requisition (CEO Action)
    const reqApproveMatch = pathname.match(/^\/api\/procurement\/requisitions\/(\d+)\/approve$/);
    if (reqApproveMatch) {
      const reqId = parseInt(reqApproveMatch[1]);
      const req = db.material_requisitions.find(r => r.id === reqId);
      if (!req) return mockError('Requisition not found', 404);
      
      req.status = data.approve ? 'approved' : 'rejected';
      req.approved_by = currentUser ? currentUser.id : 1;
      req.ceo_comments = data.comments || '';
      req.approval_date = new Date().toISOString();
      
      saveDb(db);
      return mockResponse({ message: 'Requisition authorization updated' });
    }
    
    // 3. Resolve Snag defect
    const snagResolveMatch = pathname.match(/^\/api\/snags\/(\d+)\/resolve$/);
    if (snagResolveMatch) {
      const snagId = parseInt(snagResolveMatch[1]);
      const snag = db.snags.find(s => s.id === snagId);
      if (!snag) return mockError('Snag pin not found', 404);
      
      snag.status = 'resolved';
      saveDb(db);
      return mockResponse({ message: 'Snag marked as resolved' });
    }
    
    // 4. Sign-off Snag defect
    const snagSignoffMatch = pathname.match(/^\/api\/snags\/(\d+)\/signoff$/);
    if (snagSignoffMatch) {
      const snagId = parseInt(snagSignoffMatch[1]);
      const snag = db.snags.find(s => s.id === snagId);
      if (!snag) return mockError('Snag pin not found', 404);
      
      snag.status = 'signed_off';
      snag.signed_off_by = currentUser ? currentUser.id : 4;
      saveDb(db);
      return mockResponse({ message: 'Snag signed off and closed successfully' });
    }

    // 5. Update Task Status
    const taskStatusMatch = pathname.match(/^\/api\/tasks\/(\d+)\/status$/);
    if (taskStatusMatch) {
      const taskId = parseInt(taskStatusMatch[1]);
      const task = db.tasks.find(t => t.id === taskId);
      if (!task) return mockError('Task not found', 404);
      
      task.status = data.status;
      saveDb(db);
      return mockResponse({ message: 'Task status updated successfully' });
    }

    // 6. Recommend Requisition (CTO Action)
    const reqRecommendMatch = pathname.match(/^\/api\/procurement\/requisitions\/(\d+)\/recommend$/);
    if (reqRecommendMatch) {
      const reqId = parseInt(reqRecommendMatch[1]);
      const req = db.material_requisitions.find(r => r.id === reqId);
      if (!req) return mockError('Requisition not found', 404);
      
      req.status = data.recommend ? 'cto_recommended' : 'cto_rejected';
      req.cto_comments = data.comments || '';
      req.cto_recommended_by = currentUser ? currentUser.id : 2;
      req.recommendation_date = new Date().toISOString();
      
      saveDb(db);
      return mockResponse({ message: 'Requisition operations review saved' });
    }
    
    // 7. HR Leave Approvals
    const leaveApproveMatch = pathname.match(/^\/api\/hr\/leaves\/(\d+)\/approve$/);
    if (leaveApproveMatch) {
      const leaveId = parseInt(leaveApproveMatch[1]);
      const leave = db.leaves.find(l => l.id === leaveId);
      if (!leave) return mockError('Leave request not found', 404);
      
      leave.status = data.approve ? 'approved' : 'rejected';
      saveDb(db);
      return mockResponse({ message: 'Leave status updated successfully' });
    }

    return mockError(`PATCH route not mapped: ${pathname}`, 404);
  },

  delete: async (url, config = {}) => {
    const db = getDb();
    
    const parsedUrl = new URL(url, 'http://localhost');
    const pathname = parsedUrl.pathname;
    
    // 1. Delete Project
    const projectMatch = pathname.match(/^\/api\/projects\/(\d+)$/);
    if (projectMatch) {
      const projId = parseInt(projectMatch[1]);
      db.projects = db.projects.filter(p => p.id !== projId);
      db.tasks = db.tasks.filter(t => t.project_id !== projId);
      db.boq_items = db.boq_items.filter(b => b.project_id !== projId);
      
      saveDb(db);
      return mockResponse({ message: 'Project successfully deleted' });
    }
    
    // 2. Delete Task
    const taskMatch = pathname.match(/^\/api\/tasks\/(\d+)$/);
    if (taskMatch) {
      const taskId = parseInt(taskMatch[1]);
      db.tasks = db.tasks.filter(t => t.id !== taskId);
      saveDb(db);
      return mockResponse({ message: 'Task deleted successfully' });
    }
    
    // 3. Delete Worker (Staff Account)
    const workerMatch = pathname.match(/^\/api\/workers\/(\d+)$/);
    if (workerMatch) {
      const workerId = parseInt(workerMatch[1]);
      db.users = db.users.filter(u => u.id !== workerId);
      saveDb(db);
      return mockResponse({ message: 'Staff registry details deleted' });
    }

    return mockError(`DELETE route not mapped: ${pathname}`, 404);
  }
};

export default mockAxios;
