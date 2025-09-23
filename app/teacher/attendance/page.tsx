'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { Sidebar } from '@/components/layout/sidebar';
import { Header } from '@/components/layout/header';
import { BarChart3, Calendar, Clock, TrendingUp } from 'lucide-react';
import { subscribeToCollection } from '@/lib/firebase';
import { where } from 'firebase/firestore';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// Mock teacher ID - in real app, this would come from authentication
const MOCK_TEACHER_ID = 'teacher-1';

export default function TeacherAttendancePage() {
  const [attendanceLogs, setAttendanceLogs] = useState<any[]>([]);
  const [classrooms, setClassrooms] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState({
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
  });

  useEffect(() => {
    // Subscribe to classrooms
    const unsubscribeClassrooms = subscribeToCollection('classrooms', (data) => {
      setClassrooms(data);
    });

    // Subscribe to teacher's attendance logs
    const unsubscribeAttendance = subscribeToCollection(
      'attendance_logs',
      (data) => {
        // Enrich logs with classroom data
        const enrichedLogs = data.map((log: any) => {
          const classroom = classrooms.find(c => c.id === log.classroom_id);
          return {
            ...log,
            classroom
          };
        });

        // Sort by date and time (most recent first)
        const sortedLogs = enrichedLogs.sort((a, b) => {
          const dateCompare = new Date(b.date).getTime() - new Date(a.date).getTime();
          if (dateCompare !== 0) return dateCompare;
          return b.scan_time.localeCompare(a.scan_time);
        });

        setAttendanceLogs(sortedLogs);
        setIsLoading(false);
      },
      [where('teacher_id', '==', MOCK_TEACHER_ID)]
    );

    return () => {
      unsubscribeClassrooms();
      unsubscribeAttendance();
    };
  }, [classrooms]);

  const getFilteredLogs = () => {
    return attendanceLogs.filter(log => {
      const logDate = new Date(log.date);
      return logDate.getMonth() + 1 === filters.month && 
             logDate.getFullYear() === filters.year;
    });
  };

  const getAttendanceStats = () => {
    const filteredLogs = getFilteredLogs();
    const scanInLogs = filteredLogs.filter(log => log.scan_type === 'in');
    
    const onTimeCount = scanInLogs.filter(log => log.status === 'on_time').length;
    const lateCount = scanInLogs.filter(log => log.status === 'late').length;
    const absentCount = scanInLogs.filter(log => log.status === 'absent').length;
    const totalClasses = onTimeCount + lateCount + absentCount;
    
    return {
      onTimeCount,
      lateCount,
      absentCount,
      totalClasses,
      punctualityRate: totalClasses > 0 ? Math.round((onTimeCount / totalClasses) * 100) : 0
    };
  };

  const getWeeklyData = () => {
    const filteredLogs = getFilteredLogs();
    const weeklyStats = {};
    
    filteredLogs.forEach(log => {
      if (log.scan_type === 'in') {
        const date = new Date(log.date);
        const weekStart = new Date(date.setDate(date.getDate() - date.getDay()));
        const weekKey = weekStart.toISOString().split('T')[0];
        
        if (!weeklyStats[weekKey]) {
          weeklyStats[weekKey] = { 
            week: `Week ${Math.ceil(date.getDate() / 7)}`, 
            onTime: 0, 
            late: 0, 
            absent: 0 
          };
        }
        
        weeklyStats[weekKey][log.status === 'on_time' ? 'onTime' : log.status]++;
      }
    });

    return Object.values(weeklyStats).slice(-4); // Last 4 weeks
  };

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

  const stats = getAttendanceStats();
  const weeklyData = getWeeklyData();
  const filteredLogs = getFilteredLogs().slice(0, 20); // Show last 20 records

  if (isLoading) {
    return (
      <div className="flex h-screen bg-gray-100">
        <Sidebar userRole="teacher" />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading attendance data...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar userRole="teacher" />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header userName="John Doe" userRole="teacher" />
        
        <main className="flex-1 overflow-y-auto p-6">
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">My Attendance</h1>
              <p className="text-gray-600">Track your attendance history and performance</p>
            </div>

            {/* Filters */}
            <Card>
              <CardHeader>
                <CardTitle>Filter by Period</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="month">Month</Label>
                    <Select
                      value={filters.month.toString()}
                      onChange={(e) => setFilters({...filters, month: parseInt(e.target.value)})}
                    >
                      {Array.from({length: 12}, (_, i) => (
                        <option key={i + 1} value={i + 1}>
                          {new Date(2024, i, 1).toLocaleString('default', { month: 'long' })}
                        </option>
                      ))}
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="year">Year</Label>
                    <Select
                      value={filters.year.toString()}
                      onChange={(e) => setFilters({...filters, year: parseInt(e.target.value)})}
                    >
                      <option value="2024">2024</option>
                      <option value="2023">2023</option>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Classes</CardTitle>
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalClasses}</div>
                  <p className="text-xs text-muted-foreground">This period</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">On Time</CardTitle>
                  <TrendingUp className="h-4 w-4 text-success" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-success">{stats.onTimeCount}</div>
                  <p className="text-xs text-muted-foreground">{stats.punctualityRate}% punctuality</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Late Arrivals</CardTitle>
                  <Clock className="h-4 w-4 text-secondary" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-secondary">{stats.lateCount}</div>
                  <p className="text-xs text-muted-foreground">Need improvement</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Absences</CardTitle>
                  <BarChart3 className="h-4 w-4 text-destructive" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-destructive">{stats.absentCount}</div>
                  <p className="text-xs text-muted-foreground">Missed classes</p>
                </CardContent>
              </Card>
            </div>

            {/* Charts and Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Weekly Trends */}
              <Card>
                <CardHeader>
                  <CardTitle>Weekly Attendance Trends</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={weeklyData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="week" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="onTime" fill="#66BB6A" name="On Time" />
                      <Bar dataKey="late" fill="#FFD700" name="Late" />
                      <Bar dataKey="absent" fill="#D32F2F" name="Absent" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Recent Attendance */}
              <Card>
                <CardHeader>
                  <CardTitle>Recent Attendance Records</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4 max-h-80 overflow-y-auto">
                    {filteredLogs.map((log) => (
                      <div key={log.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium">{log.classroom?.name}</p>
                          <p className="text-sm text-gray-600">
                            {log.scan_type === 'in' ? 'Scanned In' : 'Scanned Out'}
                          </p>
                          <p className="text-xs text-gray-500">
                            {new Date(log.date).toLocaleDateString()} at{' '}
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

                    {filteredLogs.length === 0 && (
                      <div className="text-center py-8">
                        <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-600">No attendance records found for this period.</p>
                      </div>
                    )}
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