'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { AuthResponse, LoginCredentials, ProfileResponse } from '@/types/admin.types';

interface AuthUser {
  id: string;
  email: string;
  name: string;
  roleId?: string | null;
  userType?: string;
}

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Check for existing token on mount and validate it
    const token = localStorage.getItem('admin_access_token');
    if (token) {
      // Validate token by fetching user profile
      fetchUserProfile();
    } else {
      setLoading(false);
    }
  }, []);

  const fetchUserProfile = async () => {
    try {
      const response = await api.get<{ data: ProfileResponse }>('/api/v1/profile');
      // Response has nested data: response.data.data
      const profileData = response.data.data;

      // Map profile response to AuthUser
      const authUser: AuthUser = {
        id: profileData.id,
        email: profileData.email,
        name: profileData.name,
        userType: profileData.userType,
      };

      setUser(authUser);
    } catch (error) {
      // Token is invalid or expired, clear it
      localStorage.removeItem('admin_access_token');
      localStorage.removeItem('admin_refresh_token');
    } finally {
      setLoading(false);
    }
  };

  const login = async (credentials: LoginCredentials) => {
    try {
      const response = await api.post<AuthResponse>('/api/v1/auth/system/login', credentials);
      // Response is already unwrapped by the interceptor
      const { accessToken, refreshToken } = response.data;

      // Store tokens in localStorage
      localStorage.setItem('admin_access_token', accessToken);
      localStorage.setItem('admin_refresh_token', refreshToken);

      // Fetch user profile to set user state
      await fetchUserProfile();

      // Use window.location for static export compatibility with basePath
      // router.push() doesn't respect basePath in static exports
      if (typeof window !== 'undefined') {
        window.location.href = '/pharmacy-admin-dashboard/';
      }
    } catch (error) {
      const message = error instanceof Error && 'response' in error
        ? (error as { response?: { data?: { message?: string } } }).response?.data?.message
        : 'Login failed';
      throw new Error(message || 'Login failed');
    }
  };

  const logout = () => {
    localStorage.removeItem('admin_access_token');
    localStorage.removeItem('admin_refresh_token');
    setUser(null);
    // Use window.location for static export compatibility with basePath
    if (typeof window !== 'undefined') {
      window.location.href = '/pharmacy-admin-dashboard/login';
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
