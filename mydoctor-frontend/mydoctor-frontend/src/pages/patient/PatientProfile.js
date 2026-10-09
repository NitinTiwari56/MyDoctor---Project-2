import React, { useEffect, useState } from 'react';
import { getPatientProfile, updatePatientProfile } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Save, CheckCircle, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

export default function PatientProfile() {
  const { user } = useAuth();
  const [form, setForm]     = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving]   = useState(false);
  const [saved, setSaved]     = useState(false);

  useEffect(() => {
    getPatientProfile().then(r => setForm(r.data.data || {})).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSaved(false);
    try {
      await updatePatientProfile(form);
      toast.success('Profile updated!');
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch {
      toast.error('Could not save profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
      <div className="spinner spinner-dark" style={{ width: 28, height: 28 }} />
    </div>
  );

  const initials = form.fullName?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || '?';

  return (
    <>
      <div className="topbar">
        <div>
          <div className="topbar-title">My Profile</div>
          <div className="topbar-subtitle">Manage your personal details</div>
        </div>
      </div>

      <div className="page">
        <motion.div
          className="card"
          style={{ maxWidth: 700 }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          {/* Profile Header */}
          <div className="profile-header">
            <motion.div
              className="profile-avatar-lg"
              whileHover={{ scale: 1.08, rotate: -3 }}
              transition={{ type: 'spring', stiffness: 300 }}
            >
              {initials}
            </motion.div>
            <div className="profile-header-info">
              <h2>{form.fullName}</h2>
              <p style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Sparkles size={14} />
                {user?.email}
              </p>
            </div>
          </div>

          <div className="card-body">
            <form onSubmit={handleSave}>
              {/* Section: Personal */}
              <p style={{
                fontSize: '.72rem', fontWeight: 650, letterSpacing: '.1em',
                textTransform: 'uppercase', color: 'var(--indigo)',
                marginBottom: 16, display: 'flex', alignItems: 'center', gap: 6,
              }}>
                <span style={{
                  width: 4, height: 16, borderRadius: 2,
                  background: 'var(--grad-primary)', display: 'inline-block',
                }} />
                Personal Information
              </p>

              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Full Name</label>
                  <input className="form-input" value={form.fullName || ''} onChange={e => set('fullName', e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Phone</label>
                  <input className="form-input" value={form.phone || ''} onChange={e => set('phone', e.target.value)} />
                </div>
              </div>
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Date of Birth</label>
                  <input className="form-input" type="date" value={form.dateOfBirth || ''} onChange={e => set('dateOfBirth', e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Gender</label>
                  <select className="form-select" value={form.gender || ''} onChange={e => set('gender', e.target.value)}>
                    <option value="">Select</option><option>Male</option><option>Female</option><option>Other</option>
                  </select>
                </div>
              </div>

              <div className="divider" />

              {/* Section: Medical */}
              <p style={{
                fontSize: '.72rem', fontWeight: 650, letterSpacing: '.1em',
                textTransform: 'uppercase', color: 'var(--indigo)',
                marginBottom: 16, display: 'flex', alignItems: 'center', gap: 6,
              }}>
                <span style={{
                  width: 4, height: 16, borderRadius: 2,
                  background: 'var(--grad-teal)', display: 'inline-block',
                }} />
                Medical Information
              </p>

              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Blood Group</label>
                  <select className="form-select" value={form.bloodGroup || ''} onChange={e => set('bloodGroup', e.target.value)}>
                    <option value="">Select</option>
                    {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(b => <option key={b}>{b}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Allergies</label>
                  <input className="form-input" value={form.allergies || ''} onChange={e => set('allergies', e.target.value)} />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Address</label>
                <textarea className="form-textarea" value={form.address || ''} onChange={e => set('address', e.target.value)} style={{ minHeight: 70 }} />
              </div>
              <div className="form-group">
                <label className="form-label">Medical History</label>
                <textarea className="form-textarea" value={form.medicalHistory || ''} onChange={e => set('medicalHistory', e.target.value)} />
              </div>

              <div className="divider" />

              {/* Section: Emergency */}
              <p style={{
                fontSize: '.72rem', fontWeight: 650, letterSpacing: '.1em',
                textTransform: 'uppercase', color: 'var(--red)',
                marginBottom: 16, display: 'flex', alignItems: 'center', gap: 6,
              }}>
                <span style={{
                  width: 4, height: 16, borderRadius: 2,
                  background: 'linear-gradient(135deg, #f43f5e, #fb7185)', display: 'inline-block',
                }} />
                Emergency Contact
              </p>

              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Emergency Contact Name</label>
                  <input className="form-input" value={form.emergencyContactName || ''} onChange={e => set('emergencyContactName', e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Emergency Contact Phone</label>
                  <input className="form-input" value={form.emergencyContactPhone || ''} onChange={e => set('emergencyContactPhone', e.target.value)} />
                </div>
              </div>

              <motion.button
                className="btn btn-primary btn-lg"
                type="submit"
                disabled={saving}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                style={{
                  marginTop: 8,
                  background: saved
                    ? 'linear-gradient(135deg, #10b981, #34d399)'
                    : undefined,
                  boxShadow: saved
                    ? '0 4px 20px rgba(16,185,129,.35)'
                    : undefined,
                  transition: 'all .3s',
                }}
              >
                {saving ? (
                  <span className="spinner" />
                ) : saved ? (
                  <><CheckCircle size={17} /> Saved!</>
                ) : (
                  <><Save size={17} /> Save Changes</>
                )}
              </motion.button>
            </form>
          </div>
        </motion.div>
      </div>
    </>
  );
}
