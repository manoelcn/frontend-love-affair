const API_BASE = 'http://localhost:8000/api/v1';

interface Tokens {
  access: string;
  refresh: string;
}

function getTokens(): Tokens | null {
  const access = localStorage.getItem('access_token');
  const refresh = localStorage.getItem('refresh_token');
  if (access && refresh) return { access, refresh };
  return null;
}

function setTokens(tokens: Tokens) {
  localStorage.setItem('access_token', tokens.access);
  localStorage.setItem('refresh_token', tokens.refresh);
}

function clearTokens() {
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
}

async function refreshAccessToken(): Promise<string | null> {
  const tokens = getTokens();
  if (!tokens) return null;
  try {
    const res = await fetch(`${API_BASE}/authentication/token/refresh/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh: tokens.refresh }),
    });
    if (!res.ok) {
      clearTokens();
      return null;
    }
    const data = await res.json();
    localStorage.setItem('access_token', data.access);
    return data.access;
  } catch {
    clearTokens();
    return null;
  }
}

async function apiFetch<T>(
  endpoint: string,
  options: RequestInit = {},
  auth = false
): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (auth) {
    const tokens = getTokens();
    if (tokens) {
      headers['Authorization'] = `Bearer ${tokens.access}`;
    }
  }

  let res = await fetch(`${API_BASE}${endpoint}`, { ...options, headers });

  if (res.status === 401 && auth) {
    const newAccess = await refreshAccessToken();
    if (newAccess) {
      headers['Authorization'] = `Bearer ${newAccess}`;
      res = await fetch(`${API_BASE}${endpoint}`, { ...options, headers });
    } else {
      clearTokens();
      window.location.href = '/login';
      throw new Error('Session expired');
    }
  }

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(JSON.stringify(errorData));
  }

  if (res.status === 204 || res.headers.get('content-length') === '0') {
    return {} as T;
  }

  return res.json();
}

// Types
export interface User {
  email: string;
  username: string;
}

export interface Movie {
  id: number;
  title: string;
  description: string;
  genre: string;
  duration: number;
  banner: string;
}

export interface Session {
  id: number;
  room: string;
  session_datetime: string;
  total_seats: number;
  movie: number;
}

export interface Seat {
  id: number;
  seat_number: string;
  status: 'available' | 'reserved' | 'purchased';
  session: number;
}

export interface Reservation {
  id: number;
  reserved_until: string;
  is_active: boolean;
  user: string;
  seat: number;
}

export interface Ticket {
  id: number;
  code: string;
  created_at: string;
  user: string;
}

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

// Auth
export const auth = {
  register: (data: { email: string; username: string; password: string }) =>
    apiFetch<User>('/authentication/register/', { method: 'POST', body: JSON.stringify(data) }),

  login: async (email: string, password: string) => {
    const data = await apiFetch<{ access: string; refresh: string }>(
      '/authentication/token/',
      { method: 'POST', body: JSON.stringify({ email, password }) }
    );
    setTokens(data);
    return data;
  },

  logout: () => {
    clearTokens();
  },

  isAuthenticated: () => !!getTokens(),
};

// Movies
export const movies = {
  list: (page = 1) =>
    apiFetch<PaginatedResponse<Movie>>(`/movies/?page=${page}`),

  sessions: (movieId: number, page = 1) =>
    apiFetch<PaginatedResponse<Session>>(`/movies/${movieId}/sessions/?page=${page}`),
};

// Sessions
export const sessions = {
  seats: (sessionId: number, page = 1) =>
    apiFetch<PaginatedResponse<Seat>>(`/sessions/${sessionId}/seats/?page=${page}`),
};

// Reservations
export const reservations = {
  create: (seatId: number) =>
    apiFetch<Reservation>('/reservations/', { method: 'POST', body: JSON.stringify({ seat: seatId }) }, true),

  checkout: (reservationId: number) =>
    apiFetch<void>(`/reservations/${reservationId}/checkout/`, { method: 'POST' }, true),
};

// Tickets
export const tickets = {
  list: (page = 1) =>
    apiFetch<PaginatedResponse<Ticket>>(`/tickets/?page=${page}`, {}, true),
};
