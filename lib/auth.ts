/**
 * Authentication utilities for Strapi v5 Users & Permissions plugin
 * The authentication endpoints remain the same in Strapi v5
 */

import Cookies from 'js-cookie';
import { config } from './config';

export interface UserAvatar {
  id: number;
  documentId?: string;
  url: string;
  name?: string;
  alternativeText?: string;
  width?: number;
  height?: number;
  formats?: {
    thumbnail?: { url: string; width: number; height: number };
    small?: { url: string; width: number; height: number };
    medium?: { url: string; width: number; height: number };
    large?: { url: string; width: number; height: number };
  };
}

export interface UserData {
  id: number;
  documentId?: string; // Strapi v5 includes documentId
  username: string;
  fullName?: string;
  email: string;
  provider?: string;
  confirmed?: boolean;
  blocked?: boolean;
  Bio?: string; // Strapi uses capital B
  phoneNumber?: string;
  Country?: string;
  Avatar?: UserAvatar; // User avatar image
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
  phoneNumber?: string;
  Country?: string;
  Bio?: string;
}

const STRAPI_URL = config.strapi.url;

import { authChannel } from './auth-channel';

// Set authentication token in cookies
export const setToken = (token: string) => {
  Cookies.set('token', token, { expires: 7, path: '/' }); // Token valid for 7 days
  authChannel?.postMessage({ type: 'login' });
};

// Get token from cookies
export const getToken = (): string | undefined => {
  return Cookies.get('token');
};

// Remove token from cookies (logout)
export const removeToken = () => {
  Cookies.remove('token', { path: '/' });
  authChannel?.postMessage({ type: 'logout' });
};

// Store user data in cookies
export const setUser = (user: UserData) => {
  Cookies.set('user', JSON.stringify(user), { expires: 7, path: '/' });
};

// Get user data from cookies
export const getUser = (): UserData | null => {
  const userData = Cookies.get('user');
  return userData ? JSON.parse(userData) : null;
};

// Remove user data from cookies
export const removeUser = () => {
  Cookies.remove('user', { path: '/' });
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
    
    // Fetch user with Avatar populated
    const userWithAvatar = await fetchCurrentUserWithToken(responseData.jwt);
    if (userWithAvatar) {
      responseData.user = userWithAvatar;
    }
    setUser(responseData.user);
    
    return responseData;
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
}

