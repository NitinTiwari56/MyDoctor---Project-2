import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getDoctorDash, getPendingAppts } from '../../services/api';
import { Clock, CheckCircle, Users, Award, ArrowRight } from 'lucide-react';

function StatusBadge({ status }) {
  return <span className={`badge badge-${status.toLowerCase()}`}>{status}</span>;
}

export default function DoctorDashboard() {
  const { user } = useAuth();
  const navigate  = useNavigate();
  const [dash, setDash]     = useState(null);
  const [pending, setPending] = useState([]);

  useEffect(() => {
    getDoctorDash().then(r=>setDash(r.data.data)).catch(()=>{});
    getPendingAppts().then(r=>setPending(r.data.data?.slice(0,5)||[])).catch(()=>{});
  }, []);

  const stats = [
    { label:'Total',     value: dash?.totalAppointments     ?? '—', icon: Users,        cls:'navy'  },
    { label:'Pending',   value: dash?.pendingAppointments   ?? '—', icon: Clock,        cls:'amber' },
    { label:'Confirmed', value: dash?.confirmedAppointments ?? '—', icon: CheckCircle,  cls:'teal'  },
    { label:'Completed', value: dash?.completedAppointments ?? '—', icon: Award,        cls:'green' },
  ];

  return (
    <>
      <div className="topbar">
        <div>
          <div className="topbar-title">Dashboard</div>
          <div className="topbar-subtitle">Welcome, Dr. {user?.fullName?.split(' ').slice(-1)[0]} 👋</div>
        </div>
        <button className="btn btn-primary" onClick={()=>navigate('/doctor/slots')}>
          Manage Slots
        </button>
      </div>
      <div className="page">
        <div className="stats-grid">
          {stats.map(s => (
            <div className="stat-card" key={s.label}>
              <div className={`stat-icon ${s.cls}`}><s.icon size={22}/></div>
              <div><div className="stat-value">{s.value}</div><div className="stat-label">{s.label}</div></div>
            </div>
          ))}
        </div>

        <div className="card">
          <div className="card-header">
            <span className="card-title">Pending Requests</span>
            <button className="btn btn-sm btn-secondary" onClick={()=>navigate('/doctor/appointments')}>
              View all <ArrowRight size={14}/>
            </button>
          </div>
          <div className="card-body" style={{padding:0}}>
            {pending.length === 0
              ? <div className="empty-state"><Clock size={40}/><h3>No pending requests</h3><p>All caught up!</p></div>
              : <div className="table-wrapper"><table>
                  <thead><tr><th>Patient</th><th>Type</th><th>Reason</th><th>Status</th></tr></thead>
                  <tbody>{pending.map(a=>(
                    <tr key={a.id} onClick={()=>navigate('/doctor/appointments')} style={{cursor:'pointer'}}>
                      <td><strong>{a.patientName}</strong><br/><span style={{fontSize:'.76rem',color:'var(--gray-400)'}}>{a.patientPhone}</span></td>
                      <td><span style={{fontSize:'.78rem'}}>{a.appointmentType?.replace('_',' ')}</span></td>
                      <td style={{maxWidth:200,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{a.reasonForVisit||'—'}</td>
                      <td><StatusBadge status={a.status}/></td>
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
