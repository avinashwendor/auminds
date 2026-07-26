import Navbar from '@/components/Navbar';
import JobBoardWidget from '@/components/JobBoardWidget';
import { getCurrentUser } from '@/lib/auth';
import { getAllJobPostings } from '@/lib/db/queries';
import { redirect } from 'next/navigation';

export default async function JobsPage() {
  const user = await getCurrentUser();
  if (!user) redirect('/login');

  const jobs = await getAllJobPostings();

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100">
      <Navbar user={user} />
      <main className="flex-1 max-w-6xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        <JobBoardWidget jobs={jobs as any} />
      </main>
    </div>
  );
}
