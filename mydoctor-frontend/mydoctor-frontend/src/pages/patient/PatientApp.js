import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { LayoutDashboard, CalendarPlus, CalendarCheck, UserCircle, Search } from 'lucide-react';
import Sidebar from '../../components/shared/Sidebar';
import PatientDashboard   from './PatientDashboard';
import FindDoctors        from './FindDoctors';
import MyAppointments     from './MyAppointments';
import PatientProfile     from './PatientProfile';

const links = [
  { items: [
    { to: '/patient',             label: 'Dashboard',      icon: LayoutDashboard },
    { to: '/patient/doctors',     label: 'Find Doctors',   icon: Search },
    { to: '/patient/appointments',label: 'My Appointments',icon: CalendarCheck },
    { to: '/patient/profile',     label: 'My Profile',     icon: UserCircle },
  ]},
];

export default function PatientApp() {
  return (
    <div className="app-layout">
      <Sidebar links={links} />
      <main className="main-content">
        <Routes>
          <Route index           element={<PatientDashboard />} />
          <Route path="doctors"  element={<FindDoctors />} />
          <Route path="appointments" element={<MyAppointments />} />
          <Route path="profile"  element={<PatientProfile />} />
          <Route path="*"        element={<Navigate to="/patient" replace />} />
        </Routes>
      </main>
    </div>
  );
}
