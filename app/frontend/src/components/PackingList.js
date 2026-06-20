import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { packingApi } from '../utils/api';
import { Plus, Trash2, Package } from 'lucide-react';

export default function PackingList({ vacationId }) {
  const qc = useQueryClient();
  const [newName, setNewName] = useState('');
  const [newCat, setNewCat]  = useState('');

  const { data: items = [], isLoading } = useQuery({
    queryKey: ['packing', vacationId],
    queryFn:  () => packingApi.getByVacation(vacationId),
  });

  const add = useMutation({
    mutationFn: () => packingApi.create(vacationId, { name: newName, category: newCat, quantity: 1 }),
    onSuccess:  () => { qc.invalidateQueries(['packing', vacationId]); setNewName(''); setNewCat(''); },
  });

  const toggle = useMutation({
    mutationFn: (id) => packingApi.toggle(id),
    onSuccess:  ()  => qc.invalidateQueries(['packing', vacationId]),
  });

  const remove = useMutation({
    mutationFn: (id) => packingApi.remove(id),
    onSuccess:  ()  => qc.invalidateQueries(['packing', vacationId]),
  });

  // Group by category
  const grouped = items.reduce((acc, item) => {
    const key = item.category || 'General';
    if (!acc[key]) acc[key] = [];
    acc[key].push(item);
    return acc;
  }, {});

  const packedCount = items.filter(i => i.packed).length;

  if (isLoading) return <div className="spinner" />;

  return (
    <div>
      {/* Progress */}
      {items.length > 0 && (
        <div style={{ marginBottom:'1.5rem' }}>
          <div style={{ display:'flex', justifyContent:'space-between', fontSize:'0.8rem', color:'var(--text-muted)', marginBottom:'6px' }}>
            <span>Packed</span>
            <span>{packedCount} / {items.length}</span>
          </div>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width:`${items.length ? (packedCount/items.length)*100 : 0}%` }} />
          </div>
        </div>
      )}

      {/* Add item */}
      <div style={{ display:'flex', gap:'0.5rem', marginBottom:'1.5rem' }}>
        <input className="input" placeholder="Item name" value={newName}
          onChange={e => setNewName(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter' && newName.trim()) add.mutate(); }}
          style={{ flex:2 }} />
        <input className="input" placeholder="Category (optional)" value={newCat}
          onChange={e => setNewCat(e.target.value)}
          style={{ flex:1 }} />
        <button className="btn btn-primary" disabled={!newName.trim() || add.isPending}
          onClick={() => add.mutate()}>
          <Plus size={15} />
        </button>
      </div>

      {/* List */}
      {Object.keys(grouped).length === 0 ? (
        <div className="empty-state">
          <Package size={36} />
          <p>No packing items yet</p>
        </div>
      ) : (
        Object.entries(grouped).map(([cat, catItems]) => (
          <div key={cat} style={{ marginBottom:'1.25rem' }}>
            <h4 style={{ color:'var(--text-muted)', fontSize:'0.75rem', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:'0.5rem' }}>
              {cat}
            </h4>
            <div style={{ display:'flex', flexDirection:'column', gap:'4px' }}>
              {catItems.map(item => (
                <div key={item.id} style={{
                  display:'flex', alignItems:'center', gap:'0.75rem',
                  padding:'0.6rem 0.85rem', background:'var(--bg-raised)',
                  borderRadius:'var(--radius-sm)', border:'1px solid var(--border)',
                  opacity: item.packed ? 0.55 : 1, transition:'opacity 0.15s',
                }}>
                  <input type="checkbox" checked={item.packed} style={{ accentColor:'var(--accent)', cursor:'pointer' }}
                    onChange={() => toggle.mutate(item.id)} />
                  <span style={{ flex:1, fontSize:'0.9rem', textDecoration: item.packed ? 'line-through' : 'none' }}>
                    {item.name}
                  </span>
                  <button className="btn btn-ghost btn-icon btn-sm" style={{ color:'var(--text-faint)' }}
                    onClick={() => remove.mutate(item.id)}>
                    <Trash2 size={13} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  );
}
