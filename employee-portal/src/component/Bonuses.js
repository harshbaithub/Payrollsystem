import React, { useState, useEffect } from 'react';
import { employeeAPI } from '../services/api';

const Bonuses = () => {
  const [bonuses, setBonuses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchBonuses();
  }, []);

  const fetchBonuses = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await employeeAPI.getApprovedBonuses();
      setBonuses(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      console.error('Error fetching bonuses:', err);
      setError('Failed to load bonuses');
      setBonuses([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div>
      <div className="page-header">
        <h2>My Bonuses</h2>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      <div className="card">
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Bonus Type</th>
                <th>Amount</th>
                <th>Description</th>
                <th>Approved Date</th>
              </tr>
            </thead>
            <tbody>
              {bonuses.length > 0 ? (
                bonuses.map((bonus) => (
                  <tr key={bonus.id}>
                    <td>{bonus.bonus_type}</td>
                    <td>₹{parseFloat(bonus.amount).toLocaleString('en-IN')}</td>
                    <td>{bonus.description || '-'}</td>
                    <td>{bonus.approval_date ? new Date(bonus.approval_date).toLocaleDateString('en-IN') : '-'}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" style={{ textAlign: 'center', padding: '20px', color: '#999' }}>
                    No approved bonuses yet
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {bonuses.length > 0 && (
          <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#f0f8ff', borderRadius: '5px' }}>
            <strong>Total Bonuses: </strong>
            ₹{bonuses.reduce((sum, b) => sum + parseFloat(b.amount || 0), 0).toLocaleString('en-IN')}
          </div>
        )}
      </div>
    </div>
  );
};

export default Bonuses;
