import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import Attendance from './components/Attendance';
import SalarySlips from './components/SalarySlips';
import Profile from './components/Profile';
import Documents from './components/Documents';
import AdvanceSalary from './components/AdvanceSalary';
import './App.css';
import './modern-styles.css';

// Simple nav component
const Nav = ({ onLogout }) => {
  let employee = {};
  try {
    employee = JSON.parse(localStorage.getItem('employee') || '{}');
  } catch (e) {
    employee = {};
  }
  
  return (
    <nav className="nav">
      <h1>💼 My Workspace</h1>
      <div className="nav-profile">
        <div className="profile-badge">
          <div className="avatar">{(employee.first_name?.[0] || 'E').toUpperCase()}</div>
          <div className="profile-info">
            <div className="profile-name">{employee.first_name || 'Employee'} {employee.last_name || ''}</div>
            <div className="profile-id">{employee.employee_id || 'ID'}</div>
          </div>
        </div>
      </div>
      <ul>
        <li><a href="/#/dashboard">Dashboard</a></li>
        <li><a href="/#/attendance">My Attendance</a></li>
        <li><a href="/#/salary-slips">Salary Slips</a></li>
        <li><a href="/#/advance-salary">Advance Salary</a></li>
        <li><a href="/#/profile">My Profile</a></li>
        <li><a href="/#/documents">Documents</a></li>
        <li><button className="btn btn-danger btn-block" onClick={onLogout}>Logout</button></li>
      </ul>
    </nav>
  );
};

// Protected Route component
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  return token ? children : <Navigate to="/" />;
};

function App() {
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('employee');
    window.location.reload();
  };

  const isAuthenticated = !!localStorage.getItem('token');
  console.log('App rendered, isAuthenticated:', isAuthenticated);

  if (!isAuthenticated) {
    return <Login />;
  }

  return (
    <Router>
      <div className="app">
        <Nav onLogout={handleLogout} />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" />} />
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/attendance" element={<ProtectedRoute><Attendance /></ProtectedRoute>} />
            <Route path="/salary-slips" element={<ProtectedRoute><SalarySlips /></ProtectedRoute>} />
            <Route path="/advance-salary" element={<ProtectedRoute><AdvanceSalary /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            <Route path="/documents" element={<ProtectedRoute><Documents /></ProtectedRoute>} />
            <Route path="*" element={<div><h2>Feature Coming Soon</h2><p>This feature is under development.</p></div>} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
