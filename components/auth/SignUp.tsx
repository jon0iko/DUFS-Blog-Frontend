'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Form, FormGroup, FormLabel, FormDescription } from '@/components/ui/form';
import { RegisterData, register as registerApi, uploadUserAvatar, completeGoogleOnboarding } from '@/lib/auth';
import { UserPlus, Lock, Mail, User, Camera, X as XIcon, ImageIcon, FileText } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import AvatarCropModal from './AvatarCropModal';
import { useToast } from '@/components/ui/toast';
import GoogleAuthButton from './GoogleAuthButton';
import { fetchAndValidateGoogleAvatar, createAvatarFile, revokeAvatarUrl } from '@/lib/google-avatar-handler';

export default function SignUp() {
  const { refreshUser } = useAuth();
  const toast = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  const isGoogleMode = searchParams.get('mode') === 'google';

  const [formData, setFormData] = useState<RegisterData>({
    username: '',
    email: '',
    password: '',
    Bio: '',
  });
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [googleName, setGoogleName] = useState('');
  const [googlePictureUrl, setGooglePictureUrl] = useState('');

  // ─── Avatar state ─────────────────────────────────────────────────────────
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const [rawImageSrc, setRawImageSrc] = useState<string | null>(null);
  const [rawFileName, setRawFileName] = useState<string>('avatar.png');
  const [showCropModal, setShowCropModal] = useState(false);
  const [croppedAvatarFile, setCroppedAvatarFile] = useState<File | null>(null);
  const [avatarPreviewUrl, setAvatarPreviewUrl] = useState<string | null>(null);
  const [avatarPreviewError, setAvatarPreviewError] = useState(false);

  useEffect(() => {
    if (isGoogleMode && typeof window !== 'undefined') {
      const name = sessionStorage.getItem('google_name') || '';
      const picture = sessionStorage.getItem('google_picture') || '';
      setGoogleName(name);
      setGooglePictureUrl(picture);
      if (picture && !avatarPreviewUrl) {
        setAvatarPreviewUrl(picture);
        setAvatarPreviewError(false);
      }
    }
  }, [isGoogleMode, avatarPreviewUrl]);

  // Cleanup: revoke blob URLs on unmount or when preview changes
  useEffect(() => {
    return () => {
      // Clean up blob URLs created by canvas operations (but not Google picture URLs)
      if (avatarPreviewUrl && avatarPreviewUrl.startsWith('blob:')) {
        revokeAvatarUrl(avatarPreviewUrl);
      }
    };
  }, [avatarPreviewUrl]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (name === 'confirmPassword') {
      setConfirmPassword(value);
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
    
    // Clear error when user types
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    // Username validation
    if (!formData.username) {
      newErrors.username = 'Username is required';
    } else if (formData.username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters';
    }
    
    if (!isGoogleMode) {
      // Email validation
      if (!formData.email) {
        newErrors.email = 'Email is required';
      } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
        newErrors.email = 'Please enter a valid email address';
      }
      
      // Password validation
      if (!formData.password) {
        newErrors.password = 'Password is required';
      } else if (formData.password.length < 8) {
        newErrors.password = 'Password must be at least 8 characters';
      }
      
      // Confirm password validation
      if (formData.password !== confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ─── Avatar handlers ───────────────────────────────────────────────────────

  const handleAvatarInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrors((prev) => ({ ...prev, avatar: 'Please select an image file' }));
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setErrors((prev) => ({ ...prev, avatar: 'Image must be under 10 MB' }));
      return;
    }

    setRawFileName(file.name);
    const reader = new FileReader();
    reader.onload = () => {
      setRawImageSrc(reader.result as string);
      setShowCropModal(true);
    };
    reader.readAsDataURL(file);
    // Reset so same file can be re-selected
    e.target.value = '';
  };

  const handleCropComplete = useCallback((file: File) => {
    setCroppedAvatarFile(file);
    const previewUrl = URL.createObjectURL(file);
    setAvatarPreviewUrl(previewUrl);
    setAvatarPreviewError(false);
    setShowCropModal(false);
    setRawImageSrc(null);
    setErrors((prev) => ({ ...prev, avatar: '' }));
  }, []);

  const handleCropCancel = useCallback(() => {
    setShowCropModal(false);
    setRawImageSrc(null);
  }, []);

  const handleRemoveAvatar = () => {
    setCroppedAvatarFile(null);
    // Only revoke blob: URLs (data URLs created by canvas operations)
    // Keep direct image URLs intact for Google pictures
    if (avatarPreviewUrl && avatarPreviewUrl.startsWith('blob:')) {
      revokeAvatarUrl(avatarPreviewUrl);
    }
    // Revert to google picture if available
    setAvatarPreviewUrl(isGoogleMode && googlePictureUrl ? googlePictureUrl : null);
  };

  // ─── Form submit ───────────────────────────────────────────────────────────

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      let userId: number | undefined;

      if (isGoogleMode) {
        // Complete Google Onboarding
        const response = await completeGoogleOnboarding({
          username: formData.username,
          fullName: googleName,
          Bio: formData.Bio,
        });
        userId = response.id;
        
        if (!croppedAvatarFile && googlePictureUrl && userId) {
          try {
            // Fetch, validate, and re-encode Google avatar with production-grade handling
            const { blob } = await fetchAndValidateGoogleAvatar(googlePictureUrl);
            
            if (blob.size > 0) {
              // Create properly-formatted file for upload
              const file = createAvatarFile(blob, userId, 'image/png');
              await uploadUserAvatar(userId, file);
            } else {
              console.warn('Google avatar validation resulted in empty blob.');
            }
          } catch (avatarErr) {
            console.error('Google avatar fetch/upload failed (non-fatal):', avatarErr);
            // Non-blocking error: continue signup even if avatar fails
          }
        }
        
        // Clear Google data from session storage
        if (typeof window !== 'undefined') {
          sessionStorage.removeItem('google_name');
          sessionStorage.removeItem('google_picture');
          sessionStorage.removeItem('google_email');
        }
      } else {
        // Standard Registration
        const response = await registerApi(formData);
        userId = response.user?.id;
      }

      // Upload avatar if one was cropped
      if (croppedAvatarFile && userId) {
        try {
          await uploadUserAvatar(userId, croppedAvatarFile);
        } catch (avatarErr) {
          console.error('Avatar upload failed (non-fatal):', avatarErr);
          toast.warning(
            'You can retry adding it from your Account Settings page.',
            'Profile photo upload failed'
          );
        }
      }

      // Sync AuthContext state
      await refreshUser();

      // Navigate
      const redirectUrl = searchParams.get('redirect') || '/';
      router.push(redirectUrl);
    } catch (error) {
      console.error('Registration error:', error);
      setErrors((prev) => ({
        ...prev,
        form: error instanceof Error ? error.message : 'Registration failed. Please try again.',
      }));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {/* Crop modal – rendered above the auth card */}
      {showCropModal && rawImageSrc && (
        <AvatarCropModal
          imageSrc={rawImageSrc}
          fileName={rawFileName}
          onCropComplete={handleCropComplete}
          onCancel={handleCropCancel}
        />
      )}

      <div className="space-y-6">
      <div className="space-y-2 text-center">
        <h2 className="text-2xl font-black text-white tracking-tight uppercase">
          {isGoogleMode ? 'Complete Your Profile' : 'Join DUFS Community'}
        </h2>
        <p className="text-sm text-white/80">
          {isGoogleMode ? 'Almost there! Choose a username.' : 'Create an account'}
        </p>
      </div>

      {!isGoogleMode && (
        <>
          <GoogleAuthButton isSignUp />
          
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/10"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase tracking-widest">
              <span className="bg-black px-2 text-white/50">Or continue with email</span>
            </div>
          </div>
        </>
      )}

      <Form onSubmit={handleSubmit} className="space-y-4">
        {errors.form && (
          <div className="p-3 bg-destructive/10 border border-destructive rounded-lg">
            <p className="text-sm font-medium text-destructive">{errors.form}</p>
          </div>
        )}

        {/* ─── Avatar upload ─── */}
        <div className="flex flex-col items-center gap-3 py-2">
          <div className="relative group">
            {/* Circle preview / placeholder */}
            <div
              className="w-24 h-24 rounded-full overflow-hidden ring-2 ring-white/20 group-hover:ring-white/40 transition-all duration-200 cursor-pointer bg-white/5 flex items-center justify-center"
              onClick={() => avatarInputRef.current?.click()}
              title="Choose a profile photo"
            >
              {avatarPreviewUrl && !avatarPreviewError ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={avatarPreviewUrl}
                  alt="Avatar preview"
                  className="w-full h-full object-cover"
                  crossOrigin="anonymous"
                  referrerPolicy="no-referrer"
                  onError={() => setAvatarPreviewError(true)}
                  onLoad={() => setAvatarPreviewError(false)}
                />
              ) : (
                <ImageIcon className="h-8 w-8 text-white/20" />
              )}
            </div>

            {/* Camera button */}
            <button
              type="button"
              onClick={() => avatarInputRef.current?.click()}
              className="absolute bottom-0 right-0 w-7 h-7 rounded-full bg-white text-black flex items-center justify-center shadow-lg hover:bg-white/90 transition-colors"
              title="Upload photo"
            >
              <Camera className="h-3.5 w-3.5" />
            </button>

            {/* Remove button */}
            {croppedAvatarFile && (
              <button
                type="button"
                onClick={handleRemoveAvatar}
                className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center shadow-md hover:bg-red-400 transition-colors"
                title="Remove photo"
              >
                <XIcon className="h-3 w-3" />
              </button>
            )}
          </div>

          <div className="text-center">
            <p className="text-xs font-semibold text-white/50 uppercase tracking-wide">
              {croppedAvatarFile ? 'Photo selected ✓' : 'Profile Photo'}
            </p>
            <p className="text-xs text-white/70 mt-0.5">
              {croppedAvatarFile ? (
                <button
                  type="button"
                  onClick={() => avatarInputRef.current?.click()}
                  className="text-white/50 hover:text-white/70 underline transition-colors"
                >
                  Change photo
                </button>
              ) : (
                'Optional · click to upload'
              )}
            </p>
          </div>

          {errors.avatar && (
            <p className="text-xs text-destructive">{errors.avatar}</p>
          )}

          <input
            ref={avatarInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleAvatarInputChange}
            tabIndex={-1}
          />
        </div>

        {isGoogleMode && (
          <FormGroup>
            <FormLabel htmlFor="googleName" className="text-white/80 font-semibold flex items-center gap-2 tracking-wide uppercase text-xs">
              <User className="h-4 w-4 text-white/60" />
              Full Name
            </FormLabel>
            <Input
              id="googleName"
              type="text"
              value={googleName}
              onChange={(e) => setGoogleName(e.target.value)}
              placeholder="Enter your full name"
              disabled={isSubmitting}
              className="mt-1 bg-white/5 border-white/15 text-white placeholder:text-white-50 focus:ring-white/30 focus:border-white/30 rounded-md"
            />
          </FormGroup>
        )}

        <FormGroup error={errors.username}>
          <FormLabel htmlFor="username" className="text-white/80 font-semibold flex items-center gap-2 tracking-wide uppercase text-xs">
            <User className="h-4 w-4 text-white/60" />
            Username
          </FormLabel>
          <Input
            id="username"
            name="username"
            type="text"
            autoComplete="username"
            value={formData.username}
            onChange={handleChange}
            placeholder="This will be your author name"
            disabled={isSubmitting}
            className="mt-1 bg-white/5 border-white/15 text-white placeholder:text-white-50 focus:ring-white/30 focus:border-white/30 rounded-md"
          />
        </FormGroup>

        {!isGoogleMode && (
          <FormGroup error={errors.email}>
            <FormLabel htmlFor="email" className="text-white/80 font-semibold flex items-center gap-2 tracking-wide uppercase text-xs">
              <Mail className="h-4 w-4 text-white/60" />
              Email Address
            </FormLabel>
            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email address"
              disabled={isSubmitting}
              className="mt-1 bg-white/5 border-white/15 text-white placeholder:text-white-50 focus:ring-white/30 focus:border-white/30 rounded-md"
            />
          </FormGroup>
        )}
        
        {/* ─── Bio ─── */}
        <FormGroup>
          <FormLabel htmlFor="Bio" className="text-white/80 font-semibold flex items-center gap-2 tracking-wide uppercase text-xs">
            <FileText className="h-4 w-4 text-white/60" />
            Bio (Optional)
          </FormLabel>
          <Textarea
            id="Bio"
            name="Bio"
            value={formData.Bio}
            onChange={handleChange}
            placeholder="Tell readers a little about yourself…"
            disabled={isSubmitting}
            rows={3}
            maxLength={500}
            className="mt-1 bg-white/5 border-white/15 text-white placeholder:text-white-50 focus:ring-white/30 focus:border-white/30 rounded-md resize-none"
          />
          <FormDescription className="mt-1 text-xs text-white/60 flex justify-between">
            <span>Shown on your author profile</span>
            <span>{(formData.Bio?.length ?? 0)}/500</span>
          </FormDescription>
        </FormGroup>

        {!isGoogleMode && (
          <>
            <FormGroup error={errors.password}>
              <FormLabel htmlFor="password" className="text-white/80 font-semibold flex items-center gap-2 tracking-wide uppercase text-xs">
                <Lock className="h-4 w-4 text-white/60" />
                Password
              </FormLabel>
              <Input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Create a strong password"
                disabled={isSubmitting}
                className="mt-1 bg-white/5 border-white/15 text-white placeholder:text-white-50 focus:ring-white/30 focus:border-white/30 rounded-md"
              />
              <FormDescription className="mt-1 text-xs text-white/30">
                Must be at least 8 characters long
              </FormDescription>
            </FormGroup>
            
            <FormGroup error={errors.confirmPassword}>
              <FormLabel htmlFor="confirmPassword" className="text-white/80 font-semibold flex items-center gap-2 tracking-wide uppercase text-xs">
                <Lock className="h-4 w-4 text-white/60" />
                Confirm Password
              </FormLabel>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                value={confirmPassword}
                onChange={handleChange}
                placeholder="Confirm your password"
                disabled={isSubmitting}
                className="mt-1 bg-white/5 border-white/15 text-white placeholder:text-white-50 focus:ring-white/30 focus:border-white/30 rounded-md"
              />
            </FormGroup>
          </>
        )}
        
        <Button
          type="submit"
          className="w-full mt-6 bg-white hover:bg-white/90 text-black font-black uppercase tracking-widest py-2 rounded-md transition-colors duration-200 flex items-center justify-center gap-2 text-sm"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
              </svg>
              {isGoogleMode ? 'Completing...' : 'Creating account...'}
            </>
          ) : (
            <>
              <UserPlus className="h-4 w-4" />
              {isGoogleMode ? 'Complete Setup' : 'Create Account'}
            </>
          )}
        </Button>
      </Form>
      
      <div className="pt-4 border-t border-white/10 mt-6">
        <p className="text-sm text-white/50 text-center">
          Already have an account?{' '}<span className="md:hidden"><br /></span>
          <Link href="/auth/signin" className="text-white font-bold underline hover:no-underline transition-colors duration-200">
            Sign In
          </Link>
        </p>
      </div>
    </div>
    </>
  );
}
