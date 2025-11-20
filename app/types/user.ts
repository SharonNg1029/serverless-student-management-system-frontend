export type UserRole = 'Student' | 'Lecturer' | 'Admin';

export interface User {
  id: string;
  username: string;
  email: string;
  fullName: string;
  role: UserRole;
  token: string;
  avatar?: string;
  phone?: string;
  isEmailVerified: boolean;
  lastLogin: string;
  loginMethod: 'normal' | 'google';
  createdAt: string;
  updatedAt: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface LoginResponse {
  id?: string;
  userId?: string;
  username?: string;
  email?: string;
  fullName?: string;
  fullname?: string;
  role?: UserRole | string;
  token?: string;
  accessToken?: string;
  avatar?: string;
  phone?: string;
  enabled?: boolean;
  isEmailVerified?: boolean;
  createAt?: string;
  createdAt?: string;
  updatedAt?: string;
}
