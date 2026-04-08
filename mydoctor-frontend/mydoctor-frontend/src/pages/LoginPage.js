import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { login as loginApi } from '../services/api';
import { Stethoscope, Shield, Clock, ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate  = useNavigate();
  const [form, setForm]       = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      const res = await loginApi(form);
      const { token, ...userData } = res.data.data;
      login(userData, token);
      toast.success(`Welcome back, ${userData.fullName}!`);
      navigate(userData.role === 'DOCTOR' ? '/doctor' : '/patient');
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid email or password');
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
            <p>Your health, beautifully managed.</p>
          </div>
          <div className="auth-features">
            {[
              { icon: Stethoscope, title: 'Expert Doctors', desc: 'Connect with verified specialists across all fields.' },
              { icon: Clock,       title: 'Real-time Booking', desc: 'See live availability and book in seconds.' },
              { icon: Shield,      title: 'Home Visits',  desc: 'Request care at your doorstep, hassle-free.' },
            ].map(({ icon: Icon, title, desc }) => (
              <div className="auth-feature" key={title}>
                <div className="auth-feature-icon"><Icon size={18} /></div>
                <div><h3>{title}</h3><p>{desc}</p></div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="auth-right">
        <div className="auth-form-container">
          <h2>Welcome back</h2>
          <p>Sign in to your MyDoctor account</p>

          {error && <div className="alert alert-error">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Email address</label>
              <input className="form-input" type="email" placeholder="you@example.com"
                value={form.email} onChange={e => setForm({...form, email: e.target.value})} required />
            </div>
            <div className="form-group">
              <label className="form-label">Password</label>
              <input className="form-input" type="password" placeholder="••••••••"
                value={form.password} onChange={e => setForm({...form, password: e.target.value})} required />
            </div>
            <button className="btn btn-primary btn-full btn-lg" type="submit" disabled={loading}
              style={{ marginTop: 8 }}>
              {loading ? <span className="spinner" /> : <>Sign in <ChevronRight size={16} /></>}
            </button>
          </form>

          <div className="auth-switch">
            Don't have an account? <Link to="/register">Create one</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
