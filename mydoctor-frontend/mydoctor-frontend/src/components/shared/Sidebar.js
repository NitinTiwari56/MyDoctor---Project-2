import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { LogOut, Sparkles } from 'lucide-react';

export default function Sidebar({ links }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const initials = user?.fullName
    ? user.fullName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : '?';

  return (
    <aside className="sidebar">
      {/* Logo */}
      <div className="sidebar-logo">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 34, height: 34, borderRadius: 8,
            background: 'linear-gradient(135deg, rgba(99,102,241,.25) 0%, rgba(139,92,246,.2) 100%)',
            border: '1px solid rgba(99,102,241,.3)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
          }}>
            <Sparkles size={17} style={{ color: '#818cf8' }} />
          </div>
          <div>
            <h1>My<span>Doctor</span></h1>
            <p>Smart Healthcare</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="sidebar-nav">
        {links.map((section, si) => (
          <React.Fragment key={si}>
            {section.label && <div className="nav-section-label">{section.label}</div>}
            {section.items.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/patient' || item.to === '/doctor' || item.to === '/admin'}
                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
              >
                <item.icon className="nav-icon" />
                <span style={{ position: 'relative', zIndex: 1 }}>{item.label}</span>
              </NavLink>
            ))}
          </React.Fragment>
        ))}
      </nav>

      {/* Footer / User card */}
      <div className="sidebar-footer">
        <div className="user-card">
          <div className="user-avatar">{initials}</div>
          <div className="user-info">
            <div className="name">{user?.fullName}</div>
            <div className="role">{user?.role}</div>
          </div>
          <button className="logout-btn" onClick={handleLogout} title="Logout">
            <LogOut size={15} />
          </button>
        </div>
      </div>
    </aside>
  );
}
