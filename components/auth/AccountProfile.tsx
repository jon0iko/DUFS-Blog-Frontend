'use client';

import React from 'react';
import { User, Mail, AtSign, Calendar } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/contexts/AuthContext';
import { formatDate } from '@/lib/utils';

export default function AccountProfile() {
  const { user, logout } = useAuth();

  if (!user) {
    return (
      <div className="text-center py-12">
        <p>Loading profile information...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="w-full">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle>Account Information</CardTitle>
            <Button 
              variant="outline" 
              size="sm" 
              className="text-destructive hover:bg-destructive/10"
              onClick={logout}
            >
              Sign Out
            </Button>
          </div>
          <CardDescription>Manage your account details</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center">
                <User className="h-6 w-6" />
              </div>
              <div>
                <p className="font-medium text-lg">{user.username}</p>
                <p className="text-sm text-muted-foreground">Member since {formatDate(user.createdAt)}</p>
              </div>
            </div>
            
            <Separator />
            
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Email</p>
                  <p>{user.email}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <AtSign className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Username</p>
                  <p>{user.username}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <Calendar className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Joined</p>
                  <p>{formatDate(user.createdAt)}</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <div className="flex justify-end">
        <Button variant="ghost" size="sm" className="text-muted-foreground">
          Delete Account
        </Button>
      </div>
    </div>
  );
}