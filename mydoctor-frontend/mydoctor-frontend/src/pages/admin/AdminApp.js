import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Stethoscope,
  CalendarCheck,
  CreditCard,
  Settings,
  ShieldCheck
} from 'lucide-react';
import Sidebar from '../../components/shared/Sidebar';
import AdminDashboard from './AdminDashboard';
import AdminUsers from './AdminUsers';
import AdminDoctors from './AdminDoctors';
import AdminAppointments from './AdminAppointments';
import AdminPayments from './AdminPayments';
import AdminSettings from './AdminSettings';

const adminLinks = [
  {
    label: 'Platform Control',
    items: [
      { to: '/admin',              label: 'Overview & Stats', icon: LayoutDashboard },
      { to: '/admin/users',        label: 'Users Directory', icon: Users },
      { to: '/admin/doctors',      label: 'Doctors Roster',  icon: Stethoscope },
      { to: '/admin/appointments', label: 'Appointments',    icon: CalendarCheck },
    ]
  },
  {
    label: 'Financials & System',
    items: [
      { to: '/admin/payments',     label: 'Transactions',    icon: CreditCard },
      { to: '/admin/settings',     label: 'System Settings', icon: Settings },
    ]
  }
];

export default function AdminApp() {
  return (
    <div className="app-layout">
      <Sidebar links={adminLinks} />
      <main className="main-content">
        <Routes>
          <Route index                element={<AdminDashboard />} />
          <Route path="users"         element={<AdminUsers />} />
          <Route path="doctors"       element={<AdminDoctors />} />
          <Route path="appointments"  element={<AdminAppointments />} />
          <Route path="payments"      element={<AdminPayments />} />
          <Route path="settings"      element={<AdminSettings />} />
          <Route path="*"             element={<Navigate to="/admin" replace />} />
        </Routes>
      </main>
    </div>
  );
}
