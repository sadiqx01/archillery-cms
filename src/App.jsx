import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import ProtectedRoute from './components/ProtectedRoute';

// Import Pages
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Projects from './pages/Projects';
import ProjectDetail from './pages/ProjectDetail';
import Workers from './pages/Workers';
import Tasks from './pages/Tasks';
import Attendance from './pages/Attendance';
import Reports from './pages/Reports';
import Rfis from './pages/Rfis';
import Financials from './pages/Financials';
import Procurement from './pages/Procurement';
import Snags from './pages/Snags';
import DailyLogs from './pages/DailyLogs';

function AppContent() {
  const { token } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  if (!token) {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  // Unified production roles list
  const allRoles = ['ceo', 'cto', 'hr', 'it', 'supervisor', 'engineer', 'worker'];

  return (
    <div className="flex h-screen bg-brand-beige dark:bg-[#060e1f] overflow-hidden">
      {/* Sidebar Panel */}
      <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />

      {/* Main Workspace */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header Navigation */}
        <Header toggleSidebar={toggleSidebar} />

        {/* Dynamic Pages Area */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8">
          <Routes>
            {/* Unified Dashboard */}
            <Route 
              path="/" 
              element={
                <ProtectedRoute allowedRoles={allRoles}>
                  <Dashboard />
                </ProtectedRoute>
              } 
            />

            {/* Projects Management */}
            <Route 
              path="/projects" 
              element={
                <ProtectedRoute allowedRoles={['ceo', 'cto', 'it', 'supervisor', 'engineer']}>
                  <Projects />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/projects/:id" 
              element={
                <ProtectedRoute allowedRoles={['ceo', 'cto', 'it', 'supervisor', 'engineer']}>
                  <ProjectDetail />
                </ProtectedRoute>
              } 
            />

            {/* Workers / Staff Directory */}
            <Route 
              path="/workers" 
              element={
                <ProtectedRoute allowedRoles={['ceo', 'hr', 'it', 'supervisor']}>
                  <Workers />
                </ProtectedRoute>
              } 
            />

            {/* Tasks Tracking */}
            <Route 
              path="/tasks" 
              element={
                <ProtectedRoute allowedRoles={['ceo', 'cto', 'it', 'supervisor', 'engineer', 'worker']}>
                  <Tasks />
                </ProtectedRoute>
              } 
            />

            {/* Attendance tracking */}
            <Route 
              path="/attendance" 
              element={
                <ProtectedRoute allowedRoles={['ceo', 'hr', 'it', 'supervisor', 'engineer', 'worker']}>
                  <Attendance />
                </ProtectedRoute>
              } 
            />

            {/* Reporting panel */}
            <Route 
              path="/reports" 
              element={
                <ProtectedRoute allowedRoles={['ceo', 'cto', 'hr', 'supervisor', 'engineer']}>
                  <Reports />
                </ProtectedRoute>
              } 
            />

            {/* RFI Communication Submittals */}
            <Route 
              path="/rfis" 
              element={
                <ProtectedRoute allowedRoles={['ceo', 'cto', 'supervisor', 'engineer']}>
                  <Rfis />
                </ProtectedRoute>
              } 
            />

            {/* Financials & Budget audit */}
            <Route 
              path="/projects/:id/financials" 
              element={
                <ProtectedRoute allowedRoles={['ceo', 'cto', 'it', 'supervisor']}>
                  <Financials />
                </ProtectedRoute>
              } 
            />

            {/* Procurement pipeline */}
            <Route 
              path="/procurement" 
              element={
                <ProtectedRoute allowedRoles={['ceo', 'cto', 'it', 'supervisor', 'engineer']}>
                  <Procurement />
                </ProtectedRoute>
              } 
            />

            {/* Snagging Punch List defect tracker */}
            <Route 
              path="/projects/:id/snags" 
              element={
                <ProtectedRoute allowedRoles={['ceo', 'cto', 'it', 'supervisor', 'engineer', 'worker']}>
                  <Snags />
                </ProtectedRoute>
              } 
            />

            {/* Daily logs Site Diaries */}
            <Route 
              path="/daily-logs" 
              element={
                <ProtectedRoute allowedRoles={['ceo', 'cto', 'supervisor', 'engineer']}>
                  <DailyLogs />
                </ProtectedRoute>
              } 
            />

            {/* Fallback routing */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
}
