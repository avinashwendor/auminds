import Navbar from '@/components/Navbar';
import { getCurrentUser } from '@/lib/auth';
import { getAdminUserDirectory, getAllCourses } from '@/lib/db/queries';
import { redirect } from 'next/navigation';
import UserManagementClient from './UserManagementClient';

export default async function AdminUsersPage() {
  const user = await getCurrentUser();
  if (!user || user.role !== 'admin') redirect('/login');

  const [usersList, coursesList] = await Promise.all([
    getAdminUserDirectory(),
    getAllCourses(),
  ]);

  return (
    <div className="min-h-screen bg-[#0B0F17] text-white flex">
      <Navbar user={user} />
      <main className="min-h-screen p-6 md:p-10 w-full">
        <UserManagementClient users={usersList as any} courses={coursesList as any} />
      </main>
    </div>
  );
}
