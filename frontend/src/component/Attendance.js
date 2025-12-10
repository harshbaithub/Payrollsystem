import React, { useState, useEffect, useCallback } from 'react';
import { attendanceAPI, employeeAPI } from '../services/api';

const Attendance = () => {
  const [attendance, setAttendance] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [activeTab, setActiveTab] = useState('pending'); // 'pending' or 'all'
  const [approvalNotes, setApprovalNotes] = useState({});
  const [message, setMessage] = useState({ type: '', text: '' });
  const [formData, setFormData] = useState({
    employee_id: '',
    date: new Date().toISOString().split('T')[0],
    status: 'present',
    hours_worked: 8,
    overtime_hours: 0,
    notes: ''
  });

  const fetchPendingRequests = useCallback(async () => {
    try {
      const pendingRes = await attendanceAPI.getPending();
      setPendingRequests(pendingRes.data || []);
    } catch (error) {
      console.error('Error fetching pending requests:', error);
    }
  }, []);

  const fetchData = useCallback(async () => {
    try {
      if (!refreshing) setLoading(true);
      const [attendanceRes, employeesRes, pendingRes] = await Promise.all([
        attendanceAPI.getAll(),
        employeeAPI.getAll(),
        attendanceAPI.getPending()
      ]);
      setAttendance(attendanceRes.data);
      setEmployees(employeesRes.data);
      setPendingRequests(pendingRes.data || []);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      setLoading(false);
    }
  }, [refreshing]);

  useEffect(() => {
    fetchData();
    // Auto-refresh pending approvals every 20 seconds
    const interval = setInterval(() => fetchPendingRequests(), 20000);
    return () => clearInterval(interval);
  }, [fetchData, fetchPendingRequests]);

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 3000);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
    showMessage('success', 'Attendance data refreshed');
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await attendanceAPI.create(formData);
      fetchData();
      handleCloseModal();
    } catch (error) {
      console.error('Error saving attendance:', error);
      alert('Failed to save attendance record.');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this record?')) {
      try {
        await attendanceAPI.delete(id);
        fetchData();
      } catch (error) {
        console.error('Error deleting attendance:', error);
      }
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setFormData({
      employee_id: '',
      date: new Date().toISOString().split('T')[0],
      status: 'present',
      hours_worked: 8,
      overtime_hours: 0,
      notes: ''
    });
  };

  const getEmployeeName = (employeeId) => {
    const emp = employees.find(e => e.employee_id === employeeId);
    return emp ? `${emp.first_name} ${emp.last_name}` : employeeId;
  };

  if (loading) return <div className="loading">Loading attendance...</div>;

  const handleApprove = async (id) => {
    try {
      await attendanceAPI.approve(id, {
        approval_status: 'approved',
        notes: approvalNotes[id] || ''
      });
      fetchPendingRequests();
      setApprovalNotes({ ...approvalNotes, [id]: '' });
      showMessage('success', 'Attendance approved successfully');
    } catch (error) {
      console.error('Error approving attendance:', error);
      showMessage('error', 'Failed to approve attendance');
    }
  };

  const handleReject = async (id) => {
    try {
      await attendanceAPI.approve(id, {
        approval_status: 'rejected',
        notes: approvalNotes[id] || ''
      });
      fetchPendingRequests();
      setApprovalNotes({ ...approvalNotes, [id]: '' });
      showMessage('success', 'Attendance rejected');
    } catch (error) {
      console.error('Error rejecting attendance:', error);
      showMessage('error', 'Failed to reject attendance');
    }
  };

  return (
    <div>
      {message.text && (
        <div className={`message ${message.type}`}>
          {message.type === 'success' ? '✓' : '✕'} {message.text}
        </div>
      )}

      <div className="page-header">
        <div className="header-content">
          <h2>Attendance Management</h2>
          <button 
            className="btn btn-secondary"
            onClick={handleRefresh}
            disabled={refreshing}
            title="Refresh attendance data"
          >
            {refreshing ? '⟳ Refreshing...' : '⟳ Refresh'}
          </button>
        </div>
      </div>

      <div className="card">
        <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
          <button 
            className={`btn ${activeTab === 'pending' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveTab('pending')}
          >
            Pending Approvals ({pendingRequests.length})
          </button>
          <button 
            className={`btn ${activeTab === 'all' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveTab('all')}
          >
            All Attendance
          </button>
        </div>

        {activeTab === 'pending' && (
          <div>
            <h3>Pending Employee Attendance Requests</h3>
            {pendingRequests.length === 0 ? (
              <p style={{ color: '#7f8c8d' }}>No pending attendance requests.</p>
            ) : (
              <div className="table-container">
                <table>
                  <thead>
                    <tr>
                      <th>Employee</th>
                      <th>Employee ID</th>
                      <th>Designation</th>
                      <th>Date</th>
                      <th>Status</th>
                      <th>Notes</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pendingRequests.map((req) => (
                      <tr key={req.id}>
                        <td>{req.first_name} {req.last_name}</td>
                        <td>{req.employee_id}</td>
                        <td>{req.designation}</td>
                        <td>{new Date(req.date).toLocaleDateString('en-IN')}</td>
                        <td>
                          <span className={`badge badge-${req.status === 'present' ? 'success' : req.status === 'absent' ? 'danger' : 'warning'}`}>
                            {req.status}
                          </span>
                        </td>
                        <td>{req.notes || '-'}</td>
                        <td>
                          <div style={{ display: 'flex', gap: '5px' }}>
                            <button 
                              className="btn btn-sm btn-success" 
                              onClick={() => handleApprove(req.id)}
                            >
                              Approve
                            </button>
                            <button 
                              className="btn btn-sm btn-danger" 
                              onClick={() => handleReject(req.id)}
                            >
                              Reject
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {activeTab === 'all' && (
          <div>
            <h3>All Attendance Records</h3>
            <div className="btn-group" style={{ marginBottom: '20px' }}>
              <button className="btn btn-primary" onClick={() => setShowModal(true)}>
                Mark Attendance
              </button>
            </div>

            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Employee</th>
                    <th>Status</th>
                    <th>Hours Worked</th>
                    <th>Overtime Hours</th>
                    <th>Notes</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {attendance.map((record) => (
                    <tr key={record.id}>
                      <td>{new Date(record.date).toLocaleDateString('en-IN')}</td>
                      <td>{getEmployeeName(record.employee_id)}</td>
                      <td>
                        <span className={`badge badge-${
                          record.status === 'present' ? 'success' : 
                          record.status === 'absent' ? 'danger' : 'warning'
                        }`}>
                          {record.status}
                        </span>
                      </td>
                      <td>{record.hours_worked}</td>
                      <td>{record.overtime_hours}</td>
                      <td>{record.notes || '-'}</td>
                      <td>
                        <button className="btn btn-danger btn-sm" onClick={() => handleDelete(record.id)}>
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>Mark Attendance</h3>
              <button className="modal-close" onClick={handleCloseModal}>&times;</button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Employee</label>
                <select
                  name="employee_id"
                  value={formData.employee_id}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Select Employee</option>
                  {employees.filter(e => e.status === 'active').map(emp => (
                    <option key={emp.employee_id} value={emp.employee_id}>
                      {emp.first_name} {emp.last_name} ({emp.employee_id})
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Date</label>
                  <input
                    type="date"
                    name="date"
                    value={formData.date}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Status</label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="present">Present</option>
                    <option value="absent">Absent</option>
                    <option value="half-day">Half Day</option>
                    <option value="leave">Leave</option>
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Hours Worked</label>
                  <input
                    type="number"
                    name="hours_worked"
                    value={formData.hours_worked}
                    onChange={handleInputChange}
                    step="0.5"
                    min="0"
                    max="24"
                  />
                </div>
                <div className="form-group">
                  <label>Overtime Hours</label>
                  <input
                    type="number"
                    name="overtime_hours"
                    value={formData.overtime_hours}
                    onChange={handleInputChange}
                    step="0.5"
                    min="0"
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Notes</label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                />
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={handleCloseModal}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Attendance;
