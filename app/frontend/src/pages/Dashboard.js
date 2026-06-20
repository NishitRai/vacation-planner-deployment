import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { vacationApi } from '../utils/api';
import { Globe, CalendarDays, CheckCircle2, Plane } from 'lucide-react';
import StatusBadge from '../components/StatusBadge';
import { differenceInDays, parseISO } from 'date-fns';

function StatCard({ icon, label, value, color }) {
  return (
    <div className="card" style={{ display:'flex', alignItems:'center', gap:'1rem' }}>
      <div style={{
        width:48, height:48, borderRadius:'var(--radius-sm)',
        background: `color-mix(in srgb, ${color} 15%, transparent)`,
        display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0,
      }}>
        {icon}
      </div>
      <div>
        <div style={{ fontSize:'1.8rem', fontFamily:'var(--font-display)', fontWeight:700 }}>{value}</div>
        <div style={{ fontSize:'0.8rem', color:'var(--text-muted)' }}>{label}</div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const navigate = useNavigate();
  const { data: vacations = [], isLoading } = useQuery({
    queryKey: ['vacations'],
    queryFn:  vacationApi.getAll,
  });

  const active    = vacations.filter(v => v.status === 'active');
  const upcoming  = vacations.filter(v => v.status === 'upcoming' || v.status === 'planning');
  const completed = vacations.filter(v => v.status === 'completed');

  const next = upcoming.sort((a,b) => new Date(a.start_date) - new Date(b.start_date))[0];
  const daysUntil = next ? differenceInDays(parseISO(next.start_date), new Date()) : null;

  if (isLoading) return <div className="spinner" />;

  return (
    <div>
      {/* Hero greeting */}
      <div style={{ marginBottom:'2.5rem' }}>
        <h1 style={{ fontStyle:'italic', marginBottom:'0.25rem' }}>
          {active.length > 0 ? `You're on your way ✈️` : `Where to next?`}
        </h1>
        <p style={{ color:'var(--text-muted)' }}>
          {active.length > 0
            ? `${active[0].title} is currently active.`
            : next
              ? `${next.title} starts in ${daysUntil >= 0 ? daysUntil : '??'} days.`
              : `Plan your next adventure below.`}
        </p>
      </div>

      {/* Stats */}
      <div className="grid-3" style={{ marginBottom:'2.5rem' }}>
        <StatCard icon={<Globe size={22} color="var(--teal)" />}    label="Total Trips"  value={vacations.length} color="var(--teal)" />
        <StatCard icon={<Plane size={22} color="var(--violet)" />}   label="Upcoming"    value={upcoming.length}  color="var(--violet)" />
        <StatCard icon={<CheckCircle2 size={22} color="var(--accent)" />} label="Completed" value={completed.length} color="var(--accent)" />
      </div>

      {/* Active trips */}
      {active.length > 0 && (
        <section style={{ marginBottom:'2.5rem' }}>
          <h3 style={{ marginBottom:'1rem', display:'flex', alignItems:'center', gap:'0.5rem' }}>
            <span style={{ width:8, height:8, borderRadius:'50%', background:'#5ecb64', display:'inline-block' }} />
            Active Trips
          </h3>
          <div className="grid-2">
            {active.map(v => <VacationMiniCard key={v.id} vacation={v} onClick={() => navigate(`/vacations/${v.id}`)} />)}
          </div>
        </section>
      )}

      {/* All trips */}
      <section>
        <div className="page-header">
          <h3>All Trips</h3>
          <button className="btn btn-ghost btn-sm" onClick={() => navigate('/vacations')}>View all →</button>
        </div>
        {vacations.length === 0 ? (
          <div className="empty-state">
            <CalendarDays size={40} />
            <p>No trips planned yet</p>
            <button className="btn btn-primary" onClick={() => navigate('/vacations/new')}>Plan your first trip</button>
          </div>
        ) : (
          <div className="grid-2">
            {vacations.slice(0,4).map(v => (
              <VacationMiniCard key={v.id} vacation={v} onClick={() => navigate(`/vacations/${v.id}`)} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function VacationMiniCard({ vacation, onClick }) {
  const days = differenceInDays(parseISO(vacation.end_date), parseISO(vacation.start_date));
  const pct  = vacation.activity_count
    ? Math.round((vacation.completed_count / vacation.activity_count) * 100)
    : 0;

  return (
    <div className="card card-hover" style={{ cursor:'pointer' }} onClick={onClick}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'0.75rem' }}>
        <div>
          <h4 style={{ marginBottom:'2px' }}>{vacation.title}</h4>
          <span style={{ fontSize:'0.8rem', color:'var(--text-muted)' }}>{vacation.destination}</span>
        </div>
        <StatusBadge status={vacation.status} />
      </div>
      <div style={{ display:'flex', gap:'1rem', fontSize:'0.8rem', color:'var(--text-muted)', marginBottom:'0.75rem' }}>
        <span>📅 {new Date(vacation.start_date).toLocaleDateString('en-US',{month:'short',day:'numeric'})} – {new Date(vacation.end_date).toLocaleDateString('en-US',{month:'short',day:'numeric'})}</span>
        <span>⏱ {days} days</span>
      </div>
      {vacation.activity_count > 0 && (
        <>
          <div className="progress-bar" style={{ marginBottom:'4px' }}>
            <div className="progress-fill" style={{ width:`${pct}%` }} />
          </div>
          <span style={{ fontSize:'0.72rem', color:'var(--text-faint)' }}>
            {vacation.completed_count} / {vacation.activity_count} activities done
          </span>
        </>
      )}
    </div>
  );
}
