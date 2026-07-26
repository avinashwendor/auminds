import { getCurrentUser } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { getAllCourses, getCourseFullTree } from '@/lib/db/queries';
import Navbar from '@/components/Navbar';
import QuizManagementClient from './QuizManagementClient';

export default async function AdminQuizzesPage() {
  const session = await getCurrentUser();
  if (!session || session.role !== 'admin') redirect('/login');
  const baseCourses = await getAllCourses();
  const courses = await Promise.all(baseCourses.map(async (course: any) => (await getCourseFullTree(course.id)) || { ...course, modules: [] }));
  return (
    <div className="min-h-screen bg-background text-foreground flex">
      <Navbar user={session} />
      <main className="min-h-screen p-6 md:p-10 w-full">
        <QuizManagementClient courses={courses} />
      </main>
    </div>
  );
}
