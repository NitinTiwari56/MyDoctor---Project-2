import React, { useEffect, useState } from 'react';
import { getDoctorProfile, updateDoctorProfile } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Home, MapPin, Award } from 'lucide-react';
import toast from 'react-hot-toast';

export default function DoctorProfile() {
  const { user } = useAuth();
  const [form, setForm]     = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving]   = useState(false);

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
    try {
      await updateDoctorProfile(form);
      toast.success('Profile updated successfully!');
    } catch {
      toast.error('Could not save profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
      <div className="spinner spinner-dark" />
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
        <div className="card" style={{ maxWidth: 720 }}>

          {/* Header banner */}
          <div className="profile-header">
            <div className="profile-avatar-lg">{initials}</div>
            <div className="profile-header-info">
              <h2>Dr. {form.fullName}</h2>
              <p>{form.specialization} · {form.experienceYears} yrs experience</p>
            </div>
          </div>

          <div className="card-body">
            <form onSubmit={handleSave}>

              {/* ── Personal Info ── */}
              <p style={{ fontSize: '.72rem', fontWeight: 600, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--gray-400)', marginBottom: 14 }}>
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
              <p style={{ fontSize: '.72rem', fontWeight: 600, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--gray-400)', marginBottom: 14 }}>
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
              <p style={{ fontSize: '.72rem', fontWeight: 600, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--gray-400)', marginBottom: 14 }}>
                Clinic & Fees
              </p>
              <div className="form-group">
                <label className="form-label">
                  <MapPin size={13} style={{ verticalAlign: 'middle', marginRight: 4 }} />
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
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px', background: form.acceptsHomeVisits ? 'var(--teal-pale)' : 'var(--gray-50)', borderRadius: 'var(--radius-sm)', border: `1.5px solid ${form.acceptsHomeVisits ? 'var(--teal)' : 'var(--gray-200)'}`, marginBottom: 18, transition: 'all .2s', cursor: 'pointer' }}
                onClick={() => set('acceptsHomeVisits', !form.acceptsHomeVisits)}>
                <Home size={18} color={form.acceptsHomeVisits ? 'var(--teal)' : 'var(--gray-400)'} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '.88rem', fontWeight: 500, color: form.acceptsHomeVisits ? 'var(--teal)' : 'var(--gray-700)' }}>Accept Home Visits</div>
                  <div style={{ fontSize: '.76rem', color: 'var(--gray-400)' }}>Patients can request visits at their location</div>
                </div>
                <div style={{ width: 36, height: 20, borderRadius: 99, background: form.acceptsHomeVisits ? 'var(--teal)' : 'var(--gray-300)', position: 'relative', transition: 'background .2s' }}>
                  <div style={{ width: 14, height: 14, borderRadius: '50%', background: 'white', position: 'absolute', top: 3, left: form.acceptsHomeVisits ? 18 : 4, transition: 'left .2s', boxShadow: '0 1px 3px rgba(0,0,0,.2)' }} />
                </div>
              </div>

              {/* ── Stats row (read-only) ── */}
              <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
                {[
                  { icon: Award, label: 'Email', value: user?.email },
                ].map(({ icon: Icon, label, value }) => (
                  <div key={label} style={{ flex: 1, padding: '10px 14px', background: 'var(--gray-50)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--gray-200)' }}>
                    <div style={{ fontSize: '.68rem', color: 'var(--gray-400)', textTransform: 'uppercase', letterSpacing: '.07em', marginBottom: 3 }}>{label}</div>
                    <div style={{ fontSize: '.85rem', color: 'var(--gray-700)', fontWeight: 500 }}>{value}</div>
                  </div>
                ))}
              </div>

              <button className="btn btn-primary btn-lg" type="submit" disabled={saving}>
                {saving ? <span className="spinner" /> : 'Save Changes'}
              </button>

            </form>
          </div>
        </div>
      </div>
    </>
  );
}
