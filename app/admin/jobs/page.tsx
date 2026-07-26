import Navbar from '@/components/Navbar';
import { getCurrentUser } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { getAllJobPostings } from '@/lib/db/queries';
import JobManagementClient from './JobManagementClient';

export default async function AdminJobsPage() {
  const session = await getCurrentUser();
  if (!session || session.role !== 'admin') redirect('/login');
  const jobs = await getAllJobPostings();
  return <div className="min-h-screen bg-background text-foreground"><Navbar user={session} /><main className="mx-auto max-w-7xl p-4 sm:p-6 lg:p-8"><JobManagementClient initialJobs={jobs} /></main></div>;
}
