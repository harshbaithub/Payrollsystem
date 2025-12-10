import React, { useState, useEffect } from 'react';
import { bonusAPI, employeeAPI } from '../services/api';

const BonusManagement = () => {
  const [bonuses, setBonuses] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('pending');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [bonusesRes, employeesRes] = await Promise.all([
        bonusAPI.getAll(),
        employeeAPI.getAll()
      ]);
      setBonuses(bonusesRes.data);
      setEmployees(employeesRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveBonus = async (id) => {
    try {
      await bonusAPI.approve(id, { bonus_approved: true });
      fetchData();
      alert('Bonus approved successfully!');
    } catch (error) {
      console.error('Error approving bonus:', error);
      alert('Failed to approve bonus');
    }
  };

  const handleRejectBonus = async (id) => {
    try {
      await bonusAPI.approve(id, { bonus_approved: false });
      fetchData();
      alert('Bonus rejected!');
    } catch (error) {
      console.error('Error rejecting bonus:', error);
      alert('Failed to reject bonus');
    }
  };

  const getEmployeeName = (employeeId) => {
    const emp = employees.find(e => e.employee_id === employeeId);
    return emp ? `${emp.first_name} ${emp.last_name}` : employeeId;
  };

  const filteredBonuses = bonuses.filter(b => {
    if (filterStatus === 'pending') return !b.bonus_approved;
    if (filterStatus === 'approved') return b.bonus_approved;
    return true;
  });

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div>
      <div className="page-header">
        <h2>Bonus Management</h2>
      </div>

      <div className="card">
        <div style={{ marginBottom: '20px' }}>
          <label style={{ marginRight: '10px' }}>Filter by Status:</label>
          <select 
            value={filterStatus} 
            onChange={(e) => setFilterStatus(e.target.value)}
            style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
          >
            <option value="all">All</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
          </select>
        </div>

        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Employee</th>
                <th>Bonus Type</th>
                <th>Amount</th>
                <th>Description</th>
                <th>Date</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredBonuses.length > 0 ? (
                filteredBonuses.map((bonus) => (
                  <tr key={bonus.id}>
                    <td>{getEmployeeName(bonus.employee_id)}</td>
                    <td>{bonus.bonus_type}</td>
                    <td>₹{parseFloat(bonus.amount).toLocaleString('en-IN')}</td>
                    <td>{bonus.description || '-'}</td>
                    <td>{new Date(bonus.date).toLocaleDateString('en-IN')}</td>
                    <td>
                      <span className={`badge badge-${bonus.bonus_approved ? 'success' : 'warning'}`}>
                        {bonus.bonus_approved ? 'Approved' : 'Pending'}
                      </span>
                    </td>
                    <td>
                      {!bonus.bonus_approved ? (
                        <div style={{ display: 'flex', gap: '5px' }}>
                          <button 
                            className="btn btn-success btn-sm"
                            onClick={() => handleApproveBonus(bonus.id)}
                          >
                            Approve
                          </button>
                          <button 
                            className="btn btn-danger btn-sm"
                            onClick={() => handleRejectBonus(bonus.id)}
                          >
                            Reject
                          </button>
                        </div>
                      ) : (
                        <span style={{ color: '#999', fontSize: '12px' }}>Approved</span>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '20px', color: '#999' }}>
                    No bonuses found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default BonusManagement;
