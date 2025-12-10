import React, { useState, useEffect } from 'react';
import { advanceSalaryAPI } from '../services/api';

const AdvanceSalary = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [filterStatus, setFilterStatus] = useState('all');
  const [filteredRequests, setFilteredRequests] = useState([]);

  useEffect(() => {
    fetchAdvanceSalaryRequests();
  }, []);

  useEffect(() => {
    filterRequests();
  }, [requests, filterStatus]);

  const filterRequests = () => {
    let filtered = requests;
    if (filterStatus !== 'all') {
      filtered = requests.filter(r => r.approval_status === filterStatus);
    }
    setFilteredRequests(filtered);
  };

  const fetchAdvanceSalaryRequests = async () => {
    try {
      const response = await advanceSalaryAPI.getAll();
      setRequests(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching advance salary requests:', error);
      showMessage('error', 'Failed to load advance salary requests');
      setLoading(false);
    }
  };

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 3000);
  };

  const handleApprove = async (id) => {
    try {
      const deductionMonth = prompt('Enter deduction month (1-12):');
      const deductionYear = prompt('Enter deduction year (e.g., 2025):');

      if (!deductionMonth || !deductionYear) {
        return;
      }

      await advanceSalaryAPI.approve(id, {
        deduction_month: parseInt(deductionMonth),
        deduction_year: parseInt(deductionYear)
      });
      
      showMessage('success', 'Advance salary approved successfully');
      fetchAdvanceSalaryRequests();
    } catch (error) {
      console.error('Error approving request:', error);
      showMessage('error', 'Failed to approve advance salary request');
    }
  };

  const handleReject = async (id) => {
    if (window.confirm('Are you sure you want to reject this request?')) {
      try {
        await advanceSalaryAPI.reject(id);
        showMessage('success', 'Advance salary request rejected');
        fetchAdvanceSalaryRequests();
      } catch (error) {
        console.error('Error rejecting request:', error);
        showMessage('error', 'Failed to reject advance salary request');
      }
    }
  };

  if (loading) return <div className="loading">Loading advance salary requests...</div>;

  return (
    <div>
      {message.text && (
        <div className={`message ${message.type}`}>
          {message.type === 'success' ? '✓' : '✕'} {message.text}
        </div>
      )}

      <div className="page-header">
        <h2>Advance Salary Requests</h2>
      </div>

      <div className="card">
        <div style={{ marginBottom: '20px' }}>
          <select 
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            style={{
              padding: '10px',
              borderRadius: '5px',
              border: '1px solid #ddd'
            }}
          >
            <option value="all">All Requests</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>

        {filteredRequests.length === 0 ? (
          <p style={{ color: '#7f8c8d', textAlign: 'center', padding: '40px 20px' }}>
            No advance salary requests found.
          </p>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Designation</th>
                  <th>Amount (₹)</th>
                  <th>Requested Date</th>
                  <th>Deduction Month</th>
                  <th>Status</th>
                  <th>Notes</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredRequests.map((request) => (
                  <tr key={request.id}>
                    <td>{request.first_name} {request.last_name}</td>
                    <td>{request.designation || 'N/A'}</td>
                    <td style={{ fontWeight: 'bold' }}>
                      {Number(request.amount).toLocaleString('en-IN')}
                    </td>
                    <td>{new Date(request.requested_date).toLocaleDateString('en-IN')}</td>
                    <td>
                      {request.deduction_month && request.deduction_year 
                        ? `${request.deduction_month}/${request.deduction_year}`
                        : '-'
                      }
                    </td>
                    <td>
                      <span className={`badge badge-${
                        request.approval_status === 'approved' ? 'success' : 
                        request.approval_status === 'rejected' ? 'danger' : 
                        'warning'
                      }`}>
                        {request.approval_status}
                      </span>
                    </td>
                    <td>{request.notes || '-'}</td>
                    <td>
                      <div className="table-actions">
                        {request.approval_status === 'pending' && (
                          <>
                            <button 
                              className="btn btn-success btn-sm"
                              onClick={() => handleApprove(request.id)}
                              title="Approve this request"
                            >
                              Approve
                            </button>
                            <button 
                              className="btn btn-danger btn-sm"
                              onClick={() => handleReject(request.id)}
                              title="Reject this request"
                            >
                              Reject
                            </button>
                          </>
                        )}
                        {request.approval_status !== 'pending' && (
                          <span style={{ color: '#999' }}>No actions</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="card" style={{ marginTop: '30px' }}>
        <h3>Summary</h3>
        <div className="form-row">
          <div className="info-item">
            <strong>Total Requests:</strong>
            <p style={{ fontSize: '24px', color: '#667eea' }}>{requests.length}</p>
          </div>
          <div className="info-item">
            <strong>Pending:</strong>
            <p style={{ fontSize: '24px', color: '#f39c12' }}>
              {requests.filter(r => r.approval_status === 'pending').length}
            </p>
          </div>
          <div className="info-item">
            <strong>Approved:</strong>
            <p style={{ fontSize: '24px', color: '#27ae60' }}>
              {requests.filter(r => r.approval_status === 'approved').length}
            </p>
          </div>
          <div className="info-item">
            <strong>Total Approved Amount:</strong>
            <p style={{ fontSize: '24px', color: '#27ae60' }}>
              ₹{requests
                .filter(r => r.approval_status === 'approved')
                .reduce((sum, r) => sum + Number(r.amount), 0)
                .toLocaleString('en-IN')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdvanceSalary;
