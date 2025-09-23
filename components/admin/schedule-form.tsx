'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getDocuments, createDocument } from '@/lib/firebase';
import { getDayName } from '@/lib/utils';

const scheduleSchema = z.object({
  teacher_id: z.string().min(1, 'Teacher is required'),
  classroom_id: z.string().min(1, 'Classroom is required'),
  day_of_week: z.number().min(0).max(6),
  start_time: z.string().min(1, 'Start time is required'),
  end_time: z.string().min(1, 'End time is required'),
  grace_period_minutes: z.number().min(0).max(60),
});

type ScheduleFormData = z.infer<typeof scheduleSchema>;

interface ScheduleFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export function ScheduleForm({ onSuccess, onCancel }: ScheduleFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [classrooms, setClassrooms] = useState<any[]>([]);
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<ScheduleFormData>({
    resolver: zodResolver(scheduleSchema),
    defaultValues: {
      grace_period_minutes: 10,
    },
  });

  useEffect(() => {
    fetchTeachersAndClassrooms();
  }, []);

  const fetchTeachersAndClassrooms = async () => {
    try {
      const [teachers, classrooms] = await Promise.all([
        getDocuments('teachers'),
        getDocuments('classrooms'),
      ]);

      setTeachers(teachers);
      setClassrooms(classrooms);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const onSubmit = async (data: ScheduleFormData) => {
    setIsLoading(true);
    try {
      await createDocument('schedules', data);
      
      onSuccess();
    } catch (error) {
      console.error('Error creating schedule:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Create Schedule</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="teacher_id">Teacher</Label>
            <Select
              {...register('teacher_id')}
              onChange={(e) => setValue('teacher_id', e.target.value)}
            >
              <option value="">Select a teacher</option>
              {teachers.map((teacher) => (
                <option key={teacher.id} value={teacher.id}>
                  {teacher.name}
                </option>
              ))}
            </Select>
            {errors.teacher_id && (
              <p className="text-sm text-red-600">{errors.teacher_id.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="classroom_id">Classroom</Label>
            <Select
              {...register('classroom_id')}
              onChange={(e) => setValue('classroom_id', e.target.value)}
            >
              <option value="">Select a classroom</option>
              {classrooms.map((classroom) => (
                <option key={classroom.id} value={classroom.id}>
                  {classroom.name} - {classroom.location}
                </option>
              ))}
            </Select>
            {errors.classroom_id && (
              <p className="text-sm text-red-600">{errors.classroom_id.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="day_of_week">Day of Week</Label>
            <Select
              {...register('day_of_week', { valueAsNumber: true })}
              onChange={(e) => setValue('day_of_week', parseInt(e.target.value))}
            >
              <option value="">Select a day</option>
              {[0, 1, 2, 3, 4, 5, 6].map((day) => (
                <option key={day} value={day}>
                  {getDayName(day)}
                </option>
              ))}
            </Select>
            {errors.day_of_week && (
              <p className="text-sm text-red-600">{errors.day_of_week.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="start_time">Start Time</Label>
              <Input
                id="start_time"
                type="time"
                {...register('start_time')}
              />
              {errors.start_time && (
                <p className="text-sm text-red-600">{errors.start_time.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="end_time">End Time</Label>
              <Input
                id="end_time"
                type="time"
                {...register('end_time')}
              />
              {errors.end_time && (
                <p className="text-sm text-red-600">{errors.end_time.message}</p>
              )}
            </div>
          </div>

          <div>
            <Label htmlFor="grace_period_minutes">Grace Period (minutes)</Label>
            <Input
              id="grace_period_minutes"
              type="number"
              min="0"
              max="60"
              {...register('grace_period_minutes', { valueAsNumber: true })}
            />
            {errors.grace_period_minutes && (
              <p className="text-sm text-red-600">{errors.grace_period_minutes.message}</p>
            )}
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="submit" disabled={isLoading} className="flex-1">
              {isLoading ? 'Creating...' : 'Create Schedule'}
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