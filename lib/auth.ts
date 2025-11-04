/**
 * Authentication utilities for Strapi v5 Users & Permissions plugin
 * The authentication endpoints remain the same in Strapi v5
 */

import Cookies from 'js-cookie';
import { config } from './config';

export interface UserData {
  id: number;
  documentId?: string; // Strapi v5 includes documentId
  username: string;
  email: string;
  provider?: string;
  confirmed?: boolean;
  blocked?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface AuthResponse {
  jwt: string;
  user: UserData;
}

export interface LoginData {
  identifier: string; // username or email
  password: string;
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
}

const STRAPI_URL = config.strapi.url;

// Set authentication token in cookies
export const setToken = (token: string) => {
  Cookies.set('token', token, { expires: 7 }); // Token valid for 7 days
};

// Get token from cookies
export const getToken = (): string | undefined => {
  return Cookies.get('token');
};

// Remove token from cookies (logout)
export const removeToken = () => {
  Cookies.remove('token');
};

// Store user data in cookies
export const setUser = (user: UserData) => {
  Cookies.set('user', JSON.stringify(user), { expires: 7 });
};

// Get user data from cookies
export const getUser = (): UserData | null => {
  const userData = Cookies.get('user');
  return userData ? JSON.parse(userData) : null;
};

// Remove user data from cookies
export const removeUser = () => {
  Cookies.remove('user');
};

// Login API call - Strapi v5 endpoint
export async function login(data: LoginData): Promise<AuthResponse> {
  try {
    const response = await fetch(`${STRAPI_URL}${config.strapi.endpoints.auth.login}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData?.error?.message || 'Login failed');
    }

    const responseData: AuthResponse = await response.json();
    setToken(responseData.jwt);
    setUser(responseData.user);
    return responseData;
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
}

// Register API call - Strapi v5 endpoint
export async function register(data: RegisterData): Promise<AuthResponse> {
  try {
    const response = await fetch(`${STRAPI_URL}${config.strapi.endpoints.auth.register}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData?.error?.message || 'Registration failed');
    }

    const responseData: AuthResponse = await response.json();
    setToken(responseData.jwt);
    setUser(responseData.user);
    return responseData;
  } catch (error) {
    console.error('Registration error:', error);
    throw error;
  }
}

// Logout function
export function logout() {
  removeToken();
  removeUser();
}

// Check if user is authenticated
export function isAuthenticated(): boolean {
  return !!getToken();
}

// Fetch current user from Strapi (useful for token validation)
// Strapi v5: User data is still returned in the same format
export async function fetchCurrentUser(): Promise<UserData | null> {
  const token = getToken();
  if (!token) return null;
  
  try {
    const response = await fetch(`${STRAPI_URL}${config.strapi.endpoints.auth.me}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch user');
    }
    
    const userData: UserData = await response.json();
    setUser(userData); // Update stored user data
    return userData;
  } catch (error) {
    console.error('Fetch user error:', error);
    logout(); // Clear invalid credentials
    return null;
  }
}