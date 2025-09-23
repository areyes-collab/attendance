'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { createDocument } from '@/lib/firebase';

const classroomSchema = z.object({
  name: z.string().min(1, 'Classroom name is required'),
  location: z.string().min(1, 'Location is required'),
});

type ClassroomFormData = z.infer<typeof classroomSchema>;

interface ClassroomFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export function ClassroomForm({ onSuccess, onCancel }: ClassroomFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ClassroomFormData>({
    resolver: zodResolver(classroomSchema),
  });

  const onSubmit = async (data: ClassroomFormData) => {
    setIsLoading(true);
    try {
      await createDocument('classrooms', data);
      
      onSuccess();
    } catch (error) {
      console.error('Error creating classroom:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Add New Classroom</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="name">Classroom Name</Label>
            <Input
              id="name"
              {...register('name')}
              placeholder="e.g., Room 101, Lab A"
            />
            {errors.name && (
              <p className="text-sm text-red-600">{errors.name.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              {...register('location')}
              placeholder="e.g., Building A, 2nd Floor"
            />
            {errors.location && (
              <p className="text-sm text-red-600">{errors.location.message}</p>
            )}
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="submit" disabled={isLoading} className="flex-1">
              {isLoading ? 'Creating...' : 'Create Classroom'}
            </Button>
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}