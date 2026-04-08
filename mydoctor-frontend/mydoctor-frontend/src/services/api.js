import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8080',
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('md_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

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

export default api;
