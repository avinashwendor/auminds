import Navbar from '@/components/Navbar';
import { getCurrentUser } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { getAllJobPostings } from '@/lib/db/queries';
import JobManagementClient from './JobManagementClient';

export default async function AdminJobsPage() {
  const session = await getCurrentUser();
  if (!session || session.role !== 'admin') redirect('/login');
  const jobs = await getAllJobPostings();
  return (
    <div className="min-h-screen bg-background text-foreground flex">
      <Navbar user={session} />
      <main className="min-h-screen p-6 md:p-10 w-full">
        <JobManagementClient initialJobs={jobs} />
      </main>
    </div>
  );
}
