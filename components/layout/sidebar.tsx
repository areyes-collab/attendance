'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Users, 
  Calendar, 
  MapPin, 
  BarChart3, 
  Settings, 
  Clock,
  UserCheck,
  Shield,
  User
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { AdminSendNotification } from '@/components/admin/admin-send-notification';
import { SendNotificationButton } from '@/components/admin/send-notification-button';
import { Bell } from 'lucide-react';


type NavItem = {
  href: string;
  icon: any;
  label: string;
  isNotification?: boolean;
};

interface SidebarProps {
  userRole: 'admin' | 'teacher';
}

export function Sidebar({ userRole }: SidebarProps) {
  const pathname = usePathname();

  const adminNavItems: NavItem[] = [
    { href: '/admin', icon: BarChart3, label: 'Dashboard' },
    { href: '/admin/scan', icon: UserCheck, label: 'RFID Scanner' },
    { href: '/admin/teachers', icon: Users, label: 'Teachers' },
    { href: '/admin/classrooms', icon: MapPin, label: 'Classrooms' },
    { href: '/admin/schedules', icon: Calendar, label: 'Schedules' },
    { href: '/admin/attendance', icon: UserCheck, label: 'Attendance' },
    { href: '/admin/reports', icon: BarChart3, label: 'Reports' },
    { href: '/admin/profile', icon: User, label: 'Profile' },
    { href: '/admin/settings', icon: Settings, label: 'Settings' },
  ];

  const teacherNavItems: NavItem[] = [
    { href: '/teacher', icon: Clock, label: 'Dashboard' },
    { href: '/teacher/schedule', icon: Calendar, label: 'My Schedule' },
    { href: '/teacher/attendance', icon: BarChart3, label: 'My Attendance' },
    { href: '/teacher/profile', icon: User, label: 'Profile' },
  ];

  const navItems: NavItem[] = userRole === 'admin' ? [
    ...adminNavItems,
  { href: '#', icon: Bell, label: 'Send Notification', isNotification: true }
  ] : teacherNavItems;

  return (
    <div className="flex h-full w-64 flex-col bg-gray-900 text-white overflow-y-auto">
      <div className="flex items-center gap-2 p-6">
        <Shield className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-xl font-bold">AttendanceTracker</h1>
          <p className="text-sm text-gray-400 capitalize">{userRole} Panel</p>
        </div>
      </div>
      <nav className="space-y-1 px-4">
        {navItems.map((item) => {
          if (item.isNotification) {
            return (
              <button
                key="notification"
                type="button"
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors w-full',
                  'text-gray-300 hover:bg-gray-800 hover:text-white'
                )}
                onClick={() => {
                  const event = new CustomEvent('openSendNotificationModal');
                  window.dispatchEvent(event);
                }}
                aria-label="Send Notification"
              >
                <Bell className="h-5 w-5" />
                {item.label}
              </button>
            );
          }
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary text-white'
                  : 'text-gray-300 hover:bg-gray-800 hover:text-white'
              )}
            >
              <item.icon className="h-5 w-5" />
              {item.label}
            </Link>
          );
        })}
      </nav>
      {userRole === 'admin' && <SendNotificationButton />}
  {/* Notification sender modal, always rendered for admin */}
  {/* Only the Bell icon sidebar item triggers the modal */}
    </div>
  );
}