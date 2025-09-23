'use client';

import { useState } from 'react';
import { Sidebar } from '@/components/layout/sidebar';
import { Header } from '@/components/layout/header';
import { ProfileForm } from '@/components/profile/profile-form';
import { NotificationPreferencesComponent } from '@/components/notifications/notification-preferences';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { User, Bell, Shield, Key } from 'lucide-react';

// Mock teacher data - in real app, this would come from authentication
const MOCK_TEACHER = {
  id: 'teacher-1',
  name: 'John Doe',
  email: 'john.doe@school.edu',
  phone: '+1 (555) 987-6543',
  bio: 'Mathematics teacher with 10 years of experience.',
  profile_image: '',
  role: 'teacher' as const,
};

export default function TeacherProfilePage() {
  const [activeTab, setActiveTab] = useState<'profile' | 'notifications' | 'security'>('profile');

  const handleProfileUpdate = () => {
    // Refresh data or show success message
    console.log('Profile updated successfully');
  };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security', icon: Shield },
  ];

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar userRole="teacher" />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header userName="John Doe" userRole="teacher" />
        
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-4xl mx-auto space-y-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Profile Settings</h1>
              <p className="text-gray-600">Manage your account settings and preferences</p>
            </div>

            {/* Tab Navigation */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex space-x-1">
                  {tabs.map((tab) => (
                    <Button
                      key={tab.id}
                      variant={activeTab === tab.id ? 'default' : 'ghost'}
                      onClick={() => setActiveTab(tab.id as any)}
                      className="flex items-center gap-2"
                    >
                      <tab.icon className="h-4 w-4" />
                      {tab.label}
                    </Button>
                  ))}
                </div>
              </CardHeader>
            </Card>

            {/* Tab Content */}
            {activeTab === 'profile' && (
              <ProfileForm user={MOCK_TEACHER} onSuccess={handleProfileUpdate} />
            )}

            {activeTab === 'notifications' && (
              <NotificationPreferencesComponent userId={MOCK_TEACHER.id} />
            )}

            {activeTab === 'security' && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Key className="h-5 w-5" />
                    Security Settings
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <h3 className="font-medium text-secondary mb-2">Password Security</h3>
                      <p className="text-sm text-secondary/80 mb-3">
                        Keep your account secure by using a strong password and enabling two-factor authentication.
                      </p>
                      <div className="space-y-2">
                        <Button variant="outline" size="sm">
                          Change Password
                        </Button>
                        <Button variant="outline" size="sm">
                          Enable 2FA
                        </Button>
                      </div>
                    </div>

                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <h3 className="font-medium text-accent mb-2">Login Activity</h3>
                      <p className="text-sm text-accent/80 mb-3">
                        Monitor your account activity and manage active sessions.
                      </p>
                      <Button variant="outline" size="sm">
                        View Login History
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}