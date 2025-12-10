import React, { useState, useEffect, useCallback } from 'react';
import { employeeAPI } from '../services/api';

const Employees = () => {
  const [employees, setEmployees] = useState([]);
  const [filteredEmployees, setFilteredEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [message, setMessage] = useState({ type: '', text: '' });
  const [formData, setFormData] = useState({
    employee_id: '',
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    gender: '',
    designation: '',
    department: '',
    hire_date: '',
    basic_salary: '',
    status: 'active'
  });

  useEffect(() => {
    fetchEmployees();
  }, []);

  const filterEmployees = useCallback(() => {
    let filtered = employees.filter(emp => {
      const matchesSearch = 
        emp.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.employee_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.email.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesDept = departmentFilter === 'all' || emp.department === departmentFilter;
      const matchesStatus = statusFilter === 'all' || emp.status === statusFilter;
      
      return matchesSearch && matchesDept && matchesStatus;
    });
    setFilteredEmployees(filtered);
  }, [departmentFilter, employees, searchTerm, statusFilter]);

  useEffect(() => {
    filterEmployees();
  }, [filterEmployees]);

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 3000);
  };

  const fetchEmployees = async () => {
    try {
      const response = await employeeAPI.getAll();
      setEmployees(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching employees:', error);
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
      if (editingEmployee) {
        await employeeAPI.update(editingEmployee.employee_id, formData);
        showMessage('success', 'Employee updated successfully');
      } else {
        await employeeAPI.create(formData);
        showMessage('success', 'Employee created successfully');
      }
      fetchEmployees();
      handleCloseModal();
    } catch (error) {
      console.error('Error saving employee:', error);
      showMessage('error', 'Failed to save employee. Please check all fields.');
    }
  };

  const handleEdit = (employee) => {
    setEditingEmployee(employee);
    setFormData({
      employee_id: employee.employee_id,
      first_name: employee.first_name,
      last_name: employee.last_name,
      email: employee.email,
      phone: employee.phone,
      gender: employee.gender || '',
      designation: employee.designation,
      department: employee.department,
      hire_date: employee.hire_date.split('T')[0],
      basic_salary: employee.basic_salary,
      status: employee.status
    });
    setShowModal(true);
  };

  const handleDelete = async (employeeId) => {
    if (window.confirm('Are you sure you want to delete this employee?')) {
      try {
        await employeeAPI.delete(employeeId);
        fetchEmployees();
      } catch (error) {
        console.error('Error deleting employee:', error);
      }
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingEmployee(null);
    setFormData({
      employee_id: '',
      first_name: '',
      last_name: '',
      email: '',
      phone: '',
      gender: '',
      designation: '',
      department: '',
      hire_date: '',
      basic_salary: '',
      status: 'active'
    });
  };

  if (loading) return <div className="loading">Loading employees...</div>;

  return (
    <div>
      {message.text && (
        <div className={`message ${message.type}`}>
          {message.type === 'success' ? '✓' : '✕'} {message.text}
        </div>
      )}

      <div className="page-header">
        <h2>Employee Management</h2>
      </div>

      <div className="card">
        <div className="btn-group">
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>
            Add New Employee
          </button>
        </div>

        <div className="filter-section" style={{ marginBottom: '20px' }}>
          <input 
            type="text"
            placeholder="Search by name, ID, or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              padding: '10px',
              borderRadius: '5px',
              border: '1px solid #ddd',
              marginRight: '10px',
              flex: 1
            }}
          />
          <select 
            value={departmentFilter}
            onChange={(e) => setDepartmentFilter(e.target.value)}
            style={{
              padding: '10px',
              borderRadius: '5px',
              border: '1px solid #ddd',
              marginRight: '10px'
            }}
          >
            <option value="all">All Departments</option>
            {[...new Set(employees.map(e => e.department))].map(dept => (
              <option key={dept} value={dept}>{dept}</option>
            ))}
          </select>
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{
              padding: '10px',
              borderRadius: '5px',
              border: '1px solid #ddd'
            }}
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>

        <p style={{ color: '#666', marginBottom: '10px' }}>Showing {filteredEmployees.length} of {employees.length} employees</p>

        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Employee ID</th>
                <th>Name</th>
                <th>Email</th>
                <th>Gender</th>
                <th>Designation</th>
                <th>Department</th>
                <th>Salary</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredEmployees.length === 0 ? (
                <tr>
                  <td colSpan="9" style={{ textAlign: 'center', color: '#999' }}>No employees found</td>
                </tr>
              ) : (
                filteredEmployees.map((employee) => (
                  <tr key={employee.id}>
                    <td>{employee.employee_id}</td>
                    <td>{employee.first_name} {employee.last_name}</td>
                    <td>{employee.email}</td>
                    <td>{employee.gender || '-'}</td>
                    <td>{employee.designation}</td>
                    <td>{employee.department}</td>
                    <td>₹{parseFloat(employee.basic_salary).toLocaleString('en-IN')}</td>
                    <td>
                      <span className={`badge badge-${employee.status === 'active' ? 'success' : 'warning'}`}>
                        {employee.status}
                      </span>
                    </td>
                    <td>
                      <div className="table-actions">
                        <button className="btn btn-primary btn-sm" onClick={() => handleEdit(employee)}>
                          Edit
                        </button>
                        <button className="btn btn-danger btn-sm" onClick={() => handleDelete(employee.employee_id)}>
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>{editingEmployee ? 'Edit Employee' : 'Add New Employee'}</h3>
              <button className="modal-close" onClick={handleCloseModal}>&times;</button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-row">
                <div className="form-group">
                  <label>Employee ID</label>
                  <input
                    type="text"
                    name="employee_id"
                    value={formData.employee_id}
                    onChange={handleInputChange}
                    disabled={editingEmployee}
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
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>First Name</label>
                  <input
                    type="text"
                    name="first_name"
                    value={formData.first_name}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Last Name</label>
                  <input
                    type="text"
                    name="last_name"
                    value={formData.last_name}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Phone</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Gender</label>
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleInputChange}
                  >
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Designation</label>
                  <input
                    type="text"
                    name="designation"
                    value={formData.designation}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Department</label>
                  <input
                    type="text"
                    name="department"
                    value={formData.department}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Hire Date</label>
                  <input
                    type="date"
                    name="hire_date"
                    value={formData.hire_date}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Basic Salary</label>
                  <input
                    type="number"
                    name="basic_salary"
                    value={formData.basic_salary}
                    onChange={handleInputChange}
                    step="0.01"
                    required
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={handleCloseModal}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingEmployee ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Employees;
