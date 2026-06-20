import { useState } from 'react';
import { MapPin, Clock, DollarSign, MoreVertical, Check, Pencil, Trash2, ChevronDown } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { activityApi } from '../utils/api';
import StatusBadge from './StatusBadge';

const CATEGORY_ICONS = {
  place_to_visit: '🏛️',
  restaurant:     '🍽️',
  activity:       '🎯',
  accommodation:  '🏨',
  transport:      '✈️',
  other:          '📌',
};

const STATUSES = ['planned','confirmed','in_progress','completed','skipped','cancelled'];

export default function ActivityCard({ activity, vacationId, onEdit, onDelete }) {
  const [showMenu, setShowMenu] = useState(false);
  const [showStatusPicker, setShowStatusPicker] = useState(false);
  const qc = useQueryClient();

  const updateStatus = useMutation({
    mutationFn: (status) => activityApi.updateStatus(activity.id, status),
    onSuccess: () => {
      qc.invalidateQueries(['activities', vacationId]);
      setShowStatusPicker(false);
      setShowMenu(false);
    },
  });

  const deleteActivity = useMutation({
    mutationFn: () => activityApi.remove(activity.id),
    onSuccess: () => qc.invalidateQueries(['activities', vacationId]),
  });

  return (
    <div className="card card-hover" style={{ position: 'relative' }}>
      {/* Top row */}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', gap:'0.5rem' }}>
        <div style={{ display:'flex', gap:'0.6rem', alignItems:'flex-start', flex:1, minWidth:0 }}>
          <span style={{ fontSize:'1.3rem', lineHeight:1, flexShrink:0 }}>
            {CATEGORY_ICONS[activity.category] || '📌'}
          </span>
          <div style={{ minWidth:0 }}>
            <h4 style={{ marginBottom:'4px', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
              {activity.title}
            </h4>
            <StatusBadge status={activity.status} />
          </div>
        </div>

        {/* Menu */}
        <div style={{ position:'relative', flexShrink:0 }}>
          <button className="btn btn-ghost btn-icon btn-sm" onClick={() => setShowMenu(!showMenu)}>
            <MoreVertical size={15} />
          </button>
          {showMenu && (
            <div style={{
              position:'absolute', right:0, top:'110%', background:'var(--bg-card)',
              border:'1px solid var(--border-mid)', borderRadius:'var(--radius-sm)',
              zIndex:50, minWidth:'160px', overflow:'hidden', boxShadow:'var(--shadow)'
            }}>
              <button className="btn btn-ghost" style={{ width:'100%', justifyContent:'flex-start', borderRadius:0 }}
                onClick={() => { setShowStatusPicker(!showStatusPicker); }}>
                <ChevronDown size={13} /> Change Status
              </button>
              {showStatusPicker && STATUSES.map(s => (
                <button key={s} className="btn btn-ghost" style={{ width:'100%', justifyContent:'flex-start', borderRadius:0, paddingLeft:'2rem' }}
                  onClick={() => updateStatus.mutate(s)}>
                  {activity.status === s && <Check size={12} />} {s}
                </button>
              ))}
              <div className="divider" style={{ margin:'4px 0' }} />
              <button className="btn btn-ghost" style={{ width:'100%', justifyContent:'flex-start', borderRadius:0 }}
                onClick={() => { onEdit(activity); setShowMenu(false); }}>
                <Pencil size={13} /> Edit
              </button>
              <button className="btn btn-ghost" style={{ width:'100%', justifyContent:'flex-start', borderRadius:0, color:'var(--rose)' }}
                onClick={() => { if (window.confirm('Delete this activity?')) deleteActivity.mutate(); setShowMenu(false); }}>
                <Trash2 size={13} /> Delete
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Details */}
      {activity.description && (
        <p style={{ fontSize:'0.85rem', color:'var(--text-muted)', marginTop:'0.6rem' }}>
          {activity.description}
        </p>
      )}

      <div style={{ display:'flex', flexWrap:'wrap', gap:'0.75rem', marginTop:'0.8rem' }}>
        {activity.location && (
          <span style={{ display:'flex', alignItems:'center', gap:'4px', fontSize:'0.8rem', color:'var(--text-muted)' }}>
            <MapPin size={12} /> {activity.location}
          </span>
        )}
        {activity.scheduled_date && (
          <span style={{ display:'flex', alignItems:'center', gap:'4px', fontSize:'0.8rem', color:'var(--text-muted)' }}>
            <Clock size={12} />
            {new Date(activity.scheduled_date).toLocaleDateString('en-US', { month:'short', day:'numeric' })}
            {activity.scheduled_time && ` · ${activity.scheduled_time.slice(0,5)}`}
          </span>
        )}
        {activity.cost_estimate > 0 && (
          <span style={{ display:'flex', alignItems:'center', gap:'4px', fontSize:'0.8rem', color:'var(--text-muted)' }}>
            <DollarSign size={12} /> {Number(activity.cost_estimate).toFixed(0)} {activity.currency}
          </span>
        )}
      </div>
    </div>
  );
}
