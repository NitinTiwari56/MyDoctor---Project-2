import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { register as registerApi } from '../services/api';
import { User, Stethoscope, ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';

export default function RegisterPage() {
  const { login } = useAuth();
  const navigate  = useNavigate();
  const [role, setRole]       = useState('PATIENT');
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');
  const [form, setForm] = useState({
    fullName:'', email:'', password:'', phone:'',
    specialization:'', qualifications:'', clinicAddress:'',
    consultationFeeClinic:500, consultationFeeHome:800,
    experienceYears:0, acceptsHomeVisits:false, bio:'',
  });

  const set = (k, v) => setForm(f => ({...f, [k]: v}));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      const payload = { ...form, role };
      const res = await registerApi(payload);
      const { token, ...userData } = res.data.data;
      login(userData, token);
      toast.success('Account created successfully!');
      navigate(role === 'DOCTOR' ? '/doctor' : '/patient');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-left">
        <div className="auth-left-content">
          <div className="auth-brand">
            <h1>My<span>Doctor</span></h1>
            <p>Join thousands managing their health smarter.</p>
          </div>
          <div className="auth-features">
            <div className="auth-feature">
              <div className="auth-feature-icon"><User size={18} /></div>
              <div><h3>For Patients</h3><p>Book appointments, track history, request home visits.</p></div>
            </div>
            <div className="auth-feature">
              <div className="auth-feature-icon"><Stethoscope size={18} /></div>
              <div><h3>For Doctors</h3><p>Manage your schedule, accept patients, grow your practice.</p></div>
            </div>
          </div>
        </div>
      </div>

      <div className="auth-right" style={{ overflowY: 'auto' }}>
        <div className="auth-form-container" style={{ maxWidth: 420 }}>
          <h2>Create account</h2>
          <p>Get started with MyDoctor today</p>

          <div className="role-toggle">
            <button type="button" className={`role-btn ${role==='PATIENT'?'active':''}`} onClick={()=>setRole('PATIENT')}>
              <User size={16} /> Patient
            </button>
            <button type="button" className={`role-btn ${role==='DOCTOR'?'active':''}`} onClick={()=>setRole('DOCTOR')}>
              <Stethoscope size={16} /> Doctor
            </button>
          </div>

          {error && <div className="alert alert-error">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input className="form-input" placeholder="John Doe" value={form.fullName}
                  onChange={e=>set('fullName',e.target.value)} required />
              </div>
              <div className="form-group">
                <label className="form-label">Phone</label>
                <input className="form-input" placeholder="9876543210" value={form.phone}
                  onChange={e=>set('phone',e.target.value)} required />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Email address</label>
              <input className="form-input" type="email" placeholder="you@example.com" value={form.email}
                onChange={e=>set('email',e.target.value)} required />
            </div>
            <div className="form-group">
              <label className="form-label">Password</label>
              <input className="form-input" type="password" placeholder="Min. 6 characters" value={form.password}
                onChange={e=>set('password',e.target.value)} required minLength={6} />
            </div>

            {role === 'DOCTOR' && <>
              <div className="divider" />
              <p style={{fontSize:'.8rem',color:'var(--gray-400)',marginBottom:16,fontWeight:500}}>DOCTOR DETAILS</p>
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Specialization</label>
                  <input className="form-input" placeholder="Cardiology" value={form.specialization}
                    onChange={e=>set('specialization',e.target.value)} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Experience (years)</label>
                  <input className="form-input" type="number" min="0" value={form.experienceYears}
                    onChange={e=>set('experienceYears',+e.target.value)} />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Qualifications</label>
                <input className="form-input" placeholder="MBBS, MD" value={form.qualifications}
                  onChange={e=>set('qualifications',e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">Clinic Address</label>
                <input className="form-input" placeholder="123 Main St, City" value={form.clinicAddress}
                  onChange={e=>set('clinicAddress',e.target.value)} />
              </div>
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Clinic Fee (₹)</label>
                  <input className="form-input" type="number" value={form.consultationFeeClinic}
                    onChange={e=>set('consultationFeeClinic',+e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Home Visit Fee (₹)</label>
                  <input className="form-input" type="number" value={form.consultationFeeHome}
                    onChange={e=>set('consultationFeeHome',+e.target.value)} />
                </div>
              </div>
              <div className="form-group" style={{display:'flex',alignItems:'center',gap:10}}>
                <input type="checkbox" id="homeVisits" checked={form.acceptsHomeVisits}
                  onChange={e=>set('acceptsHomeVisits',e.target.checked)} style={{width:16,height:16,accentColor:'var(--teal)'}} />
                <label htmlFor="homeVisits" className="form-label" style={{margin:0,cursor:'pointer'}}>Accept home visits</label>
              </div>
            </>}

            <button className="btn btn-primary btn-full btn-lg" type="submit" disabled={loading}
              style={{ marginTop: 8 }}>
              {loading ? <span className="spinner" /> : <>Create account <ChevronRight size={16} /></>}
            </button>
          </form>

          <div className="auth-switch">
            Already have an account? <Link to="/login">Sign in</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
