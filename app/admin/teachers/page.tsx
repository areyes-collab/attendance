'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Sidebar } from '@/components/layout/sidebar';
import { Header } from '@/components/layout/header';
import { TeacherForm } from '@/components/admin/teacher-form';
import { Plus, Edit, Trash2, Users } from 'lucide-react';
import { subscribeToCollection, deleteDocument } from '@/lib/firebase';

export default function TeachersPage() {
  const [teachers, setTeachers] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Subscribe to teachers collection for real-time updates
    const unsubscribe = subscribeToCollection('teachers', (data) => {
      // Sort by created_at descending
      const sortedTeachers = data.sort((a, b) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
      setTeachers(sortedTeachers);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this teacher?')) return;

    try {
      await deleteDocument('teachers', id);
    } catch (error) {
      console.error('Error deleting teacher:', error);
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
            <p className="mt-4 text-gray-600">Loading teachers...</p>
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
                <h1 className="text-2xl font-bold text-gray-900">Teachers</h1>
                <p className="text-gray-600">Manage teacher accounts and RFID assignments</p>
              </div>
              <Button onClick={() => setShowForm(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Teacher
              </Button>
            </div>

            {showForm && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <TeacherForm
                  onSuccess={handleFormSuccess}
                  onCancel={() => setShowForm(false)}
                />
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {teachers.map((teacher) => (
                <Card key={teacher.id}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{teacher.name}</CardTitle>
                      <Users className="h-5 w-5 text-gray-400" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <p className="text-sm text-gray-600">
                        <strong>Email:</strong> {teacher.email}
                      </p>
                      <p className="text-sm text-gray-600">
                        <strong>RFID ID:</strong> {teacher.rfid_id}
                      </p>
                      <p className="text-xs text-gray-500">
                        Created: {new Date(teacher.created_at).toLocaleDateString()}
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
                        onClick={() => handleDelete(teacher.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {teachers.length === 0 && (
              <Card>
                <CardContent className="text-center py-12">
                  <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No teachers found</h3>
                  <p className="text-gray-600 mb-4">Get started by adding your first teacher.</p>
                  <Button onClick={() => setShowForm(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Teacher
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