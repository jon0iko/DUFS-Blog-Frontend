'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Form, FormGroup, FormLabel } from '@/components/ui/form';
import { LoginData } from '@/lib/auth';
import { Eye, EyeOff, LogIn } from 'lucide-react';
import GoogleAuthButton from './GoogleAuthButton';

export default function SignIn() {
  const { login, isLoading } = useAuth();
  const [formData, setFormData] = useState<LoginData>({
    identifier: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error when user types
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.identifier) {
      newErrors.identifier = 'Email or username is required';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    try {
      await login(formData);
    } catch (error) {
      console.error('Login error:', error);
      // Set a general form error
      setErrors((prev) => ({ 
        ...prev, 
        form: 'Invalid email/username or password' 
      }));
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center">
        <h2 className="text-2xl font-black text-white tracking-tight uppercase">Welcome Back</h2>
        <p className="text-sm text-white/80">
          Sign in to your account
        </p>
      </div>

      <GoogleAuthButton />

      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-white/10"></div>
        </div>
        <div className="relative flex justify-center text-xs uppercase tracking-widest">
          <span className="bg-black px-2 text-white/80">Or continue with</span>
        </div>
      </div>
      
      <Form onSubmit={handleSubmit} className="space-y-4">
        {errors.form && (
          <div className="p-3 bg-destructive/10 border border-destructive rounded-lg">
            <p className="text-sm font-medium text-destructive">{errors.form}</p>
          </div>
        )}
        
        <FormGroup error={errors.identifier}>
          <FormLabel htmlFor="identifier" className="text-white/80 font-semibold tracking-wide uppercase text-xs">
            Email or Username
          </FormLabel>
          <Input
            id="identifier"
            name="identifier"
            type="text"
            autoComplete="email"
            value={formData.identifier}
            onChange={handleChange}
            placeholder="Enter your email or username"
            disabled={isLoading}
            className="mt-1 bg-white/5 border-white/15 text-white placeholder:text-white/25 focus:ring-white/30 focus:border-white/30 rounded-md"
          />
          {errors.identifier && (
            <p className="mt-1 text-xs text-destructive">{errors.identifier}</p>
          )}
        </FormGroup>
        
        <FormGroup error={errors.password}>
          <div className="flex items-center justify-between">
            <FormLabel htmlFor="password" className="text-white/80 font-semibold tracking-wide uppercase text-xs">
              Password
            </FormLabel>
            <Link 
              href="/auth/forgot-password" 
              className="text-xs text-white/80 hover:text-white font-medium transition-colors duration-200"
            >
              Forgot password?
            </Link>
          </div>
          <div className="relative mt-1">
            <Input
              id="password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter your password"
              disabled={isLoading}
              className="bg-white/5 border-white/15 text-white placeholder:text-white/25 focus:[ring-white]/30 focus:border-white/30 pr-10 rounded-md mb-6"
            />
            <button
              type="button"
              className="absolute inset-y-0 right-0 flex items-center px-3 text-white/40 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30"
              onClick={() => setShowPassword((prev) => !prev)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {/* {errors.password && (
            <p className="mt-1 text-xs text-destructive">{errors.password}</p>
          )} */}
        </FormGroup>
        
        <Button 
          type="submit" 
          className="w-full mt-6 bg-white hover:bg-white/70 text-black font-black uppercase tracking-widest py-2 rounded-md transition-colors duration-200 flex items-center justify-center gap-2 text-sm"
          disabled={isLoading}
        >
          <LogIn className="h-4 w-4" />
          {isLoading ? 'Signing in...' : 'Sign In'}
        </Button>
      </Form>
      
      <div className="pt-4 border-t border-white/10 mt-6">
        <p className="text-sm text-white/80 text-center">
          Don&apos;t have an account?{' '}<span className="md:hidden"><br /></span>
          <Link href="/auth/signup" className="text-white font-bold underline hover:no-underline transition-colors duration-200">
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  );
}