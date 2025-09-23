'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Sidebar } from '@/components/layout/sidebar';
import { Header } from '@/components/layout/header';
import { UserCheck, Clock, Calendar, Filter, Download } from 'lucide-react';
import { getDocuments } from '@/lib/firebase';

export default function AttendancePage() {
  const [attendanceLogs, setAttendanceLogs] = useState<any[]>([]);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [classrooms, setClassrooms] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState({
    teacher: '',
    classroom: '',
    status: '',
    date: '',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [teachers, classrooms] = await Promise.all([
        getDocuments('teachers'),
        getDocuments('classrooms'),
      ]);

      setTeachers(teachers);
      setClassrooms(classrooms);

      // Fetch attendance logs from Firestore
      const allLogs = await getDocuments('attendance_logs');
      const logs = allLogs
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, 100);

      // Enrich logs with teacher and classroom data
      const enrichedLogs = logs.map((log: any) => {
        const teacher = teachers.find(t => t.id === log.teacher_id);
        const classroom = classrooms.find(c => c.id === log.classroom_id);
        return {
          ...log,
          teacher,
          classroom
        };
      });

      setAttendanceLogs(enrichedLogs);
    } catch (error) {
      console.error('Error fetching attendance data:', error);
    } finally {
      setIsLoading(false);
    }
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

  const getScanTypeBadge = (scanType: string) => {
    return (
      <Badge variant={scanType === 'in' ? 'default' : 'outline'}>
        {scanType === 'in' ? 'Scan In' : 'Scan Out'}
      </Badge>
    );
  };

  const filteredLogs = attendanceLogs.filter(log => {
    if (filters.teacher && log.teacher_id !== filters.teacher) return false;
    if (filters.classroom && log.classroom_id !== filters.classroom) return false;
    if (filters.status && log.status !== filters.status) return false;
    if (filters.date && log.date !== filters.date) return false;
    return true;
  });

  if (isLoading) {
    return (
      <div className="flex h-screen bg-gray-100">
        <Sidebar userRole="admin" />
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
      <Sidebar userRole="admin" />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header userName="Admin User" userRole="admin" />
        
        <main className="flex-1 overflow-y-auto p-6">
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Attendance Records</h1>
                <p className="text-gray-600">View and manage teacher attendance logs</p>
              </div>
              <Button variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Export Data
              </Button>
            </div>

            {/* Filters */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Filter className="h-5 w-5" />
                  Filters
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <Label htmlFor="teacher-filter">Teacher</Label>
                    <Select
                      value={filters.teacher}
                      onChange={(e) => setFilters({...filters, teacher: e.target.value})}
                    >
                      <option value="">All Teachers</option>
                      {teachers.map((teacher) => (
                        <option key={teacher.id} value={teacher.id}>
                          {teacher.name}
                        </option>
                      ))}
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="classroom-filter">Classroom</Label>
                    <Select
                      value={filters.classroom}
                      onChange={(e) => setFilters({...filters, classroom: e.target.value})}
                    >
                      <option value="">All Classrooms</option>
                      {classrooms.map((classroom) => (
                        <option key={classroom.id} value={classroom.id}>
                          {classroom.name}
                        </option>
                      ))}
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="status-filter">Status</Label>
                    <Select
                      value={filters.status}
                      onChange={(e) => setFilters({...filters, status: e.target.value})}
                    >
                      <option value="">All Statuses</option>
                      <option value="on_time">On Time</option>
                      <option value="late">Late</option>
                      <option value="early_leave">Early Leave</option>
                      <option value="absent">Absent</option>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="date-filter">Date</Label>
                    <Input
                      id="date-filter"
                      type="date"
                      value={filters.date}
                      onChange={(e) => setFilters({...filters, date: e.target.value})}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Attendance Logs */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UserCheck className="h-5 w-5" />
                  Attendance Logs ({filteredLogs.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredLogs.map((log) => (
                    <div key={log.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-medium">{log.teacher?.name}</h3>
                          {getStatusBadge(log.status)}
                          {getScanTypeBadge(log.scan_type)}
                        </div>
                        <div className="text-sm text-gray-600 space-y-1">
                          <p className="flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            {new Date(log.date).toLocaleDateString('en-US', {
                              weekday: 'long',
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                            })}
                          </p>
                          <p className="flex items-center gap-2">
                            <Clock className="h-4 w-4" />
                            {new Date(`2000-01-01T${log.scan_time}`).toLocaleTimeString('en-US', {
                              hour: 'numeric',
                              minute: '2-digit',
                              hour12: true,
                            })}
                          </p>
                          <p>{log.classroom?.name} - {log.classroom?.location}</p>
                        </div>
                      </div>
                    </div>
                  ))}

                  {filteredLogs.length === 0 && (
                    <div className="text-center py-12">
                      <UserCheck className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No attendance records found</h3>
                      <p className="text-gray-600">Try adjusting your filters or check back later.</p>
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