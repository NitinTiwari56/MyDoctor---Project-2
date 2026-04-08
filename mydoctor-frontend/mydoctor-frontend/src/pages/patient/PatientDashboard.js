import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getPatientDash, getPatientAppts } from '../../services/api';
import { CalendarCheck, Clock, CheckCircle, XCircle, ArrowRight } from 'lucide-react';
import { format } from 'date-fns';

function StatusBadge({ status }) {
  return <span className={`badge badge-${status.toLowerCase()}`}>{status}</span>;
}

export default function PatientDashboard() {
  const { user } = useAuth();
  const navigate  = useNavigate();
  const [dash, setDash]   = useState(null);
  const [appts, setAppts] = useState([]);

  useEffect(() => {
    getPatientDash().then(r => setDash(r.data.data)).catch(()=>{});
    getPatientAppts().then(r => setAppts(r.data.data?.slice(0,5) || [])).catch(()=>{});
  }, []);

  const stats = [
    { label:'Upcoming', value: dash?.upcomingAppointments ?? '—',  icon: Clock,         cls:'teal'  },
    { label:'Completed',value: dash?.completedAppointments ?? '—', icon: CheckCircle,   cls:'green' },
    { label:'Cancelled', value: dash?.cancelledAppointments ?? '—',icon: XCircle,       cls:'amber' },
  ];

  return (
    <>
      <div className="topbar">
        <div>
          <div className="topbar-title">Dashboard</div>
          <div className="topbar-subtitle">Good day, {user?.fullName?.split(' ')[0]} 👋</div>
        </div>
        <button className="btn btn-primary" onClick={() => navigate('/patient/doctors')}>
          <CalendarCheck size={16} /> Book Appointment
        </button>
      </div>

      <div className="page">
        <div className="stats-grid">
          {stats.map(s => (
            <div className="stat-card" key={s.label}>
              <div className={`stat-icon ${s.cls}`}><s.icon size={22} /></div>
              <div>
                <div className="stat-value">{s.value}</div>
                <div className="stat-label">{s.label}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="card">
          <div className="card-header">
            <span className="card-title">Recent Appointments</span>
            <button className="btn btn-sm btn-secondary" onClick={()=>navigate('/patient/appointments')}>
              View all <ArrowRight size={14} />
            </button>
          </div>
          <div className="card-body" style={{padding:'0 0 0 0'}}>
            {appts.length === 0
              ? <div className="empty-state"><CalendarCheck size={40} /><h3>No appointments yet</h3><p>Book your first appointment to get started.</p></div>
              : <div className="table-wrapper"><table>
                  <thead><tr><th>Doctor</th><th>Date & Time</th><th>Type</th><th>Status</th></tr></thead>
                  <tbody>{appts.map(a => (
                    <tr key={a.id}>
                      <td><strong>Dr. {a.doctorName}</strong><br/><span style={{fontSize:'.76rem',color:'var(--gray-400)'}}>{a.doctorSpecialization}</span></td>
                      <td>{a.appointmentDate ? format(new Date(a.appointmentDate),'dd MMM yyyy') : '—'}<br/>
                          <span style={{fontSize:'.76rem',color:'var(--gray-400)'}}>{a.startTime ? a.startTime.slice(0,5) : '—'}</span></td>
                      <td><span style={{fontSize:'.78rem'}}>{a.appointmentType?.replace('_',' ')}</span></td>
                      <td><StatusBadge status={a.status} /></td>
                    </tr>
                  ))}</tbody>
                </table></div>
            }
          </div>
        </div>
      </div>
    </>
  );
}
