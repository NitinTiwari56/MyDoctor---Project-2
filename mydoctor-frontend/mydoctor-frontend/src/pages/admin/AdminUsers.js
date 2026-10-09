import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Users,
  Search,
  Filter,
  UserPlus,
  Edit2,
  Trash2,
  Power,
  ShieldCheck,
  Stethoscope,
  User as UserIcon,
  X,
  Check,
  AlertTriangle,
  Download
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import {
  getAdminUsers,
  createAdminUser,
  updateAdminUser,
  toggleAdminUserStatus,
  deleteAdminUser
} from '../../services/api';
import { exportToCsv } from '../../utils/exportCsv';

export default function AdminUsers() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Modals state
  const [isCreateOpen, setIsCreateOpen] = useState(searchParams.get('action') === 'create');
  const [editingUser, setEditingUser] = useState(null);
  const [deletingUser, setDeletingUser] = useState(null);

  // Create form state
  const initialCreateForm = {
    fullName: '',
    email: '',
    password: '',
    phone: '',
    role: 'PATIENT',
    specialization: 'General Medicine',
    qualifications: 'MBBS',
    clinicAddress: '',
    consultationFeeClinic: 500,
    consultationFeeHome: 800,
    bio: '',
    experienceYears: 5,
    acceptsHomeVisits: false,
    gender: 'MALE',
    bloodGroup: 'O+',
    address: ''
  };
  const [createForm, setCreateForm] = useState(initialCreateForm);
  const [saving, setSaving] = useState(false);

  // Edit form state
  const [editForm, setEditForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    role: 'PATIENT',
    active: true
  });

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const params = {};
      if (roleFilter) params.role = roleFilter;
      if (statusFilter !== '') params.active = statusFilter === 'true';
      if (searchTerm) params.search = searchTerm;

      const res = await getAdminUsers(params);
      setUsers(res.data.data);
    } catch (err) {
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [roleFilter, statusFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchUsers();
  };

  const handleToggleStatus = async (user) => {
    try {
      const res = await toggleAdminUserStatus(user.id);
      toast.success(`User ${user.fullName} ${res.data.data.active ? 'activated' : 'deactivated'}`);
      setUsers(users.map(u => (u.id === user.id ? res.data.data : u)));
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await createAdminUser(createForm);
      toast.success('User created successfully!');
      setIsCreateOpen(false);
      setCreateForm(initialCreateForm);
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create user');
    } finally {
      setSaving(false);
    }
  };

  const handleEditOpen = (user) => {
    setEditingUser(user);
    setEditForm({
      fullName: user.fullName || '',
      email: user.email || '',
      phone: user.phone || '',
      role: user.role || 'PATIENT',
      active: user.active
    });
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await updateAdminUser(editingUser.id, editForm);
      toast.success('User updated successfully!');
      setEditingUser(null);
      setUsers(users.map(u => (u.id === editingUser.id ? res.data.data : u)));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update user');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingUser) return;
    try {
      await deleteAdminUser(deletingUser.id);
      toast.success(`User ${deletingUser.fullName} removed.`);
      setDeletingUser(null);
      setUsers(users.filter(u => u.id !== deletingUser.id));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete user');
    }
  };

  const getRoleBadge = (role) => {
    switch (role) {
      case 'ADMIN':
        return (
          <span style={{
            background: 'linear-gradient(135deg, rgba(99,102,241,0.15), rgba(139,92,246,0.2))',
            color: 'var(--indigo)',
            fontWeight: 700,
            fontSize: '0.72rem',
            padding: '3px 8px',
            borderRadius: 6,
            display: 'inline-flex',
            alignItems: 'center',
            gap: 4
          }}>
            <ShieldCheck size={12} /> Admin
          </span>
        );
      case 'DOCTOR':
        return (
          <span style={{
            background: 'linear-gradient(135deg, rgba(20,184,166,0.15), rgba(45,212,191,0.2))',
            color: 'var(--teal-dark)',
            fontWeight: 700,
            fontSize: '0.72rem',
            padding: '3px 8px',
            borderRadius: 6,
            display: 'inline-flex',
            alignItems: 'center',
            gap: 4
          }}>
            <Stethoscope size={12} /> Doctor
          </span>
        );
      default:
        return (
          <span style={{
            background: 'rgba(56,189,248,0.15)',
            color: '#0284c7',
            fontWeight: 700,
            fontSize: '0.72rem',
            padding: '3px 8px',
            borderRadius: 6,
            display: 'inline-flex',
            alignItems: 'center',
            gap: 4
          }}>
            <UserIcon size={12} /> Patient
          </span>
        );
    }
  };

  const handleExportCsv = () => {
    if (!users.length) {
      toast.error('No users to export');
      return;
    }

    const columns = [
      { key: 'id', label: 'User ID' },
      { key: 'fullName', label: 'Full Name' },
      { key: 'email', label: 'Email' },
      { key: 'phone', label: 'Phone' },
      { key: 'role', label: 'Role' },
      { key: 'active', label: 'Active' },
      { key: 'specialization', label: 'Doctor Specialization' },
      { key: 'consultationFeeClinic', label: 'Clinic Fee' },
      { key: 'gender', label: 'Patient Gender' },
      { key: 'bloodGroup', label: 'Patient Blood Group' },
    ];

    exportToCsv(
      `mydoctor_users_directory_${new Date().toISOString().slice(0, 10)}`,
      columns,
      users
    );
    toast.success('User directory CSV downloaded');
  };

  return (
    <div style={{ padding: '24px 32px', maxWidth: 1400, margin: '0 auto' }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 16,
        marginBottom: 24
      }}>
        <div>
          <h1 style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--navy)', letterSpacing: '-0.02em' }}>
            Users & Account Directory
          </h1>
          <p style={{ color: 'var(--gray-500)', fontSize: '0.92rem' }}>
            Manage platform authentication, accounts, roles, and provider verification.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          <button
            onClick={handleExportCsv}
            className="btn btn-secondary"
            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 14px' }}
          >
            <Download size={15} />
            <span>Export CSV</span>
          </button>

          <button
            onClick={() => setIsCreateOpen(true)}
            className="btn btn-primary"
            style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 18px' }}
          >
            <UserPlus size={16} />
            <span>Add New Account</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div style={{
        background: 'white',
        borderRadius: 14,
        padding: '16px 20px',
        border: '1px solid var(--gray-200)',
        boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
        marginBottom: 20,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 16
      }}>
        <form onSubmit={handleSearchSubmit} style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1, minWidth: 280 }}>
          <div style={{ position: 'relative', width: '100%' }}>
            <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--gray-400)' }} />
            <input
              type="text"
              className="form-input"
              style={{ paddingLeft: 38, height: 40 }}
              placeholder="Search by name, email, or phone number..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button type="submit" className="btn btn-secondary" style={{ height: 40 }}>
            Search
          </button>
        </form>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Filter size={15} style={{ color: 'var(--gray-400)' }} />
            <span style={{ fontSize: '0.85rem', color: 'var(--gray-600)', fontWeight: 500 }}>Role:</span>
            <select
              className="form-input"
              style={{ height: 38, padding: '0 12px', fontSize: '0.85rem', width: 130 }}
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
            >
              <option value="">All Roles</option>
              <option value="PATIENT">Patients</option>
              <option value="DOCTOR">Doctors</option>
              <option value="ADMIN">Admins</option>
            </select>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--gray-600)', fontWeight: 500 }}>Status:</span>
            <select
              className="form-input"
              style={{ height: 38, padding: '0 12px', fontSize: '0.85rem', width: 130 }}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">All Statuses</option>
              <option value="true">Active</option>
              <option value="false">Suspended</option>
            </select>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div style={{
        background: 'white',
        borderRadius: 16,
        border: '1px solid var(--gray-200)',
        boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
        overflow: 'hidden'
      }}>
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 260 }}>
            <div className="spinner" style={{ width: 32, height: 32 }} />
          </div>
        ) : users.length > 0 ? (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.87rem' }}>
              <thead>
                <tr style={{ background: 'var(--gray-50)', borderBottom: '1px solid var(--gray-200)', textAlign: 'left', color: 'var(--gray-500)' }}>
                  <th style={{ padding: '14px 18px', fontWeight: 600 }}>User</th>
                  <th style={{ padding: '14px 18px', fontWeight: 600 }}>Role</th>
                  <th style={{ padding: '14px 18px', fontWeight: 600 }}>Contact Info</th>
                  <th style={{ padding: '14px 18px', fontWeight: 600 }}>Profile Particulars</th>
                  <th style={{ padding: '14px 18px', fontWeight: 600 }}>Status</th>
                  <th style={{ padding: '14px 18px', fontWeight: 600, textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => {
                  const initials = u.fullName
                    ? u.fullName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
                    : '?';

                  return (
                    <tr key={u.id} style={{ borderBottom: '1px solid var(--gray-100)', transition: 'background 0.2s' }}>
                      {/* Name & Avatar */}
                      <td style={{ padding: '14px 18px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          <div style={{
                            width: 36, height: 36, borderRadius: '50%',
                            background: u.role === 'ADMIN'
                              ? 'linear-gradient(135deg, #6366f1, #8b5cf6)'
                              : u.role === 'DOCTOR'
                                ? 'linear-gradient(135deg, #0d9488, #14b8a6)'
                                : 'linear-gradient(135deg, #38bdf8, #0284c7)',
                            color: 'white',
                            fontWeight: 700,
                            fontSize: '0.8rem',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0
                          }}>
                            {initials}
                          </div>
                          <div>
                            <div style={{ fontWeight: 700, color: 'var(--navy)' }}>{u.fullName}</div>
                            <div style={{ fontSize: '0.76rem', color: 'var(--gray-400)' }}>ID: #{u.id}</div>
                          </div>
                        </div>
                      </td>

                      {/* Role */}
                      <td style={{ padding: '14px 18px' }}>
                        {getRoleBadge(u.role)}
                      </td>

                      {/* Contact */}
                      <td style={{ padding: '14px 18px' }}>
                        <div style={{ color: 'var(--gray-800)', fontWeight: 500 }}>{u.email}</div>
                        <div style={{ fontSize: '0.78rem', color: 'var(--gray-500)' }}>{u.phone}</div>
                      </td>

                      {/* Particulars */}
                      <td style={{ padding: '14px 18px' }}>
                        {u.role === 'DOCTOR' && (
                          <div>
                            <span style={{ fontWeight: 600, color: 'var(--teal-dark)' }}>{u.specialization}</span>
                            <div style={{ fontSize: '0.76rem', color: 'var(--gray-500)' }}>
                              Fee: ₹{u.consultationFeeClinic || 0} • {u.appointmentCount || 0} appts
                            </div>
                          </div>
                        )}
                        {u.role === 'PATIENT' && (
                          <div style={{ fontSize: '0.8rem', color: 'var(--gray-600)' }}>
                            Blood: {u.bloodGroup || 'N/A'} • Gender: {u.gender || 'N/A'}
                          </div>
                        )}
                        {u.role === 'ADMIN' && (
                          <span style={{ fontSize: '0.8rem', color: 'var(--gray-500)' }}>Full System Clearance</span>
                        )}
                      </td>

                      {/* Status */}
                      <td style={{ padding: '14px 18px' }}>
                        <button
                          onClick={() => handleToggleStatus(u)}
                          style={{
                            border: 'none',
                            background: u.active ? 'var(--green-pale)' : 'var(--red-pale)',
                            color: u.active ? 'var(--green)' : 'var(--red)',
                            padding: '4px 10px',
                            borderRadius: 12,
                            fontWeight: 600,
                            fontSize: '0.76rem',
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 4
                          }}
                          title="Click to toggle status"
                        >
                          <span style={{ width: 6, height: 6, borderRadius: '50%', background: u.active ? 'var(--green)' : 'var(--red)' }} />
                          {u.active ? 'Active' : 'Suspended'}
                        </button>
                      </td>

                      {/* Actions */}
                      <td style={{ padding: '14px 18px', textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: 6 }}>
                          <button
                            onClick={() => handleEditOpen(u)}
                            className="btn btn-secondary"
                            style={{ padding: '6px 10px', fontSize: '0.78rem' }}
                            title="Edit user"
                          >
                            <Edit2 size={13} />
                          </button>
                          <button
                            onClick={() => setDeletingUser(u)}
                            className="btn"
                            style={{
                              padding: '6px 10px',
                              fontSize: '0.78rem',
                              background: 'var(--red-pale)',
                              color: 'var(--red)',
                              border: 'none'
                            }}
                            title="Delete user"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '48px 0', color: 'var(--gray-400)' }}>
            No users match the search criteria.
          </div>
        )}
      </div>

      {/* CREATE USER MODAL */}
      <AnimatePresence>
        {isCreateOpen && (
          <div style={{
            position: 'fixed', inset: 0, zIndex: 999,
            background: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(4px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20
          }}>
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              style={{
                background: 'white', borderRadius: 20, width: '100%', maxWidth: 560,
                maxHeight: '90vh', overflowY: 'auto', padding: 28, position: 'relative',
                boxShadow: '0 20px 50px rgba(0,0,0,0.2)'
              }}
            >
              <button
                onClick={() => setIsCreateOpen(false)}
                style={{ position: 'absolute', right: 20, top: 20, background: 'none', border: 'none', cursor: 'pointer', color: 'var(--gray-400)' }}
              >
                <X size={20} />
              </button>

              <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--navy)', marginBottom: 6 }}>
                Create New Platform User
              </h2>
              <p style={{ color: 'var(--gray-500)', fontSize: '0.85rem', marginBottom: 20 }}>
                Provision a patient, certified practitioner, or system administrator account.
              </p>

              <form onSubmit={handleCreateSubmit}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                  <div className="form-group" style={{ gridColumn: 'span 2' }}>
                    <label className="form-label">Full Name</label>
                    <input
                      className="form-input"
                      required
                      placeholder="e.g. Dr. Priya Sharma"
                      value={createForm.fullName}
                      onChange={e => setCreateForm({ ...createForm, fullName: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Email Address</label>
                    <input
                      className="form-input"
                      type="email"
                      required
                      placeholder="email@example.com"
                      value={createForm.email}
                      onChange={e => setCreateForm({ ...createForm, email: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Phone Number</label>
                    <input
                      className="form-input"
                      required
                      placeholder="+91 98765 43210"
                      value={createForm.phone}
                      onChange={e => setCreateForm({ ...createForm, phone: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Temporary Password</label>
                    <input
                      className="form-input"
                      type="password"
                      required
                      placeholder="Min 6 characters"
                      value={createForm.password}
                      onChange={e => setCreateForm({ ...createForm, password: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Account Role</label>
                    <select
                      className="form-input"
                      value={createForm.role}
                      onChange={e => setCreateForm({ ...createForm, role: e.target.value })}
                    >
                      <option value="PATIENT">Patient</option>
                      <option value="DOCTOR">Doctor</option>
                      <option value="ADMIN">Administrator</option>
                    </select>
                  </div>

                  {/* Doctor extra fields */}
                  {createForm.role === 'DOCTOR' && (
                    <>
                      <div className="form-group">
                        <label className="form-label">Specialization</label>
                        <input
                          className="form-input"
                          placeholder="e.g. Cardiology"
                          value={createForm.specialization}
                          onChange={e => setCreateForm({ ...createForm, specialization: e.target.value })}
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Qualifications</label>
                        <input
                          className="form-input"
                          placeholder="e.g. MBBS, MD"
                          value={createForm.qualifications}
                          onChange={e => setCreateForm({ ...createForm, qualifications: e.target.value })}
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Clinic Fee (₹)</label>
                        <input
                          type="number"
                          className="form-input"
                          value={createForm.consultationFeeClinic}
                          onChange={e => setCreateForm({ ...createForm, consultationFeeClinic: parseInt(e.target.value) || 0 })}
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Home Visit Fee (₹)</label>
                        <input
                          type="number"
                          className="form-input"
                          value={createForm.consultationFeeHome}
                          onChange={e => setCreateForm({ ...createForm, consultationFeeHome: parseInt(e.target.value) || 0 })}
                        />
                      </div>
                      <div className="form-group" style={{ gridColumn: 'span 2' }}>
                        <label className="form-label">Clinic Address</label>
                        <input
                          className="form-input"
                          placeholder="Street, City, Pin"
                          value={createForm.clinicAddress}
                          onChange={e => setCreateForm({ ...createForm, clinicAddress: e.target.value })}
                        />
                      </div>
                      <div className="form-group" style={{ gridColumn: 'span 2' }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.85rem', cursor: 'pointer' }}>
                          <input
                            type="checkbox"
                            checked={createForm.acceptsHomeVisits}
                            onChange={e => setCreateForm({ ...createForm, acceptsHomeVisits: e.target.checked })}
                          />
                          Accepts Home Visits for Patients
                        </label>
                      </div>
                    </>
                  )}

                  {/* Patient extra fields */}
                  {createForm.role === 'PATIENT' && (
                    <>
                      <div className="form-group">
                        <label className="form-label">Blood Group</label>
                        <select
                          className="form-input"
                          value={createForm.bloodGroup}
                          onChange={e => setCreateForm({ ...createForm, bloodGroup: e.target.value })}
                        >
                          <option value="A+">A+</option>
                          <option value="A-">A-</option>
                          <option value="B+">B+</option>
                          <option value="B-">B-</option>
                          <option value="O+">O+</option>
                          <option value="O-">O-</option>
                          <option value="AB+">AB+</option>
                          <option value="AB-">AB-</option>
                        </select>
                      </div>
                      <div className="form-group">
                        <label className="form-label">Gender</label>
                        <select
                          className="form-input"
                          value={createForm.gender}
                          onChange={e => setCreateForm({ ...createForm, gender: e.target.value })}
                        >
                          <option value="MALE">Male</option>
                          <option value="FEMALE">Female</option>
                          <option value="OTHER">Other</option>
                        </select>
                      </div>
                    </>
                  )}
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 24 }}>
                  <button
                    type="button"
                    onClick={() => setIsCreateOpen(false)}
                    className="btn btn-secondary"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={saving}
                  >
                    {saving ? 'Creating...' : 'Create Account'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* EDIT USER MODAL */}
      <AnimatePresence>
        {editingUser && (
          <div style={{
            position: 'fixed', inset: 0, zIndex: 999,
            background: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(4px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20
          }}>
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              style={{
                background: 'white', borderRadius: 20, width: '100%', maxWidth: 480,
                padding: 28, position: 'relative', boxShadow: '0 20px 50px rgba(0,0,0,0.2)'
              }}
            >
              <button
                onClick={() => setEditingUser(null)}
                style={{ position: 'absolute', right: 20, top: 20, background: 'none', border: 'none', cursor: 'pointer', color: 'var(--gray-400)' }}
              >
                <X size={20} />
              </button>

              <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--navy)', marginBottom: 6 }}>
                Edit Account Details
              </h2>
              <p style={{ color: 'var(--gray-500)', fontSize: '0.85rem', marginBottom: 20 }}>
                Updating #{editingUser.id} - {editingUser.fullName}
              </p>

              <form onSubmit={handleEditSubmit}>
                <div className="form-group" style={{ marginBottom: 14 }}>
                  <label className="form-label">Full Name</label>
                  <input
                    className="form-input"
                    required
                    value={editForm.fullName}
                    onChange={e => setEditForm({ ...editForm, fullName: e.target.value })}
                  />
                </div>

                <div className="form-group" style={{ marginBottom: 14 }}>
                  <label className="form-label">Email Address</label>
                  <input
                    className="form-input"
                    type="email"
                    required
                    value={editForm.email}
                    onChange={e => setEditForm({ ...editForm, email: e.target.value })}
                  />
                </div>

                <div className="form-group" style={{ marginBottom: 14 }}>
                  <label className="form-label">Phone Number</label>
                  <input
                    className="form-input"
                    required
                    value={editForm.phone}
                    onChange={e => setEditForm({ ...editForm, phone: e.target.value })}
                  />
                </div>

                <div className="form-group" style={{ marginBottom: 14 }}>
                  <label className="form-label">Role</label>
                  <select
                    className="form-input"
                    value={editForm.role}
                    onChange={e => setEditForm({ ...editForm, role: e.target.value })}
                  >
                    <option value="PATIENT">Patient</option>
                    <option value="DOCTOR">Doctor</option>
                    <option value="ADMIN">Administrator</option>
                  </select>
                </div>

                <div className="form-group" style={{ marginBottom: 20 }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.88rem', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={editForm.active}
                      onChange={e => setEditForm({ ...editForm, active: e.target.checked })}
                    />
                    Account is Active and Enabled
                  </label>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
                  <button
                    type="button"
                    onClick={() => setEditingUser(null)}
                    className="btn btn-secondary"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={saving}
                  >
                    {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* DELETE CONFIRMATION MODAL */}
      <AnimatePresence>
        {deletingUser && (
          <div style={{
            position: 'fixed', inset: 0, zIndex: 999,
            background: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(4px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20
          }}>
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              style={{
                background: 'white', borderRadius: 20, width: '100%', maxWidth: 420,
                padding: 26, textAlign: 'center', boxShadow: '0 20px 50px rgba(0,0,0,0.2)'
              }}
            >
              <div style={{
                width: 48, height: 48, borderRadius: 14, background: 'var(--red-pale)',
                color: 'var(--red)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 16px auto'
              }}>
                <AlertTriangle size={24} />
              </div>

              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--navy)', marginBottom: 8 }}>
                Delete User Account?
              </h3>
              <p style={{ color: 'var(--gray-500)', fontSize: '0.88rem', marginBottom: 22, lineHeight: 1.5 }}>
                Are you sure you want to permanently delete <strong>{deletingUser.fullName}</strong> ({deletingUser.email})? This action cannot be undone.
              </p>

              <div style={{ display: 'flex', justifyContent: 'center', gap: 12 }}>
                <button
                  onClick={() => setDeletingUser(null)}
                  className="btn btn-secondary"
                  style={{ flex: 1 }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteConfirm}
                  className="btn"
                  style={{ flex: 1, background: 'var(--red)', color: 'white' }}
                >
                  Delete User
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
