import React from 'react';
import {
  Settings,
  ShieldCheck,
  Server,
  Database,
  Lock,
  CreditCard,
  CheckCircle2,
  Key,
  Info
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function AdminSettings() {
  const { user } = useAuth();

  return (
    <div style={{ padding: '24px 32px', maxWidth: 1100, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--navy)', letterSpacing: '-0.02em' }}>
          Platform Infrastructure & Settings
        </h1>
        <p style={{ color: 'var(--gray-500)', fontSize: '0.92rem' }}>
          Configuration status, system health parameters, and administrator security profile.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 24 }}>
        {/* System Health */}
        <div style={{
          background: 'white',
          borderRadius: 16,
          padding: 24,
          border: '1px solid var(--gray-200)',
          boxShadow: '0 4px 18px rgba(0,0,0,0.02)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: 'var(--teal-pale)', color: 'var(--teal)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Server size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--navy)' }}>System Health Status</h3>
              <p style={{ fontSize: '0.78rem', color: 'var(--gray-500)' }}>Core microservices operational state</p>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px', background: 'var(--gray-50)', borderRadius: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <Server size={16} style={{ color: 'var(--indigo)' }} />
                <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--gray-700)' }}>Spring Boot 3 Core</span>
              </div>
              <span className="badge badge-success"><CheckCircle2 size={12} /> Running</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px', background: 'var(--gray-50)', borderRadius: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <Database size={16} style={{ color: 'var(--teal)' }} />
                <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--gray-700)' }}>MySQL RDBMS Cluster</span>
              </div>
              <span className="badge badge-success"><CheckCircle2 size={12} /> Connected</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px', background: 'var(--gray-50)', borderRadius: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <Lock size={16} style={{ color: 'var(--amber)' }} />
                <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--gray-700)' }}>JWT Auth & Role Guard</span>
              </div>
              <span className="badge badge-success"><CheckCircle2 size={12} /> Enforced</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px', background: 'var(--gray-50)', borderRadius: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <CreditCard size={16} style={{ color: 'var(--green)' }} />
                <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--gray-700)' }}>Razorpay Webhook Node</span>
              </div>
              <span className="badge badge-success"><CheckCircle2 size={12} /> Ready</span>
            </div>
          </div>
        </div>

        {/* Administrator Profile Info */}
        <div style={{
          background: 'white',
          borderRadius: 16,
          padding: 24,
          border: '1px solid var(--gray-200)',
          boxShadow: '0 4px 18px rgba(0,0,0,0.02)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(99,102,241,0.12)', color: 'var(--indigo)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ShieldCheck size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--navy)' }}>Admin Security Profile</h3>
              <p style={{ fontSize: '0.78rem', color: 'var(--gray-500)' }}>Current authenticated session</p>
            </div>
          </div>

          <div style={{ padding: '16px', background: 'linear-gradient(135deg, rgba(99,102,241,0.05), rgba(139,92,246,0.05))', borderRadius: 12, border: '1px solid rgba(99,102,241,0.12)', marginBottom: 16 }}>
            <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--navy)', marginBottom: 2 }}>{user?.fullName}</div>
            <div style={{ fontSize: '0.82rem', color: 'var(--indigo)', fontWeight: 600, marginBottom: 8 }}>{user?.email}</div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: 'white', padding: '3px 10px', borderRadius: 20, fontSize: '0.72rem', fontWeight: 700 }}>
              <ShieldCheck size={12} /> {user?.role} ACCESS GRANTED
            </div>
          </div>

          <div style={{ padding: '14px 16px', background: 'var(--gray-50)', borderRadius: 12, fontSize: '0.82rem', color: 'var(--gray-600)', lineHeight: 1.6 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 700, color: 'var(--navy)', marginBottom: 4 }}>
              <Info size={14} style={{ color: 'var(--indigo)' }} /> Default Credentials Reference
            </div>
            Platform root administrator account is seeded by default:
            <div style={{ marginTop: 6, fontFamily: 'monospace', background: 'white', padding: '6px 10px', borderRadius: 6, border: '1px solid var(--gray-200)' }}>
              admin@mydoctor.com / Admin@123
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
