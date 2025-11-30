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
  phoneNumber?: string;
  Country?: string;
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
  phoneNumber: string;
  Country: string;
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
// Note: Strapi's default register endpoint only accepts username, email, password
// Custom fields (phoneNumber, Country) must be updated after registration
export async function register(data: RegisterData): Promise<AuthResponse> {
  try {
    // Step 1: Register with core fields only
    const coreData = {
      username: data.username,
      email: data.email,
      password: data.password,
    };

    const response = await fetch(`${STRAPI_URL}${config.strapi.endpoints.auth.register}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(coreData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData?.error?.message || 'Registration failed');
    }

    const responseData: AuthResponse = await response.json();
    setToken(responseData.jwt);
    setUser(responseData.user);

    // Step 2: Update user with custom fields (phoneNumber, Country)
    if (data.phoneNumber || data.Country) {
      try {
        await updateUserProfile(responseData.user.id, {
          phoneNumber: data.phoneNumber,
          Country: data.Country,
        }, responseData.jwt);
        
        // Update stored user with new fields
        const updatedUser = {
          ...responseData.user,
          phoneNumber: data.phoneNumber,
          Country: data.Country,
        };
        setUser(updatedUser);
        responseData.user = updatedUser;
      } catch (profileError) {
        console.error('Failed to update user profile:', profileError);
        // Don't throw - user is registered, profile update is secondary
      }
    }
    
    // Step 3: Automatically create an Author entry for the new user
    try {
      await createAuthorForUser(responseData.user, responseData.jwt);
    } catch (authorError) {
      console.error('Failed to create author for user:', authorError);
      // Don't throw - user is already registered, author creation is secondary
    }
    
    return responseData;
  } catch (error) {
    console.error('Registration error:', error);
    throw error;
  }
}

/**
 * Update user profile with custom fields
 * Used after registration to add phoneNumber, Country, etc.
 */
async function updateUserProfile(
  userId: number,
  profileData: { phoneNumber?: string; Country?: string },
  token: string
): Promise<void> {
  const response = await fetch(`${STRAPI_URL}/api/users/${userId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(profileData),
  });

  if (!response.ok) {
    const errorData = await response.json();
    console.error('Profile update error:', errorData);
    throw new Error(errorData?.error?.message || 'Failed to update profile');
  }

  console.log('User profile updated successfully');
}

/**
 * Create an Author entry linked to the user
 * This is called automatically after user registration
 */
async function createAuthorForUser(user: UserData, token: string): Promise<void> {
  // Generate a slug from username
  const slug = user.username.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  
  const authorData = {
    Name: user.username,
    slug: slug,
    users_permissions_user: user.id, // Link to the user (using numeric ID for Strapi v5)
  };

  const response = await fetch(`${STRAPI_URL}${config.strapi.endpoints.authors}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ data: authorData }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    console.error('Author creation error:', errorData);
    throw new Error(errorData?.error?.message || 'Failed to create author');
  }

  console.log('Author created successfully for user:', user.username);
}

/**
 * Get the Author entry for the currently logged in user
 * Returns null if no author is found
 */
export async function getAuthorForCurrentUser(): Promise<{ id: number; documentId: string; Name: string } | null> {
  const token = getToken();
  const user = getUser();
  
  if (!token || !user) {
    return null;
  }

  try {
    // Query authors filtered by the user relation
    const searchParams = new URLSearchParams();
    searchParams.append('filters[users_permissions_user][id][$eq]', user.id.toString());
    searchParams.append('populate[0]', 'users_permissions_user');
    
    const response = await fetch(
      `${STRAPI_URL}${config.strapi.endpoints.authors}?${searchParams.toString()}`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch author');
    }

    const data = await response.json();
    
    if (data.data && data.data.length > 0) {
      const author = data.data[0];
      return {
        id: author.id,
        documentId: author.documentId,
        Name: author.Name,
      };
    }
    
    return null;
  } catch (error) {
    console.error('Error fetching author for user:', error);
    return null;
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