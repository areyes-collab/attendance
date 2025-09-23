'use client';

import { useState } from 'react';
import { logout } from '@/lib/logout';
import { useRouter } from 'next/navigation';
import { Bell, User, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { NotificationCenter } from '@/components/notifications/notification-center';
import Link from 'next/link';

interface HeaderProps {
  userName: string;
  userRole: 'admin' | 'teacher';
  userId?: string;
  unreadNotifications?: number;
}

export function Header({ userName, userRole, userId = 'user-1', unreadNotifications = 0 }: HeaderProps) {
  const [showNotifications, setShowNotifications] = useState(false);
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  return (
    <>
      <header className="flex h-16 items-center justify-between border-b bg-white px-6">
      <div>
        <h2 className="text-lg font-semibold text-gray-900">
          Welcome back, {userName}
        </h2>
        <p className="text-sm text-gray-500">
          {new Date().toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
        </p>
      </div>
      
      <div className="flex items-center gap-4">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => setShowNotifications(true)}
          className="relative"
        >
          <Bell className="h-5 w-5" />
          {unreadNotifications > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center text-xs p-0"
            >
              {unreadNotifications > 9 ? '9+' : unreadNotifications}
            </Badge>
          )}
        </Button>
        <Link href={`/${userRole}/profile`}>
          <Button variant="ghost" size="icon">
          <User className="h-5 w-5" />
        </Button>
        </Link>
        <Button variant="ghost" size="icon" onClick={handleLogout}>
          <LogOut className="h-5 w-5" />
        </Button>
      </div>
    </header>
      
      <NotificationCenter
        userId={userId}
        userRole={userRole}
        isOpen={showNotifications}
        onClose={() => setShowNotifications(false)}
      />
    </>
  );
}