import Navbar from '@/components/Navbar';
import { getCurrentUser } from '@/lib/auth';
import { getAllPendingSubmissions } from '@/lib/db/queries';
import { redirect } from 'next/navigation';
import AssignmentReviewerClient from './AssignmentReviewerClient';

export default async function AdminAssignmentsPage() {
  const user = await getCurrentUser();
  if (!user || user.role !== 'admin') redirect('/login');

  const pendingSubmissions = await getAllPendingSubmissions();

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100">
      <Navbar user={user} />
      <main className="flex-1 max-w-6xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        <AssignmentReviewerClient submissions={pendingSubmissions as any} />
      </main>
    </div>
  );
}
