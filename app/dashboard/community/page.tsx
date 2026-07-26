import Navbar from '@/components/Navbar';
import CommunityChatWidget from '@/components/CommunityChatWidget';
import { getCurrentUser } from '@/lib/auth';
import { redirect } from 'next/navigation';

export default async function CommunityPage() {
  const user = await getCurrentUser();
  if (!user) redirect('/login');

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar user={user} />
      <main className="mx-auto w-full max-w-[88rem] p-4 sm:p-6 md:px-8 md:py-8 lg:px-10">
        <header className="flex flex-col gap-4 border-b border-border pb-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="mb-3 flex items-center gap-3"><span className="signal-dot" /><span className="board-label">Student network / Live channel</span></div>
            <h1 className="board-value text-4xl leading-none sm:text-5xl">COMMUNITY</h1>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground">Ask focused questions, share the context behind your work, and help another learner move forward.</p>
          </div>
          <span className="board-label">Respect the work / Explain the why</span>
        </header>
        <div className="mt-8">
          <CommunityChatWidget currentUserId={user.id} />
        </div>
      </main>
    </div>
  );
}

