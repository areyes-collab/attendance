'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Sidebar } from '@/components/layout/sidebar';
import { Header } from '@/components/layout/header';
import { Users, MapPin, Calendar, UserCheck, Clock, TrendingUp } from 'lucide-react';
import { AdminSendNotification } from '@/components/admin/admin-send-notification';
import { subscribeToCollection } from '@/lib/firebase';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalTeachers: 0,
    totalClassrooms: 0,
    totalSchedules: 0,
    todayAttendance: 0,
  });
  const [recentAttendance, setRecentAttendance] = useState<any[]>([]);
  const [attendanceChart, setAttendanceChart] = useState<any[]>([]);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [classrooms, setClassrooms] = useState<any[]>([]);

  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];

    // Subscribe to teachers
    const unsubscribeTeachers = subscribeToCollection('teachers', (data) => {
      setTeachers(data);
      setStats(prev => ({ ...prev, totalTeachers: data.length }));
    });

    // Subscribe to classrooms
    const unsubscribeClassrooms = subscribeToCollection('classrooms', (data) => {
      setClassrooms(data);
      setStats(prev => ({ ...prev, totalClassrooms: data.length }));
    });

    // Subscribe to schedules
    const unsubscribeSchedules = subscribeToCollection('schedules', (data) => {
      setStats(prev => ({ ...prev, totalSchedules: data.length }));
    });

    // Subscribe to attendance logs
    const unsubscribeAttendance = subscribeToCollection('attendance_logs', (data) => {
      // Filter today's attendance
      const todayAttendance = data.filter(log => log.date === today);
      setStats(prev => ({ ...prev, todayAttendance: todayAttendance.length }));

      // Get recent attendance (last 10)
      const recentLogs = data
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, 10);
      
      // Enrich with teacher and classroom data
      const enrichedLogs = recentLogs.map((log: any) => {
        const teacher = teachers.find(t => t.id === log.teacher_id);
        const classroom = classrooms.find(c => c.id === log.classroom_id);
        
        return {
          ...log,
          teacher: teacher || null,
          classroom: classroom || null
        };
      });

      setRecentAttendance(enrichedLogs);

      // Generate sample chart data (in real app, this would be calculated from actual data)
      const chartData = [
        { day: 'Mon', onTime: 45, late: 8, absent: 2 },
        { day: 'Tue', onTime: 42, late: 10, absent: 3 },
        { day: 'Wed', onTime: 48, late: 5, absent: 2 },
        { day: 'Thu', onTime: 44, late: 9, absent: 2 },
        { day: 'Fri', onTime: 40, late: 12, absent: 3 },
      ];
      setAttendanceChart(chartData);
    });

    return () => {
      unsubscribeTeachers();
      unsubscribeClassrooms();
      unsubscribeSchedules();
      unsubscribeAttendance();
    };
  }, [teachers, classrooms]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'on_time':
        return <Badge variant="success">On Time</Badge>;
      case 'late':
        return <Badge variant="warning">Late</Badge>;
      case 'early_leave':
        return <Badge variant="warning">Early Leave</Badge>;
      case 'absent':
        return <Badge variant="destructive">Absent</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar userRole="admin" />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header userName="Admin User" userRole="admin" />
        
        <main className="flex-1 overflow-y-auto p-6">
          <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Teachers</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalTeachers}</div>
                  <p className="text-xs text-muted-foreground">Active teachers</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Classrooms</CardTitle>
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalClassrooms}</div>
                  <p className="text-xs text-muted-foreground">Available rooms</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Schedules</CardTitle>
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalSchedules}</div>
                  <p className="text-xs text-muted-foreground">Active schedules</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Today's Scans</CardTitle>
                  <UserCheck className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.todayAttendance}</div>
                  <p className="text-xs text-muted-foreground">RFID scans today</p>
                </CardContent>
              </Card>
            </div>

            {/* Charts and Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Attendance Chart temporarily removed due to React/Recharts type conflict */}

              {/* Recent Attendance */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    Recent Attendance
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentAttendance.map((log) => (
                      <div key={log.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium">{log.teacher?.name || 'Unknown Teacher'}</p>
                          <p className="text-sm text-gray-600">
                            {log.classroom?.name || 'Unknown Classroom'} - {log.scan_type === 'in' ? 'Scanned In' : 'Scanned Out'}
                          </p>
                          <p className="text-xs text-gray-500">
                            {new Date(`2000-01-01T${log.scan_time}`).toLocaleTimeString('en-US', {
                              hour: 'numeric',
                              minute: '2-digit',
                              hour12: true,
                            })}
                          </p>
                        </div>
                        <div>
                          {getStatusBadge(log.status)}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}