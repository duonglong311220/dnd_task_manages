import api from './api';
import { User, LoginCredentials, RegisterData } from '../types';

interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

function saveTokens(accessToken: string, refreshToken: string) {
  localStorage.setItem('accessToken', accessToken);
  localStorage.setItem('refreshToken', refreshToken);
}

export const authService = {
  async login(credentials: LoginCredentials): Promise<User> {
    const response = await api.post<{ success: boolean; data: AuthResponse }>('/auth/login', credentials);
    const { user, accessToken, refreshToken } = response.data.data;
    saveTokens(accessToken, refreshToken);
    localStorage.setItem('user', JSON.stringify(user));
    return user;
  },

  async register(data: RegisterData): Promise<User> {
    const response = await api.post<{ success: boolean; data: AuthResponse }>('/auth/register', data);
    const { user, accessToken, refreshToken } = response.data.data;
    saveTokens(accessToken, refreshToken);
    localStorage.setItem('user', JSON.stringify(user));
    return user;
  },

  async logout(): Promise<void> {
    try {
      await api.post('/auth/logout');
    } finally {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
    }
  },

  async updateUser(_id: string, data: Partial<User>): Promise<User> {
    const response = await api.patch<{ success: boolean; data: User }>('/users/me', data);
    const user = response.data.data;
    localStorage.setItem('user', JSON.stringify(user));
    return user;
  },

  async getUserById(_id: string): Promise<User> {
    const response = await api.get<{ success: boolean; data: User }>('/users/me');
    return response.data.data;
  },
};

