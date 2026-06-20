import axios from 'axios';

// Base URL strategy:
// - In the Docker/Vagrant setup REACT_APP_API_URL is intentionally left blank.
//   Axios then uses a relative path ('/api'), so every request goes to the
//   same host:port the browser loaded the page from (the VM IP on port 80).
//   Nginx intercepts those /api/* requests and forwards them to backend:4000
//   on the internal Docker network — the browser never contacts port 4000.
// - For local development outside Docker, set REACT_APP_API_URL=http://localhost:4000/api
//   in frontend/.env.local and the fallback below will be ignored.

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || '/api',
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.response.use(
  (res) => res.data,
  (err) => {
    const message = err.response?.data?.error || err.message || 'Something went wrong';
    return Promise.reject(new Error(message));
  }
);

// ── Vacations ────────────────────────────────────────────────
export const vacationApi = {
  getAll:       ()         => api.get('/vacations'),
  getOne:       (id)       => api.get(`/vacations/${id}`),
  create:       (data)     => api.post('/vacations', data),
  update:       (id, data) => api.put(`/vacations/${id}`, data),
  updateStatus: (id, status) => api.patch(`/vacations/${id}/status`, { status }),
  remove:       (id)       => api.delete(`/vacations/${id}`),
};

// ── Activities ───────────────────────────────────────────────
export const activityApi = {
  getByVacation: (vacationId)       => api.get(`/vacations/${vacationId}/activities`),
  create:        (vacationId, data) => api.post(`/vacations/${vacationId}/activities`, data),
  update:        (id, data)         => api.put(`/activities/${id}`, data),
  updateStatus:  (id, status)       => api.patch(`/activities/${id}/status`, { status }),
  remove:        (id)               => api.delete(`/activities/${id}`),
};

// ── Packing ──────────────────────────────────────────────────
export const packingApi = {
  getByVacation: (vacationId)       => api.get(`/vacations/${vacationId}/packing`),
  create:        (vacationId, data) => api.post(`/vacations/${vacationId}/packing`, data),
  toggle:        (id)               => api.patch(`/packing/${id}/toggle`),
  update:        (id, data)         => api.put(`/packing/${id}`, data),
  remove:        (id)               => api.delete(`/packing/${id}`),
};

// ── Notes ────────────────────────────────────────────────────
export const notesApi = {
  getByVacation: (vacationId)       => api.get(`/vacations/${vacationId}/notes`),
  create:        (vacationId, data) => api.post(`/vacations/${vacationId}/notes`, data),
  update:        (id, data)         => api.put(`/notes/${id}`, data),
  remove:        (id)               => api.delete(`/notes/${id}`),
};
