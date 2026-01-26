import api from './api';
import { User, LoginCredentials, RegisterData } from '../types';

export const authService = {
  async login(credentials: LoginCredentials): Promise<User> {
    const response = await api.get<User[]>('/users', {
      params: {
        email: credentials.email,
        password: credentials.password,
      },
    });

    if (response.data.length === 0) {
      throw new Error('Email hoặc mật khẩu không đúng');
    }

    return response.data[0];
  },

  async register(data: RegisterData): Promise<User> {
    const existingUsers = await api.get<User[]>('/users', {
      params: { email: data.email },
    });

    if (existingUsers.data.length > 0) {
      throw new Error('Email đã được sử dụng');
    }

    const newUser: Omit<User, 'id'> = {
      ...data,
      avatar: '',
      createdAt: new Date().toISOString(),
    };

    const response = await api.post<User>('/users', newUser);
    return response.data;
  },

  async updateUser(id: string, data: Partial<User>): Promise<User> {
    const response = await api.patch<User>(`/users/${id}`, data);
    return response.data;
  },

  async getUserById(id: string): Promise<User> {
    const response = await api.get<User>(`/users/${id}`);
    return response.data;
  },
};

