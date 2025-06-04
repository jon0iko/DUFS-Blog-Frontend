'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Form, FormGroup, FormLabel } from '@/components/ui/form';
import { LoginData } from '@/lib/auth';

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
    <div className="w-full max-w-md mx-auto p-6 space-y-8">
      <div className="text-center">
        <h1 className="text-2xl font-bold tracking-tight">Sign In</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Enter your credentials to access your account
        </p>
      </div>
      
      <Form onSubmit={handleSubmit} className="space-y-4">
        {errors.form && (
          <div className="p-3 bg-destructive/10 border border-destructive rounded-md">
            <p className="text-sm font-medium text-destructive">{errors.form}</p>
          </div>
        )}
        
        <FormGroup error={errors.identifier}>
          <FormLabel htmlFor="identifier">Email or Username</FormLabel>
          <Input
            id="identifier"
            name="identifier"
            type="text"
            autoComplete="username"
            value={formData.identifier}
            onChange={handleChange}
            placeholder="Enter your email or username"
            disabled={isLoading}
          />
        </FormGroup>
        
        <FormGroup error={errors.password}>
          <div className="flex items-center justify-between">
            <FormLabel htmlFor="password">Password</FormLabel>
            <Link 
              href="/auth/forgot-password" 
              className="text-sm font-medium text-primary hover:underline"
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
          />
        </FormGroup>
        
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? 'Signing in...' : 'Sign In'}
        </Button>
      </Form>
      
      <div className="text-center">
        <p className="text-sm text-muted-foreground">
          Don&apos;t have an account?{' '}
          <Link href="/auth/signup" className="text-primary font-medium hover:underline">
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  );
}