import Navbar from '@/components/Navbar';
import { getCurrentUser } from '@/lib/auth';
import { getAllUsers, getAllCourses } from '@/lib/db/queries';
import { redirect } from 'next/navigation';
import UserManagementClient from './UserManagementClient';

export default async function AdminUsersPage() {
  const user = await getCurrentUser();
  if (!user || user.role !== 'admin') redirect('/login');

  const usersList = await getAllUsers();
  const coursesList = await getAllCourses();

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100">
      <Navbar user={user} />
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        <UserManagementClient users={usersList as any} courses={coursesList as any} />
      </main>
    </div>
  );
}
