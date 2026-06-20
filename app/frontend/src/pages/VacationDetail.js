import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { vacationApi, activityApi } from '../utils/api';
import { ArrowLeft, Plus, MapPin, Utensils, Activity, Hotel, Plane, MoreHorizontal, Pencil } from 'lucide-react';
import StatusBadge from '../components/StatusBadge';
import ActivityCard from '../components/ActivityCard';
import ActivityFormModal from '../components/ActivityFormModal';
import PackingList from '../components/PackingList';
import NotesPanel from '../components/NotesPanel';
import { differenceInDays, parseISO } from 'date-fns';

const TABS = ['Overview', 'Activities', 'Packing', 'Notes'];

const CATEGORY_FILTERS = [
  { key:'all',            label:'All',         icon: null },
  { key:'place_to_visit', label:'Places',      icon: <MapPin size={13} /> },
  { key:'restaurant',     label:'Food & Drink', icon: <Utensils size={13} /> },
  { key:'activity',       label:'Things To Do', icon: <Activity size={13} /> },
  { key:'accommodation',  label:'Stay',         icon: <Hotel size={13} /> },
  { key:'transport',      label:'Transport',    icon: <Plane size={13} /> },
];

const STATUS_ACTIONS = {
  planning:  ['upcoming','active','cancelled'],
  upcoming:  ['active','planning','cancelled'],
  active:    ['completed','planning','cancelled'],
  completed: ['planning'],
  cancelled: ['planning'],
};

