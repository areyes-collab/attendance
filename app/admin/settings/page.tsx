'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { Sidebar } from '@/components/layout/sidebar';
import { Header } from '@/components/layout/header';
import { Settings, Save, Database, Clock, Bell, Shield } from 'lucide-react';

export default function SettingsPage() {
  const [settings, setSettings] = useState({
    // System Settings
    systemName: 'Teacher Attendance System',
    timezone: 'America/New_York',
    dateFormat: 'MM/DD/YYYY',
    timeFormat: '12',
    
    // Attendance Settings
    defaultGracePeriod: 10,
    autoMarkAbsent: true,
    absentThreshold: 15,
    allowManualEntry: true,
    
    // Notification Settings
    emailNotifications: true,
    lateArrivalNotification: true,
    absentNotification: true,
    weeklyReports: true,
    
    // Security Settings
    sessionTimeout: 30,
    passwordMinLength: 8,
    requirePasswordChange: false,
    twoFactorAuth: false,
  });

  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // In a real app, this would save to the database
      await new Promise(resolve => setTimeout(resolve, 1000));
      alert('Settings saved successfully!');
    } catch (error) {
      console.error('Error saving settings:', error);
      alert('Error saving settings. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleInputChange = (key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar userRole="admin" />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header userName="Admin User" userRole="admin" />
        
        <main className="flex-1 overflow-y-auto p-6">
          <div className="space-y-6 max-w-4xl">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">System Settings</h1>
                <p className="text-gray-600">Configure system preferences and behavior</p>
              </div>
              <Button onClick={handleSave} disabled={isSaving}>
                <Save className="h-4 w-4 mr-2" />
                {isSaving ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>

            {/* System Configuration */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  System Configuration
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="systemName">System Name</Label>
                    <Input
                      id="systemName"
                      value={settings.systemName}
                      onChange={(e) => handleInputChange('systemName', e.target.value)}
                    />
                  </div>

                  <div>
                    <Label htmlFor="timezone">Timezone</Label>
                    <Select
                      value={settings.timezone}
                      onChange={(e) => handleInputChange('timezone', e.target.value)}
                    >
                      <option value="America/New_York">Eastern Time</option>
                      <option value="America/Chicago">Central Time</option>
                      <option value="America/Denver">Mountain Time</option>
                      <option value="America/Los_Angeles">Pacific Time</option>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="dateFormat">Date Format</Label>
                    <Select
                      value={settings.dateFormat}
                      onChange={(e) => handleInputChange('dateFormat', e.target.value)}
                    >
                      <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                      <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                      <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="timeFormat">Time Format</Label>
                    <Select
                      value={settings.timeFormat}
                      onChange={(e) => handleInputChange('timeFormat', e.target.value)}
                    >
                      <option value="12">12 Hour (AM/PM)</option>
                      <option value="24">24 Hour</option>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Attendance Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Attendance Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="defaultGracePeriod">Default Grace Period (minutes)</Label>
                    <Input
                      id="defaultGracePeriod"
                      type="number"
                      min="0"
                      max="60"
                      value={settings.defaultGracePeriod}
                      onChange={(e) => handleInputChange('defaultGracePeriod', parseInt(e.target.value))}
                    />
                  </div>

                  <div>
                    <Label htmlFor="absentThreshold">Auto-mark Absent After (minutes)</Label>
                    <Input
                      id="absentThreshold"
                      type="number"
                      min="5"
                      max="120"
                      value={settings.absentThreshold}
                      onChange={(e) => handleInputChange('absentThreshold', parseInt(e.target.value))}
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="autoMarkAbsent"
                      checked={settings.autoMarkAbsent}
                      onChange={(e) => handleInputChange('autoMarkAbsent', e.target.checked)}
                      className="rounded border-gray-300"
                    />
                    <Label htmlFor="autoMarkAbsent">Automatically mark teachers as absent</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="allowManualEntry"
                      checked={settings.allowManualEntry}
                      onChange={(e) => handleInputChange('allowManualEntry', e.target.checked)}
                      className="rounded border-gray-300"
                    />
                    <Label htmlFor="allowManualEntry">Allow manual attendance entry</Label>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Notification Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  Notification Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="emailNotifications"
                      checked={settings.emailNotifications}
                      onChange={(e) => handleInputChange('emailNotifications', e.target.checked)}
                      className="rounded border-gray-300"
                    />
                    <Label htmlFor="emailNotifications">Enable email notifications</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="lateArrivalNotification"
                      checked={settings.lateArrivalNotification}
                      onChange={(e) => handleInputChange('lateArrivalNotification', e.target.checked)}
                      className="rounded border-gray-300"
                    />
                    <Label htmlFor="lateArrivalNotification">Notify on late arrivals</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="absentNotification"
                      checked={settings.absentNotification}
                      onChange={(e) => handleInputChange('absentNotification', e.target.checked)}
                      className="rounded border-gray-300"
                    />
                    <Label htmlFor="absentNotification">Notify on absences</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="weeklyReports"
                      checked={settings.weeklyReports}
                      onChange={(e) => handleInputChange('weeklyReports', e.target.checked)}
                      className="rounded border-gray-300"
                    />
                    <Label htmlFor="weeklyReports">Send weekly attendance reports</Label>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Security Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Security Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="sessionTimeout">Session Timeout (minutes)</Label>
                    <Input
                      id="sessionTimeout"
                      type="number"
                      min="5"
                      max="480"
                      value={settings.sessionTimeout}
                      onChange={(e) => handleInputChange('sessionTimeout', parseInt(e.target.value))}
                    />
                  </div>

                  <div>
                    <Label htmlFor="passwordMinLength">Minimum Password Length</Label>
                    <Input
                      id="passwordMinLength"
                      type="number"
                      min="6"
                      max="32"
                      value={settings.passwordMinLength}
                      onChange={(e) => handleInputChange('passwordMinLength', parseInt(e.target.value))}
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="requirePasswordChange"
                      checked={settings.requirePasswordChange}
                      onChange={(e) => handleInputChange('requirePasswordChange', e.target.checked)}
                      className="rounded border-gray-300"
                    />
                    <Label htmlFor="requirePasswordChange">Require periodic password changes</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="twoFactorAuth"
                      checked={settings.twoFactorAuth}
                      onChange={(e) => handleInputChange('twoFactorAuth', e.target.checked)}
                      className="rounded border-gray-300"
                    />
                    <Label htmlFor="twoFactorAuth">Enable two-factor authentication</Label>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Database Management */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5" />
                  Database Management
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-4">
                  <Button variant="outline">
                    <Database className="h-4 w-4 mr-2" />
                    Backup Database
                  </Button>
                  <Button variant="outline">
                    <Database className="h-4 w-4 mr-2" />
                    Export Data
                  </Button>
                  <Button variant="destructive">
                    <Database className="h-4 w-4 mr-2" />
                    Clear Old Records
                  </Button>
                </div>
                <p className="text-sm text-gray-600">
                  Manage your database with backup, export, and cleanup operations.
                </p>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}