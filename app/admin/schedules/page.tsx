'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Sidebar } from '@/components/layout/sidebar';
import { Header } from '@/components/layout/header';
import { ScheduleForm } from '@/components/admin/schedule-form';
import { Plus, Edit, Trash2, Calendar, Clock } from 'lucide-react';
import { subscribeToCollection, deleteDocument } from '@/lib/firebase';
import { formatTime, getDayName } from '@/lib/utils';

export default function SchedulesPage() {
  const [schedules, setSchedules] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [classrooms, setClassrooms] = useState<any[]>([]);

  useEffect(() => {
    // Subscribe to teachers
    const unsubscribeTeachers = subscribeToCollection('teachers', (data) => {
      setTeachers(data);
    });

    // Subscribe to classrooms
    const unsubscribeClassrooms = subscribeToCollection('classrooms', (data) => {
      setClassrooms(data);
    });

    // Subscribe to schedules
    const unsubscribeSchedules = subscribeToCollection('schedules', (data) => {
      // Enrich schedules with teacher and classroom data
      const enrichedSchedules = data.map((schedule: any) => {
        const teacher = teachers.find(t => t.id === schedule.teacher_id);
        const classroom = classrooms.find(c => c.id === schedule.classroom_id);
        
        return {
          ...schedule,
          teacher,
          classroom
        };
      });

      const sortedSchedules = enrichedSchedules.sort((a, b) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
      setSchedules(sortedSchedules);
      setIsLoading(false);
    });

    return () => {
      unsubscribeTeachers();
      unsubscribeClassrooms();
      unsubscribeSchedules();
    };
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this schedule?')) return;

    try {
      await deleteDocument('schedules', id);
    } catch (error) {
      console.error('Error deleting schedule:', error);
    }
  };

  const handleFormSuccess = () => {
    setShowForm(false);
  };

  if (isLoading) {
    return (
      <div className="flex h-screen bg-gray-100">
        <Sidebar userRole="admin" />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading schedules...</p>
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
                <h1 className="text-2xl font-bold text-gray-900">Schedules</h1>
                <p className="text-gray-600">Manage teacher class schedules and timings</p>
              </div>
              <Button onClick={() => setShowForm(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Schedule
              </Button>
            </div>

            {showForm && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <ScheduleForm
                  onSuccess={handleFormSuccess}
                  onCancel={() => setShowForm(false)}
                />
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {schedules.map((schedule) => (
                <Card key={schedule.id}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{schedule.teacher?.name}</CardTitle>
                      <Calendar className="h-5 w-5 text-gray-400" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {schedule.classroom?.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {schedule.classroom?.location}
                        </p>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">
                          {getDayName(schedule.day_of_week)}
                        </Badge>
                        <Badge variant="secondary">
                          Grace: {schedule.grace_period_minutes}min
                        </Badge>
                      </div>
                      
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Clock className="h-4 w-4" />
                        <span>
                          {formatTime(schedule.start_time)} - {formatTime(schedule.end_time)}
                        </span>
                      </div>
                      
                      <p className="text-xs text-gray-500">
                        Created: {new Date(schedule.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    
                    <div className="flex gap-2 mt-4">
                      <Button size="sm" variant="outline" className="flex-1">
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDelete(schedule.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {schedules.length === 0 && (
              <Card>
                <CardContent className="text-center py-12">
                  <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No schedules found</h3>
                  <p className="text-gray-600 mb-4">Get started by creating your first schedule.</p>
                  <Button onClick={() => setShowForm(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Schedule
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}