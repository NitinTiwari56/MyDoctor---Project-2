import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getPatientDash, getPatientAppts } from '../../services/api';
import { CalendarCheck, Clock, CheckCircle, XCircle, ArrowRight, Sparkles, TrendingUp, Heart, Zap, Bot } from 'lucide-react';
import { format } from 'date-fns';
import { motion } from 'framer-motion';
import CountUp from 'react-countup';

// Premium Unsplash images
const BANNER_IMG = 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=1200&q=80&auto=format';
const FEATURE_IMGS = [
  'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=100&q=80&auto=format',
  'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=100&q=80&auto=format',
  'https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=100&q=80&auto=format',
];

function StatusBadge({ status }) {
  const s = status.toLowerCase();
  return (
    <span
      className={`badge badge-${s}`}
      style={{
        animation: s === 'pending' ? 'pulse 2s ease-in-out infinite' : undefined,
      }}
    >
      {s === 'pending' && <span style={{
        width: 5, height: 5, borderRadius: '50%',
        background: 'currentColor', display: 'inline-block',
        animation: 'pulse 1.5s ease-in-out infinite',
      }} />}
      {status}
    </span>
  );
}

export default function PatientDashboard() {
  const { user } = useAuth();
  const navigate  = useNavigate();
  const [dash, setDash]   = useState(null);
  const [appts, setAppts] = useState([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    Promise.all([
      getPatientDash().then(r => setDash(r.data.data)).catch(() => {}),
      getPatientAppts().then(r => setAppts(r.data.data?.slice(0, 5) || [])).catch(() => {}),
    ]).finally(() => setLoaded(true));
  }, []);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  const stats = [
    { label: 'Upcoming',  value: dash?.upcomingAppointments ?? 0,  icon: Clock,       cls: 'teal'  },
    { label: 'Completed', value: dash?.completedAppointments ?? 0, icon: CheckCircle, cls: 'green' },
    { label: 'Cancelled', value: dash?.cancelledAppointments ?? 0, icon: XCircle,     cls: 'amber' },
  ];

  return (
    <>
      {/* Topbar */}
      <div className="topbar">
        <div>
          <div className="topbar-title">Dashboard</div>
          <div className="topbar-subtitle">{greeting}, {user?.fullName?.split(' ')[0]} 👋</div>
        </div>
        <motion.button
          className="btn btn-primary"
          onClick={() => navigate('/patient/doctors')}
          whileHover={{ scale: 1.03, boxShadow: '0 6px 24px rgba(99,102,241,.35)' }}
          whileTap={{ scale: 0.97 }}
        >
          <CalendarCheck size={16} /> Book Appointment
        </motion.button>
      </div>

      <div className="page">
        {/* Welcome Banner with Real Image */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          style={{ position: 'relative', marginBottom: 26 }}
        >
          <div style={{
            borderRadius: 'var(--radius-md)',
            overflow: 'hidden', position: 'relative',
            minHeight: 220,
          }}>
            {/* Background Image */}
            <img
              src={BANNER_IMG} alt="" aria-hidden="true"
              style={{
                position: 'absolute', inset: 0,
                width: '100%', height: '100%',
                objectFit: 'cover', filter: 'brightness(.6) saturate(1.2)',
              }}
            />
            <div style={{
              position: 'absolute', inset: 0,
              background: 'linear-gradient(135deg, rgba(11,15,26,.8) 0%, rgba(30,27,75,.65) 60%, rgba(49,46,129,.5) 100%)',
            }} />

            {/* Animated orbs */}
            <motion.div
              animate={{ y: [0, -15, 0], x: [0, 10, 0] }}
              transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
              style={{
                position: 'absolute', top: -30, right: -20,
                width: 140, height: 140, borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(99,102,241,.3) 0%, transparent 70%)',
              }}
            />

            <div style={{ position: 'relative', zIndex: 1, padding: '32px 36px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <Sparkles size={18} style={{ color: '#818cf8' }} />
                <span style={{ fontSize: '.72rem', fontWeight: 650, letterSpacing: '.1em', textTransform: 'uppercase', color: '#818cf8' }}>
                  Welcome Back
                </span>
              </div>
              <h2 style={{
                fontFamily: 'var(--font-display)', fontSize: '1.7rem',
                color: 'white', marginBottom: 8,
              }}>
                {greeting}, {user?.fullName?.split(' ')[0]}!
              </h2>
              <p style={{ color: 'rgba(255,255,255,.5)', fontSize: '.88rem', maxWidth: 450 }}>
                Stay on top of your health with MyDoctor. Book appointments, track your history, and manage your wellness journey.
              </p>

              <div style={{ display: 'flex', gap: 12, marginTop: 20, flexWrap: 'wrap', alignItems: 'center' }}>
                <motion.button
                  className="btn"
                  onClick={() => navigate('/patient/assistant')}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  style={{
                    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                    color: 'white',
                    border: 'none',
                    boxShadow: '0 4px 14px rgba(99,102,241,.4)',
                    display: 'flex', alignItems: 'center', gap: 7,
                  }}
                >
                  <Bot size={15} /> AI Health Assistant
                </motion.button>

                <motion.button
                  className="btn"
                  onClick={() => navigate('/patient/doctors')}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  style={{
                    background: 'rgba(255,255,255,.1)',
                    color: 'white',
                    border: '1px solid rgba(255,255,255,.15)',
                    backdropFilter: 'blur(10px)',
                  }}
                >
                  <TrendingUp size={15} /> Find a Doctor
                </motion.button>

                {/* Glassmorphic floating card */}
                <motion.div
                  animate={{ y: [0, -5, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                  style={{
                    background: 'rgba(255,255,255,.08)',
                    backdropFilter: 'blur(12px)',
                    border: '1px solid rgba(255,255,255,.12)',
                    borderRadius: 12, padding: '10px 18px',
                    display: 'flex', alignItems: 'center', gap: 10,
                  }}
                >
                  <div style={{ display: 'flex' }}>
                    {FEATURE_IMGS.map((src, i) => (
                      <img key={i} src={src} alt="" style={{
                        width: 26, height: 26, borderRadius: '50%',
                        border: '2px solid rgba(11,15,26,.5)',
                        objectFit: 'cover', marginLeft: i > 0 ? -8 : 0,
                      }} />
                    ))}
                  </div>
                  <span style={{ color: 'rgba(255,255,255,.6)', fontSize: '.76rem', fontWeight: 500 }}>
                    500+ doctors available
                  </span>
                  <div style={{
                    width: 6, height: 6, borderRadius: '50%',
                    background: '#10b981', boxShadow: '0 0 8px rgba(16,185,129,.6)',
                    animation: 'pulse 2s ease-in-out infinite',
                  }} />
                </motion.div>
              </div>
            </div>
          </div>

          {/* Reflection */}
          <div style={{
            height: 35, marginTop: 2,
            borderRadius: '0 0 14px 14px', overflow: 'hidden',
          }}>
            <img src={BANNER_IMG} alt="" aria-hidden="true" style={{
              width: '100%', height: 220, objectFit: 'cover',
              display: 'block', transform: 'scaleY(-1)',
              filter: 'blur(6px) brightness(.25)',
              maskImage: 'linear-gradient(to bottom, rgba(0,0,0,.3), transparent)',
              WebkitMaskImage: 'linear-gradient(to bottom, rgba(0,0,0,.3), transparent)',
            }} />
          </div>
        </motion.div>

        {/* Stats with CountUp */}
        <div className="stats-grid">
          {stats.map((s, i) => (
            <motion.div
              className="stat-card" key={s.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.08, duration: 0.4 }}
              whileHover={{ y: -4, boxShadow: '0 12px 30px rgba(0,0,0,.12)' }}
            >
              <div className={`stat-icon ${s.cls}`}><s.icon size={22} /></div>
              <div>
                <div className="stat-value">
                  {loaded ? (
                    <CountUp end={typeof s.value === 'number' ? s.value : 0} duration={1.5} />
                  ) : '—'}
                </div>
                <div className="stat-label">{s.label}</div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Quick health tips */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          style={{
            display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: 14, marginBottom: 24,
          }}
        >
          {[
            { emoji: '💧', tip: 'Drink 8 glasses of water daily', color: 'rgba(56,189,248,.08)', border: 'rgba(56,189,248,.15)' },
            { emoji: '🏃', tip: '30 mins exercise improves heart health', color: 'rgba(16,185,129,.08)', border: 'rgba(16,185,129,.15)' },
            { emoji: '😴', tip: '7-9 hours of sleep boosts immunity', color: 'rgba(139,92,246,.08)', border: 'rgba(139,92,246,.15)' },
          ].map((item, i) => (
            <motion.div
              key={i}
              whileHover={{ scale: 1.02, y: -2 }}
              style={{
                padding: '14px 18px', borderRadius: 12,
                background: item.color, border: `1px solid ${item.border}`,
                display: 'flex', alignItems: 'center', gap: 12,
                cursor: 'default',
              }}
            >
              <span style={{ fontSize: '1.2rem' }}>{item.emoji}</span>
              <span style={{ fontSize: '.8rem', fontWeight: 500, color: 'var(--gray-600)' }}>{item.tip}</span>
            </motion.div>
          ))}
        </motion.div>

        {/* Recent Appointments Card */}
        <motion.div
          className="card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="card-header">
            <span className="card-title">Recent Appointments</span>
            <motion.button
              className="btn btn-sm btn-secondary"
              onClick={() => navigate('/patient/appointments')}
              whileHover={{ scale: 1.03 }}
            >
              View all <ArrowRight size={14} />
            </motion.button>
          </div>
          <div className="card-body" style={{ padding: 0 }}>
            {!loaded ? (
              <div style={{ textAlign: 'center', padding: 50 }}>
                <div className="spinner spinner-dark" />
              </div>
            ) : appts.length === 0 ? (
              <div className="empty-state">
                <motion.div
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                >
                  <CalendarCheck size={40} />
                </motion.div>
                <h3>No appointments yet</h3>
                <p>Book your first appointment to get started.</p>
                <motion.button
                  className="btn btn-outline"
                  onClick={() => navigate('/patient/doctors')}
                  whileHover={{ scale: 1.03 }}
                  style={{ marginTop: 12 }}
                >
                  Find Doctors
                </motion.button>
              </div>
            ) : (
              <div className="table-wrapper">
                <table>
                  <thead>
                    <tr>
                      <th>Doctor</th>
                      <th>Date & Time</th>
                      <th>Type</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {appts.map((a, i) => (
                      <motion.tr
                        key={a.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.05 }}
                        style={{ cursor: 'pointer' }}
                        onClick={() => navigate('/patient/appointments')}
                      >
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <div style={{
                              width: 36, height: 36, borderRadius: 8,
                              background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              color: 'white', fontSize: '.75rem', fontWeight: 600, flexShrink: 0,
                              boxShadow: '0 2px 8px rgba(99,102,241,.25)',
                            }}>
                              {a.doctorName?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                            </div>
                            <div>
                              <strong style={{ fontSize: '.87rem' }}>Dr. {a.doctorName}</strong>
                              <div style={{ fontSize: '.73rem', color: 'var(--indigo)', fontWeight: 550 }}>
                                {a.doctorSpecialization}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td>
                          <div style={{ fontWeight: 500 }}>
                            {a.appointmentDate ? format(new Date(a.appointmentDate), 'dd MMM yyyy') : '—'}
                          </div>
                          <span style={{ fontSize: '.75rem', color: 'var(--gray-400)' }}>
                            {a.startTime ? a.startTime.slice(0, 5) : '—'}
                          </span>
                        </td>
                        <td>
                          <span style={{
                            fontSize: '.76rem', fontWeight: 500,
                            padding: '3px 8px', borderRadius: 6,
                            background: 'var(--gray-50)',
                          }}>
                            {a.appointmentType?.replace('_', ' ')}
                          </span>
                        </td>
                        <td><StatusBadge status={a.status} /></td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </>
  );
}
