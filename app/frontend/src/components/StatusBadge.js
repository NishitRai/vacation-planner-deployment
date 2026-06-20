const LABELS = {
  planning:    'Planning',
  upcoming:    'Upcoming',
  active:      'Active',
  completed:   'Completed',
  cancelled:   'Cancelled',
  planned:     'Planned',
  confirmed:   'Confirmed',
  in_progress: 'In Progress',
  skipped:     'Skipped',
};

export default function StatusBadge({ status }) {
  return (
    <span className={`badge badge-${status}`}>
      {LABELS[status] || status}
    </span>
  );
}
