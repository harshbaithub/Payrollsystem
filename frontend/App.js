import React from 'react';
import { HashRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import './App.css';
import './modern-styles.css';

import Dashboard from './components/Dashboard';
import Employees from './components/Employees';
import Attendance from './components/Attendance';
import Payroll from './components/Payroll';
import Adjustments from './components/Adjustments';
import Documents from './components/Documents';

const Navigation = () => {
  const location = useLocation();

  return (
    <nav className="nav">
      <h1>💼 HR Management</h1>
      <ul>
        <li>
          <Link to="/" className={location.pathname === '/' ? 'active' : ''}>
            Dashboard
          </Link>
        </li>
        <li>
          <Link to="/employees" className={location.pathname === '/employees' ? 'active' : ''}>
            Employees
          </Link>
        </li>
        <li>
          <Link to="/attendance" className={location.pathname === '/attendance' ? 'active' : ''}>
            Attendance
          </Link>
        </li>
        <li>
          <Link to="/adjustments" className={location.pathname === '/adjustments' ? 'active' : ''}>
            Adjustments
          </Link>
        </li>
        <li>
          <Link to="/payroll" className={location.pathname === '/payroll' ? 'active' : ''}>
            Payroll
          </Link>
        </li>
        <li>
          <Link to="/documents" className={location.pathname === '/documents' ? 'active' : ''}>
            Documents
          </Link>
        </li>
      </ul>
    </nav>
  );
};

function App() {
  return (
    <Router>
      <div className="app">
        <Navigation />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/employees" element={<Employees />} />
            <Route path="/attendance" element={<Attendance />} />
            <Route path="/adjustments" element={<Adjustments />} />
            <Route path="/payroll" element={<Payroll />} />
            <Route path="/documents" element={<Documents />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