export default function VacationDetail() {
  const { id }    = useParams();
  const navigate  = useNavigate();
  const qc        = useQueryClient();

  const [tab, setTab]             = useState('Overview');
  const [catFilter, setCatFilter] = useState('all');
  const [showActivityModal, setShowActivityModal] = useState(false);
  const [editingActivity, setEditingActivity]     = useState(null);

  const { data: vacation, isLoading: vLoading } = useQuery({
    queryKey: ['vacation', id],
    queryFn:  () => vacationApi.getOne(id),
  });

  const { data: activities = [], isLoading: aLoading } = useQuery({
    queryKey: ['activities', id],
    queryFn:  () => activityApi.getByVacation(id),
  });

  const updateStatus = useMutation({
    mutationFn: (status) => vacationApi.updateStatus(id, status),
    onSuccess:  () => { qc.invalidateQueries(['vacation', id]); qc.invalidateQueries(['vacations']); },
  });

  if (vLoading) return <div className="spinner" />;
  if (!vacation) return <p style={{ color:'var(--rose)' }}>Trip not found.</p>;

  const days       = differenceInDays(parseISO(vacation.end_date), parseISO(vacation.start_date));
  const filtered   = catFilter === 'all' ? activities : activities.filter(a => a.category === catFilter);
  const completed  = activities.filter(a => a.status === 'completed').length;
  const pct        = activities.length ? Math.round((completed / activities.length) * 100) : 0;
  const nextActions = STATUS_ACTIONS[vacation.status] || [];

  // Group activities by date for overview
  const byDate = filtered.reduce((acc, a) => {
    const key = a.scheduled_date ? a.scheduled_date.slice(0,10) : 'Unscheduled';
    if (!acc[key]) acc[key] = [];
    acc[key].push(a);
    return acc;
  }, {});
  const dateKeys = Object.keys(byDate).sort((a,b) => a === 'Unscheduled' ? 1 : a.localeCompare(b));

  return (
    <div>
      {/* Back nav */}
      <button className="btn btn-ghost btn-sm" style={{ marginBottom:'1.5rem' }}
        onClick={() => navigate('/vacations')}>
        <ArrowLeft size={14} /> All Trips
      </button>

      {/* Header */}
      <div style={{ marginBottom:'2rem' }}>
        {vacation.cover_image && (
          <div style={{
            height:180, borderRadius:'var(--radius-lg)', overflow:'hidden',
            marginBottom:'1.5rem', background:'var(--bg-raised)',
          }}>
            <img src={vacation.cover_image} alt="" style={{ width:'100%', height:'100%', objectFit:'cover' }} />
          </div>
        )}

        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', flexWrap:'wrap', gap:'1rem' }}>
          <div>
            <h2 style={{ marginBottom:'4px' }}>{vacation.title}</h2>
            <p style={{ color:'var(--text-muted)', display:'flex', alignItems:'center', gap:'4px', fontSize:'0.9rem' }}>
              📍 {vacation.destination}
            </p>
          </div>
          <div style={{ display:'flex', gap:'0.5rem', alignItems:'center', flexWrap:'wrap' }}>
            <StatusBadge status={vacation.status} />
            {nextActions.map(s => (
              <button key={s} className="btn btn-ghost btn-sm"
                onClick={() => updateStatus.mutate(s)}
                disabled={updateStatus.isPending}>
                → {s}
              </button>
            ))}
            <button className="btn btn-ghost btn-sm" onClick={() => navigate(`/vacations/${id}/edit`)}>
              <Pencil size={13} /> Edit
            </button>
          </div>
        </div>

        {vacation.description && (
          <p style={{ color:'var(--text-muted)', marginTop:'0.75rem', maxWidth:640 }}>
            {vacation.description}
          </p>
        )}

        {/* Meta strip */}
        <div style={{ display:'flex', gap:'2rem', marginTop:'1rem', fontSize:'0.85rem', color:'var(--text-muted)', flexWrap:'wrap' }}>
          <span>📅 {new Date(vacation.start_date).toLocaleDateString('en-US',{month:'long',day:'numeric',year:'numeric'})}</span>
          <span>🏁 {new Date(vacation.end_date).toLocaleDateString('en-US',{month:'long',day:'numeric',year:'numeric'})}</span>
          <span>⏱ {days} days</span>
          <span>📌 {activities.length} activities</span>
        </div>

        {/* Progress */}
        {activities.length > 0 && (
          <div style={{ marginTop:'1rem', maxWidth:400 }}>
            <div style={{ display:'flex', justifyContent:'space-between', fontSize:'0.75rem', color:'var(--text-faint)', marginBottom:'5px' }}>
              <span>Trip Progress</span>
              <span>{completed}/{activities.length} completed ({pct}%)</span>
            </div>
            <div className="progress-bar">
              <div className="progress-fill" style={{ width:`${pct}%` }} />
            </div>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="tabs">
        {TABS.map(t => (
          <button key={t} className={`tab ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)}>{t}</button>
        ))}
      </div>

      {/* ── OVERVIEW ─────────────────────────────────────────── */}
      {tab === 'Overview' && (
        <div>
          <div className="grid-3" style={{ marginBottom:'2rem' }}>
            {[
              { label:'Places to Visit', count: activities.filter(a=>a.category==='place_to_visit').length, color:'var(--teal)', icon:'🏛️' },
              { label:'Restaurants',     count: activities.filter(a=>a.category==='restaurant').length,     color:'var(--rose)', icon:'🍽️' },
              { label:'Things To Do',    count: activities.filter(a=>a.category==='activity').length,       color:'var(--violet)', icon:'🎯' },
            ].map(s => (
              <div key={s.label} className="card" style={{ textAlign:'center' }}>
                <div style={{ fontSize:'1.75rem', marginBottom:'4px' }}>{s.icon}</div>
                <div style={{ fontSize:'1.5rem', fontFamily:'var(--font-display)', color:s.color }}>{s.count}</div>
                <div style={{ fontSize:'0.78rem', color:'var(--text-muted)' }}>{s.label}</div>
              </div>
            ))}
          </div>

          {/* Upcoming/confirmed items */}
          {['confirmed','planned'].map(st => {
            const items = activities.filter(a => a.status === st).slice(0, 4);
            if (!items.length) return null;
            return (
              <div key={st} style={{ marginBottom:'1.5rem' }}>
                <h4 style={{ marginBottom:'0.75rem', color:'var(--text-muted)', textTransform:'capitalize' }}>
                  {st === 'confirmed' ? '✅ Confirmed' : '📋 Planned'}
                </h4>
                <div className="grid-2">
                  {items.map(a => (
                    <ActivityCard key={a.id} activity={a} vacationId={id}
                      onEdit={(act) => { setEditingActivity(act); setShowActivityModal(true); }}
                      onDelete={() => {}} />
                  ))}
                </div>
              </div>
            );
          })}

          {activities.length === 0 && (
            <div className="empty-state">
              <span style={{ fontSize:'3rem' }}>🗺️</span>
              <p>No activities added yet</p>
              <button className="btn btn-primary" onClick={() => setTab('Activities')}>
                <Plus size={15} /> Add Activities
              </button>
            </div>
          )}
        </div>
      )}

      {/* ── ACTIVITIES ───────────────────────────────────────── */}
      {tab === 'Activities' && (
        <div>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1rem', flexWrap:'wrap', gap:'0.75rem' }}>
            {/* Category filter pills */}
            <div style={{ display:'flex', gap:'6px', flexWrap:'wrap' }}>
              {CATEGORY_FILTERS.map(f => (
                <button key={f.key}
                  className="btn btn-sm"
                  style={{
                    background: catFilter === f.key ? 'var(--accent)' : 'var(--bg-raised)',
                    color:      catFilter === f.key ? '#0a0a0f' : 'var(--text-muted)',
                    border:     `1px solid ${catFilter === f.key ? 'var(--accent)' : 'var(--border)'}`,
                  }}
                  onClick={() => setCatFilter(f.key)}>
                  {f.icon} {f.label}
                </button>
              ))}
            </div>
            <button className="btn btn-primary"
              onClick={() => { setEditingActivity(null); setShowActivityModal(true); }}>
              <Plus size={15} /> Add Activity
            </button>
          </div>

          {aLoading ? <div className="spinner" /> :
            filtered.length === 0 ? (
              <div className="empty-state">
                <span style={{ fontSize:'2.5rem' }}>📌</span>
                <p>No activities in this category</p>
              </div>
            ) : (
              dateKeys.map(dateKey => (
                <div key={dateKey} style={{ marginBottom:'1.5rem' }}>
                  <h4 style={{ marginBottom:'0.75rem', color:'var(--text-muted)', fontSize:'0.8rem', textTransform:'uppercase', letterSpacing:'0.06em' }}>
                    {dateKey === 'Unscheduled' ? '📌 Unscheduled'
                      : `📅 ${new Date(dateKey + 'T00:00:00').toLocaleDateString('en-US',{weekday:'long',month:'long',day:'numeric'})}`}
                  </h4>
                  <div className="grid-2">
                    {byDate[dateKey].map(a => (
                      <ActivityCard key={a.id} activity={a} vacationId={id}
                        onEdit={(act) => { setEditingActivity(act); setShowActivityModal(true); }}
                        onDelete={() => {}} />
                    ))}
                  </div>
                </div>
              ))
            )
          }
        </div>
      )}

      {/* ── PACKING ──────────────────────────────────────────── */}
      {tab === 'Packing' && <PackingList vacationId={id} />}

      {/* ── NOTES ────────────────────────────────────────────── */}
      {tab === 'Notes' && <NotesPanel vacationId={id} />}

      {/* Activity modal */}
      {showActivityModal && (
        <ActivityFormModal
          vacationId={id}
          activity={editingActivity}
          onClose={() => { setShowActivityModal(false); setEditingActivity(null); }}
        />
      )}
    </div>
  );
}
