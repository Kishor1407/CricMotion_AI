const getApiBaseUrl = (): string => {
  if (process.env.NEXT_PUBLIC_API_URL) return process.env.NEXT_PUBLIC_API_URL;
  if (typeof window !== 'undefined') return '/v1';
  if (process.env.BACKEND_URL) return `${process.env.BACKEND_URL}/v1`;
  return 'http://localhost:5050/v1';
};

const API_BASE_URL = getApiBaseUrl();

export interface User {
  id: string;
  email: string;
  profile?: {
    firstName?: string;
    lastName?: string;
    avatarUrl?: string;
  };
  wallet?: {
    generationCredits: number;
    subscriptionTier: string;
  };
  oauth?: {
    instagramConnected?: boolean;
    instagramAccountId?: string | null;
    instagramUsername?: string | null;
  };
}

export interface AuthResponse {
  success: boolean;
  message?: string;
  token?: string;
  user?: User;
}

export const authStorage = {
  getToken: (): string | null => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('cricmotion_token');
  },
  setToken: (token: string): void => {
    if (typeof window === 'undefined') return;
    localStorage.setItem('cricmotion_token', token);
  },
  getUser: (): User | null => {
    if (typeof window === 'undefined') return null;
    const userStr = localStorage.getItem('cricmotion_user');
    return userStr ? JSON.parse(userStr) : null;
  },
  setUser: (user: User): void => {
    if (typeof window === 'undefined') return;
    localStorage.setItem('cricmotion_user', JSON.stringify(user));
  },
  clear: (): void => {
    if (typeof window === 'undefined') return;
    localStorage.removeItem('cricmotion_token');
    localStorage.removeItem('cricmotion_user');
  },
};

export async function apiRequest<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = authStorage.getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'API request failed');
  }

  return data as T;
}
