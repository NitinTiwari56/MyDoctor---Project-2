import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || '',
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('md_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Auto-handle 401 (expired/invalid token)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('md_token');
      localStorage.removeItem('md_user');
      if (window.location.pathname !== '/login' && window.location.pathname !== '/register') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Auth
export const register = (data) => api.post('/api/auth/register', data);
export const login    = (data) => api.post('/api/auth/login', data);

// Doctors (public)
export const getAllDoctors      = ()       => api.get('/api/doctors/list');
export const searchDoctors      = (kw)     => api.get(`/api/doctors/search?keyword=${kw}`);
export const getDoctorsBySpec   = (name)   => api.get(`/api/doctors/specialization?name=${name}`);

// Slots
export const getAvailableSlots  = (doctorId, date) => api.get(`/api/slots/available?doctorId=${doctorId}&date=${date}`);
export const getMySlots         = (date)   => api.get(`/api/slots/my?date=${date}`);
export const createSlot         = (data)   => api.post('/api/slots', data);
export const createBulkSlots    = (data)   => api.post('/api/slots/bulk', data);
export const deleteSlot         = (id)     => api.delete(`/api/slots/${id}`);
export const blockSlot          = (id)     => api.patch(`/api/slots/${id}/block`);

// Appointments - Patient
export const bookAppointment    = (data)   => api.post('/api/appointments/book', data);
export const cancelAppointment  = (id)     => api.patch(`/api/appointments/${id}/cancel`);
export const getPatientAppts    = ()       => api.get('/api/appointments/my/patient');

// Appointments - Doctor
export const getDoctorAppts     = ()       => api.get('/api/appointments/my/doctor');
export const getPendingAppts    = ()       => api.get('/api/appointments/my/doctor/pending');
export const confirmAppt        = (id)     => api.patch(`/api/appointments/${id}/confirm`);
export const rejectAppt         = (id, body) => api.patch(`/api/appointments/${id}/reject`, body);
export const completeAppt       = (id, body) => api.patch(`/api/appointments/${id}/complete`, body);

// Profiles
export const getPatientProfile  = ()       => api.get('/api/patient/profile');
export const updatePatientProfile = (data) => api.put('/api/patient/profile', data);
export const getPatientDash     = ()       => api.get('/api/patient/dashboard');

export const getDoctorProfile   = ()       => api.get('/api/doctor/profile');
export const updateDoctorProfile = (data)  => api.put('/api/doctor/profile', data);
export const getDoctorDash      = ()       => api.get('/api/doctor/dashboard');

// Payments (Razorpay)
export const createPaymentOrder = (data)   => api.post('/api/payments/create-order', data);
export const verifyPayment      = (data)   => api.post('/api/payments/verify', data);

// Admin Platform Management
export const getAdminStats          = () => api.get('/api/admin/stats');
export const getAdminUsers          = (params = {}) => api.get('/api/admin/users', { params });
export const createAdminUser        = (data) => api.post('/api/admin/users', data);
export const updateAdminUser        = (id, data) => api.put(`/api/admin/users/${id}`, data);
export const toggleAdminUserStatus  = (id) => api.patch(`/api/admin/users/${id}/toggle-status`);
export const deleteAdminUser        = (id) => api.delete(`/api/admin/users/${id}`);

export const getAdminDoctors        = (params = {}) => api.get('/api/admin/doctors', { params });
export const updateAdminDoctor      = (id, data) => api.put(`/api/admin/doctors/${id}`, data);
export const toggleAdminDoctorStatus = (id) => api.patch(`/api/admin/doctors/${id}/toggle-status`);
export const verifyAdminDoctor      = (id, data) => api.patch(`/api/admin/doctors/${id}/verification`, data);

export const getAdminAppointments   = (params = {}) => api.get('/api/admin/appointments', { params });
export const updateAdminApptStatus  = (id, data) => api.patch(`/api/admin/appointments/${id}/status`, data);
export const deleteAdminAppt        = (id) => api.delete(`/api/admin/appointments/${id}`);

export const getAdminPayments       = () => api.get('/api/admin/payments');

// Patient AI Chatbot (Spring AI)
export const sendChatbotMessage     = (data) => api.post('/api/patient/chatbot/message', data);

export default api;

