import React, { useEffect, useState } from 'react';
import { getDoctorProfile, updateDoctorProfile } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Home, MapPin, Award, Save, CheckCircle, Stethoscope, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

export default function DoctorProfile() {
  const { user } = useAuth();
  const [form, setForm]     = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving]   = useState(false);
  const [saved, setSaved]     = useState(false);

  useEffect(() => {
    getDoctorProfile()
      .then(r => setForm(r.data.data || {}))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSaved(false);
    try {
      await updateDoctorProfile(form);
      toast.success('Profile updated successfully!');
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
          <div className="topbar-subtitle">Manage your professional details</div>
        </div>
      </div>

      <div className="page">
        <motion.div
          className="card"
          style={{ maxWidth: 740 }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          {/* Header banner */}
          <div className="profile-header">
            <motion.div
              className="profile-avatar-lg"
              whileHover={{ scale: 1.08, rotate: -3 }}
              transition={{ type: 'spring', stiffness: 300 }}
            >
              {initials}
            </motion.div>
            <div className="profile-header-info">
              <h2>Dr. {form.fullName}</h2>
              <p style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Stethoscope size={14} />
                {form.specialization} · {form.experienceYears} yrs experience
              </p>
            </div>
          </div>

          <div className="card-body">
            <form onSubmit={handleSave}>

              {/* ── Personal Info ── */}
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

              <div className="divider" />

              {/* ── Professional Info ── */}
              <p style={{
                fontSize: '.72rem', fontWeight: 650, letterSpacing: '.1em',
                textTransform: 'uppercase', color: 'var(--teal-dark)',
                marginBottom: 16, display: 'flex', alignItems: 'center', gap: 6,
              }}>
                <span style={{
                  width: 4, height: 16, borderRadius: 2,
                  background: 'var(--grad-teal)', display: 'inline-block',
                }} />
                Professional Details
              </p>
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Specialization</label>
                  <input className="form-input" value={form.specialization || ''} onChange={e => set('specialization', e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Experience (years)</label>
                  <input className="form-input" type="number" min="0" value={form.experienceYears || 0} onChange={e => set('experienceYears', +e.target.value)} />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Qualifications</label>
                <input className="form-input" placeholder="e.g. MBBS, MD, DNB" value={form.qualifications || ''} onChange={e => set('qualifications', e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">Bio</label>
                <textarea className="form-textarea" placeholder="Write a short professional bio..." value={form.bio || ''} onChange={e => set('bio', e.target.value)} />
              </div>

              <div className="divider" />

              {/* ── Clinic Info ── */}
              <p style={{
                fontSize: '.72rem', fontWeight: 650, letterSpacing: '.1em',
                textTransform: 'uppercase', color: 'var(--indigo)',
                marginBottom: 16, display: 'flex', alignItems: 'center', gap: 6,
              }}>
                <span style={{
                  width: 4, height: 16, borderRadius: 2,
                  background: 'var(--grad-primary)', display: 'inline-block',
                }} />
                Clinic & Fees
              </p>
              <div className="form-group">
                <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                  <MapPin size={13} />
                  Clinic Address
                </label>
                <input className="form-input" placeholder="123 Main St, City" value={form.clinicAddress || ''} onChange={e => set('clinicAddress', e.target.value)} />
              </div>
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Clinic Consultation Fee (₹)</label>
                  <input className="form-input" type="number" min="0" value={form.consultationFeeClinic || 0} onChange={e => set('consultationFeeClinic', +e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Home Visit Fee (₹)</label>
                  <input className="form-input" type="number" min="0" value={form.consultationFeeHome || 0} onChange={e => set('consultationFeeHome', +e.target.value)} />
                </div>
              </div>

              {/* ── Home Visits toggle ── */}
              <motion.div
                style={{
                  display: 'flex', alignItems: 'center', gap: 14,
                  padding: '14px 18px',
                  background: form.acceptsHomeVisits
                    ? 'linear-gradient(135deg, rgba(99,102,241,.06), rgba(139,92,246,.04))'
                    : 'var(--gray-50)',
                  borderRadius: 10,
                  border: `1.5px solid ${form.acceptsHomeVisits ? 'rgba(99,102,241,.2)' : 'var(--gray-200)'}`,
                  marginBottom: 22,
                  cursor: 'pointer',
                  transition: 'all .25s',
                }}
                onClick={() => set('acceptsHomeVisits', !form.acceptsHomeVisits)}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
              >
                <Home size={18} color={form.acceptsHomeVisits ? '#6366f1' : '#94a3b8'} style={{ transition: 'color .2s' }} />
                <div style={{ flex: 1 }}>
                  <div style={{
                    fontSize: '.88rem', fontWeight: 550,
                    color: form.acceptsHomeVisits ? 'var(--indigo)' : 'var(--gray-700)',
                    transition: 'color .2s',
                  }}>
                    Accept Home Visits
                  </div>
                  <div style={{ fontSize: '.76rem', color: 'var(--gray-400)' }}>
                    Patients can request visits at their location
                  </div>
                </div>
                <div style={{
                  width: 42, height: 24, borderRadius: 99,
                  background: form.acceptsHomeVisits
                    ? 'linear-gradient(135deg, #6366f1, #8b5cf6)'
                    : 'var(--gray-300)',
                  position: 'relative',
                  transition: 'background .3s',
                  boxShadow: form.acceptsHomeVisits ? '0 2px 10px rgba(99,102,241,.3)' : 'none',
                  flexShrink: 0,
                }}>
                  <motion.div
                    style={{
                      width: 18, height: 18, borderRadius: '50%',
                      background: 'white', position: 'absolute',
                      top: 3,
                      boxShadow: '0 1px 4px rgba(0,0,0,.2)',
                    }}
                    animate={{ left: form.acceptsHomeVisits ? 20 : 4 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  />
                </div>
              </motion.div>

              {/* ── Email read-only ── */}
              <div style={{
                display: 'flex', gap: 12, marginBottom: 22,
              }}>
                <div style={{
                  flex: 1, padding: '12px 16px',
                  background: 'linear-gradient(135deg, rgba(99,102,241,.04), rgba(139,92,246,.02))',
                  borderRadius: 10,
                  border: '1px solid rgba(99,102,241,.08)',
                }}>
                  <div style={{
                    fontSize: '.68rem', color: 'var(--gray-400)',
                    textTransform: 'uppercase', letterSpacing: '.08em',
                    marginBottom: 4, fontWeight: 600,
                    display: 'flex', alignItems: 'center', gap: 4,
                  }}>
                    <Sparkles size={11} />
                    Email
                  </div>
                  <div style={{ fontSize: '.85rem', color: 'var(--gray-700)', fontWeight: 500 }}>
                    {user?.email}
                  </div>
                </div>
              </div>

              <motion.button
                className="btn btn-primary btn-lg"
                type="submit"
                disabled={saving}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                style={{
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
