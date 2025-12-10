import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach JWT from localStorage to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 by clearing session and redirecting to login
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

// Employee API
export const employeeAPI = {
  getAll: () => api.get('/employees'),
  getById: (employeeId) => api.get(`/employees/${employeeId}`),
  create: (data) => api.post('/employees', data),
  update: (employeeId, data) => api.put(`/employees/${employeeId}`, data),
  delete: (employeeId) => api.delete(`/employees/${employeeId}`),
};

// Attendance API
export const attendanceAPI = {
  getAll: (params) => api.get('/attendance', { params }),
  getPending: () => api.get('/attendance/requests/pending'),
  create: (data) => api.post('/attendance', data),
  update: (id, data) => api.put(`/attendance/${id}`, data),
  approve: (id, data) => api.put(`/attendance/requests/${id}/approve`, data),
  delete: (id) => api.delete(`/attendance/${id}`),
};

// Payroll API
export const payrollAPI = {
  getAll: (params) => api.get('/payroll', { params }),
  generate: (data) => api.post('/payroll/generate', data),
  updateStatus: (id, data) => api.put(`/payroll/${id}/status`, data),
  getSummary: (params) => api.get('/payroll/summary', { params }),
};

// Deduction API
export const deductionAPI = {
  getAll: (params) => api.get('/deductions', { params }),
  create: (data) => api.post('/deductions', data),
  delete: (id) => api.delete(`/deductions/${id}`),
};

// Bonus API
export const bonusAPI = {
  getAll: (params) => api.get('/bonuses', { params }),
  create: (data) => api.post('/bonuses', data),
  delete: (id) => api.delete(`/bonuses/${id}`),
};

// Documents API
export const documentsAPI = {
  getAll: () => api.get('/employee/all-documents'),
};

// Advance Salary API
export const advanceSalaryAPI = {
  getAll: () => api.get('/advance-salary'),
  getByEmployee: (employeeId) => api.get(`/advance-salary/employee/${employeeId}`),
  request: (data) => api.post('/advance-salary/request', data),
  approve: (id, data) => api.put(`/advance-salary/${id}/approve`, data),
  reject: (id, data) => api.put(`/advance-salary/${id}/reject`, data),
};

// Extra Days API
export const extraDaysAPI = {
  getAll: (params) => api.get('/extra-days', { params }),
  create: (data) => api.post('/extra-days', data),
  delete: (id) => api.delete(`/extra-days/${id}`),
};

// Add method to employeeAPI for manager to get all documents
employeeAPI.getAllDocuments = () => api.get('/employee/all-documents');
employeeAPI.deleteDocument = (id) => api.delete(`/employee/documents/manager/${id}`);

export default api;
