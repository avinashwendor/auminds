import Navbar from '@/components/Navbar';
import { getCurrentUser } from '@/lib/auth';
import { getAdminStudentProgress } from '@/lib/db/admin-progress';
import { redirect } from 'next/navigation';
import StudentProgressClient from './StudentProgressClient';

interface PageProps {
  searchParams: Promise<{ userId?: string | string[] }>;
}

export default async function AdminProgressPage({ searchParams }: PageProps) {
  const user = await getCurrentUser();
  if (!user || user.role !== 'admin') redirect('/login');

  const query = await searchParams;
  const userId = Array.isArray(query.userId) ? query.userId[0] : query.userId;
  const data = await getAdminStudentProgress();

  return (
    <div className="min-h-screen bg-[#0B0F17] text-white flex">
      <Navbar user={user} />
      <main className="min-h-screen p-6 md:p-10 w-full">
        <StudentProgressClient initialData={data} initialSelectedUserId={userId} />
      </main>
    </div>
  );
}
