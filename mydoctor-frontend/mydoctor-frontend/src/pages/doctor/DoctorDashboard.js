import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getDoctorDash, getPendingAppts } from '../../services/api';
import { Clock, CheckCircle, Users, Award, ArrowRight, Sparkles, Stethoscope, CalendarClock } from 'lucide-react';
import { motion } from 'framer-motion';
import CountUp from 'react-countup';

// Premium Unsplash image
const BANNER_IMG = 'https://images.unsplash.com/photo-1631217868264-e5b90bb7e133?w=1200&q=80&auto=format';

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

export default function DoctorDashboard() {
  const { user } = useAuth();
  const navigate  = useNavigate();
  const [dash, setDash]     = useState(null);
  const [pending, setPending] = useState([]);
  const [loaded, setLoaded]   = useState(false);

  useEffect(() => {
    Promise.all([
      getDoctorDash().then(r => setDash(r.data.data)).catch(() => {}),
      getPendingAppts().then(r => setPending(r.data.data?.slice(0, 5) || [])).catch(() => {}),
    ]).finally(() => setLoaded(true));
  }, []);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  const stats = [
    { label: 'Total',     value: dash?.totalAppointments     ?? 0, icon: Users,       cls: 'navy'  },
    { label: 'Pending',   value: dash?.pendingAppointments   ?? 0, icon: Clock,       cls: 'amber' },
    { label: 'Confirmed', value: dash?.confirmedAppointments ?? 0, icon: CheckCircle, cls: 'teal'  },
    { label: 'Completed', value: dash?.completedAppointments ?? 0, icon: Award,       cls: 'green' },
  ];

  return (
    <>
      <div className="topbar">
        <div>
          <div className="topbar-title">Dashboard</div>
          <div className="topbar-subtitle">{greeting}, Dr. {user?.fullName?.split(' ').slice(-1)[0]} 👋</div>
        </div>
        <motion.button
          className="btn btn-primary"
          onClick={() => navigate('/doctor/slots')}
          whileHover={{ scale: 1.03, boxShadow: '0 6px 24px rgba(99,102,241,.35)' }}
          whileTap={{ scale: 0.97 }}
        >
          <CalendarClock size={16} /> Manage Slots
        </motion.button>
      </div>

      <div className="page">
        {/* Welcome Banner with Image */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          style={{ position: 'relative', marginBottom: 26 }}
        >
          <div style={{
            borderRadius: 'var(--radius-md)',
            overflow: 'hidden', position: 'relative', minHeight: 220,
          }}>
            <img
              src={BANNER_IMG} alt="" aria-hidden="true"
              style={{
                position: 'absolute', inset: 0, width: '100%', height: '100%',
                objectFit: 'cover', filter: 'brightness(.55) saturate(1.2)',
              }}
            />
            <div style={{
              position: 'absolute', inset: 0,
              background: 'linear-gradient(135deg, rgba(11,15,26,.75) 0%, rgba(30,27,75,.6) 60%, rgba(49,46,129,.45) 100%)',
            }} />

            <motion.div
              animate={{ y: [0, -12, 0], x: [0, 8, 0] }}
              transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
              style={{
                position: 'absolute', top: -20, right: -10,
                width: 120, height: 120, borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(20,184,166,.25) 0%, transparent 70%)',
              }}
            />

            <div style={{ position: 'relative', zIndex: 1, padding: '32px 36px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <Sparkles size={18} style={{ color: '#818cf8' }} />
                <span style={{ fontSize: '.72rem', fontWeight: 650, letterSpacing: '.1em', textTransform: 'uppercase', color: '#818cf8' }}>
                  Doctor Portal
                </span>
              </div>
              <h2 style={{
                fontFamily: 'var(--font-display)', fontSize: '1.7rem',
                color: 'white', marginBottom: 8,
              }}>
                {greeting}, Dr. {user?.fullName?.split(' ').slice(-1)[0]}!
              </h2>
              <p style={{ color: 'rgba(255,255,255,.5)', fontSize: '.88rem', maxWidth: 460 }}>
                Manage your appointments, track patient requests, and keep your practice running smoothly.
              </p>

              <div style={{ display: 'flex', gap: 12, marginTop: 20, flexWrap: 'wrap' }}>
                <motion.button
                  className="btn"
                  onClick={() => navigate('/doctor/appointments')}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  style={{
                    background: 'rgba(255,255,255,.1)', color: 'white',
                    border: '1px solid rgba(255,255,255,.15)',
                    backdropFilter: 'blur(10px)',
                  }}
                >
                  <Stethoscope size={15} /> View Appointments
                </motion.button>

                {/* Live pending badge */}
                {loaded && (dash?.pendingAppointments ?? 0) > 0 && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    style={{
                      background: 'rgba(245,158,11,.15)',
                      backdropFilter: 'blur(10px)',
                      border: '1px solid rgba(245,158,11,.25)',
                      borderRadius: 10, padding: '8px 16px',
                      display: 'flex', alignItems: 'center', gap: 8,
                    }}
                  >
                    <div style={{
                      width: 8, height: 8, borderRadius: '50%',
                      background: '#f59e0b',
                      boxShadow: '0 0 8px rgba(245,158,11,.5)',
                      animation: 'pulse 1.5s ease-in-out infinite',
                    }} />
                    <span style={{ color: 'white', fontSize: '.76rem', fontWeight: 600 }}>
                      {dash?.pendingAppointments} pending requests
                    </span>
                  </motion.div>
                )}
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

        {/* Pending Requests */}
        <motion.div
          className="card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="card-header">
            <span className="card-title">Pending Requests</span>
            <motion.button
              className="btn btn-sm btn-secondary"
              onClick={() => navigate('/doctor/appointments')}
              whileHover={{ scale: 1.03 }}
            >
              View all <ArrowRight size={14} />
            </motion.button>
          </div>
          <div className="card-body" style={{ padding: 0 }}>
            {!loaded ? (
              <div style={{ textAlign: 'center', padding: 50 }}><div className="spinner spinner-dark" /></div>
            ) : pending.length === 0 ? (
              <div className="empty-state">
                <motion.div
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                >
                  <Clock size={40} />
                </motion.div>
                <h3>No pending requests</h3>
                <p>All caught up! 🎉</p>
              </div>
            ) : (
              <div className="table-wrapper">
                <table>
                  <thead><tr><th>Patient</th><th>Type</th><th>Reason</th><th>Status</th></tr></thead>
                  <tbody>
                    {pending.map((a, i) => (
                      <motion.tr
                        key={a.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.05 }}
                        onClick={() => navigate('/doctor/appointments')}
                        style={{ cursor: 'pointer' }}
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
                              {a.patientName?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                            </div>
                            <div>
                              <strong style={{ fontSize: '.87rem' }}>{a.patientName}</strong>
                              <div style={{ fontSize: '.73rem', color: 'var(--gray-400)' }}>{a.patientPhone}</div>
                            </div>
                          </div>
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
                        <td style={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {a.reasonForVisit || '—'}
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
