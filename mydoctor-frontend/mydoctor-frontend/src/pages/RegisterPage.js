import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { register as registerApi } from '../services/api';
import { User, Stethoscope, ChevronRight, Eye, EyeOff, Sparkles, HeartPulse, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

// Premium Unsplash images
const HERO_IMG = 'https://images.unsplash.com/photo-1666214280557-f1b5022eb634?w=800&q=80&auto=format';
const TRUST_LOGOS = [
  'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=80&q=80&auto=format',
  'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=80&q=80&auto=format',
  'https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=80&q=80&auto=format',
  'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=80&q=80&auto=format',
];

export default function RegisterPage() {
  const { login } = useAuth();
  const navigate  = useNavigate();
  const [role, setRole]       = useState('PATIENT');
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');
  const [showPw, setShowPw]   = useState(false);
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
        {/* Floating decorative orbs */}
        <div style={{
          position: 'absolute', top: '12%', right: '20%',
          width: 100, height: 100, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(99,102,241,.12) 0%, transparent 70%)',
          animation: 'float 7s ease-in-out infinite', pointerEvents: 'none',
        }} />
        <div style={{
          position: 'absolute', bottom: '25%', left: '12%',
          width: 70, height: 70, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(139,92,246,.1) 0%, transparent 70%)',
          animation: 'float2 9s ease-in-out infinite', pointerEvents: 'none',
        }} />

        <div className="auth-left-content">
          <div className="auth-brand">
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
              <motion.div
                animate={{ rotate: [0, 5, -5, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                style={{
                  width: 44, height: 44, borderRadius: 12,
                  background: 'linear-gradient(135deg, rgba(99,102,241,.2) 0%, rgba(139,92,246,.15) 100%)',
                  border: '1px solid rgba(99,102,241,.3)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
              >
                <Sparkles size={22} style={{ color: '#818cf8' }} />
              </motion.div>
            </div>
            <h1>My<span>Doctor</span></h1>
            <p>Join thousands managing their health smarter.</p>
          </div>

          {/* Hero Image with Glassmorphism */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            style={{ position: 'relative', marginBottom: 40 }}
          >
            <div style={{
              borderRadius: 20, overflow: 'hidden',
              boxShadow: '0 20px 60px rgba(20,184,166,.25), 0 0 80px rgba(99,102,241,.1)',
              border: '1px solid rgba(255,255,255,.1)',
              position: 'relative',
            }}>
              <img
                src={HERO_IMG}
                alt="Healthcare team collaboration"
                style={{
                  width: '100%', height: 280, objectFit: 'cover',
                  display: 'block', filter: 'brightness(0.8) saturate(1.15)',
                }}
              />
              <div style={{
                position: 'absolute', bottom: 0, left: 0, right: 0, height: '50%',
                background: 'linear-gradient(to top, rgba(11,15,26,.9), transparent)',
                pointerEvents: 'none',
              }} />

              {/* Floating stats */}
              <motion.div
                animate={{ y: [0, -6, 0] }}
                transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
                style={{
                  position: 'absolute', top: 16, right: 16,
                  background: 'rgba(255,255,255,.1)',
                  backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)',
                  border: '1px solid rgba(255,255,255,.15)',
                  borderRadius: 12, padding: '12px 16px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <HeartPulse size={16} style={{ color: '#f43f5e' }} />
                  <div>
                    <div style={{ color: 'white', fontSize: '.8rem', fontWeight: 700 }}>98.5%</div>
                    <div style={{ color: 'rgba(255,255,255,.5)', fontSize: '.6rem' }}>Patient Satisfaction</div>
                  </div>
                </div>
              </motion.div>

              <motion.div
                animate={{ y: [0, 8, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                style={{
                  position: 'absolute', bottom: 16, left: 16,
                  background: 'rgba(255,255,255,.1)',
                  backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)',
                  border: '1px solid rgba(255,255,255,.15)',
                  borderRadius: 12, padding: '10px 16px',
                  display: 'flex', alignItems: 'center', gap: 10,
                }}
              >
                <div style={{ display: 'flex' }}>
                  {TRUST_LOGOS.map((src, i) => (
                    <img key={i} src={src} alt="" style={{
                      width: 24, height: 24, borderRadius: '50%',
                      border: '2px solid rgba(11,15,26,.5)',
                      objectFit: 'cover', marginLeft: i > 0 ? -6 : 0,
                    }} />
                  ))}
                </div>
                <div>
                  <div style={{ color: 'white', fontSize: '.7rem', fontWeight: 600 }}>10,000+ Patients</div>
                  <div style={{ color: 'rgba(255,255,255,.45)', fontSize: '.58rem' }}>Already registered</div>
                </div>
              </motion.div>
            </div>

            {/* Reflection */}
            <div style={{
              height: 50, marginTop: 2,
              borderRadius: '0 0 20px 20px', overflow: 'hidden',
            }}>
              <img src={HERO_IMG} alt="" aria-hidden="true" style={{
                width: '100%', height: 280, objectFit: 'cover',
                display: 'block', transform: 'scaleY(-1)',
                filter: 'blur(4px) brightness(.3)',
                maskImage: 'linear-gradient(to bottom, rgba(0,0,0,.2), transparent)',
                WebkitMaskImage: 'linear-gradient(to bottom, rgba(0,0,0,.2), transparent)',
              }} />
            </div>
          </motion.div>

          <div className="auth-features">
            <motion.div className="auth-feature"
              initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
            >
              <div className="auth-feature-icon"><User size={18} /></div>
              <div><h3>For Patients</h3><p>Book appointments, track history, request home visits.</p></div>
            </motion.div>
            <motion.div className="auth-feature"
              initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
            >
              <div className="auth-feature-icon"><Stethoscope size={18} /></div>
              <div><h3>For Doctors</h3><p>Manage your schedule, accept patients, grow your practice.</p></div>
            </motion.div>
            <motion.div className="auth-feature"
              initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 }}
            >
              <div className="auth-feature-icon"><ShieldCheck size={18} /></div>
              <div><h3>Secure & Private</h3><p>HIPAA-compliant data handling with end-to-end encryption.</p></div>
            </motion.div>
          </div>
        </div>
      </div>

      <div className="auth-right" style={{ overflowY: 'auto' }}>
        <motion.div
          className="auth-form-container" style={{ maxWidth: 420 }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h2>Create account</h2>
          <p>Get started with MyDoctor today</p>

          {/* Premium Role Toggle */}
          <div className="role-toggle">
            <motion.button
              type="button"
              className={`role-btn ${role==='PATIENT'?'active':''}`}
              onClick={() => setRole('PATIENT')}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              style={{ position: 'relative', overflow: 'hidden' }}
            >
              <User size={16} style={{
                transition: 'transform .3s',
                transform: role === 'PATIENT' ? 'scale(1.15)' : 'scale(1)',
              }} />
              Patient
            </motion.button>
            <motion.button
              type="button"
              className={`role-btn ${role==='DOCTOR'?'active':''}`}
              onClick={() => setRole('DOCTOR')}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              style={{ position: 'relative', overflow: 'hidden' }}
            >
              <Stethoscope size={16} style={{
                transition: 'transform .3s',
                transform: role === 'DOCTOR' ? 'scale(1.15)' : 'scale(1)',
              }} />
              Doctor
            </motion.button>
          </div>

          {error && (
            <motion.div className="alert alert-error"
              initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
            >
              <span style={{ fontSize: '1rem' }}>⚠️</span>
              {error}
            </motion.div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input className="form-input" placeholder="John Doe" value={form.fullName}
                  onChange={e => set('fullName', e.target.value)} required />
              </div>
              <div className="form-group">
                <label className="form-label">Phone</label>
                <input className="form-input" placeholder="9876543210" value={form.phone}
                  onChange={e => set('phone', e.target.value)} required />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Email address</label>
              <input className="form-input" type="email" placeholder="you@example.com" value={form.email}
                onChange={e => set('email', e.target.value)} required />
            </div>
            <div className="form-group">
              <label className="form-label">Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  className="form-input"
                  type={showPw ? 'text' : 'password'}
                  placeholder="Min. 6 characters"
                  value={form.password}
                  onChange={e => set('password', e.target.value)}
                  required minLength={6}
                  style={{ paddingRight: 44 }}
                />
                <button
                  type="button" onClick={() => setShowPw(!showPw)}
                  style={{
                    position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                    background: 'none', border: 'none', cursor: 'pointer',
                    color: '#94a3b8', padding: 2, transition: 'color .2s',
                  }}
                  onMouseEnter={e => { e.target.style.color = '#6366f1'; }}
                  onMouseLeave={e => { e.target.style.color = '#94a3b8'; }}
                >
                  {showPw ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
            </div>

            {role === 'DOCTOR' && <>
              <div className="divider" />
              <p style={{
                fontSize: '.72rem', fontWeight: 650, letterSpacing: '.1em',
                textTransform: 'uppercase', color: 'var(--indigo)',
                marginBottom: 16, display: 'flex', alignItems: 'center', gap: 6,
              }}>
                <Stethoscope size={13} />
                Doctor Details
              </p>
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Specialization</label>
                  <input className="form-input" placeholder="Cardiology" value={form.specialization}
                    onChange={e => set('specialization', e.target.value)} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Experience (years)</label>
                  <input className="form-input" type="number" min="0" value={form.experienceYears}
                    onChange={e => set('experienceYears', +e.target.value)} />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Qualifications</label>
                <input className="form-input" placeholder="MBBS, MD" value={form.qualifications}
                  onChange={e => set('qualifications', e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">Clinic Address</label>
                <input className="form-input" placeholder="123 Main St, City" value={form.clinicAddress}
                  onChange={e => set('clinicAddress', e.target.value)} />
              </div>
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Clinic Fee (₹)</label>
                  <input className="form-input" type="number" value={form.consultationFeeClinic}
                    onChange={e => set('consultationFeeClinic', +e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Home Visit Fee (₹)</label>
                  <input className="form-input" type="number" value={form.consultationFeeHome}
                    onChange={e => set('consultationFeeHome', +e.target.value)} />
                </div>
              </div>

              {/* Premium Toggle */}
              <div
                style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '12px 16px', marginBottom: 10,
                  background: form.acceptsHomeVisits ? 'rgba(99,102,241,.06)' : 'var(--gray-50)',
                  borderRadius: 8,
                  border: `1.5px solid ${form.acceptsHomeVisits ? 'rgba(99,102,241,.25)' : 'var(--gray-200)'}`,
                  cursor: 'pointer', transition: 'all .25s',
                }}
                onClick={() => set('acceptsHomeVisits', !form.acceptsHomeVisits)}
              >
                <div style={{
                  width: 40, height: 22, borderRadius: 99,
                  background: form.acceptsHomeVisits
                    ? 'linear-gradient(135deg, #6366f1, #8b5cf6)'
                    : 'var(--gray-300)',
                  position: 'relative', transition: 'background .3s',
                  boxShadow: form.acceptsHomeVisits ? '0 2px 8px rgba(99,102,241,.3)' : 'none',
                  flexShrink: 0,
                }}>
                  <div style={{
                    width: 16, height: 16, borderRadius: '50%',
                    background: 'white', position: 'absolute',
                    top: 3, left: form.acceptsHomeVisits ? 20 : 4,
                    transition: 'left .3s cubic-bezier(.34,1.56,.64,1)',
                    boxShadow: '0 1px 3px rgba(0,0,0,.2)',
                  }} />
                </div>
                <label style={{
                  fontSize: '.84rem', fontWeight: 500, cursor: 'pointer',
                  color: form.acceptsHomeVisits ? 'var(--indigo)' : 'var(--gray-600)',
                  transition: 'color .2s',
                }}>
                  Accept home visits
                </label>
              </div>
            </>}

            <motion.button
              className="btn btn-primary btn-full btn-lg"
              type="submit" disabled={loading}
              style={{ marginTop: 12 }}
              whileHover={{ scale: 1.02, boxShadow: '0 6px 30px rgba(99,102,241,.4)' }}
              whileTap={{ scale: 0.98 }}
            >
              {loading ? <span className="spinner" /> : <>Create account <ChevronRight size={16} /></>}
            </motion.button>
          </form>

          <div className="auth-switch">
            Already have an account? <Link to="/login">Sign in</Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
