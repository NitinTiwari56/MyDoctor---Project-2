import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Users,
  Stethoscope,
  CalendarCheck,
  TrendingUp,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ArrowRight,
  RefreshCw,
  Home,
  Building2,
  Shield,
  Eye,
  UserPlus,
  BarChart3,
  Award,
  Download
} from 'lucide-react';
import { motion } from 'framer-motion';
import CountUp from 'react-countup';
import toast from 'react-hot-toast';
import { getAdminStats } from '../../services/api';
import { exportToCsv } from '../../utils/exportCsv';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [hoveredMonth, setHoveredMonth] = useState(null);
  const [hoveredDay, setHoveredDay] = useState(null);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const res = await getAdminStats();
      setStats(res.data.data);
    } catch (err) {
      toast.error('Failed to load dashboard statistics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const handleExportSummary = () => {
    if (!stats) return;
    const summaryRows = [
      { metric: 'Total Platform Users', value: stats.totalUsers },
      { metric: 'Registered Patients', value: stats.totalPatients },
      { metric: 'Registered Doctors', value: stats.totalDoctors },
      { metric: 'Active Practitioners', value: stats.activeDoctors },
      { metric: 'Pending Doctor Verifications', value: stats.pendingDoctorVerifications || 0 },
      { metric: 'Total Appointments', value: stats.totalAppointments },
      { metric: 'Confirmed Appointments', value: stats.confirmedAppointments },
      { metric: 'Completed Appointments', value: stats.completedAppointments },
      { metric: 'Pending Appointments', value: stats.pendingAppointments },
      { metric: 'Cancelled/Rejected Appointments', value: (stats.cancelledAppointments || 0) + (stats.rejectedAppointments || 0) },
      { metric: 'Gross Settled Revenue (INR)', value: `₹${(stats.totalRevenue || 0).toLocaleString()}` },
    ];

    exportToCsv(
      `mydoctor_executive_summary_${new Date().toISOString().slice(0, 10)}`,
      [
        { key: 'metric', label: 'Platform Metric' },
        { key: 'value', label: 'Recorded Value' },
      ],
      summaryRows
    );
    toast.success('Executive summary CSV downloaded');
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'CONFIRMED':
        return <span className="badge badge-success"><CheckCircle2 size={12} /> Confirmed</span>;
      case 'PENDING':
        return <span className="badge badge-warning"><Clock size={12} /> Pending</span>;
      case 'COMPLETED':
        return <span className="badge badge-primary"><CheckCircle2 size={12} /> Completed</span>;
      case 'CANCELLED':
        return <span className="badge badge-danger"><XCircle size={12} /> Cancelled</span>;
      case 'REJECTED':
        return <span className="badge badge-danger"><XCircle size={12} /> Rejected</span>;
      default:
        return <span className="badge badge-neutral">{status}</span>;
    }
  };

  if (loading && !stats) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <div className="spinner" style={{ width: 36, height: 36 }} />
      </div>
    );
  }

  const totalAppts = stats?.totalAppointments || 1;
  const confirmedPct = Math.round(((stats?.confirmedAppointments || 0) / totalAppts) * 100);
  const pendingPct   = Math.round(((stats?.pendingAppointments || 0) / totalAppts) * 100);
  const completedPct = Math.round(((stats?.completedAppointments || 0) / totalAppts) * 100);
  const cancelledPct = Math.round((((stats?.cancelledAppointments || 0) + (stats?.rejectedAppointments || 0)) / totalAppts) * 100);

  // Revenue trend points calculation for SVG
  const revenueEntries = stats?.monthlyRevenueTrend ? Object.entries(stats.monthlyRevenueTrend) : [];
  const maxRevenue = Math.max(...revenueEntries.map(([_, v]) => v), 1000);

  // Daily appointment entries
  const appointmentEntries = stats?.dailyAppointmentTrend ? Object.entries(stats.dailyAppointmentTrend) : [];
  const maxDailyAppts = Math.max(...appointmentEntries.map(([_, v]) => v), 5);

  return (
    <div style={{ padding: '24px 32px', maxWidth: 1400, margin: '0 auto' }}>
      {/* Top Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 16,
        marginBottom: 20
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
            <span style={{
              background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              color: 'white',
              fontSize: '0.72rem',
              fontWeight: 700,
              padding: '3px 10px',
              borderRadius: 20,
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              display: 'flex',
              alignItems: 'center',
              gap: 4
            }}>
              <Shield size={12} /> Root Administrator
            </span>
          </div>
          <h1 style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--navy)', letterSpacing: '-0.02em' }}>
            Platform Executive Control
          </h1>
          <p style={{ color: 'var(--gray-500)', fontSize: '0.92rem' }}>
            Real-time analytics, practitioner verification, and appointment auditing.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          <button
            onClick={handleExportSummary}
            className="btn btn-secondary"
            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 14px' }}
            title="Download executive KPI report"
          >
            <Download size={15} />
            <span>Export KPIs (CSV)</span>
          </button>
          <button
            onClick={fetchStats}
            className="btn btn-secondary"
            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 14px' }}
            title="Refresh statistics"
          >
            <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
            <span>Refresh</span>
          </button>
          <button
            onClick={() => navigate('/admin/users?action=create')}
            className="btn btn-primary"
            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 16px' }}
          >
            <UserPlus size={15} />
            <span>Create New User</span>
          </button>
        </div>
      </div>

      {/* Doctor Verification Notice Banner if pending */}
      {stats?.pendingDoctorVerifications > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            background: 'linear-gradient(135deg, rgba(245,158,11,0.12), rgba(251,191,36,0.18))',
            border: '1px solid rgba(245,158,11,0.35)',
            borderRadius: 14,
            padding: '14px 20px',
            marginBottom: 24,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 12
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 36, height: 36, borderRadius: 10,
              background: 'var(--amber)', color: 'white',
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
            }}>
              <Award size={20} />
            </div>
            <div>
              <div style={{ fontSize: '0.92rem', fontWeight: 800, color: 'var(--navy)' }}>
                {stats.pendingDoctorVerifications} {stats.pendingDoctorVerifications === 1 ? 'Doctor License' : 'Doctor Licenses'} Pending Administrative Verification
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--gray-600)' }}>
                Newly registered healthcare practitioners require review before appearing on public search listings.
              </div>
            </div>
          </div>

          <button
            onClick={() => navigate('/admin/doctors?verification=PENDING')}
            className="btn"
            style={{
              background: 'var(--navy)', color: 'white',
              fontSize: '0.8rem', fontWeight: 700, padding: '8px 16px', borderRadius: 8
            }}
          >
            Review Practitioner Applications →
          </button>
        </motion.div>
      )}

      {/* KPI Stat Cards Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
        gap: 20,
        marginBottom: 24
      }}>
        {/* Total Users */}
        <motion.div
          whileHover={{ y: -4 }}
          style={{
            background: 'white',
            borderRadius: 16,
            padding: 22,
            border: '1px solid var(--gray-200)',
            boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
            <div style={{
              width: 44, height: 44, borderRadius: 12,
              background: 'linear-gradient(135deg, rgba(99,102,241,0.12), rgba(139,92,246,0.15))',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'var(--indigo)'
            }}>
              <Users size={22} />
            </div>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--teal)', background: 'var(--teal-pale)', padding: '2px 8px', borderRadius: 8 }}>
              Active Platform
            </span>
          </div>
          <div>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--navy)', lineHeight: 1.1 }}>
              <CountUp end={stats?.totalUsers || 0} duration={1} />
            </div>
            <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--gray-500)', marginTop: 4 }}>
              Total Registered Users
            </div>
          </div>
          <div style={{ marginTop: 14, paddingTop: 12, borderTop: '1px solid var(--gray-100)', display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: 'var(--gray-500)' }}>
            <span>Patients: <strong style={{ color: 'var(--gray-700)' }}>{stats?.totalPatients || 0}</strong></span>
            <span>Doctors: <strong style={{ color: 'var(--gray-700)' }}>{stats?.totalDoctors || 0}</strong></span>
          </div>
        </motion.div>

        {/* Active Doctors */}
        <motion.div
          whileHover={{ y: -4 }}
          style={{
            background: 'white',
            borderRadius: 16,
            padding: 22,
            border: '1px solid var(--gray-200)',
            boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
            <div style={{
              width: 44, height: 44, borderRadius: 12,
              background: 'linear-gradient(135deg, rgba(20,184,166,0.12), rgba(45,212,191,0.15))',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'var(--teal)'
            }}>
              <Stethoscope size={22} />
            </div>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--green)', background: 'var(--green-pale)', padding: '2px 8px', borderRadius: 8 }}>
              Certified
            </span>
          </div>
          <div>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--navy)', lineHeight: 1.1 }}>
              <CountUp end={stats?.activeDoctors || 0} duration={1} />
            </div>
            <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--gray-500)', marginTop: 4 }}>
              Active Practitioners
            </div>
          </div>
          <div style={{ marginTop: 14, paddingTop: 12, borderTop: '1px solid var(--gray-100)', display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: 'var(--gray-500)' }}>
            <span>Total Rostered: <strong style={{ color: 'var(--gray-700)' }}>{stats?.totalDoctors || 0}</strong></span>
            <Link to="/admin/doctors" style={{ color: 'var(--indigo)', fontWeight: 600, textDecoration: 'none' }}>View All →</Link>
          </div>
        </motion.div>

        {/* Total Appointments */}
        <motion.div
          whileHover={{ y: -4 }}
          style={{
            background: 'white',
            borderRadius: 16,
            padding: 22,
            border: '1px solid var(--gray-200)',
            boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
            <div style={{
              width: 44, height: 44, borderRadius: 12,
              background: 'linear-gradient(135deg, rgba(245,158,11,0.12), rgba(251,191,36,0.15))',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'var(--amber)'
            }}>
              <CalendarCheck size={22} />
            </div>
            {stats?.pendingAppointments > 0 ? (
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--amber)', background: 'var(--amber-pale)', padding: '2px 8px', borderRadius: 8 }}>
                {stats.pendingAppointments} Pending
              </span>
            ) : (
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--green)', background: 'var(--green-pale)', padding: '2px 8px', borderRadius: 8 }}>
                All Clear
              </span>
            )}
          </div>
          <div>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--navy)', lineHeight: 1.1 }}>
              <CountUp end={stats?.totalAppointments || 0} duration={1} />
            </div>
            <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--gray-500)', marginTop: 4 }}>
              Total Appointments
            </div>
          </div>
          <div style={{ marginTop: 14, paddingTop: 12, borderTop: '1px solid var(--gray-100)', display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: 'var(--gray-500)' }}>
            <span>Confirmed: <strong style={{ color: 'var(--green)' }}>{stats?.confirmedAppointments || 0}</strong></span>
            <span>Completed: <strong style={{ color: 'var(--indigo)' }}>{stats?.completedAppointments || 0}</strong></span>
          </div>
        </motion.div>

        {/* Estimated Platform Volume / Revenue */}
        <motion.div
          whileHover={{ y: -4 }}
          style={{
            background: 'white',
            borderRadius: 16,
            padding: 22,
            border: '1px solid var(--gray-200)',
            boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
            <div style={{
              width: 44, height: 44, borderRadius: 12,
              background: 'linear-gradient(135deg, rgba(16,185,129,0.12), rgba(52,211,153,0.15))',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'var(--green)'
            }}>
              <TrendingUp size={22} />
            </div>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--indigo)', background: 'rgba(99,102,241,0.1)', padding: '2px 8px', borderRadius: 8 }}>
              INR
            </span>
          </div>
          <div>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--navy)', lineHeight: 1.1 }}>
              ₹<CountUp end={stats?.totalRevenue || 0} duration={1.2} separator="," />
            </div>
            <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--gray-500)', marginTop: 4 }}>
              Platform Volume
            </div>
          </div>
          <div style={{ marginTop: 14, paddingTop: 12, borderTop: '1px solid var(--gray-100)', display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: 'var(--gray-500)' }}>
            <span>Settled & Completed</span>
            <Link to="/admin/payments" style={{ color: 'var(--indigo)', fontWeight: 600, textDecoration: 'none' }}>Audit →</Link>
          </div>
        </motion.div>
      </div>

      {/* INTERACTIVE CHARTS ROW */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
        gap: 20,
        marginBottom: 24
      }}>
        {/* Monthly Revenue Trend Chart */}
        <div style={{
          background: 'white',
          borderRadius: 16,
          padding: 24,
          border: '1px solid var(--gray-200)',
          boxShadow: '0 4px 20px rgba(0,0,0,0.03)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <TrendingUp size={18} style={{ color: 'var(--indigo)' }} />
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--navy)' }}>Monthly Revenue Growth</h3>
            </div>
            <span style={{ fontSize: '0.78rem', color: 'var(--gray-500)', fontWeight: 600 }}>Last 6 Months (INR)</span>
          </div>
          <p style={{ fontSize: '0.82rem', color: 'var(--gray-500)', marginBottom: 20 }}>
            Completed consultations & direct gateway collections
          </p>

          {/* SVG Line / Bar visualization */}
          <div style={{ height: 180, display: 'flex', alignItems: 'flex-end', gap: 14, paddingTop: 20, paddingBottom: 10 }}>
            {revenueEntries.map(([month, val], idx) => {
              const heightPct = Math.max(15, Math.round((val / maxRevenue) * 100));
              const isHovered = hoveredMonth === month;

              return (
                <div
                  key={month}
                  style={{
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    height: '100%',
                    justifyContent: 'flex-end',
                    cursor: 'pointer',
                    position: 'relative'
                  }}
                  onMouseEnter={() => setHoveredMonth(month)}
                  onMouseLeave={() => setHoveredMonth(null)}
                >
                  {/* Tooltip */}
                  {isHovered && (
                    <motion.div
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      style={{
                        position: 'absolute',
                        top: -34,
                        background: 'var(--navy)',
                        color: 'white',
                        padding: '4px 8px',
                        borderRadius: 6,
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        whiteSpace: 'nowrap',
                        zIndex: 10,
                        boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                      }}
                    >
                      ₹{val.toLocaleString()}
                    </motion.div>
                  )}

                  {/* Visual Bar */}
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${heightPct}%` }}
                    transition={{ duration: 0.8, delay: idx * 0.1 }}
                    style={{
                      width: '100%',
                      maxWidth: 42,
                      borderRadius: '8px 8px 3px 3px',
                      background: isHovered
                        ? 'linear-gradient(180deg, #4f46e5 0%, #6366f1 100%)'
                        : 'linear-gradient(180deg, #818cf8 0%, #6366f1 100%)',
                      boxShadow: isHovered ? '0 6px 16px rgba(99,102,241,0.4)' : 'none',
                      transition: 'background 0.2s, box-shadow 0.2s'
                    }}
                  />

                  {/* Label */}
                  <div style={{ marginTop: 10, fontSize: '0.74rem', color: isHovered ? 'var(--indigo)' : 'var(--gray-500)', fontWeight: isHovered ? 700 : 500 }}>
                    {month.split(' ')[0]}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Daily Appointment Volume Chart */}
        <div style={{
          background: 'white',
          borderRadius: 16,
          padding: 24,
          border: '1px solid var(--gray-200)',
          boxShadow: '0 4px 20px rgba(0,0,0,0.03)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <BarChart3 size={18} style={{ color: 'var(--teal-dark)' }} />
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--navy)' }}>Weekly Booking Velocity</h3>
            </div>
            <span style={{ fontSize: '0.78rem', color: 'var(--gray-500)', fontWeight: 600 }}>Last 7 Days</span>
          </div>
          <p style={{ fontSize: '0.82rem', color: 'var(--gray-500)', marginBottom: 20 }}>
            Scheduled consultations across all departments
          </p>

          {/* SVG Bar visualization */}
          <div style={{ height: 180, display: 'flex', alignItems: 'flex-end', gap: 12, paddingTop: 20, paddingBottom: 10 }}>
            {appointmentEntries.map(([day, count], idx) => {
              const heightPct = Math.max(15, Math.round((count / maxDailyAppts) * 100));
              const isHovered = hoveredDay === day;

              return (
                <div
                  key={day}
                  style={{
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    height: '100%',
                    justifyContent: 'flex-end',
                    cursor: 'pointer',
                    position: 'relative'
                  }}
                  onMouseEnter={() => setHoveredDay(day)}
                  onMouseLeave={() => setHoveredDay(null)}
                >
                  {/* Tooltip */}
                  {isHovered && (
                    <motion.div
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      style={{
                        position: 'absolute',
                        top: -34,
                        background: 'var(--navy)',
                        color: 'white',
                        padding: '4px 8px',
                        borderRadius: 6,
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        whiteSpace: 'nowrap',
                        zIndex: 10,
                        boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                      }}
                    >
                      {count} {count === 1 ? 'Booking' : 'Bookings'}
                    </motion.div>
                  )}

                  {/* Visual Bar */}
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${heightPct}%` }}
                    transition={{ duration: 0.8, delay: idx * 0.1 }}
                    style={{
                      width: '100%',
                      maxWidth: 36,
                      borderRadius: '8px 8px 3px 3px',
                      background: isHovered
                        ? 'linear-gradient(180deg, #0d9488 0%, #14b8a6 100%)'
                        : 'linear-gradient(180deg, #2dd4bf 0%, #14b8a6 100%)',
                      boxShadow: isHovered ? '0 6px 16px rgba(20,184,166,0.4)' : 'none',
                      transition: 'background 0.2s, box-shadow 0.2s'
                    }}
                  />

                  {/* Label */}
                  <div style={{ marginTop: 10, fontSize: '0.72rem', color: isHovered ? 'var(--teal-dark)' : 'var(--gray-500)', fontWeight: isHovered ? 700 : 500 }}>
                    {day.split(' ')[0]}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Middle Row: Appointment Breakdown & Quick Insights */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: 20,
        marginBottom: 24
      }}>
        {/* Status Breakdown Bar */}
        <div style={{
          background: 'white',
          borderRadius: 16,
          padding: 22,
          border: '1px solid var(--gray-200)',
          boxShadow: '0 4px 20px rgba(0,0,0,0.03)'
        }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--navy)', marginBottom: 6 }}>
            Appointment Status Pipeline
          </h3>
          <p style={{ fontSize: '0.82rem', color: 'var(--gray-500)', marginBottom: 20 }}>
            Real-time status breakdown across all platform bookings
          </p>

          {/* Multi-segment progress bar */}
          <div style={{
            height: 12,
            borderRadius: 8,
            background: 'var(--gray-100)',
            display: 'flex',
            overflow: 'hidden',
            marginBottom: 20
          }}>
            <div style={{ width: `${confirmedPct}%`, background: 'var(--green)' }} title={`Confirmed: ${confirmedPct}%`} />
            <div style={{ width: `${completedPct}%`, background: 'var(--indigo)' }} title={`Completed: ${completedPct}%`} />
            <div style={{ width: `${pendingPct}%`, background: 'var(--amber)' }} title={`Pending: ${pendingPct}%`} />
            <div style={{ width: `${cancelledPct}%`, background: 'var(--red)' }} title={`Cancelled: ${cancelledPct}%`} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: 'var(--green)' }} />
              <div>
                <div style={{ fontSize: '0.78rem', color: 'var(--gray-500)' }}>Confirmed</div>
                <div style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--gray-800)' }}>
                  {stats?.confirmedAppointments || 0} ({confirmedPct}%)
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: 'var(--indigo)' }} />
              <div>
                <div style={{ fontSize: '0.78rem', color: 'var(--gray-500)' }}>Completed</div>
                <div style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--gray-800)' }}>
                  {stats?.completedAppointments || 0} ({completedPct}%)
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: 'var(--amber)' }} />
              <div>
                <div style={{ fontSize: '0.78rem', color: 'var(--gray-500)' }}>Pending Review</div>
                <div style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--gray-800)' }}>
                  {stats?.pendingAppointments || 0} ({pendingPct}%)
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: 'var(--red)' }} />
              <div>
                <div style={{ fontSize: '0.78rem', color: 'var(--gray-500)' }}>Cancelled/Rejected</div>
                <div style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--gray-800)' }}>
                  {(stats?.cancelledAppointments || 0) + (stats?.rejectedAppointments || 0)} ({cancelledPct}%)
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modality & Specializations */}
        <div style={{
          background: 'white',
          borderRadius: 16,
          padding: 22,
          border: '1px solid var(--gray-200)',
          boxShadow: '0 4px 20px rgba(0,0,0,0.03)'
        }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--navy)', marginBottom: 6 }}>
            Top Doctor Specializations
          </h3>
          <p style={{ fontSize: '0.82rem', color: 'var(--gray-500)', marginBottom: 16 }}>
            Doctor distribution across medical departments
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {stats?.specializationStats && Object.keys(stats.specializationStats).length > 0 ? (
              Object.entries(stats.specializationStats).slice(0, 4).map(([spec, count]) => (
                <div key={spec} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px', background: 'var(--gray-50)', borderRadius: 10 }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--gray-700)' }}>{spec}</span>
                  <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--indigo)', background: 'rgba(99,102,241,0.1)', padding: '2px 8px', borderRadius: 12 }}>
                    {count} {count === 1 ? 'Doctor' : 'Doctors'}
                  </span>
                </div>
              ))
            ) : (
              <p style={{ color: 'var(--gray-400)', fontSize: '0.85rem' }}>No doctors registered yet.</p>
            )}
          </div>
        </div>
      </div>

      {/* Recent Platform Appointments Feed */}
      <div style={{
        background: 'white',
        borderRadius: 16,
        padding: 24,
        border: '1px solid var(--gray-200)',
        boxShadow: '0 4px 20px rgba(0,0,0,0.03)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <div>
            <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--navy)' }}>
              Recent Appointments Audit
            </h2>
            <p style={{ fontSize: '0.82rem', color: 'var(--gray-500)' }}>
              Latest bookings submitted by patients across the platform
            </p>
          </div>
          <Link
            to="/admin/appointments"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              fontSize: '0.85rem',
              fontWeight: 600,
              color: 'var(--indigo)',
              textDecoration: 'none'
            }}
          >
            Full Appointments Manager <ArrowRight size={15} />
          </Link>
        </div>

        {stats?.recentAppointments && stats.recentAppointments.length > 0 ? (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.86rem' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--gray-100)', textAlign: 'left', color: 'var(--gray-500)' }}>
                  <th style={{ padding: '12px 14px' }}>Appt #</th>
                  <th style={{ padding: '12px 14px' }}>Patient</th>
                  <th style={{ padding: '12px 14px' }}>Doctor</th>
                  <th style={{ padding: '12px 14px' }}>Date & Time</th>
                  <th style={{ padding: '12px 14px' }}>Type</th>
                  <th style={{ padding: '12px 14px' }}>Status</th>
                  <th style={{ padding: '12px 14px', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {stats.recentAppointments.map((appt) => (
                  <tr key={appt.id} style={{ borderBottom: '1px solid var(--gray-100)', transition: 'background 0.2s' }}>
                    <td style={{ padding: '14px', fontWeight: 600, color: 'var(--navy)' }}>
                      #{appt.id}
                    </td>
                    <td style={{ padding: '14px' }}>
                      <div style={{ fontWeight: 600, color: 'var(--gray-800)' }}>{appt.patientName || 'Unknown Patient'}</div>
                      <div style={{ fontSize: '0.76rem', color: 'var(--gray-500)' }}>{appt.patientPhone || 'No phone'}</div>
                    </td>
                    <td style={{ padding: '14px' }}>
                      <div style={{ fontWeight: 600, color: 'var(--gray-800)' }}>{appt.doctorName || 'Doctor'}</div>
                      <div style={{ fontSize: '0.76rem', color: 'var(--indigo)' }}>{appt.doctorSpecialization}</div>
                    </td>
                    <td style={{ padding: '14px' }}>
                      <div style={{ fontWeight: 500 }}>{appt.appointmentDate || 'Not scheduled'}</div>
                      <div style={{ fontSize: '0.76rem', color: 'var(--gray-500)' }}>
                        {appt.startTime ? `${appt.startTime} - ${appt.endTime}` : 'Flexible'}
                      </div>
                    </td>
                    <td style={{ padding: '14px' }}>
                      {appt.appointmentType === 'HOME_VISIT' ? (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: '0.78rem', color: 'var(--teal)', fontWeight: 600 }}>
                          <Home size={13} /> Home Visit
                        </span>
                      ) : (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: '0.78rem', color: 'var(--indigo)', fontWeight: 600 }}>
                          <Building2 size={13} /> Clinic
                        </span>
                      )}
                    </td>
                    <td style={{ padding: '14px' }}>
                      {getStatusBadge(appt.status)}
                    </td>
                    <td style={{ padding: '14px', textAlign: 'right' }}>
                      <button
                        onClick={() => navigate(`/admin/appointments?selected=${appt.id}`)}
                        className="btn btn-secondary"
                        style={{ padding: '6px 12px', fontSize: '0.78rem' }}
                      >
                        <Eye size={13} style={{ marginRight: 4 }} /> Manage
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '36px 0', color: 'var(--gray-400)' }}>
            No appointments booked yet on the platform.
          </div>
        )}
      </div>
    </div>
  );
}
