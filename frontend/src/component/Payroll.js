import React, { useState, useEffect, useCallback } from 'react';
import { payrollAPI } from '../services/api';

const Payroll = () => {
  const [payrollRecords, setPayrollRecords] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const fetchPayrollData = useCallback(async () => {
    try {
      const [recordsRes, summaryRes] = await Promise.all([
        payrollAPI.getAll({ month: selectedMonth, year: selectedYear }),
        payrollAPI.getSummary({ month: selectedMonth, year: selectedYear })
      ]);
      setPayrollRecords(recordsRes.data);
      setSummary(summaryRes.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching payroll data:', error);
      setLoading(false);
    }
  }, [selectedMonth, selectedYear]);

  useEffect(() => {
    fetchPayrollData();
  }, [fetchPayrollData]);

  const handleGeneratePayroll = async () => {
    if (window.confirm(`Generate payroll for ${selectedMonth}/${selectedYear}?`)) {
      try {
        setLoading(true);
        await payrollAPI.generate({ month: selectedMonth, year: selectedYear });
        fetchPayrollData();
        alert('Payroll generated successfully!');
      } catch (error) {
        console.error('Error generating payroll:', error);
        alert('Failed to generate payroll.');
        setLoading(false);
      }
    }
  };

  const handleUpdateStatus = async (id, status) => {
    try {
      await payrollAPI.updateStatus(id, {
        status,
        payment_date: status === 'paid' ? new Date().toISOString().split('T')[0] : null
      });
      fetchPayrollData();
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  if (loading) return <div className="loading">Loading payroll...</div>;

  return (
    <div>
      <div className="page-header">
        <h2>Payroll Management</h2>
      </div>

      {summary && (
        <div className="stats-container">
          <div className="stat-card blue">
            <h3>Total Employees</h3>
            <p>{summary.total_employees || 0}</p>
          </div>
          <div className="stat-card green">
            <h3>Total Gross Salary</h3>
            <p>₹{parseFloat(summary.total_gross || 0).toLocaleString('en-IN')}</p>
          </div>
          <div className="stat-card orange">
            <h3>Total Deductions</h3>
            <p>₹{parseFloat(summary.total_deductions || 0).toLocaleString('en-IN')}</p>
          </div>
          <div className="stat-card purple">
            <h3>Total Net Salary</h3>
            <p>₹{parseFloat(summary.total_net || 0).toLocaleString('en-IN')}</p>
          </div>
        </div>
      )}

      <div className="card">
        <div className="btn-group" style={{ justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: '10px' }}>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(Number(e.target.value))}
              className="btn"
            >
              {months.map((month, index) => (
                <option key={index} value={index + 1}>{month}</option>
              ))}
            </select>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="btn"
            >
              {[2023, 2024, 2025, 2026].map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>
          <button className="btn btn-success" onClick={handleGeneratePayroll}>
            Generate Payroll
          </button>
        </div>

        <div className="table-container mt-20">
          <table>
            <thead>
              <tr>
                <th>Employee</th>
                <th>Designation</th>
                <th>Days (P/A)</th>
                <th>Extra Days</th>
                <th>Basic Salary</th>
                <th>Overtime</th>
                <th>Extra Pay</th>
                <th>Bonuses</th>
                <th>Deductions</th>
                <th>Gross Salary</th>
                <th>Tax</th>
                <th>Net Salary</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {payrollRecords.map((record) => (
                <tr key={record.id}>
                  <td>{record.first_name} {record.last_name}</td>
                  <td>{record.designation}</td>
                  <td>
                    <div style={{ fontSize: '12px' }}>
                      <div>Payable: {record.payable_days || 0}</div>
                      <div>Absent: {record.absent_days || 0}</div>
                    </div>
                  </td>
                  <td>{record.extra_days || 0}</td>
                  <td>₹{parseFloat(record.basic_salary).toLocaleString('en-IN')}</td>
                  <td>₹{parseFloat(record.overtime_pay).toLocaleString('en-IN')}</td>
                  <td>₹{parseFloat(record.extra_pay || 0).toLocaleString('en-IN')}</td>
                  <td>₹{parseFloat(record.bonuses).toLocaleString('en-IN')}</td>
                  <td>₹{parseFloat(record.deductions).toLocaleString('en-IN')}</td>
                  <td>₹{parseFloat(record.gross_salary).toLocaleString('en-IN')}</td>
                  <td>₹{parseFloat(record.tax).toLocaleString('en-IN')}</td>
                  <td><strong>₹{parseFloat(record.net_salary).toLocaleString('en-IN')}</strong></td>
                  <td>
                    <span className={`badge badge-${record.status === 'paid' ? 'success' :
                        record.status === 'approved' ? 'info' : 'warning'
                      }`}>
                      {record.status}
                    </span>
                  </td>
                  <td>
                    {(record.status === 'pending' || record.status === 'generated') && (
                      <button
                        className="btn btn-primary btn-sm"
                        onClick={() => handleUpdateStatus(record.id, 'approved')}
                      >
                        Approve
                      </button>
                    )}
                    {record.status === 'approved' && (
                      <button
                        className="btn btn-success btn-sm"
                        onClick={() => handleUpdateStatus(record.id, 'paid')}
                      >
                        Mark Paid
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {payrollRecords.length === 0 && (
            <div className="text-center mt-20">
              <p>No payroll records found for this period.</p>
              <p>Click "Generate Payroll" to create payroll for {months[selectedMonth - 1]} {selectedYear}.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Payroll;
