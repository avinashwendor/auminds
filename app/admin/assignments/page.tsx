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
    <div className="min-h-screen bg-background text-foreground flex">
      <Navbar user={user} />
      <main className="min-h-screen p-6 md:p-10 w-full">
        <AssignmentReviewerClient submissions={pendingSubmissions as any} />
      </main>
    </div>
  );
}
