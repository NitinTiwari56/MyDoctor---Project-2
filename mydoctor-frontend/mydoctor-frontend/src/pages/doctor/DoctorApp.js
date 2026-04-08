import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { LayoutDashboard, CalendarClock, Calendar, UserCircle, PlusCircle } from 'lucide-react';
import Sidebar from '../../components/shared/Sidebar';
import DoctorDashboard    from './DoctorDashboard';
import DoctorAppointments from './DoctorAppointments';
import ManageSlots        from './ManageSlots';
import DoctorProfile      from './DoctorProfile';

const links = [
  { items: [
    { to: '/doctor',              label: 'Dashboard',       icon: LayoutDashboard },
    { to: '/doctor/appointments', label: 'Appointments',    icon: CalendarClock },
    { to: '/doctor/slots',        label: 'Manage Slots',    icon: Calendar },
    { to: '/doctor/profile',      label: 'My Profile',      icon: UserCircle },
  ]},
];

export default function DoctorApp() {
  return (
    <div className="app-layout">
      <Sidebar links={links} />
      <main className="main-content">
        <Routes>
          <Route index              element={<DoctorDashboard />} />
          <Route path="appointments" element={<DoctorAppointments />} />
          <Route path="slots"        element={<ManageSlots />} />
          <Route path="profile"      element={<DoctorProfile />} />
          <Route path="*"            element={<Navigate to="/doctor" replace />} />
        </Routes>
      </main>
    </div>
  );
}