// Helper to fetch current user with a specific token (used during login)
async function fetchCurrentUserWithToken(token: string): Promise<UserData | null> {
  try {
    const response = await fetch(`${STRAPI_URL}${config.strapi.endpoints.auth.me}?populate=Avatar`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    
    if (!response.ok) {
      return null;
    }
    
    return await response.json();
  } catch (error) {
    console.error('Fetch user with token error:', error);
    return null;
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

    // Step 2: Update user with custom fields (phoneNumber, Country, Bio)
    if (data.phoneNumber || data.Country || data.Bio) {
      try {
        await updateUserProfile(responseData.user.id, {
          phoneNumber: data.phoneNumber,
          Country: data.Country,
          ...(data.Bio ? { Bio: data.Bio } : {}),
        }, responseData.jwt);
        
        // Update stored user with new fields
        const updatedUser = {
          ...responseData.user,
          phoneNumber: data.phoneNumber,
          Country: data.Country,
          ...(data.Bio ? { Bio: data.Bio } : {}),
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
  profileData: { phoneNumber?: string; Country?: string; Bio?: string },
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

}

/**
 * Get the Author entry for the currently logged in user
 * Returns null if no author is found
 */
export async function getAuthorForCurrentUser(): Promise<{ id: number; documentId: string; Name: string; slug: string } | null> {
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
        slug: author.slug,
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

/**
 * Update user profile (public function)
 * Updates username, Bio, phoneNumber, Country
 */
export async function updateUserData(
  userId: number,
  profileData: { 
    username?: string; 
    Bio?: string;
    phoneNumber?: string; 
    Country?: string;
  }
): Promise<UserData> {
  const token = getToken();
  if (!token) {
    throw new Error('Not authenticated');
  }

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
    
    // Check for duplicate username error
    if (errorData?.error?.message?.includes('username') || 
        errorData?.error?.message?.includes('unique') ||
        errorData?.error?.message?.includes('already')) {
      throw new Error('This username is already taken. Please choose a different one.');
    }
    
    throw new Error(errorData?.error?.message || 'Failed to update profile');
  }

  const updatedUser: UserData = await response.json();
  setUser(updatedUser); // Update stored user data
  
  // If Bio was updated, also update the author's Bio
  if (profileData.Bio !== undefined) {
    try {
      await updateAuthorBio(profileData.Bio);
    } catch (err) {
      console.warn('Failed to sync bio to author:', err);
      // Don't throw - user update succeeded, author sync is secondary
    }
  }
  
  return updatedUser;
}

/**
 * Update the author's Bio field
 * Called when user updates their bio to keep author in sync
 */
async function updateAuthorBio(bio: string): Promise<void> {
  const token = getToken();
  const user = getUser();
  
  if (!token || !user) {
    return;
  }

  // First, get the author for this user
  const author = await getAuthorForCurrentUser();
  if (!author) {
    return; // No author linked to this user
  }

  // Update the author's Bio
  const response = await fetch(`${STRAPI_URL}/api/authors/${author.documentId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({
      data: {
        Bio: bio,
      },
    }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    console.error('Author bio update error:', errorData);
    throw new Error('Failed to update author bio');
  }
}

/**
 * Change user password
 */
export async function changePassword(
  currentPassword: string,
  newPassword: string
): Promise<void> {
  const token = getToken();
  if (!token) {
    throw new Error('Not authenticated');
  }

  const response = await fetch(`${STRAPI_URL}/api/auth/change-password`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({
      currentPassword,
      password: newPassword,
      passwordConfirmation: newPassword,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    console.error('Password change error:', errorData);
    
    if (errorData?.error?.message?.includes('password') || 
        errorData?.error?.message?.includes('incorrect') ||
        errorData?.error?.message?.includes('wrong')) {
      throw new Error('Current password is incorrect');
    }
    
    throw new Error(errorData?.error?.message || 'Failed to change password');
  }
}

/**
 * Delete the author entry linked to the currently authenticated user
 * No-op if no author exists.
 */
async function deleteAuthorForCurrentUser(token: string): Promise<void> {
  const author = await getAuthorForCurrentUser();
  if (!author?.documentId) {
    return;
  }

  const response = await fetch(`${STRAPI_URL}/api/authors/${author.documentId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    console.error('Author deletion error:', errorData);
    const errorMessage =
      typeof errorData === 'object' &&
      errorData !== null &&
      'error' in errorData &&
      typeof (errorData as { error?: { message?: string } }).error?.message === 'string'
        ? (errorData as { error: { message: string } }).error.message
        : 'Failed to delete author';
    throw new Error(errorMessage);
  }
}

/**
 * Delete the currently authenticated user's avatar file from Strapi media library.
 * No-op if the user has no avatar.
 */
async function deleteCurrentUserAvatarFromMediaLibrary(token: string): Promise<void> {
  const user = await fetchCurrentUserWithToken(token);
  const avatarId = user?.Avatar?.id;

  if (!avatarId) {
    return;
  }

  const response = await fetch(`${STRAPI_URL}/api/upload/files/${avatarId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    console.error('Avatar media deletion error:', errorData);
    const errorMessage =
      typeof errorData === 'object' &&
      errorData !== null &&
      'error' in errorData &&
      typeof (errorData as { error?: { message?: string } }).error?.message === 'string'
        ? (errorData as { error: { message: string } }).error.message
        : 'Failed to delete avatar from media library';
    throw new Error(errorMessage);
  }
}

/**
 * Delete user account
 * Note: This requires proper Strapi permissions for users to delete themselves
 */
export async function deleteAccount(userId: number): Promise<void> {
  const token = getToken();
  if (!token) {
    throw new Error('Not authenticated');
  }

  // Delete avatar asset first so media files are not orphaned.
  await deleteCurrentUserAvatarFromMediaLibrary(token);

  // Delete linked author first to avoid leaving orphaned author records.
  await deleteAuthorForCurrentUser(token);

  const response = await fetch(`${STRAPI_URL}/api/users/${userId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json();
    console.error('Account deletion error:', errorData);
    throw new Error(errorData?.error?.message || 'Failed to delete account');
  }

  // Clear local auth data after successful deletion
  logout();
}

// Fetch current user from Strapi (useful for token validation)
// Strapi v5: User data is still returned in the same format
export async function fetchCurrentUser(): Promise<UserData | null> {
  const token = getToken();
  if (!token) return null;
  
  try {
    // Populate Avatar field when fetching current user
    const response = await fetch(`${STRAPI_URL}${config.strapi.endpoints.auth.me}?populate=Avatar`, {
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

/**
 * Get the full avatar URL for a user
 * Returns placeholder if no avatar is set
 */
export function getUserAvatarUrl(user: UserData | null): string {
  if (!user?.Avatar?.url) {
    return '/images/avatarPlaceholder.png';
  }
  const url = user.Avatar.url;
  return url.startsWith('http') ? url : `${STRAPI_URL}${url}`;
}

/**
 * Upload avatar image for a user
 * Uses Strapi's upload endpoint and then links it to the user
 */
export async function uploadUserAvatar(userId: number, file: File): Promise<UserData> {
  const token = getToken();
  if (!token) {
    throw new Error('Not authenticated');
  }

  // Step 1: Upload the file to Strapi's media library
  const formData = new FormData();
  formData.append('files', file);
  formData.append('ref', 'plugin::users-permissions.user');
  formData.append('refId', userId.toString());
  formData.append('field', 'Avatar');

  const uploadResponse = await fetch(`${STRAPI_URL}/api/upload`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    body: formData,
  });

  if (!uploadResponse.ok) {
    const errorData = await uploadResponse.json();
    console.error('Avatar upload error:', errorData);
    throw new Error(errorData?.error?.message || 'Failed to upload avatar');
  }

  // Step 2: Fetch updated user data with the new avatar
  const updatedUser = await fetchCurrentUser();
  if (!updatedUser) {
    throw new Error('Failed to fetch updated user data');
  }

  return updatedUser;
}

/**
 * Remove user avatar
 */
export async function removeUserAvatar(userId: number): Promise<UserData> {
  const token = getToken();
  if (!token) {
    throw new Error('Not authenticated');
  }

  // Update user to remove avatar reference
  const response = await fetch(`${STRAPI_URL}/api/users/${userId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ Avatar: null }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    console.error('Remove avatar error:', errorData);
    throw new Error(errorData?.error?.message || 'Failed to remove avatar');
  }

  // Fetch updated user data
  const updatedUser = await fetchCurrentUser();
  if (!updatedUser) {
    throw new Error('Failed to fetch updated user data');
  }

  return updatedUser;
}

/**
 * Log in with Google access token
 */
export async function loginWithGoogleToken(accessToken: string): Promise<AuthResponse> {
  try {
    const response = await fetch(`${STRAPI_URL}/api/auth/google/callback?access_token=${accessToken}`);
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData?.error?.message || 'Google authentication failed');
    }

    const responseData: AuthResponse = await response.json();
    setToken(responseData.jwt);
    
    // Fetch user with Avatar populated
    const userWithAvatar = await fetchCurrentUserWithToken(responseData.jwt);
    if (userWithAvatar) {
      responseData.user = userWithAvatar;
    }
    setUser(responseData.user);
    
    return responseData;
  } catch (error) {
    console.error('Google login error:', error);
    throw error;
  }
}

/**
 * Complete onboarding for a new Google user
 */
export async function completeGoogleOnboarding(data: { username: string, fullName?: string, Bio?: string }): Promise<UserData> {
  const token = getToken();
  const user = getUser();
  if (!token || !user) {
    throw new Error('Not authenticated');
  }

  // 1. Update user profile
  const response = await fetch(`${STRAPI_URL}/api/users/${user.id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({
      username: data.username,
      ...(data.fullName ? { fullName: data.fullName } : {}),
      ...(data.Bio ? { Bio: data.Bio } : {}),
    }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    if (errorData?.error?.message?.includes('username') || 
        errorData?.error?.message?.includes('unique') ||
        errorData?.error?.message?.includes('already')) {
      throw new Error('This username is already taken. Please choose a different one.');
    }
    throw new Error(errorData?.error?.message || 'Failed to complete onboarding');
  }

  const updatedUser: UserData = await response.json();
  setUser(updatedUser);

  // 2. Create the Author entry
  try {
    await createAuthorForUser(updatedUser, token);
  } catch (authorError) {
    console.error('Failed to create author for user:', authorError);
  }

  return updatedUser;
}