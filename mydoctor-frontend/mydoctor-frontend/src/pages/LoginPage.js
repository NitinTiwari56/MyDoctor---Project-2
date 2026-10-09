import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { login as loginApi } from '../services/api';
import { Stethoscope, Shield, Clock, ChevronRight, Eye, EyeOff, Sparkles, Heart, Activity } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

// Premium Unsplash medical images
const HERO_IMG = 'https://images.unsplash.com/photo-1631217868264-e5b90bb7e133?w=800&q=80&auto=format';
const AVATAR_IMGS = [
  'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=100&q=80&auto=format',
  'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=100&q=80&auto=format',
  'https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=100&q=80&auto=format',
];

export default function LoginPage() {
  const { login } = useAuth();
  const navigate  = useNavigate();
  const [form, setForm]       = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');
  const [showPw, setShowPw]   = useState(false);
  const [focused, setFocused] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      const res = await loginApi(form);
      const { token, ...userData } = res.data.data;
      login(userData, token);
      toast.success(`Welcome back, ${userData.fullName}!`);
      if (userData.role === 'ADMIN') {
        navigate('/admin');
      } else if (userData.role === 'DOCTOR') {
        navigate('/doctor');
      } else {
        navigate('/patient');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  const features = [
    { icon: Stethoscope, title: 'Expert Doctors', desc: 'Connect with verified specialists across all medical fields.' },
    { icon: Clock,       title: 'Real-time Booking', desc: 'See live availability and book appointments in seconds.' },
    { icon: Shield,      title: 'Home Visits',  desc: 'Request quality healthcare at your doorstep, hassle-free.' },
  ];

  return (
    <div className="auth-page">
      <div className="auth-left">
        {/* Floating decorative orbs */}
        <div style={{
          position: 'absolute', top: '15%', left: '10%',
          width: 120, height: 120, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(99,102,241,.12) 0%, transparent 70%)',
          animation: 'float 6s ease-in-out infinite',
          pointerEvents: 'none',
        }} />
        <div style={{
          position: 'absolute', bottom: '20%', right: '15%',
          width: 80, height: 80, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(20,184,166,.1) 0%, transparent 70%)',
          animation: 'float2 8s ease-in-out infinite',
          pointerEvents: 'none',
        }} />
        <div style={{
          position: 'absolute', top: '55%', left: '45%',
          width: 60, height: 60, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(139,92,246,.08) 0%, transparent 70%)',
          animation: 'float 10s ease-in-out infinite',
          pointerEvents: 'none',
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
            <p>Your health, beautifully managed.</p>
          </div>

          {/* Hero Image with Glassmorphism Overlay */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            style={{ position: 'relative', marginBottom: 40 }}
          >
            <div style={{
              borderRadius: 20,
              overflow: 'hidden',
              boxShadow: '0 20px 60px rgba(99,102,241,.3), 0 0 80px rgba(99,102,241,.1)',
              border: '1px solid rgba(255,255,255,.1)',
              position: 'relative',
            }}>
              <img
                src={HERO_IMG}
                alt="Modern healthcare technology"
                style={{
                  width: '100%', height: 280, objectFit: 'cover',
                  display: 'block', filter: 'brightness(0.85) saturate(1.1)',
                }}
              />
              {/* Gradient overlay */}
              <div style={{
                position: 'absolute', bottom: 0, left: 0, right: 0,
                height: '50%',
                background: 'linear-gradient(to top, rgba(11,15,26,.9), transparent)',
                pointerEvents: 'none',
              }} />

              {/* Floating glassmorphic badges */}
              <motion.div
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                style={{
                  position: 'absolute', top: 16, right: 16,
                  background: 'rgba(255,255,255,.12)',
                  backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)',
                  border: '1px solid rgba(255,255,255,.18)',
                  borderRadius: 12, padding: '10px 16px',
                  display: 'flex', alignItems: 'center', gap: 8,
                }}
              >
                <Activity size={14} style={{ color: '#2dd4bf' }} />
                <span style={{ color: 'white', fontSize: '.72rem', fontWeight: 600, letterSpacing: '.03em' }}>
                  Live Health Monitoring
                </span>
              </motion.div>

              <motion.div
                animate={{ y: [0, 6, 0] }}
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
                <div style={{ display: 'flex', gap: -6 }}>
                  {AVATAR_IMGS.map((src, i) => (
                    <img key={i} src={src} alt="" style={{
                      width: 26, height: 26, borderRadius: '50%',
                      border: '2px solid rgba(11,15,26,.5)',
                      objectFit: 'cover',
                      marginLeft: i > 0 ? -8 : 0,
                    }} />
                  ))}
                </div>
                <div>
                  <div style={{ color: 'white', fontSize: '.72rem', fontWeight: 600 }}>500+ Doctors</div>
                  <div style={{ color: 'rgba(255,255,255,.5)', fontSize: '.62rem' }}>Online now</div>
                </div>
                <div style={{
                  width: 8, height: 8, borderRadius: '50%',
                  background: '#10b981', boxShadow: '0 0 10px rgba(16,185,129,.6)',
                  animation: 'pulse 2s ease-in-out infinite',
                }} />
              </motion.div>
            </div>

            {/* Reflection */}
            <div style={{
              height: 50, marginTop: 2,
              borderRadius: '0 0 20px 20px',
              overflow: 'hidden',
            }}>
              <img src={HERO_IMG} alt="" aria-hidden="true" style={{
                width: '100%', height: 280, objectFit: 'cover',
                display: 'block', transform: 'scaleY(-1)',
                filter: 'blur(4px) brightness(.3)',
                maskImage: 'linear-gradient(to bottom, rgba(0,0,0,.25), transparent)',
                WebkitMaskImage: 'linear-gradient(to bottom, rgba(0,0,0,.25), transparent)',
              }} />
            </div>
          </motion.div>

          <div className="auth-features">
            {features.map(({ icon: Icon, title, desc }, i) => (
              <motion.div
                className="auth-feature" key={title}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + i * 0.1, duration: 0.4 }}
              >
                <div className="auth-feature-icon"><Icon size={18} /></div>
                <div><h3>{title}</h3><p>{desc}</p></div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      <div className="auth-right">
        <motion.div
          className="auth-form-container"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h2>Welcome back</h2>
          <p>Sign in to your MyDoctor account</p>

          {error && (
            <motion.div
              className="alert alert-error"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <span style={{ fontSize: '1rem' }}>⚠️</span>
              {error}
            </motion.div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Email address</label>
              <div style={{ position: 'relative' }}>
                <input
                  className="form-input"
                  type="email"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={e => setForm({...form, email: e.target.value})}
                  onFocus={() => setFocused('email')}
                  onBlur={() => setFocused('')}
                  required
                  style={{
                    borderColor: focused === 'email' ? '#6366f1' : undefined,
                    boxShadow: focused === 'email' ? '0 0 0 3px rgba(99,102,241,.1), 0 0 20px rgba(99,102,241,.06)' : undefined,
                  }}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  className="form-input"
                  type={showPw ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={form.password}
                  onChange={e => setForm({...form, password: e.target.value})}
                  onFocus={() => setFocused('password')}
                  onBlur={() => setFocused('')}
                  required
                  style={{
                    paddingRight: 44,
                    borderColor: focused === 'password' ? '#6366f1' : undefined,
                    boxShadow: focused === 'password' ? '0 0 0 3px rgba(99,102,241,.1), 0 0 20px rgba(99,102,241,.06)' : undefined,
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  style={{
                    position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                    background: 'none', border: 'none', cursor: 'pointer',
                    color: '#94a3b8', padding: 2,
                    transition: 'color .2s, transform .2s',
                  }}
                  onMouseEnter={e => { e.target.style.color = '#6366f1'; }}
                  onMouseLeave={e => { e.target.style.color = '#94a3b8'; }}
                >
                  {showPw ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
            </div>

            <motion.button
              className="btn btn-primary btn-full btn-lg"
              type="submit"
              disabled={loading}
              style={{ marginTop: 10 }}
              whileHover={{ scale: 1.02, boxShadow: '0 6px 30px rgba(99,102,241,.4)' }}
              whileTap={{ scale: 0.98 }}
            >
              {loading ? (
                <span className="spinner" />
              ) : (
                <>
                  Sign in
                  <ChevronRight size={17} style={{ transition: 'transform .2s' }} />
                </>
              )}
            </motion.button>
          </form>

          {/* Social proof */}
          <div style={{
            marginTop: 22, padding: '14px 16px',
            background: 'linear-gradient(135deg, rgba(99,102,241,.04), rgba(139,92,246,.02))',
            borderRadius: 10, border: '1px solid rgba(99,102,241,.08)',
            display: 'flex', alignItems: 'center', gap: 12,
          }}>
            <div style={{ display: 'flex' }}>
              {AVATAR_IMGS.map((src, i) => (
                <img key={i} src={src} alt="" style={{
                  width: 28, height: 28, borderRadius: '50%',
                  border: '2px solid white', objectFit: 'cover',
                  marginLeft: i > 0 ? -8 : 0,
                }} />
              ))}
            </div>
            <div style={{ fontSize: '.76rem', color: 'var(--gray-500)' }}>
              <strong style={{ color: 'var(--indigo)' }}>2,000+</strong> healthcare professionals trust MyDoctor
            </div>
          </div>

          <div className="auth-switch">
            Don't have an account? <Link to="/register">Create one</Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
