import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('employee');
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (data) => api.post('/auth/employee/login', data),
};

// Employee Portal API
export const employeeAPI = {
  getProfile: () => api.get('/employee/profile'),
  updateProfile: (data) => api.put('/employee/profile', data),
  submitAttendance: (data) => api.post('/employee/attendance', data),
  getAttendance: (params) => api.get('/employee/attendance', { params }),
  getSalarySlips: () => api.get('/employee/salary-slips'),
  getSalarySlip: (id) => api.get(`/employee/salary-slips/${id}`),
  getDeductions: () => api.get('/employee/deductions'),
  getBonuses: () => api.get('/employee/bonuses'),
  getAdvanceSalaries: () => api.get('/advance-salary/employee'),
  requestAdvanceSalary: (data) => api.post('/advance-salary/request', data),
  uploadDocument: (formData) => api.post('/employee/documents', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  getDocuments: () => api.get('/employee/documents'),
  deleteDocument: (id) => api.delete(`/employee/documents/${id}`),
};

export default api;
