"use client";
import { useEffect, useState } from "react";
import { Sidebar } from '@/components/layout/sidebar';
import { Header } from '@/components/layout/header';
import { subscribeToCollection } from '@/lib/firebase';
import { where } from 'firebase/firestore';

const MOCK_TEACHER_ID = 'teacher-1';

export default function TeacherSchedulePage() {
	const [schedules, setSchedules] = useState<any[]>([]);
	const [classrooms, setClassrooms] = useState<any[]>([]);
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		// Subscribe to classrooms
		const unsubscribeClassrooms = subscribeToCollection('classrooms', (data) => {
			setClassrooms(data);
		});

		// Subscribe to teacher's schedules
		const unsubscribeSchedules = subscribeToCollection(
			'schedules',
			(data) => {
				setSchedules(data);
				setIsLoading(false);
			},
			[where('teacher_id', '==', MOCK_TEACHER_ID)]
		);

		return () => {
			unsubscribeClassrooms();
			unsubscribeSchedules();
		};
	}, []);

	const getClassroomName = (classroomId: string) => {
		const classroom = classrooms.find((c) => c.id === classroomId);
		return classroom ? classroom.name : classroomId;
	};

	const daysOfWeek = [
		'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'
	];

	return (
		<div className="flex h-screen bg-gray-100">
			<Sidebar userRole="teacher" />
			<div className="flex-1 flex flex-col overflow-hidden">
				<Header userName="John Doe" userRole="teacher" />
				<main className="flex-1 overflow-y-auto p-6">
					<div className="max-w-4xl mx-auto space-y-6">
						<h1 className="text-2xl font-bold text-gray-900">My Schedule</h1>
						<p className="text-gray-600">View your class schedule here.</p>
						{isLoading ? (
							<div>Loading schedule...</div>
						) : schedules.length === 0 ? (
							<div className="text-gray-500">No schedule found.</div>
						) : (
							<div className="overflow-x-auto">
								<table className="min-w-full bg-white rounded shadow">
									<thead>
										<tr>
											<th className="px-4 py-2 border">Day</th>
											<th className="px-4 py-2 border">Time</th>
											<th className="px-4 py-2 border">Classroom</th>
										</tr>
									</thead>
									<tbody>
										{schedules.map((sched) => (
											<tr key={sched.id}>
												<td className="px-4 py-2 border">{daysOfWeek[sched.day_of_week]}</td>
												<td className="px-4 py-2 border">{sched.start_time} - {sched.end_time}</td>
												<td className="px-4 py-2 border">{getClassroomName(sched.classroom_id)}</td>
											</tr>
										))}
									</tbody>
								</table>
							</div>
						)}
					</div>
				</main>
			</div>
		</div>
	);
}