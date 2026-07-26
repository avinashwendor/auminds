'use client';

import { Medal, ShieldCheck, Trophy } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

interface LeaderboardUser { id: string; name: string; username: string; avatarUrl?: string | null; points: number; role: string }
interface LeaderboardWidgetProps { users: LeaderboardUser[] }

export default function LeaderboardWidget({ users }: LeaderboardWidgetProps) {
  const learners = users.filter((user) => user.role !== 'admin');
  return <section>
    <header className="flex flex-col justify-between gap-6 border-b border-border pb-8 sm:flex-row sm:items-end"><div><div className="flex items-center gap-2"><Trophy className="size-4 text-primary" /><span className="board-label text-primary">Academy standings · live</span></div><h1 className="board-value mt-3 text-4xl sm:text-5xl">LEARNER STANDINGS</h1><p className="mt-3 max-w-2xl text-muted-foreground">Points reflect completed lessons, first-time quiz passes, and instructor-approved project work.</p></div><div className="border border-border p-4"><p className="board-label">Ranked learners</p><p className="board-value mt-2 text-3xl">{learners.length}</p></div></header>
    <div className="hidden grid-cols-[5rem_1fr_9rem_8rem] gap-4 border-b border-border py-3 board-label sm:grid"><span>Rank</span><span>Learner</span><span>Status</span><span className="text-right">Points</span></div>
    {learners.length === 0 ? <div className="py-16 text-center"><Trophy className="mx-auto mb-4 size-8 text-muted-foreground" /><h2 className="board-value text-2xl">NO STANDINGS YET</h2><p className="mt-2 text-sm text-muted-foreground">Complete learning activities to establish the first rank.</p></div> : learners.map((user, index) => { const rank = index + 1; const podium = rank <= 3; return <article key={user.id} className={cn('grid gap-4 border-b border-border py-5 sm:grid-cols-[5rem_1fr_9rem_8rem] sm:items-center', rank === 1 && 'bg-primary/5')}><div className="flex items-center gap-2"><span className={cn('board-value text-2xl', podium ? 'text-primary' : 'text-muted-foreground')}>{String(rank).padStart(2, '0')}</span>{rank === 1 ? <Trophy className="size-4 text-primary" /> : podium ? <Medal className="size-4 text-muted-foreground" /> : null}</div><div className="flex items-center gap-3"><Avatar className="size-10 rounded-sm border border-border"><AvatarImage src={user.avatarUrl || undefined} alt="" /><AvatarFallback className="rounded-sm bg-muted font-bold text-primary">{user.name.charAt(0)}</AvatarFallback></Avatar><div><h2 className="font-bold">{user.name}</h2><p className="font-mono text-[10px] text-muted-foreground">@{user.username}</p></div></div><span className="board-label">{rank === 1 ? 'LEADING' : rank <= 3 ? 'PODIUM' : 'ACTIVE'}</span><p className="text-left font-mono text-sm font-bold text-primary sm:text-right">{user.points.toLocaleString()} PTS</p></article>; })}
    <footer className="mt-6 flex items-start gap-3 border border-border bg-card p-4 text-sm text-muted-foreground"><ShieldCheck className="mt-0.5 size-4 shrink-0 text-primary" /><p>Standings exclude administrator accounts. Repeated quiz passes do not award duplicate points.</p></footer>
  </section>;
}
