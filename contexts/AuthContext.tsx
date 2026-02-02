'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { 
  login as loginApi, 
  register as registerApi, 
  logout as logoutApi,
  fetchCurrentUser,
  isAuthenticated,
  getUser,
  UserData,
  LoginData,
  RegisterData
} from '@/lib/auth';

interface AuthContextType {
  isLoading: boolean;
  isAuthenticated: boolean;
  user: UserData | null;
  login: (data: LoginData) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  updateLocalUser: (userData: UserData) => void;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [user, setUser] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Check if the user is already authenticated when the app loads
  useEffect(() => {
    const initAuth = async () => {
      setIsLoading(true);
      try {
        if (isAuthenticated()) {
          const userData = getUser();
          if (userData) {
            // Optional: validate the token by fetching current user
            const currentUser = await fetchCurrentUser();
            if (currentUser) {
              setUser(currentUser);
            }
          }
        }
      } catch (error) {
        console.error('Authentication initialization error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (data: LoginData) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await loginApi(data);
      setUser(response.user);
      const redirectUrl = searchParams.get('redirect') || '/';
      router.push(redirectUrl);
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('An unknown error occurred');
      }
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: RegisterData) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await registerApi(data);
      setUser(response.user);
      const redirectUrl = searchParams.get('redirect') || '/';
      router.push(redirectUrl);
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('An unknown error occurred');
      }
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    logoutApi();
    setUser(null);
    router.push('/');
  };

  // Refresh user data from server
  const refreshUser = useCallback(async () => {
    try {
      const currentUser = await fetchCurrentUser();
      if (currentUser) {
        setUser(currentUser);
      }
    } catch (error) {
      console.error('Error refreshing user:', error);
    }
  }, []);

  // Update local user state (without fetching from server)
  const updateLocalUser = useCallback((userData: UserData) => {
    setUser(userData);
  }, []);

  const value = {
    isLoading,
    isAuthenticated: !!user,
    user,
    login,
    register,
    logout,
    refreshUser,
    updateLocalUser,
    error
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};