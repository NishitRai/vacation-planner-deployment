import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { vacationApi } from '../utils/api';
import { ArrowLeft } from 'lucide-react';

const STATUSES = ['planning','upcoming','active','completed','cancelled'];

const empty = { title:'', destination:'', description:'', start_date:'', end_date:'', cover_image:'', status:'planning' };

export default function NewVacation() {
  const { id }  = useParams();
  const isEdit  = Boolean(id);
  const navigate = useNavigate();
  const qc       = useQueryClient();
  const [form, setForm] = useState(empty);

  const { data: existing } = useQuery({
    queryKey: ['vacation', id],
    queryFn:  () => vacationApi.getOne(id),
    enabled:  isEdit,
  });

  useEffect(() => {
    if (existing) {
      setForm({
        ...existing,
        start_date: existing.start_date?.slice(0,10) ?? '',
        end_date:   existing.end_date?.slice(0,10)   ?? '',
      });
    }
  }, [existing]);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const mutation = useMutation({
    mutationFn: () => isEdit ? vacationApi.update(id, form) : vacationApi.create(form),
    onSuccess:  (data) => {
      qc.invalidateQueries(['vacations']);
      navigate(`/vacations/${data.id ?? id}`);
    },
  });

  return (
    <div style={{ maxWidth:680 }}>
      <button className="btn btn-ghost btn-sm" style={{ marginBottom:'1.5rem' }}
        onClick={() => navigate(-1)}>
        <ArrowLeft size={14} /> Back
      </button>

      <h2 style={{ marginBottom:'0.25rem' }}>{isEdit ? 'Edit Trip' : 'Plan a New Trip'}</h2>
      <p style={{ color:'var(--text-muted)', marginBottom:'2rem', fontSize:'0.9rem' }}>
        {isEdit ? 'Update your trip details below.' : 'Start by giving your adventure a name and destination.'}
      </p>

      <form onSubmit={(e) => { e.preventDefault(); mutation.mutate(); }}
        style={{ display:'flex', flexDirection:'column', gap:'1.25rem' }}>

        <div className="card">
          <h4 style={{ marginBottom:'1rem', color:'var(--text-muted)' }}>Basic Info</h4>
          <div style={{ display:'flex', flexDirection:'column', gap:'1rem' }}>
            <div className="form-group">
              <label className="form-label">Trip Name *</label>
              <input className="input" required value={form.title}
                onChange={e => set('title', e.target.value)} placeholder="e.g. Summer in Tokyo" />
            </div>
            <div className="form-group">
              <label className="form-label">Destination *</label>
              <input className="input" required value={form.destination}
                onChange={e => set('destination', e.target.value)} placeholder="e.g. Tokyo, Japan" />
            </div>
            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea className="textarea" value={form.description}
                onChange={e => set('description', e.target.value)}
                placeholder="What's this trip all about?" />
            </div>
          </div>
        </div>

        <div className="card">
          <h4 style={{ marginBottom:'1rem', color:'var(--text-muted)' }}>Dates & Status</h4>
          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Start Date *</label>
              <input className="input" type="date" required value={form.start_date}
                onChange={e => set('start_date', e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">End Date *</label>
              <input className="input" type="date" required value={form.end_date}
                onChange={e => set('end_date', e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Status</label>
              <select className="select" value={form.status} onChange={e => set('status', e.target.value)}>
                {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Cover Image URL</label>
              <input className="input" type="url" value={form.cover_image}
                onChange={e => set('cover_image', e.target.value)} placeholder="https://..." />
            </div>
          </div>
        </div>

        {mutation.isError && (
          <p style={{ color:'var(--rose)', fontSize:'0.875rem' }}>{mutation.error.message}</p>
        )}

        <div style={{ display:'flex', gap:'0.75rem' }}>
          <button type="button" className="btn btn-ghost" onClick={() => navigate(-1)}>Cancel</button>
          <button type="submit" className="btn btn-primary" disabled={mutation.isPending}>
            {mutation.isPending ? 'Saving…' : isEdit ? 'Save Changes' : 'Create Trip'}
          </button>
        </div>
      </form>
    </div>
  );
}
