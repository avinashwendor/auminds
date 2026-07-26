import { getCurrentUser } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { getAllCourses, getCourseFullTree } from '@/lib/db/queries';
import Navbar from '@/components/Navbar';
import CourseManagementClient from './CourseManagementClient';

export default async function AdminCoursesPage() {
  const session = await getCurrentUser();
  if (!session || session.role !== 'admin') redirect('/login');
  const baseCourses = await getAllCourses();
  const courses = await Promise.all(baseCourses.map(async (course: any) => (await getCourseFullTree(course.id)) || { ...course, modules: [] }));
  return <div className="min-h-screen bg-background text-foreground"><Navbar user={session} /><main className="mx-auto max-w-7xl p-4 sm:p-6 lg:p-8"><CourseManagementClient initialCourses={courses} /></main></div>;
}
