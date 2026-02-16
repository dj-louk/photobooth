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
    // Clone the response before reading to avoid "body stream already read" error
    const errorText = await response.text();
    let errorMessage = 'Une erreur est survenue';
    try {
      const errorJson = JSON.parse(errorText);
      errorMessage = errorJson.detail || errorMessage;
    } catch {
      errorMessage = errorText || errorMessage;
    }
    throw new Error(errorMessage);
  }
  
  const text = await response.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
};

// Safe fetch helper for public endpoints
const safeFetch = async (url, options = {}) => {
  try {
    const response = await fetch(url, options);
    if (!response.ok) {
      console.warn(`API call failed: ${url}`, response.status);
      return null;
    }
    const text = await response.text();
    if (!text) return null;
    return JSON.parse(text);
  } catch (error) {
    console.warn(`API error: ${url}`, error);
    return null;
  }
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
  getActive: () => safeFetch(`${API_URL}/api/events/active`),
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
    return safeFetch(`${API_URL}${url}`) || [];
  },
  getById: (id) => safeFetch(`${API_URL}/api/groups/${id}`),
  search: (query, eventId) => {
    const url = eventId 
      ? `/api/groups/search/${query}?event_id=${eventId}` 
      : `/api/groups/search/${query}`;
    return safeFetch(`${API_URL}${url}`) || [];
  },
  create: async (data) => {
    const response = await fetch(`${API_URL}/api/groups`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!response.ok) {
      const text = await response.text();
      throw new Error(text || 'Erreur création groupe');
    }
    return response.json();
  },
  delete: (id) => fetchWithAuth(`/api/groups/${id}`, { method: 'DELETE' }),
  regenerateQr: (id) => fetchWithAuth(`/api/groups/${id}/regenerate-qr`, { method: 'POST' }),
  incrementDownload: (id) => safeFetch(`${API_URL}/api/groups/${id}/increment-download`, { 
    method: 'POST' 
  })
};

// Photos API
export const photosApi = {
  getByGroup: (groupId) => safeFetch(`${API_URL}/api/photos/${groupId}`) || [],
  upload: async (groupId, photoData) => {
    const response = await fetch(`${API_URL}/api/photos?group_id=${groupId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ photo_data: photoData })
    });
    if (!response.ok) throw new Error('Erreur upload photo');
    return response.json();
  },
  uploadBatch: async (groupId, photos) => {
    const response = await fetch(`${API_URL}/api/photos/batch?group_id=${groupId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ photos })
    });
    if (!response.ok) throw new Error('Erreur upload photos');
    return response.json();
  }
};

// Settings API
export const settingsApi = {
  get: () => safeFetch(`${API_URL}/api/settings`),
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
