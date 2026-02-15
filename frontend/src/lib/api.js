const API_URL = process.env.REACT_APP_BACKEND_URL;

// Helper for fetch with credentials
const fetchWithAuth = async (endpoint, options = {}) => {
  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers
    }
  });
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Erreur réseau' }));
    throw new Error(error.detail || 'Une erreur est survenue');
  }
  
  return response.json();
};

// Auth API
export const authApi = {
  exchangeSession: (sessionId) => fetchWithAuth(`/api/auth/session?session_id=${sessionId}`),
  getMe: () => fetchWithAuth('/api/auth/me'),
  logout: () => fetchWithAuth('/api/auth/logout', { method: 'POST' })
};

// Events API
export const eventsApi = {
  getAll: () => fetchWithAuth('/api/events'),
  getActive: () => fetch(`${API_URL}/api/events/active`).then(r => r.ok ? r.json() : null),
  getById: (id) => fetchWithAuth(`/api/events/${id}`),
  create: (data) => fetchWithAuth('/api/events', {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  update: (id, data) => fetchWithAuth(`/api/events/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data)
  }),
  delete: (id) => fetchWithAuth(`/api/events/${id}`, { method: 'DELETE' })
};

// Groups API
export const groupsApi = {
  getAll: (eventId) => {
    const url = eventId ? `/api/groups?event_id=${eventId}` : '/api/groups';
    return fetch(`${API_URL}${url}`).then(r => r.json());
  },
  getById: (id) => fetch(`${API_URL}/api/groups/${id}`).then(r => r.json()),
  search: (query, eventId) => {
    const url = eventId 
      ? `/api/groups/search/${query}?event_id=${eventId}` 
      : `/api/groups/search/${query}`;
    return fetch(`${API_URL}${url}`).then(r => r.json());
  },
  create: (data) => fetch(`${API_URL}/api/groups`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }).then(r => r.json()),
  delete: (id) => fetchWithAuth(`/api/groups/${id}`, { method: 'DELETE' }),
  regenerateQr: (id) => fetchWithAuth(`/api/groups/${id}/regenerate-qr`, { method: 'POST' }),
  incrementDownload: (id) => fetch(`${API_URL}/api/groups/${id}/increment-download`, { 
    method: 'POST' 
  })
};

// Photos API
export const photosApi = {
  getByGroup: (groupId) => fetch(`${API_URL}/api/photos/${groupId}`).then(r => r.json()),
  upload: (groupId, photoData) => fetch(`${API_URL}/api/photos?group_id=${groupId}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ photo_data: photoData })
  }).then(r => r.json()),
  uploadBatch: (groupId, photos) => fetch(`${API_URL}/api/photos/batch?group_id=${groupId}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ photos })
  }).then(r => r.json())
};

// Settings API
export const settingsApi = {
  get: () => fetch(`${API_URL}/api/settings`).then(r => r.json()),
  update: (data) => fetchWithAuth('/api/settings', {
    method: 'PUT',
    body: JSON.stringify(data)
  })
};

// Stats API
export const statsApi = {
  get: () => fetchWithAuth('/api/stats')
};

export default {
  auth: authApi,
  events: eventsApi,
  groups: groupsApi,
  photos: photosApi,
  settings: settingsApi,
  stats: statsApi
};
