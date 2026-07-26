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
    <div className="min-h-screen bg-background text-foreground flex">
      <Navbar user={user} />
      <main className="min-h-screen p-6 md:p-10 w-full">
        <JobBoardWidget jobs={jobs as any} />
      </main>
    </div>
  );
}
