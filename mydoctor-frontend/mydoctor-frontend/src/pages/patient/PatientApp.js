import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { LayoutDashboard, CalendarCheck, UserCircle, Search, Bot } from 'lucide-react';
import Sidebar from '../../components/shared/Sidebar';
import PatientDashboard     from './PatientDashboard';
import FindDoctors          from './FindDoctors';
import MyAppointments       from './MyAppointments';
import PatientProfile       from './PatientProfile';
import PatientAssistantPage from './PatientAssistantPage';
import PatientChatbot       from '../../components/patient/PatientChatbot';

const links = [
  { items: [
    { to: '/patient',             label: 'Dashboard',           icon: LayoutDashboard },
    { to: '/patient/assistant',   label: 'AI Health Assistant', icon: Bot },
    { to: '/patient/doctors',     label: 'Find Doctors',        icon: Search },
    { to: '/patient/appointments',label: 'My Appointments',     icon: CalendarCheck },
    { to: '/patient/profile',     label: 'My Profile',          icon: UserCircle },
  ]},
];

export default function PatientApp() {
  return (
    <div className="app-layout">
      <Sidebar links={links} />
      <main className="main-content">
        <Routes>
          <Route index              element={<PatientDashboard />} />
          <Route path="assistant"   element={<PatientAssistantPage />} />
          <Route path="doctors"     element={<FindDoctors />} />
          <Route path="appointments" element={<MyAppointments />} />
          <Route path="profile"     element={<PatientProfile />} />
          <Route path="*"           element={<Navigate to="/patient" replace />} />
        </Routes>
      </main>
      {/* Ambient floating Spring AI Chatbot accessible across all patient views */}
      <PatientChatbot />
    </div>
  );
}
