import React, { useState, useEffect } from 'react';
import { employeeAPI } from '../services/api';

const AdvanceSalary = () => {
  const [advanceSalaries, setAdvanceSalaries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    amount: '',
    description: ''
  });
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    fetchAdvanceSalaries();
  }, []);

  const fetchAdvanceSalaries = async () => {
    try {
      setLoading(true);
      const response = await employeeAPI.getAdvanceSalaries();
      setAdvanceSalaries(Array.isArray(response.data) ? response.data : []);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching advance salaries:', error);
      setAdvanceSalaries([]);
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.amount || formData.amount <= 0) {
      setMessage({ type: 'error', text: 'Please enter a valid amount' });
      return;
    }

    try {
      await employeeAPI.requestAdvanceSalary({
        amount: parseFloat(formData.amount),
        description: formData.description
      });
      setMessage({ type: 'success', text: 'Advance salary request submitted successfully!' });
      setFormData({ amount: '', description: '' });
      setShowModal(false);
      fetchAdvanceSalaries();
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (error) {
      console.error('Error submitting request:', error);
      setMessage({ type: 'error', text: error.response?.data?.message || 'Failed to submit request' });
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setFormData({ amount: '', description: '' });
  };

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div>
      <div className="page-header">
        <h2>Advance Salary Requests</h2>
      </div>

      {message.text && (
        <div className={`alert alert-${message.type}`}>
          {message.text}
        </div>
      )}

      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div style={{ fontSize: '14px', color: '#666' }}>
            Total Requests: <strong>{advanceSalaries.length}</strong>
          </div>
          <button className="btn btn-success" onClick={() => setShowModal(true)}>
            + Request Advance Salary
          </button>
        </div>

        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Amount</th>
                <th>Status</th>
                <th>Requested Date</th>
                <th>Deduction Month</th>
              </tr>
            </thead>
            <tbody>
              {advanceSalaries.length > 0 ? (
                advanceSalaries.map((request) => (
                  <tr key={request.id}>
                    <td>₹{parseFloat(request.amount).toLocaleString('en-IN')}</td>
                    <td>
                      <span className={`badge badge-${
                        request.approval_status === 'approved' ? 'success' : 
                        request.approval_status === 'rejected' ? 'danger' : 
                        'warning'
                      }`}>
                        {request.approval_status}
                      </span>
                    </td>
                    <td>{new Date(request.requested_date).toLocaleDateString('en-IN')}</td>
                    <td>
                      {request.deduction_month && request.deduction_year
                        ? `${request.deduction_month}/${request.deduction_year}`
                        : '-'
                      }
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" style={{ textAlign: 'center', padding: '20px', color: '#999' }}>
                    No advance salary requests yet
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>Request Advance Salary</h3>
              <button className="modal-close" onClick={handleCloseModal}>&times;</button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Amount (₹)</label>
                <input
                  type="number"
                  name="amount"
                  value={formData.amount}
                  onChange={handleInputChange}
                  placeholder="Enter amount"
                  min="0"
                  step="0.01"
                  required
                />
              </div>

              <div className="form-group">
                <label>Reason for Request</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Explain why you need advance salary..."
                  rows="4"
                />
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={handleCloseModal}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-success">
                  Submit Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdvanceSalary;
