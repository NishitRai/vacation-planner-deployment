import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { vacationApi } from '../utils/api';
import { Plus, Globe, Trash2, Pencil } from 'lucide-react';
import StatusBadge from '../components/StatusBadge';
import { differenceInDays, parseISO } from 'date-fns';

const STATUS_ORDER = { active:0, upcoming:1, planning:2, completed:3, cancelled:4 };

export default function VacationList() {
  const navigate = useNavigate();
  const qc       = useQueryClient();

  const { data: vacations = [], isLoading } = useQuery({
    queryKey: ['vacations'],
    queryFn:  vacationApi.getAll,
  });

  const remove = useMutation({
    mutationFn: vacationApi.remove,
    onSuccess:  () => qc.invalidateQueries(['vacations']),
  });

  const sorted = [...vacations].sort((a,b) =>
    (STATUS_ORDER[a.status] ?? 9) - (STATUS_ORDER[b.status] ?? 9) ||
    new Date(a.start_date) - new Date(b.start_date)
  );

  if (isLoading) return <div className="spinner" />;

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>My Trips</h2>
          <p style={{ color:'var(--text-muted)', fontSize:'0.9rem', marginTop:'4px' }}>
            {vacations.length} {vacations.length === 1 ? 'trip' : 'trips'} planned
          </p>
        </div>
        <button className="btn btn-primary" onClick={() => navigate('/vacations/new')}>
          <Plus size={15} /> New Trip
        </button>
      </div>

      {sorted.length === 0 ? (
        <div className="empty-state" style={{ marginTop:'4rem' }}>
          <Globe size={48} />
          <h3>No trips yet</h3>
          <p style={{ maxWidth:320 }}>Start planning your first adventure. Add destinations, activities, restaurants, and more.</p>
          <button className="btn btn-primary" onClick={() => navigate('/vacations/new')}>
            Plan your first trip
          </button>
        </div>
      ) : (
        <div style={{ display:'flex', flexDirection:'column', gap:'1rem' }}>
          {sorted.map(v => {
            const days = differenceInDays(parseISO(v.end_date), parseISO(v.start_date));
            const pct  = v.activity_count ? Math.round((v.completed_count / v.activity_count) * 100) : 0;
            return (
              <div key={v.id} className="card card-hover"
                style={{ display:'flex', gap:'1.5rem', alignItems:'stretch', cursor:'pointer' }}
                onClick={() => navigate(`/vacations/${v.id}`)}>

                {/* Color stripe */}
                <div style={{
                  width:4, borderRadius:2, flexShrink:0,
                  background: v.status === 'active'    ? '#5ecb64' :
                               v.status === 'planning'  ? 'var(--violet)' :
                               v.status === 'upcoming'  ? 'var(--teal)' :
                               v.status === 'completed' ? 'var(--accent)' : 'var(--border)',
                }} />

                {/* Main content */}
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'0.5rem' }}>
                    <div>
                      <h3 style={{ fontSize:'1.15rem', marginBottom:'2px' }}>{v.title}</h3>
                      <span style={{ fontSize:'0.85rem', color:'var(--text-muted)' }}>📍 {v.destination}</span>
                    </div>
                    <StatusBadge status={v.status} />
                  </div>

                  {v.description && (
                    <p style={{ fontSize:'0.85rem', color:'var(--text-muted)', marginBottom:'0.75rem',
                      overflow:'hidden', textOverflow:'ellipsis', display:'-webkit-box',
                      WebkitLineClamp:2, WebkitBoxOrient:'vertical' }}>
                      {v.description}
                    </p>
                  )}

                  <div style={{ display:'flex', gap:'1.5rem', fontSize:'0.8rem', color:'var(--text-muted)', flexWrap:'wrap', marginBottom:'0.75rem' }}>
                    <span>
                      📅 {new Date(v.start_date).toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'})}
                       {' – '}
                       {new Date(v.end_date).toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'})}
                    </span>
                    <span>⏱ {days} days</span>
                    <span>📌 {v.activity_count} activities</span>
                  </div>

                  {v.activity_count > 0 && (
                    <div style={{ display:'flex', alignItems:'center', gap:'0.75rem' }}>
                      <div className="progress-bar" style={{ flex:1 }}>
                        <div className="progress-fill" style={{ width:`${pct}%` }} />
                      </div>
                      <span style={{ fontSize:'0.75rem', color:'var(--text-faint)', flexShrink:0 }}>{pct}%</span>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div style={{ display:'flex', flexDirection:'column', justifyContent:'center', gap:'4px' }}
                  onClick={e => e.stopPropagation()}>
                  <button className="btn btn-ghost btn-icon btn-sm"
                    onClick={() => navigate(`/vacations/${v.id}/edit`)}>
                    <Pencil size={14} />
                  </button>
                  <button className="btn btn-ghost btn-icon btn-sm" style={{ color:'var(--rose)' }}
                    onClick={() => { if (window.confirm(`Delete "${v.title}"?`)) remove.mutate(v.id); }}>
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
