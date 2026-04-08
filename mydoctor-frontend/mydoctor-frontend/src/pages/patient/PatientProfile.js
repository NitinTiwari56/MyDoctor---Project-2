import React, { useEffect, useState } from 'react';
import { getPatientProfile, updatePatientProfile } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

export default function PatientProfile() {
  const { user } = useAuth();
  const [form, setForm]     = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving]   = useState(false);

  useEffect(() => {
    getPatientProfile().then(r => setForm(r.data.data || {})).catch(()=>{}).finally(()=>setLoading(false));
  }, []);

  const set = (k,v) => setForm(f=>({...f,[k]:v}));

  const handleSave = async (e) => {
    e.preventDefault(); setSaving(true);
    try {
      await updatePatientProfile(form);
      toast.success('Profile updated!');
    } catch { toast.error('Could not save profile'); }
    finally { setSaving(false); }
  };

  if (loading) return <div style={{textAlign:'center',padding:80}}><div className="spinner spinner-dark"/></div>;

  const initials = form.fullName?.split(' ').map(n=>n[0]).join('').slice(0,2).toUpperCase() || '?';

  return (
    <>
      <div className="topbar"><div><div className="topbar-title">My Profile</div><div className="topbar-subtitle">Manage your personal details</div></div></div>
      <div className="page">
        <div className="card" style={{maxWidth:680}}>
          <div className="profile-header">
            <div className="profile-avatar-lg">{initials}</div>
            <div className="profile-header-info">
              <h2>{form.fullName}</h2>
              <p>{user?.email}</p>
            </div>
          </div>
          <div className="card-body">
            <form onSubmit={handleSave}>
              <div className="form-grid">
                <div className="form-group"><label className="form-label">Full Name</label>
                  <input className="form-input" value={form.fullName||''} onChange={e=>set('fullName',e.target.value)}/></div>
                <div className="form-group"><label className="form-label">Phone</label>
                  <input className="form-input" value={form.phone||''} onChange={e=>set('phone',e.target.value)}/></div>
              </div>
              <div className="form-grid">
                <div className="form-group"><label className="form-label">Date of Birth</label>
                  <input className="form-input" type="date" value={form.dateOfBirth||''} onChange={e=>set('dateOfBirth',e.target.value)}/></div>
                <div className="form-group"><label className="form-label">Gender</label>
                  <select className="form-select" value={form.gender||''} onChange={e=>set('gender',e.target.value)}>
                    <option value="">Select</option><option>Male</option><option>Female</option><option>Other</option>
                  </select></div>
              </div>
              <div className="form-grid">
                <div className="form-group"><label className="form-label">Blood Group</label>
                  <select className="form-select" value={form.bloodGroup||''} onChange={e=>set('bloodGroup',e.target.value)}>
                    <option value="">Select</option>{['A+','A-','B+','B-','AB+','AB-','O+','O-'].map(b=><option key={b}>{b}</option>)}
                  </select></div>
                <div className="form-group"><label className="form-label">Allergies</label>
                  <input className="form-input" value={form.allergies||''} onChange={e=>set('allergies',e.target.value)}/></div>
              </div>
              <div className="form-group"><label className="form-label">Address</label>
                <textarea className="form-textarea" value={form.address||''} onChange={e=>set('address',e.target.value)} style={{minHeight:70}}/></div>
              <div className="form-group"><label className="form-label">Medical History</label>
                <textarea className="form-textarea" value={form.medicalHistory||''} onChange={e=>set('medicalHistory',e.target.value)}/></div>
              <div className="form-grid">
                <div className="form-group"><label className="form-label">Emergency Contact Name</label>
                  <input className="form-input" value={form.emergencyContactName||''} onChange={e=>set('emergencyContactName',e.target.value)}/></div>
                <div className="form-group"><label className="form-label">Emergency Contact Phone</label>
                  <input className="form-input" value={form.emergencyContactPhone||''} onChange={e=>set('emergencyContactPhone',e.target.value)}/></div>
              </div>
              <button className="btn btn-primary" type="submit" disabled={saving}>
                {saving ? <span className="spinner"/> : 'Save Changes'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}
