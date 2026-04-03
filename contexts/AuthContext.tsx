'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { GoogleOAuthProvider } from '@react-oauth/google';
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
import { authChannel } from '@/lib/auth-channel';

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

  // Effect for handling cross-tab auth events
  useEffect(() => {
    const handleAuthMessage = (event: MessageEvent) => {
      if (event.data.type === 'logout') {
        // Another tab logged out or deleted account. Redirect to sign-in.
        // A full page navigation is the most robust way to reset all state.
        window.location.href = '/auth/signin?reason=session-ended';
      } else if (event.data.type === 'login') {
        // Another tab logged in. Reload to sync the new session.
        window.location.reload();
      }
    };

    authChannel?.addEventListener('message', handleAuthMessage);

    return () => {
      authChannel?.removeEventListener('message', handleAuthMessage);
    };
  }, []);

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
            } else {
              // Token is invalid, log out
              logoutApi();
            }
          }
        }
      } catch (error) {
        console.error('Authentication initialization error:', error);
        logoutApi(); // Clear invalid data
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
      router.replace(redirectUrl);
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
      router.replace(redirectUrl);
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
    logoutApi(); // from @lib/auth, removes cookies and broadcasts
    setUser(null); // Update state for the current tab
    window.location.reload();
  };

  // Refresh user data from server
  const refreshUser = useCallback(async () => {
    try {
      const currentUser = await fetchCurrentUser();
      setUser(currentUser); // It's okay to set null if fetch fails
    } catch (error) {
      console.error('Error refreshing user:', error);
      setUser(null);
    }
  }, []);

  // Update local user state (e.g., after profile update)
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

  return (
    <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || ""}>
      <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
    </GoogleOAuthProvider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};