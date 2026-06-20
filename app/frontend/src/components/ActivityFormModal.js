import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { activityApi } from '../utils/api';
import Modal from './Modal';

const CATEGORIES = [
  { value:'place_to_visit', label:'🏛️  Place to Visit' },
  { value:'restaurant',     label:'🍽️  Restaurant' },
  { value:'activity',       label:'🎯  Activity / Thing to Do' },
  { value:'accommodation',  label:'🏨  Accommodation' },
  { value:'transport',      label:'✈️  Transport' },
  { value:'other',          label:'📌  Other' },
];

const STATUSES = ['planned','confirmed','in_progress','completed','skipped','cancelled'];

const empty = {
  title:'', category:'activity', description:'', location:'', address:'',
  website:'', phone:'', scheduled_date:'', scheduled_time:'', duration_mins:'',
  cost_estimate:'', currency:'USD', status:'planned', priority:3, notes:'',
};

export default function ActivityFormModal({ vacationId, activity, onClose }) {
  const isEdit = Boolean(activity);
  const [form, setForm] = useState(isEdit ? {
    ...activity,
    scheduled_date: activity.scheduled_date ? activity.scheduled_date.slice(0,10) : '',
    scheduled_time: activity.scheduled_time ? activity.scheduled_time.slice(0,5) : '',
    cost_estimate: activity.cost_estimate ?? '',
    duration_mins: activity.duration_mins ?? '',
  } : empty);

  const qc = useQueryClient();
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const mutation = useMutation({
    mutationFn: () => isEdit
      ? activityApi.update(activity.id, form)
      : activityApi.create(vacationId, form),
    onSuccess: () => {
      qc.invalidateQueries(['activities', vacationId]);
      onClose();
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    mutation.mutate();
  };

  return (
    <Modal title={isEdit ? 'Edit Activity' : 'Add Activity'} onClose={onClose}>
      <form onSubmit={handleSubmit} style={{ display:'flex', flexDirection:'column', gap:'1rem' }}>
        <div className="form-group">
          <label className="form-label">Title *</label>
          <input className="input" required value={form.title}
            onChange={e => set('title', e.target.value)} placeholder="e.g. Senso-ji Temple" />
        </div>

        <div className="grid-2">
          <div className="form-group">
            <label className="form-label">Category</label>
            <select className="select" value={form.category} onChange={e => set('category', e.target.value)}>
              {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Status</label>
            <select className="select" value={form.status} onChange={e => set('status', e.target.value)}>
              {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Description</label>
          <textarea className="textarea" value={form.description}
            onChange={e => set('description', e.target.value)} placeholder="What makes this special?" />
        </div>

        <div className="grid-2">
          <div className="form-group">
            <label className="form-label">Location / Neighborhood</label>
            <input className="input" value={form.location}
              onChange={e => set('location', e.target.value)} placeholder="e.g. Asakusa, Tokyo" />
          </div>
          <div className="form-group">
            <label className="form-label">Full Address</label>
            <input className="input" value={form.address}
              onChange={e => set('address', e.target.value)} placeholder="Street address" />
          </div>
        </div>

        <div className="grid-2">
          <div className="form-group">
            <label className="form-label">Date</label>
            <input className="input" type="date" value={form.scheduled_date}
              onChange={e => set('scheduled_date', e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">Time</label>
            <input className="input" type="time" value={form.scheduled_time}
              onChange={e => set('scheduled_time', e.target.value)} />
          </div>
        </div>

        <div className="grid-2">
          <div className="form-group">
            <label className="form-label">Est. Cost</label>
            <input className="input" type="number" min="0" step="0.01"
              value={form.cost_estimate} onChange={e => set('cost_estimate', e.target.value)}
              placeholder="0.00" />
          </div>
          <div className="form-group">
            <label className="form-label">Currency</label>
            <input className="input" value={form.currency}
              onChange={e => set('currency', e.target.value)} placeholder="USD" />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Priority (1 = low, 5 = must-do)</label>
          <input className="input" type="range" min="1" max="5" value={form.priority}
            onChange={e => set('priority', Number(e.target.value))}
            style={{ padding:0, background:'none', border:'none' }} />
          <span style={{ fontSize:'0.8rem', color:'var(--text-muted)' }}>
            {'⭐'.repeat(form.priority)} ({form.priority}/5)
          </span>
        </div>

        <div className="form-group">
          <label className="form-label">Website</label>
          <input className="input" type="url" value={form.website}
            onChange={e => set('website', e.target.value)} placeholder="https://" />
        </div>

        <div className="form-group">
          <label className="form-label">Notes</label>
          <textarea className="textarea" value={form.notes}
            onChange={e => set('notes', e.target.value)}
            placeholder="Reservations needed? Tips? Dress code?" />
        </div>

        <div style={{ display:'flex', gap:'0.75rem', justifyContent:'flex-end', marginTop:'0.5rem' }}>
          <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button type="submit" className="btn btn-primary" disabled={mutation.isPending}>
            {mutation.isPending ? 'Saving…' : isEdit ? 'Save Changes' : 'Add Activity'}
          </button>
        </div>
        {mutation.isError && (
          <p style={{ color:'var(--rose)', fontSize:'0.85rem' }}>{mutation.error.message}</p>
        )}
      </form>
    </Modal>
  );
}
