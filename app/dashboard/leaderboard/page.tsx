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
    <div className="min-h-screen bg-background text-foreground flex">
      <Navbar user={user} />
      <main className="min-h-screen p-6 md:p-10 w-full">
        <LeaderboardWidget users={leaderboardUsers} />
      </main>
    </div>
  );
}
