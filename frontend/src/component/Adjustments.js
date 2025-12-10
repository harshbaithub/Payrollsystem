import React, { useState, useEffect } from 'react';
import { deductionAPI, bonusAPI, employeeAPI, advanceSalaryAPI, extraDaysAPI } from '../services/api';

const Adjustments = () => {
  const [activeTab, setActiveTab] = useState('deductions');
  const [deductions, setDeductions] = useState([]);
  const [bonuses, setBonuses] = useState([]);
  const [extraDays, setExtraDays] = useState([]);
  const [advanceSalaries, setAdvanceSalaries] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [approvalModal, setApprovalModal] = useState(false);
  const [selectedApprovalId, setSelectedApprovalId] = useState(null);
  const [approvalData, setApprovalData] = useState({ deduction_month: '', deduction_year: '' });
  const [formData, setFormData] = useState({
    employee_id: '',
    type: '',
    amount: '',
    description: '',
    date: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [deductionsRes, bonusesRes, employeesRes, advanceSalariesRes, extraDaysRes] = await Promise.all([
        deductionAPI.getAll(),
        bonusAPI.getAll(),
        employeeAPI.getAll(),
        advanceSalaryAPI.getAll(),
        extraDaysAPI.getAll()
      ]);
      setDeductions(deductionsRes.data);
      setBonuses(bonusesRes.data);
      setEmployees(employeesRes.data);
      setAdvanceSalaries(advanceSalariesRes.data);
      setExtraDays(extraDaysRes.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      setLoading(false);
    }
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
      if (activeTab === 'deductions') {
        await deductionAPI.create({
          employee_id: formData.employee_id,
          deduction_type: formData.type,
          amount: formData.amount,
          description: formData.description,
          date: formData.date
        });
      } else if (activeTab === 'bonuses') {
        await bonusAPI.create({
          employee_id: formData.employee_id,
          bonus_type: formData.type,
          amount: formData.amount,
          description: formData.description,
          date: formData.date
        });
      } else if (activeTab === 'extra-days') {
        await extraDaysAPI.create({
          employee_id: formData.employee_id,
          days_count: formData.amount, // Using amount field for days count
          reason: formData.type,
          date: formData.date
        });
      }
      fetchData();
      handleCloseModal();
      alert(`${activeTab === 'deductions' ? 'Deduction' : activeTab === 'bonuses' ? 'Bonus' : 'Extra Day'} added successfully!`);
    } catch (error) {
      console.error('Error saving:', error);
      alert('Failed to save.');
    }
  };

  const handleDelete = async (id, type) => {
    if (window.confirm('Are you sure you want to delete this record?')) {
      try {
        if (type === 'deduction') {
          await deductionAPI.delete(id);
        } else if (type === 'bonus') {
          await bonusAPI.delete(id);
        } else {
          await extraDaysAPI.delete(id);
        }
        fetchData();
      } catch (error) {
        console.error('Error deleting:', error);
      }
    }
  };

  const handleApproveAdvanceSalary = async (id) => {
    setSelectedApprovalId(id);
    setApprovalModal(true);
  };

  const handleSubmitApproval = async () => {
    if (!approvalData.deduction_month || !approvalData.deduction_year) {
      alert('Please enter both deduction month and year');
      return;
    }
    try {
      await advanceSalaryAPI.approve(selectedApprovalId, {
        deduction_month: parseInt(approvalData.deduction_month),
        deduction_year: parseInt(approvalData.deduction_year)
      });
      fetchData();
      setApprovalModal(false);
      setApprovalData({ deduction_month: '', deduction_year: '' });
      setSelectedApprovalId(null);
      alert('Advance salary request approved!');
    } catch (error) {
      console.error('Error approving:', error);
      alert('Failed to approve request');
    }
  };

  const handleRejectAdvanceSalary = async (id) => {
    if (window.confirm('Are you sure you want to reject this request?')) {
      try {
        await advanceSalaryAPI.reject(id, {});
        fetchData();
        alert('Advance salary request rejected!');
      } catch (error) {
        console.error('Error rejecting:', error);
        alert('Failed to reject request');
      }
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setFormData({
      employee_id: '',
      type: '',
      amount: '',
      description: '',
      date: new Date().toISOString().split('T')[0]
    });
  };

  const getEmployeeName = (employeeId) => {
    const emp = employees.find(e => e.employee_id === employeeId);
    return emp ? `${emp.first_name} ${emp.last_name}` : employeeId;
  };

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div>
      <div className="page-header">
        <h2>Salary Adjustments</h2>
      </div>

      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
          <div className="btn-group">
            <button
              className={`btn ${activeTab === 'deductions' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setActiveTab('deductions')}
            >
              Deductions
            </button>
            <button
              className={`btn ${activeTab === 'bonuses' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setActiveTab('bonuses')}
            >
              Bonuses
            </button>
            <button
              className={`btn ${activeTab === 'extra-days' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setActiveTab('extra-days')}
            >
              Extra Days
            </button>
            <button
              className={`btn ${activeTab === 'advance-salary' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setActiveTab('advance-salary')}
            >
              Advance Salary Requests
            </button>
          </div>
          {activeTab !== 'advance-salary' && (
            <button className="btn btn-success" onClick={() => setShowModal(true)}>
              {`Add ${activeTab === 'deductions' ? 'Deduction' : activeTab === 'bonuses' ? 'Bonus' : 'Extra Day'}`}
            </button>
          )}
        </div>

        <div className="table-container">
          <table>
            <thead>
              <tr>
                {activeTab !== 'advance-salary' && <th>Date</th>}
                <th>Employee</th>
                {activeTab !== 'advance-salary' && <th>{activeTab === 'extra-days' ? 'Reason' : 'Type'}</th>}
                <th>{activeTab === 'extra-days' ? 'Days' : 'Amount'}</th>
                {activeTab !== 'advance-salary' && activeTab !== 'extra-days' && <th>Description</th>}
                {activeTab === 'advance-salary' && <th>Status</th>}
                {activeTab === 'advance-salary' && <th>Requested Date</th>}
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {activeTab === 'advance-salary' ? (
                advanceSalaries.map((record) => (
                  <tr key={record.id}>
                    <td>{getEmployeeName(record.employee_id)}</td>
                    <td>₹{parseFloat(record.amount).toLocaleString('en-IN')}</td>
                    <td>
                      <span className={`badge badge-${record.approval_status === 'approved' ? 'success' :
                        record.approval_status === 'rejected' ? 'danger' :
                          'warning'
                        }`}>
                        {record.approval_status}
                      </span>
                    </td>
                    <td>{new Date(record.requested_date).toLocaleDateString('en-IN')}</td>
                    <td>
                      {record.approval_status === 'pending' ? (
                        <div style={{ display: 'flex', gap: '5px' }}>
                          <button
                            className="btn btn-success btn-sm"
                            onClick={() => handleApproveAdvanceSalary(record.id)}
                          >
                            Approve
                          </button>
                          <button
                            className="btn btn-danger btn-sm"
                            onClick={() => handleRejectAdvanceSalary(record.id)}
                          >
                            Reject
                          </button>
                        </div>
                      ) : (
                        <span style={{ color: '#999', fontSize: '12px' }}>No Action</span>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                (activeTab === 'deductions' ? deductions : activeTab === 'bonuses' ? bonuses : extraDays).map((record) => (
                  <tr key={record.id}>
                    <td>{new Date(record.date).toLocaleDateString()}</td>
                    <td>{getEmployeeName(record.employee_id)}</td>
                    <td>{record.deduction_type || record.bonus_type || record.reason}</td>
                    <td>{activeTab === 'extra-days' ? record.days_count : `₹${parseFloat(record.amount).toLocaleString('en-IN')}`}</td>
                    {activeTab !== 'extra-days' && <td>{record.description || '-'}</td>}
                    <td>
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => handleDelete(record.id, activeTab === 'deductions' ? 'deduction' : activeTab === 'bonuses' ? 'bonus' : 'extra-day')}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && activeTab !== 'advance-salary' && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>Add {activeTab === 'deductions' ? 'Deduction' : activeTab === 'bonuses' ? 'Bonus' : 'Extra Day'}</h3>
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
                  <label>Type</label>
                  <input
                    type="text"
                    name="type"
                    value={formData.type}
                    onChange={handleInputChange}
                    placeholder={activeTab === 'deductions' ? 'e.g., Tax, Insurance' : activeTab === 'bonuses' ? 'e.g., Performance, Festival' : 'e.g., Weekend work'}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>{activeTab === 'extra-days' ? 'Days Count' : 'Amount'}</label>
                  <input
                    type="number"
                    name="amount"
                    value={formData.amount}
                    onChange={handleInputChange}
                    step="0.01"
                    min="0"
                    required
                  />
                </div>
              </div>

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
                <label>Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                />
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={handleCloseModal}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-success">
                  Add
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {approvalModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>Approve Advance Salary Request</h3>
              <button className="modal-close" onClick={() => { setApprovalModal(false); setApprovalData({ deduction_month: '', deduction_year: '' }); }}>&times;</button>
            </div>

            <form onSubmit={(e) => { e.preventDefault(); handleSubmitApproval(); }}>
              <div className="form-group">
                <label>Deduction Month (1-12)</label>
                <input
                  type="number"
                  min="1"
                  max="12"
                  value={approvalData.deduction_month}
                  onChange={(e) => setApprovalData({ ...approvalData, deduction_month: e.target.value })}
                  placeholder="e.g., 1 for January"
                  required
                />
              </div>

              <div className="form-group">
                <label>Deduction Year</label>
                <input
                  type="number"
                  min="2020"
                  max={new Date().getFullYear() + 1}
                  value={approvalData.deduction_year}
                  onChange={(e) => setApprovalData({ ...approvalData, deduction_year: e.target.value })}
                  placeholder="e.g., 2025"
                  required
                />
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => { setApprovalModal(false); setApprovalData({ deduction_month: '', deduction_year: '' }); }}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-success">
                  Approve
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Adjustments;
