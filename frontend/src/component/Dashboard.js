import React, { useState, useEffect } from 'react';
import { employeeAPI } from '../services/api';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalEmployees: 0,
    activeEmployees: 0,
    departments: 0,
    totalSalary: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await employeeAPI.getAll();
      const employees = response.data;

      const activeEmployees = employees.filter(e => e.status === 'active');
      const departments = [...new Set(employees.map(e => e.department))].length;
      const totalSalary = activeEmployees.reduce((sum, e) => sum + parseFloat(e.basic_salary), 0);

      setStats({
        totalEmployees: employees.length,
        activeEmployees: activeEmployees.length,
        departments,
        totalSalary
      });
      setLoading(false);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setLoading(false);
    }
  };

  if (loading) return <div className="loading">Loading dashboard...</div>;

  return (
    <div>
      <div className="page-header">
        <h2>Dashboard</h2>
        <p>Welcome to the Payroll Management System</p>
      </div>

      <div className="stats-container">
        <div className="stat-card blue">
          <h3>Total Employees</h3>
          <p>{stats.totalEmployees}</p>
        </div>
        <div className="stat-card green">
          <h3>Active Employees</h3>
          <p>{stats.activeEmployees}</p>
        </div>
        <div className="stat-card orange">
          <h3>Departments</h3>
          <p>{stats.departments}</p>
        </div>
        <div className="stat-card purple">
          <h3>Monthly Salary Budget</h3>
          <p>₹{stats.totalSalary.toLocaleString('en-IN')}</p>
        </div>
      </div>

      <div className="card">
        <h3>Quick Actions</h3>
        <div className="btn-group mt-20">
          <button className="btn btn-primary" onClick={() => window.location.href = '/#/employees'}>
            Manage Employees
          </button>
          <button className="btn btn-success" onClick={() => window.location.href = '/#/attendance'}>
            Mark Attendance
          </button>
          <button className="btn btn-secondary" onClick={() => window.location.href = '/#/payroll'}>
            Process Payroll
          </button>
        </div>
      </div>

      <div className="card">
        <h3>System Overview</h3>
        <p>This payroll system allows you to:</p>
        <ul style={{ marginLeft: '20px', marginTop: '15px', lineHeight: '1.8' }}>
          <li>Manage employee records and information</li>
          <li>Track daily attendance and overtime hours</li>
          <li>Add bonuses and deductions for employees</li>
          <li>Generate monthly payroll automatically</li>
          <li>View detailed payroll reports and summaries</li>
        </ul>
      </div>
    </div>
  );
};

export default Dashboard;
