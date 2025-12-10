import React, { useState, useEffect } from 'react';
import { employeeAPI } from '../services/api';

const SalarySlips = () => {
  const [slips, setSlips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSlip, setSelectedSlip] = useState(null);
  const employee = JSON.parse(localStorage.getItem('employee') || '{}');

  const handlePrintSlip = () => {
    if (!selectedSlip) return;
    const monthLabel = selectedSlip.month && selectedSlip.year
      ? `${new Date(0, selectedSlip.month - 1).toLocaleDateString('en-IN', { month: 'long' })}, ${selectedSlip.year}`
      : 'N/A';

    const popup = window.open('', '_blank', 'width=800,height=900');
    if (!popup) return;

    popup.document.write(`
      <html>
        <head>
          <title>Salary Slip - ${monthLabel}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; color: #2c3e50; }
            h2, h3 { margin: 0; }
            .section { margin-top: 20px; border-top: 1px solid #ccc; padding-top: 15px; }
            .row { display: flex; flex-wrap: wrap; gap: 16px; }
            .item { width: 220px; }
            .label { font-weight: bold; }
            .net { margin-top: 20px; padding: 16px; background: #e8f8f5; border-left: 4px solid #27ae60; }
            table { width: 100%; border-collapse: collapse; margin-top: 12px; }
            th, td { padding: 8px; border: 1px solid #ddd; text-align: left; }
          </style>
        </head>
        <body>
          <h2>Salary Slip</h2>
          <p><strong>Month:</strong> ${monthLabel}</p>
          <div class="row">
            <div class="item"><span class="label">Employee Name:</span> ${employee.first_name || ''} ${employee.last_name || ''}</div>
            <div class="item"><span class="label">Employee ID:</span> ${employee.employee_id || ''}</div>
            <div class="item"><span class="label">Designation:</span> ${employee.designation || ''}</div>
            <div class="item"><span class="label">Department:</span> ${employee.department || ''}</div>
          </div>

          <div class="section">
            <h3>Attendance Details</h3>
            <div class="row">
              <div class="item"><span class="label">Total Days:</span> ${selectedSlip.total_days || 30}</div>
              <div class="item"><span class="label">Payable Days:</span> ${selectedSlip.payable_days || 0}</div>
              <div class="item"><span class="label">Absent Days:</span> ${selectedSlip.absent_days || 0}</div>
              <div class="item"><span class="label">Paid Leave Days:</span> ${selectedSlip.paid_leave_days || 0}</div>
              <div class="item"><span class="label">Extra Days (Weekend/Holiday):</span> ${selectedSlip.extra_days || 0}</div>
            </div>
          </div>

          <div class="section">
            <h3>Earnings</h3>
            <table>
              <tr><th>Component</th><th>Amount (₹)</th></tr>
              <tr><td>Basic Salary</td><td>${Number(selectedSlip.basic_salary || 0).toLocaleString('en-IN')}</td></tr>
              <tr><td>HRA</td><td>${Number(selectedSlip.hra || 0).toLocaleString('en-IN')}</td></tr>
              <tr><td>Dearness Allowance</td><td>${Number(selectedSlip.da || 0).toLocaleString('en-IN')}</td></tr>
              <tr><td>Overtime Pay</td><td>${Number(selectedSlip.overtime_pay || 0).toLocaleString('en-IN')}</td></tr>
              <tr><td>Extra Days Pay</td><td>${Number(selectedSlip.extra_pay || 0).toLocaleString('en-IN')}</td></tr>
              <tr><td>Bonuses</td><td>${Number(selectedSlip.total_bonuses || 0).toLocaleString('en-IN')}</td></tr>
            </table>
          </div>

          <div class="section">
            <h3>Deductions</h3>
            <table>
              <tr><th>Component</th><th>Amount (₹)</th></tr>
              <tr><td>Income Tax</td><td>${Number(selectedSlip.tax || 0).toLocaleString('en-IN')}</td></tr>
              <tr><td>PF</td><td>${Number(selectedSlip.pf || 0).toLocaleString('en-IN')}</td></tr>
              <tr><td>ESI</td><td>${Number(selectedSlip.esi || 0).toLocaleString('en-IN')}</td></tr>
              <tr><td>Other Deductions</td><td>${Number(selectedSlip.total_deductions || 0).toLocaleString('en-IN')}</td></tr>
            </table>
          </div>

          <div class="net">
            <h3>Net Salary: ₹${Number(selectedSlip.net_salary || 0).toLocaleString('en-IN')}</h3>
          </div>

          <script>
            window.onload = function() { window.print(); };
          </script>
        </body>
      </html>
    `);
    popup.document.close();
  };

  useEffect(() => {
    fetchSalarySlips();
  }, []);

  const fetchSalarySlips = async () => {
    try {
      const response = await employeeAPI.getSalarySlips();
      setSlips(response.data || []);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching salary slips:', error);
      setLoading(false);
    }
  };

  if (loading) return <div className="loading">Loading salary slips...</div>;

  return (
    <div>
      <div className="page-header">
        <h2>My Salary Slips</h2>
        <p>Employee ID: {employee.employee_id}</p>
      </div>

      {selectedSlip ? (
        <div className="card">
          <button className="btn btn-secondary" onClick={() => setSelectedSlip(null)} style={{ marginBottom: '20px' }}>
            ← Back to List
          </button>
          
          <div style={{ background: '#f8f9fa', padding: '20px', borderRadius: '8px' }}>
            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
              <h3>Salary Slip</h3>
              <p>Month: {selectedSlip.month && selectedSlip.year ? `${new Date(0, selectedSlip.month - 1).toLocaleDateString('en-IN', { month: 'long' })}, ${selectedSlip.year}` : 'N/A'}</p>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '10px' }}>
              <button className="btn btn-primary" onClick={handlePrintSlip}>
                Download / Print
              </button>
            </div>

            <div className="form-row">
              <div className="info-item">
                <strong>Employee Name:</strong>
                <p>{employee.first_name} {employee.last_name}</p>
              </div>
              <div className="info-item">
                <strong>Employee ID:</strong>
                <p>{employee.employee_id}</p>
              </div>
              <div className="info-item">
                <strong>Designation:</strong>
                <p>{employee.designation}</p>
              </div>
              <div className="info-item">
                <strong>Department:</strong>
                <p>{employee.department}</p>
              </div>
            </div>

            <div style={{ marginTop: '30px', borderTop: '2px solid #ddd', paddingTop: '20px' }}>
              <h4>Attendance Details</h4>
              <div className="form-row">
                <div className="info-item">
                  <strong>Total Days:</strong>
                  <p>{selectedSlip.total_days || 30}</p>
                </div>
                <div className="info-item">
                  <strong>Payable Days:</strong>
                  <p>{selectedSlip.payable_days || 0}</p>
                </div>
                <div className="info-item">
                  <strong>Absent Days:</strong>
                  <p>{selectedSlip.absent_days || 0}</p>
                </div>
                <div className="info-item">
                  <strong>Paid Leave Days:</strong>
                  <p>{selectedSlip.paid_leave_days || 0}</p>
                </div>
                <div className="info-item">
                  <strong>Extra Days (Weekend/Holiday):</strong>
                  <p>{selectedSlip.extra_days || 0}</p>
                </div>
              </div>
            </div>

            <div style={{ marginTop: '30px', borderTop: '2px solid #ddd', paddingTop: '20px' }}>
              <h4>Earnings</h4>
              <div className="form-row">
                <div className="info-item">
                  <strong>Basic Salary:</strong>
                  <p>₹{parseFloat(selectedSlip.basic_salary || 0).toLocaleString('en-IN')}</p>
                </div>
                <div className="info-item">
                  <strong>HRA:</strong>
                  <p>₹{parseFloat(selectedSlip.hra || 0).toLocaleString('en-IN')}</p>
                </div>
                <div className="info-item">
                  <strong>Dearness Allowance:</strong>
                  <p>₹{parseFloat(selectedSlip.da || 0).toLocaleString('en-IN')}</p>
                </div>
                <div className="info-item">
                  <strong>Overtime Pay:</strong>
                  <p>₹{parseFloat(selectedSlip.overtime_pay || 0).toLocaleString('en-IN')}</p>
                </div>
                <div className="info-item">
                  <strong>Extra Days Pay:</strong>
                  <p>₹{parseFloat(selectedSlip.extra_pay || 0).toLocaleString('en-IN')}</p>
                </div>
                <div className="info-item">
                  <strong>Bonuses:</strong>
                  <p>₹{parseFloat(selectedSlip.total_bonuses || 0).toLocaleString('en-IN')}</p>
                </div>
              </div>
            </div>

            <div style={{ marginTop: '20px', borderTop: '2px solid #ddd', paddingTop: '20px' }}>
              <h4>Deductions</h4>
              <div className="form-row">
                <div className="info-item">
                  <strong>Income Tax:</strong>
                  <p>₹{parseFloat(selectedSlip.tax || 0).toLocaleString('en-IN')}</p>
                </div>
                <div className="info-item">
                  <strong>PF (Provident Fund):</strong>
                  <p>₹{parseFloat(selectedSlip.pf || 0).toLocaleString('en-IN')}</p>
                </div>
                <div className="info-item">
                  <strong>ESI:</strong>
                  <p>₹{parseFloat(selectedSlip.esi || 0).toLocaleString('en-IN')}</p>
                </div>
                <div className="info-item">
                  <strong>Other Deductions:</strong>
                  <p>₹{parseFloat(selectedSlip.total_deductions || 0).toLocaleString('en-IN')}</p>
                </div>
              </div>
            </div>

            <div style={{ marginTop: '20px', background: '#e8f8f5', padding: '20px', borderRadius: '5px', borderLeft: '4px solid #27ae60' }}>
              <h4 style={{ color: '#27ae60' }}>Net Salary</h4>
              <h2 style={{ color: '#27ae60', margin: '10px 0' }}>₹{parseFloat(selectedSlip.net_salary || 0).toLocaleString('en-IN')}</h2>
            </div>
          </div>
        </div>
      ) : (
        <div className="card">
          <h3>Salary Slips History</h3>
          {slips.length === 0 ? (
            <p style={{ color: '#7f8c8d' }}>No salary slips available yet.</p>
          ) : (
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Month</th>
                    <th>Basic Salary</th>
                    <th>Bonuses</th>
                    <th>Deductions</th>
                    <th>Net Salary</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {slips.map((slip) => (
                    <tr key={slip.id}>
                      <td>{slip.month && slip.year ? `${new Date(0, slip.month - 1).toLocaleDateString('en-IN', { month: 'long' })}, ${slip.year}` : 'N/A'}</td>
                      <td>₹{parseFloat(slip.basic_salary || 0).toLocaleString('en-IN')}</td>
                      <td>₹{parseFloat(slip.total_bonuses || 0).toLocaleString('en-IN')}</td>
                      <td>₹{parseFloat((slip.tax || 0) + (slip.total_deductions || 0)).toLocaleString('en-IN')}</td>
                      <td style={{ fontWeight: 'bold', color: '#27ae60' }}>₹{parseFloat(slip.net_salary || 0).toLocaleString('en-IN')}</td>
                      <td>
                        <button className="btn btn-sm btn-primary" onClick={() => setSelectedSlip(slip)}>
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SalarySlips;
