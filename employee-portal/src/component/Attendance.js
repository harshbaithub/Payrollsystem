import React, { useState, useEffect } from 'react';
import { employeeAPI } from '../services/api';

const Attendance = () => {
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    status: 'present',
    notes: ''
  });
  const [message, setMessage] = useState('');
  const employee = JSON.parse(localStorage.getItem('employee') || '{}');

  useEffect(() => {
    fetchAttendance();
  }, []);

  const fetchAttendance = async () => {
    try {
      const response = await employeeAPI.getAttendance();
      setAttendanceRecords(response.data || []);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching attendance:', error);
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await employeeAPI.submitAttendance(formData);
      setMessage('Attendance marked successfully!');
      setFormData({ date: new Date().toISOString().split('T')[0], status: 'present', notes: '' });
      setShowForm(false);
      fetchAttendance();
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage('Error marking attendance: ' + (error.response?.data?.error || error.message));
    }
  };

  if (loading) return <div className="loading">Loading attendance...</div>;

  return (
    <div>
      <div className="page-header">
        <h2>My Attendance</h2>
        <p>Employee ID: {employee.employee_id}</p>
      </div>

      {message && <div className={message.includes('successfully') ? 'success' : 'error'}>{message}</div>}

      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3>Mark Attendance</h3>
          <button 
            className="btn btn-primary" 
            onClick={() => setShowForm(!showForm)}
          >
            {showForm ? 'Cancel' : 'Mark Attendance'}
          </button>
        </div>

        {showForm && (
          <form onSubmit={handleSubmit} style={{ marginTop: '20px', paddingTop: '20px', borderTop: '1px solid #ddd' }}>
            <div className="form-row">
              <div className="form-group">
                <label>Date</label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                >
                  <option value="present">Present</option>
                  <option value="absent">Absent</option>
                  <option value="half-day">Half Day</option>
                  <option value="leave">Leave</option>
                </select>
              </div>
            </div>
            <div className="form-group">
              <label>Notes (Optional)</label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Add any notes..."
              />
            </div>
            <button type="submit" className="btn btn-success">Submit Attendance</button>
          </form>
        )}
      </div>

      <div className="card">
        <h3>Attendance History</h3>
        {attendanceRecords.length === 0 ? (
          <p style={{ color: '#7f8c8d' }}>No attendance records yet.</p>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Status</th>
                  <th>Notes</th>
                  <th>Approval Status</th>
                </tr>
              </thead>
              <tbody>
                {attendanceRecords.map((record) => (
                  <tr key={record.id}>
                    <td>{new Date(record.date).toLocaleDateString('en-IN')}</td>
                    <td>
                      <span className={`badge badge-${record.status === 'present' ? 'success' : record.status === 'absent' ? 'danger' : 'warning'}`}>
                        {record.status}
                      </span>
                    </td>
                    <td>{record.notes || '-'}</td>
                    <td>
                      <span className={`badge badge-${record.approval_status === 'approved' ? 'success' : record.approval_status === 'rejected' ? 'danger' : 'warning'}`}>
                        {record.approval_status || 'pending'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Attendance;
