'use client';

import React, { useState, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { useGoogleLogin } from '@react-oauth/google';
import { useRouter, useSearchParams } from 'next/navigation';
import { loginWithGoogleToken, getAuthorForCurrentUser } from '@/lib/auth';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/components/ui/toast';

/**
 * Helper to get a high-quality version of the Google profile picture.
 * Google's default URL usually ends in '=s96-c' (96x96).
 * Replacing it with '=s400-c' gives a 400x400 image.
 */
const getHighResGoogleAvatar = (url: string) => {
  if (!url) return '';
  // Replace the size parameter (e.g., =s96-c) with a larger one
  return url.replace(/=s\d+-c/, '=s400-c');
};

export default function GoogleAuthButton({ isSignUp = false }: { isSignUp?: boolean }) {
  const [isLoading, setIsLoading] = useState(false);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { refreshUser } = useAuth();
  const toast = useToast();

  const login = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setIsLoading(true);
      try {
        // 1. Fetch user profile from Google to get name and picture
        // We do this manually to get high-quality info for onboarding
        const userInfoRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
        });
        
        if (!userInfoRes.ok) {
          throw new Error('Failed to fetch user info from Google');
        }
        
        const userInfo = await userInfoRes.json();
        const highResPicture = getHighResGoogleAvatar(userInfo.picture);
        
        // 2. Log in to Strapi using the Google access token
        let authResponse;
        try {
          authResponse = await loginWithGoogleToken(tokenResponse.access_token);
        } catch (strapiError: any) {
          // Check for specific Strapi errors (like email already taken)
          const errorMessage = strapiError?.message || '';
          if (errorMessage.toLowerCase().includes('email') || errorMessage.toLowerCase().includes('taken')) {
            toast.error(
              'An account with this email already exists. Please sign in with your password instead.',
              'Account Conflict'
            );
          } else {
            throw strapiError;
          }
          setIsLoading(false);
          return;
        }
        
        if (!authResponse || !authResponse.jwt) {
          throw new Error('Failed to authenticate with Strapi using Google token.');
        }

        // Update AuthContext with the new user
        await refreshUser();
        
        // 3. Check if user has an Author entry
        const author = await getAuthorForCurrentUser();
        
        if (author) {
          // Existing user with author profile completed
          const redirectUrl = searchParams.get('redirect') || '/';
          startTransition(() => {
            router.push(redirectUrl);
          });
          toast.success('Welcome back!', 'Authentication Successful');
        } else {
          // New user needing onboarding - Store info for the signup page
          if (typeof window !== 'undefined') {
            sessionStorage.setItem('google_name', userInfo.name || '');
            sessionStorage.setItem('google_picture', highResPicture || '');
            sessionStorage.setItem('google_email', userInfo.email || '');
          }
          startTransition(() => {
            router.push('/auth/signup?mode=google');
          });
        }
      } catch (error) {
        console.error('Google Auth Error:', error);
        toast.error(
          'Google authentication failed. Please try again or use another method.',
          'Authentication Error'
        );
      } finally {
        setIsLoading(false);
      }
    },
    onError: (error) => {
      console.error('Google Login Failed:', error);
      toast.error('Google login was cancelled or failed.', 'Authentication Error');
    }
  });

  return (
    <Button
      type="button"
      variant="outline"
      className="w-full bg-white/5 border-white/15 text-white hover:bg-white/10 hover:text-white font-semibold flex items-center justify-center gap-2 py-2 h-10 rounded-md transition-colors"
      onClick={() => login()}
      disabled={isLoading}
    >
      {isLoading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className="w-5 h-5">
          <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z" />
          <path fill="#FF3D00" d="m6.306 14.691 6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z" />
          <path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238A11.91 11.91 0 0 1 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z" />
          <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 0 1-4.087 5.571l.003-.002 6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z" />
        </svg>
      )}
      {isSignUp ? 'Sign up with Google' : 'Sign in with Google'}
    </Button>
  );
}
