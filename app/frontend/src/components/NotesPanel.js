import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notesApi } from '../utils/api';
import { Plus, Trash2, StickyNote, Pencil, Check, X } from 'lucide-react';

function NoteItem({ note, vacationId }) {
  const qc = useQueryClient();
  const [editing, setEditing]   = useState(false);
  const [title, setTitle]       = useState(note.title || '');
  const [content, setContent]   = useState(note.content);

  const update = useMutation({
    mutationFn: () => notesApi.update(note.id, { title, content, note_date: note.note_date }),
    onSuccess:  () => { qc.invalidateQueries(['notes', vacationId]); setEditing(false); },
  });

  const remove = useMutation({
    mutationFn: () => notesApi.remove(note.id),
    onSuccess:  () => qc.invalidateQueries(['notes', vacationId]),
  });

  return (
    <div className="card" style={{ marginBottom:'0.75rem' }}>
      {editing ? (
        <div style={{ display:'flex', flexDirection:'column', gap:'0.75rem' }}>
          <input className="input" value={title} onChange={e => setTitle(e.target.value)} placeholder="Note title" />
          <textarea className="textarea" value={content} onChange={e => setContent(e.target.value)} rows={4} />
          <div style={{ display:'flex', gap:'0.5rem', justifyContent:'flex-end' }}>
            <button className="btn btn-ghost btn-sm" onClick={() => setEditing(false)}><X size={13} /> Cancel</button>
            <button className="btn btn-primary btn-sm" onClick={() => update.mutate()} disabled={update.isPending}>
              <Check size={13} /> Save
            </button>
          </div>
        </div>
      ) : (
        <>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'0.5rem' }}>
            <div>
              {note.title && <h4 style={{ marginBottom:'2px' }}>{note.title}</h4>}
              {note.note_date && (
                <span style={{ fontSize:'0.75rem', color:'var(--text-faint)' }}>
                  {new Date(note.note_date).toLocaleDateString('en-US', { month:'long', day:'numeric', year:'numeric' })}
                </span>
              )}
            </div>
            <div style={{ display:'flex', gap:'4px' }}>
              <button className="btn btn-ghost btn-icon btn-sm" onClick={() => setEditing(true)}><Pencil size={13} /></button>
              <button className="btn btn-ghost btn-icon btn-sm" style={{ color:'var(--rose)' }}
                onClick={() => { if (window.confirm('Delete note?')) remove.mutate(); }}>
                <Trash2 size={13} />
              </button>
            </div>
          </div>
          <p style={{ fontSize:'0.875rem', color:'var(--text-muted)', whiteSpace:'pre-wrap' }}>{note.content}</p>
        </>
      )}
    </div>
  );
}

export default function NotesPanel({ vacationId }) {
  const qc = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle]       = useState('');
  const [content, setContent]   = useState('');
  const [noteDate, setNoteDate] = useState('');

  const { data: notes = [], isLoading } = useQuery({
    queryKey: ['notes', vacationId],
    queryFn:  () => notesApi.getByVacation(vacationId),
  });

  const add = useMutation({
    mutationFn: () => notesApi.create(vacationId, { title, content, note_date: noteDate || null }),
    onSuccess:  () => {
      qc.invalidateQueries(['notes', vacationId]);
      setTitle(''); setContent(''); setNoteDate(''); setShowForm(false);
    },
  });

  if (isLoading) return <div className="spinner" />;

  return (
    <div>
      <div style={{ display:'flex', justifyContent:'flex-end', marginBottom:'1rem' }}>
        <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
          <Plus size={15} /> New Note
        </button>
      </div>

      {showForm && (
        <div className="card" style={{ marginBottom:'1rem', borderColor:'var(--border-mid)' }}>
          <div style={{ display:'flex', flexDirection:'column', gap:'0.75rem' }}>
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Title (optional)</label>
                <input className="input" value={title} onChange={e => setTitle(e.target.value)} placeholder="Day 1 highlights..." />
              </div>
              <div className="form-group">
                <label className="form-label">Date (optional)</label>
                <input className="input" type="date" value={noteDate} onChange={e => setNoteDate(e.target.value)} />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Content *</label>
              <textarea className="textarea" rows={4} value={content} onChange={e => setContent(e.target.value)}
                placeholder="Write your note, journal entry, or reminder..." />
            </div>
            <div style={{ display:'flex', gap:'0.5rem', justifyContent:'flex-end' }}>
              <button className="btn btn-ghost btn-sm" onClick={() => setShowForm(false)}>Cancel</button>
              <button className="btn btn-primary btn-sm" onClick={() => add.mutate()}
                disabled={!content.trim() || add.isPending}>
                Add Note
              </button>
            </div>
          </div>
        </div>
      )}

      {notes.length === 0 ? (
        <div className="empty-state">
          <StickyNote size={36} />
          <p>No notes yet — start your travel journal!</p>
        </div>
      ) : (
        notes.map(note => <NoteItem key={note.id} note={note} vacationId={vacationId} />)
      )}
    </div>
  );
}
