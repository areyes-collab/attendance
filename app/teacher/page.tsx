"use client";
import { useEffect, useState } from "react";
import { Sidebar } from '@/components/layout/sidebar';
import { Header } from '@/components/layout/header';
import { subscribeToCollection } from '@/lib/firebase';
import { where } from 'firebase/firestore';

const MOCK_TEACHER_ID = 'teacher-1';

export default function TeacherPage() {
	const [schedules, setSchedules] = useState<any[]>([]);
	const [classrooms, setClassrooms] = useState<any[]>([]);
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		const unsubscribeClassrooms = subscribeToCollection('classrooms', (data) => {
			setClassrooms(data);
		});
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

	// Today's and next class logic
	const today = new Date();
	const todayDay = today.getDay();
	const nowTime = today.toTimeString().slice(0,5);
	const todayClasses = schedules.filter(s => s.day_of_week === todayDay);
	const nextClass = todayClasses
		.filter(s => s.start_time >= nowTime)
		.sort((a, b) => a.start_time.localeCompare(b.start_time))[0];
	const weekStart = new Date(today);
	weekStart.setDate(today.getDate() - today.getDay());
	const weekEnd = new Date(weekStart);
	weekEnd.setDate(weekStart.getDate() + 6);
	const weekClasses = schedules.filter(s => {
		// All classes in this week (by day_of_week)
		return s.day_of_week >= weekStart.getDay() && s.day_of_week <= weekEnd.getDay();
	});
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
						<h1 className="text-2xl font-bold text-gray-900">Teacher Dashboard</h1>
						<p className="text-gray-600">Welcome to your dashboard. Use the sidebar to navigate your portal features.</p>
						{isLoading ? (
							<div>Loading dashboard data...</div>
						) : (
							<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
								<div className="bg-white rounded shadow p-4">
									<h2 className="font-semibold text-lg mb-2">Next Class</h2>
									{nextClass ? (
										<div>
											<div className="text-primary font-bold">{daysOfWeek[nextClass.day_of_week]}</div>
											<div>{nextClass.start_time} - {nextClass.end_time}</div>
											<div>Room: {getClassroomName(nextClass.classroom_id)}</div>
										</div>
									) : (
										<div className="text-gray-500">No more classes today</div>
									)}
								</div>
								<div className="bg-white rounded shadow p-4">
									<h2 className="font-semibold text-lg mb-2">Today's Schedule</h2>
									{todayClasses.length > 0 ? (
										<ul className="space-y-1">
											{todayClasses.map((c) => (
												<li key={c.id}>
													<span className="font-medium">{c.start_time}-{c.end_time}</span> — Room: {getClassroomName(c.classroom_id)}
												</li>
											))}
										</ul>
									) : (
										<div className="text-gray-500">No classes scheduled for today</div>
									)}
								</div>
								<div className="bg-white rounded shadow p-4">
									<h2 className="font-semibold text-lg mb-2">This Week</h2>
									<div className="text-3xl font-bold text-primary">{weekClasses.length}</div>
									<div className="text-gray-500">Total classes this week</div>
								</div>
							</div>
						)}
					</div>
				</main>
			</div>
		</div>
	);
}