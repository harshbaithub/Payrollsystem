import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { employeeAPI } from '../services/api';

const Dashboard = () => {
  const [profile, setProfile] = useState(null);
  const [stats, setStats] = useState({
    totalAttendance: 0,
    pendingAttendance: 0,
    salarySlips: 0,
    documents: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [refreshing, setRefreshing] = useState(false);
  
  const employee = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem('employee') || '{}');
    } catch (e) {
      console.error('Error parsing employee data:', e);
      return {};
    }
  }, []);

  const fetchDashboardData = useCallback(async () => {
    try {
      if (!refreshing) setLoading(true);
      setError(null);
      const [profileRes, attendanceRes, slipsRes, docsRes] = await Promise.all([
        employeeAPI.getProfile(),
        employeeAPI.getAttendance().catch(() => ({ data: [] })),
        employeeAPI.getSalarySlips().catch(() => ({ data: [] })),
        employeeAPI.getDocuments().catch(() => ({ data: [] }))
      ]);

      setProfile(profileRes.data);
      setStats({
        totalAttendance: Array.isArray(attendanceRes.data) ? attendanceRes.data.length : 0,
        pendingAttendance: Array.isArray(attendanceRes.data) ? attendanceRes.data.filter(a => a.approval_status === 'pending').length : 0,
        salarySlips: Array.isArray(slipsRes.data) ? slipsRes.data.length : 0,
        documents: Array.isArray(docsRes.data) ? docsRes.data.length : 0
      });
      setLoading(false);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setError('Failed to load dashboard data. Please try again.');
      setLoading(false);
    }
  }, [refreshing]);

  useEffect(() => {
    console.log('Dashboard mounted, fetching data...');
    fetchDashboardData();
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchDashboardData, 30000);
    return () => clearInterval(interval);
  }, [fetchDashboardData]);

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 3000);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchDashboardData();
    setRefreshing(false);
    showMessage('success', 'Dashboard refreshed successfully');
  };

  if (loading) return <div className="loading">Loading dashboard...</div>;
  if (error) return <div className="error-message">{error}</div>;

  return (
    <div>
      {message.text && (
        <div className={`message ${message.type}`}>
          {message.type === 'success' ? '✓' : '✕'} {message.text}
        </div>
      )}
      
      <div className="page-header">
        <div className="header-content">
          <div>
            <h2>Welcome, {employee.first_name || ''} {employee.last_name || ''}!</h2>
            <p>Employee ID: {employee.employee_id || 'N/A'} | Designation: {employee.designation || 'N/A'}</p>
          </div>
          <button 
            className="btn btn-secondary"
            onClick={handleRefresh}
            disabled={refreshing}
            title="Refresh dashboard data"
          >
            {refreshing ? '⟳ Refreshing...' : '⟳ Refresh'}
          </button>
        </div>
      </div>

      <div className="stats-container">
        <div className="stat-card blue">
          <h3>Monthly Salary</h3>
          <p>₹{parseFloat(profile?.basic_salary || 0).toLocaleString('en-IN')}</p>
        </div>
        <div className="stat-card green">
          <h3>Attendance Marked</h3>
          <p>{stats.totalAttendance}</p>
        </div>
        <div className="stat-card orange">
          <h3>Pending Approval</h3>
          <p>{stats.pendingAttendance}</p>
        </div>
        <div className="stat-card">
          <h3>Salary Slips</h3>
          <p>{stats.salarySlips}</p>
        </div>
      </div>

      <div className="card">
        <h3>Quick Actions</h3>
        <div className="btn-group mt-20">
          <button className="btn btn-primary" onClick={() => window.location.href = '/#/attendance'}>
            Mark Attendance
          </button>
          <button className="btn btn-success" onClick={() => window.location.href = '/#/salary-slips'}>
            View Salary Slips
          </button>
          <button className="btn btn-secondary" onClick={() => window.location.href = '/#/profile'}>
            Update Profile
          </button>
          <button className="btn btn-primary" onClick={() => window.location.href = '/#/documents'}>
            My Documents
          </button>
        </div>
      </div>

      <div className="card">
        <h3>Personal Information</h3>
        <div className="info-grid">
          <div className="info-item">
            <strong>Email:</strong> {profile?.email}
          </div>
          <div className="info-item">
            <strong>Phone:</strong> {profile?.phone || 'Not provided'}
          </div>
          <div className="info-item">
            <strong>Department:</strong> {profile?.department}
          </div>
          <div className="info-item">
            <strong>Hire Date:</strong> {profile?.hire_date ? new Date(profile.hire_date).toLocaleDateString('en-IN') : 'N/A'}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
