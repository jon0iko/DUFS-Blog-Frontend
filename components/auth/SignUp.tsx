'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Form, FormGroup, FormLabel, FormDescription } from '@/components/ui/form';
import { RegisterData } from '@/lib/auth';
import { UserPlus, Lock, Mail, User, Phone, Globe } from 'lucide-react';
import { COUNTRIES, validatePhoneNumber } from '@/lib/phone-validation';

export default function SignUp() {
  const { register, isLoading } = useAuth();
  const [formData, setFormData] = useState<RegisterData>({
    username: '',
    email: '',
    password: '',
    phoneNumber: '',
    Country: '',
  });
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
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

    // Country validation
    if (!formData.Country) {
      newErrors.Country = 'Country is required';
    }

    // Phone number validation
    if (!formData.phoneNumber) {
      newErrors.phoneNumber = 'Phone number is required';
    } else if (!validatePhoneNumber(formData.phoneNumber, formData.Country)) {
      newErrors.phoneNumber = `Invalid phone number for ${COUNTRIES.find(c => c.code === formData.Country)?.name || 'selected country'}`;
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    try {
      await register(formData);
    } catch (error) {
      console.error('Registration error:', error);
      // Set a general form error
      setErrors((prev) => ({ 
        ...prev, 
        form: 'Registration failed. This email or username might already be in use.'
      }));
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold text-foreground tracking-tight">Join Our Community</h2>
        <p className="text-sm text-muted-foreground">
          Create an account to start sharing your film insights
        </p>
      </div>
      
      <Form onSubmit={handleSubmit} className="space-y-4">
        {errors.form && (
          <div className="p-3 bg-destructive/10 border border-destructive rounded-lg">
            <p className="text-sm font-medium text-destructive">{errors.form}</p>
          </div>
        )}
        
        <FormGroup error={errors.username}>
          <FormLabel htmlFor="username" className="text-foreground font-semibold flex items-center gap-2">
            <User className="h-4 w-4 text-brand-accent" />
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
            disabled={isLoading}
            className="mt-1 bg-background border-border text-foreground placeholder:text-muted-foreground focus:ring-brand-accent focus:border-brand-accent"
          />
        </FormGroup>
        
        <FormGroup error={errors.email}>
          <FormLabel htmlFor="email" className="text-foreground font-semibold flex items-center gap-2">
            <Mail className="h-4 w-4 text-brand-accent" />
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
            disabled={isLoading}
            className="mt-1 bg-background border-border text-foreground placeholder:text-muted-foreground focus:ring-brand-accent focus:border-brand-accent"
          />
        </FormGroup>

        <FormGroup error={errors.Country}>
          <FormLabel htmlFor="Country" className="text-foreground font-semibold flex items-center gap-2">
            <Globe className="h-4 w-4 text-brand-accent" />
            Country
          </FormLabel>
          <select
            id="Country"
            name="Country"
            value={formData.Country}
            onChange={handleChange}
            disabled={isLoading}
            className="mt-1 w-full px-3 py-2 bg-background border border-border text-foreground rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-accent focus:border-brand-accent placeholder:text-muted-foreground"
          >
            <option value="">Select your country</option>
            {COUNTRIES.map((country) => (
              <option key={country.code} value={country.code}>
                {country.flag} {country.name}
              </option>
            ))}
          </select>
        </FormGroup>

        <FormGroup error={errors.phoneNumber}>
          <FormLabel htmlFor="phoneNumber" className="text-foreground font-semibold flex items-center gap-2">
            <Phone className="h-4 w-4 text-brand-accent" />
            Phone Number
          </FormLabel>
          <Input
            id="phoneNumber"
            name="phoneNumber"
            type="tel"
            value={formData.phoneNumber}
            onChange={handleChange}
            placeholder={formData.Country ? "Enter your phone number" : "Select a country first"}
            disabled={isLoading || !formData.Country}
            className="mt-1 bg-background border-border text-foreground placeholder:text-muted-foreground focus:ring-brand-accent focus:border-brand-accent"
          />
          <FormDescription className="mt-1 text-xs text-muted-foreground">
            Enter a valid phone number for your country
          </FormDescription>
        </FormGroup>
        
        <FormGroup error={errors.password}>
          <FormLabel htmlFor="password" className="text-foreground font-semibold flex items-center gap-2">
            <Lock className="h-4 w-4 text-brand-accent" />
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
            disabled={isLoading}
            className="mt-1 bg-background border-border text-foreground placeholder:text-muted-foreground focus:ring-brand-accent focus:border-brand-accent"
          />
          <FormDescription className="mt-1 text-xs text-muted-foreground">
            Must be at least 8 characters long
          </FormDescription>
        </FormGroup>
        
        <FormGroup error={errors.confirmPassword}>
          <FormLabel htmlFor="confirmPassword" className="text-foreground font-semibold flex items-center gap-2">
            <Lock className="h-4 w-4 text-brand-accent" />
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
            disabled={isLoading}
            className="mt-1 bg-background border-border text-foreground placeholder:text-muted-foreground focus:ring-brand-accent focus:border-brand-accent"
          />
        </FormGroup>
        
        <Button 
          type="submit" 
          className="w-full mt-6 bg-brand-accent hover:bg-brand-accent/90 text-white font-semibold py-2 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
          disabled={isLoading}
        >
          <UserPlus className="h-4 w-4" />
          {isLoading ? 'Creating account...' : 'Create Account'}
        </Button>
      </Form>
      
      <div className="pt-4 border-t border-border">
        <p className="text-sm text-muted-foreground text-center">
          Already have an account?{' '}
          <Link href="/auth/signin" className="text-brand-accent font-semibold hover:underline transition-colors duration-200">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}