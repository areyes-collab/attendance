"use client";
import { Sidebar } from '@/components/layout/sidebar';
import { Header } from '@/components/layout/header';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Bell } from 'lucide-react';
import { AdminSendNotification } from '@/components/admin/admin-send-notification';

export default function NotificationPage() {
  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar userRole="admin" />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header userName="Admin User" userRole="admin" />
        <main className="flex-1 overflow-y-auto p-6">
          <div className="space-y-6 max-w-4xl">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Send Notification</h1>
                <p className="text-gray-600">Send a notification to teachers</p>
              </div>
            </div>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  Notification Sender
                </CardTitle>
              </CardHeader>
              <CardContent>
                <AdminSendNotification />
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}
