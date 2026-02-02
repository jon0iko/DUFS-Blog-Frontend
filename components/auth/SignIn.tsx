'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Form, FormGroup, FormLabel } from '@/components/ui/form';
import { LoginData } from '@/lib/auth';
import { LogIn } from 'lucide-react';

export default function SignIn() {
  const { login, isLoading } = useAuth();
  const [formData, setFormData] = useState<LoginData>({
    identifier: '',
    password: '',
  });
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
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
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
      <div className="space-y-2">
        <h2 className="text-2xl font-bold text-foreground tracking-tight">Welcome Back</h2>
        <p className="text-sm text-muted-foreground">
          Sign in to your account to continue
        </p>
      </div>
      
      <Form onSubmit={handleSubmit} className="space-y-4">
        {errors.form && (
          <div className="p-3 bg-destructive/10 border border-destructive rounded-lg">
            <p className="text-sm font-medium text-destructive">{errors.form}</p>
          </div>
        )}
        
        <FormGroup error={errors.identifier}>
          <FormLabel htmlFor="identifier" className="text-foreground font-semibold">
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
            className="mt-1 bg-background border-border text-foreground placeholder:text-muted-foreground focus:ring-brand-accent focus:border-brand-accent"
          />
          {errors.identifier && (
            <p className="mt-1 text-xs text-destructive">{errors.identifier}</p>
          )}
        </FormGroup>
        
        <FormGroup error={errors.password}>
          <div className="flex items-center justify-between">
            <FormLabel htmlFor="password" className="text-foreground font-semibold">
              Password
            </FormLabel>
            <Link 
              href="/auth/forgot-password" 
              className="text-xs text-brand-accent hover:underline font-medium"
            >
              Forgot password?
            </Link>
          </div>
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Enter your password"
            disabled={isLoading}
            className="mt-1 bg-background border-border text-foreground placeholder:text-muted-foreground focus:ring-brand-accent focus:border-brand-accent"
          />
          {errors.password && (
            <p className="mt-1 text-xs text-destructive">{errors.password}</p>
          )}
        </FormGroup>
        
        <Button 
          type="submit" 
          className="w-full mt-6 bg-brand-accent hover:bg-brand-accent/90 text-white font-semibold py-2 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
          disabled={isLoading}
        >
          <LogIn className="h-4 w-4" />
          {isLoading ? 'Signing in...' : 'Sign In'}
        </Button>
      </Form>
      
      <div className="pt-4 border-t border-border">
        <p className="text-sm text-muted-foreground text-center">
          Don&apos;t have an account?{' '}
          <Link href="/auth/signup" className="text-brand-accent font-semibold hover:underline transition-colors duration-200">
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  );
}