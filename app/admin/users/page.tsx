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
    <div className="min-h-screen bg-background text-foreground flex">
      <Navbar user={user} />
      <main className="min-h-screen p-6 md:p-10 w-full">
        <UserManagementClient users={usersList as any} courses={coursesList as any} />
      </main>
    </div>
  );
}
