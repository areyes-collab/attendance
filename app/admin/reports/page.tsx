'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Sidebar } from '@/components/layout/sidebar';
import { Header } from '@/components/layout/header';
import { BarChart3, Download, Calendar, TrendingUp, Users, Clock } from 'lucide-react';
import { getDocuments } from '@/lib/firebase';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';

export default function ReportsPage() {
  const [teachers, setTeachers] = useState<any[]>([]);
  const [attendanceData, setAttendanceData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [reportType, setReportType] = useState('overview');
  const [selectedTeacher, setSelectedTeacher] = useState('');
  const [dateRange, setDateRange] = useState({
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    fetchData();
  }, [dateRange]);

  const fetchData = async () => {
    try {
      const teachers = await getDocuments('teachers');
      setTeachers(teachers);

      // Fetch attendance logs and filter by date range
      const allLogs = await getDocuments('attendance_logs');
      const filteredLogs = allLogs.filter(log => 
        log.date >= dateRange.start && log.date <= dateRange.end
      );

      setAttendanceData(filteredLogs);
    } catch (error) {
      console.error('Error fetching report data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getOverviewStats = () => {
    const totalScans = attendanceData.length;
    const onTimeCount = attendanceData.filter(log => log.status === 'on_time' && log.scan_type === 'in').length;
    const lateCount = attendanceData.filter(log => log.status === 'late').length;
    const absentCount = attendanceData.filter(log => log.status === 'absent').length;
    const earlyLeaveCount = attendanceData.filter(log => log.status === 'early_leave').length;

    return {
      totalScans,
      onTimeCount,
      lateCount,
      absentCount,
      earlyLeaveCount,
      punctualityRate: totalScans > 0 ? Math.round((onTimeCount / totalScans) * 100) : 0
    };
  };

  const getWeeklyData = () => {
    const weeklyStats = {};
    attendanceData.forEach(log => {
      const date = new Date(log.date);
      const weekStart = new Date(date.setDate(date.getDate() - date.getDay()));
      const weekKey = weekStart.toISOString().split('T')[0];
      
      if (!weeklyStats[weekKey]) {
        weeklyStats[weekKey] = { week: weekKey, onTime: 0, late: 0, absent: 0 };
      }
      
      if (log.scan_type === 'in') {
        weeklyStats[weekKey][log.status === 'on_time' ? 'onTime' : log.status]++;
      }
    });

    return Object.values(weeklyStats).slice(-8);
  };

  const getStatusDistribution = () => {
    const stats = getOverviewStats();
    return [
      { name: 'On Time', value: stats.onTimeCount, color: '#66BB6A' },
      { name: 'Late', value: stats.lateCount, color: '#FFD700' },
      { name: 'Absent', value: stats.absentCount, color: '#D32F2F' },
      { name: 'Early Leave', value: stats.earlyLeaveCount, color: '#1976D2' },
    ].filter(item => item.value > 0);
  };

  const getTeacherStats = () => {
    const teacherStats = {};
    
    attendanceData.forEach(log => {
      if (!teacherStats[log.teacher_id]) {
        const teacher = teachers.find(t => t.id === log.teacher_id);
        teacherStats[log.teacher_id] = {
          name: teacher?.name || 'Unknown',
          onTime: 0,
          late: 0,
          absent: 0,
          total: 0
        };
      }
      
      if (log.scan_type === 'in') {
        teacherStats[log.teacher_id][log.status === 'on_time' ? 'onTime' : log.status]++;
        teacherStats[log.teacher_id].total++;
      }
    });

    return Object.values(teacherStats).map((stats: any) => ({
      ...stats,
      punctualityRate: stats.total > 0 ? Math.round((stats.onTime / stats.total) * 100) : 0
    }));
  };

  const stats = getOverviewStats();
  const weeklyData = getWeeklyData();
  const statusDistribution = getStatusDistribution();
  const teacherStats = getTeacherStats();

  if (isLoading) {
    return (
      <div className="flex h-screen bg-gray-100">
        <Sidebar userRole="admin" />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading reports...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar userRole="admin" />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header userName="Admin User" userRole="admin" />
        
        <main className="flex-1 overflow-y-auto p-6">
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Reports & Analytics</h1>
                <p className="text-gray-600">Comprehensive attendance insights and statistics</p>
              </div>
              <Button variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Export Report
              </Button>
            </div>

            {/* Filters */}
            <Card>
              <CardHeader>
                <CardTitle>Report Filters</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="report-type">Report Type</Label>
                    <Select
                      value={reportType}
                      onChange={(e) => setReportType(e.target.value)}
                    >
                      <option value="overview">Overview</option>
                      <option value="teacher">Teacher Performance</option>
                      <option value="trends">Trends Analysis</option>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="start-date">Start Date</Label>
                    <Input
                      id="start-date"
                      type="date"
                      value={dateRange.start}
                      onChange={(e) => setDateRange({...dateRange, start: e.target.value})}
                    />
                  </div>

                  <div>
                    <Label htmlFor="end-date">End Date</Label>
                    <Input
                      id="end-date"
                      type="date"
                      value={dateRange.end}
                      onChange={(e) => setDateRange({...dateRange, end: e.target.value})}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Overview Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Scans</CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalScans}</div>
                  <p className="text-xs text-muted-foreground">In selected period</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">On Time</CardTitle>
                  <TrendingUp className="h-4 w-4 text-success" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-success">{stats.onTimeCount}</div>
                  <p className="text-xs text-muted-foreground">{stats.punctualityRate}% punctuality rate</p>
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
                  <Users className="h-4 w-4 text-destructive" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-destructive">{stats.absentCount}</div>
                  <p className="text-xs text-muted-foreground">Requires attention</p>
                </CardContent>
              </Card>
            </div>

            {/* Charts */}
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

              {/* Status Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle>Attendance Status Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={statusDistribution}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {statusDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* Teacher Performance */}
            <Card>
              <CardHeader>
                <CardTitle>Teacher Performance Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {teacherStats.map((teacher, index) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <h3 className="font-medium">{teacher.name}</h3>
                        <div className="flex gap-4 mt-2 text-sm">
                          <span className="text-green-600">On Time: {teacher.onTime}</span>
                          <span className="text-yellow-600">Late: {teacher.late}</span>
                          <span className="text-red-600">Absent: {teacher.absent}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant={teacher.punctualityRate >= 90 ? 'success' : teacher.punctualityRate >= 70 ? 'warning' : 'destructive'}>
                          {teacher.punctualityRate}% Punctual
                        </Badge>
                        <p className="text-xs text-gray-500 mt-1">
                          Total: {teacher.total} classes
                        </p>
                      </div>
                    </div>
                  ))}

                  {teacherStats.length === 0 && (
                    <div className="text-center py-8">
                      <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600">No teacher data available for the selected period.</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}