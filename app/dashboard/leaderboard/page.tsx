import Navbar from '@/components/Navbar';
import LeaderboardWidget from '@/components/LeaderboardWidget';
import { getCurrentUser } from '@/lib/auth';
import { getLeaderboard } from '@/lib/db/queries';
import { redirect } from 'next/navigation';

export default async function LeaderboardPage() {
  const user = await getCurrentUser();
  if (!user) redirect('/login');

  const leaderboardUsers = await getLeaderboard();

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100">
      <Navbar user={user} />
      <main className="flex-1 max-w-5xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        <LeaderboardWidget users={leaderboardUsers} />
      </main>
    </div>
  );
}
