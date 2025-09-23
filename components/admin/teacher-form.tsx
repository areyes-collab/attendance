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

const teacherSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  rfid_id: z.string().min(1, 'RFID ID is required'),
});

type TeacherFormData = z.infer<typeof teacherSchema>;

interface TeacherFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export function TeacherForm({ onSuccess, onCancel }: TeacherFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<TeacherFormData>({
    resolver: zodResolver(teacherSchema),
  });

  const onSubmit = async (data: TeacherFormData) => {
    setIsLoading(true);
    try {
      await createDocument('teachers', data);
      
      onSuccess();
    } catch (error) {
      console.error('Error creating teacher:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Add New Teacher</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              {...register('name')}
              placeholder="Enter teacher's full name"
            />
            {errors.name && (
              <p className="text-sm text-red-600">{errors.name.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              {...register('email')}
              placeholder="Enter email address"
            />
            {errors.email && (
              <p className="text-sm text-red-600">{errors.email.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="rfid_id">RFID ID</Label>
            <Input
              id="rfid_id"
              {...register('rfid_id')}
              placeholder="Enter RFID card ID"
            />
            {errors.rfid_id && (
              <p className="text-sm text-red-600">{errors.rfid_id.message}</p>
            )}
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="submit" disabled={isLoading} className="flex-1">
              {isLoading ? 'Creating...' : 'Create Teacher'}
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