'use client';

import { Medal, ShieldCheck, Trophy, Crown, Sparkles, TrendingUp } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface LeaderboardUser {
  id: string;
  name: string;
  username: string;
  avatarUrl?: string | null;
  points: number;
  role: string;
}

interface LeaderboardWidgetProps {
  users: LeaderboardUser[];
}

export default function LeaderboardWidget({ users }: LeaderboardWidgetProps) {
  const learners = users.filter((user) => user.role !== 'admin');
  const topThree = learners.slice(0, 3);

  // Reorder for podium (2nd, 1st, 3rd)
  const first = topThree[0];
  const second = topThree[1];
  const third = topThree[2];

  return (
    <div className="space-y-10">
      
      {/* Header */}
      <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 border-b border-[#919EAB]/12 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="outline" className="bg-[#FFC107]/15 text-[#FFC107] border-[#FFC107]/40 font-mono text-xs px-3 py-1 font-bold">
              <Trophy className="size-4 mr-1.5" /> LIVE STANDINGS
            </Badge>
            <span className="text-xs font-mono font-bold text-[#919EAB]">UPDATED REALTIME</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight">ACADEMY LEADERBOARD</h1>
          <p className="mt-2 text-sm text-[#919EAB] max-w-xl leading-relaxed">
            Points reflect completed lessons, first-attempt quiz mastery, and instructor-reviewed project submissions.
          </p>
        </div>

        <div className="minimal-card p-5 text-right min-w-[160px]">
          <span className="board-label block text-xs">Ranked Engineers</span>
          <strong className="text-3xl font-extrabold text-[#00AB55] font-mono mt-1 block">
            {learners.length}
          </strong>
        </div>
      </header>

      {/* Top 3 Podium Display */}
      {topThree.length > 0 && (
        <section className="grid gap-6 sm:grid-cols-3 items-end pt-6 pb-4">
          
          {/* 2nd Place */}
          {second && (
            <div className="minimal-card p-8 text-center border-[#3366FF]/40 relative order-2 sm:order-1 flex flex-col items-center shadow-xl">
              <Badge variant="outline" className="bg-[#3366FF]/15 text-[#3366FF] border-[#3366FF]/40 font-mono text-xs px-3 py-1 mb-4 font-bold">
                🥈 2ND PLACE
              </Badge>
              <Avatar className="size-20 rounded-2xl border-2 border-[#3366FF] shadow-lg shadow-[#3366FF]/20 my-2">
                <AvatarImage src={second.avatarUrl || undefined} />
                <AvatarFallback className="bg-[#3366FF]/20 text-[#3366FF] font-extrabold text-xl">
                  {second.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <h3 className="font-extrabold text-white text-xl mt-3">{second.name}</h3>
              <p className="text-xs font-mono text-[#919EAB] mt-0.5">@{second.username}</p>
              <span className="text-[#3366FF] font-mono font-extrabold text-base mt-4 block">
                {second.points.toLocaleString()} PTS
              </span>
            </div>
          )}

          {/* 1st Place */}
          {first && (
            <div className="minimal-card p-10 text-center border-[#FFC107]/60 bg-gradient-to-b from-[#FFC107]/15 via-[#161C24] to-[#161C24] relative order-1 sm:order-2 flex flex-col items-center shadow-2xl scale-105">
              <div className="absolute -top-5 size-10 rounded-full bg-[#FFC107] text-[#161C24] grid place-items-center shadow-lg shadow-[#FFC107]/50">
                <Crown className="size-6 fill-current" />
              </div>
              <Badge variant="outline" className="bg-[#FFC107]/20 text-[#FFC107] border-[#FFC107]/50 font-mono text-xs px-4 py-1 mb-4 mt-2 font-extrabold">
                🥇 CHAMPION
              </Badge>
              <Avatar className="size-24 rounded-2xl border-2 border-[#FFC107] shadow-xl shadow-[#FFC107]/30 my-2">
                <AvatarImage src={first.avatarUrl || undefined} />
                <AvatarFallback className="bg-[#FFC107]/20 text-[#FFC107] font-extrabold text-3xl">
                  {first.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <h3 className="font-extrabold text-white text-2xl mt-3">{first.name}</h3>
              <p className="text-xs font-mono text-[#919EAB] mt-0.5">@{first.username}</p>
              <span className="text-[#FFC107] font-mono font-extrabold text-xl mt-4 block">
                {first.points.toLocaleString()} PTS
              </span>
            </div>
          )}

          {/* 3rd Place */}
          {third && (
            <div className="minimal-card p-8 text-center border-[#826AF9]/40 relative order-3 flex flex-col items-center shadow-xl">
              <Badge variant="outline" className="bg-[#826AF9]/15 text-[#826AF9] border-[#826AF9]/40 font-mono text-xs px-3 py-1 mb-4 font-bold">
                🥉 3RD PLACE
              </Badge>
              <Avatar className="size-20 rounded-2xl border-2 border-[#826AF9] shadow-lg shadow-[#826AF9]/20 my-2">
                <AvatarImage src={third.avatarUrl || undefined} />
                <AvatarFallback className="bg-[#826AF9]/20 text-[#826AF9] font-extrabold text-xl">
                  {third.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <h3 className="font-extrabold text-white text-xl mt-3">{third.name}</h3>
              <p className="text-xs font-mono text-[#919EAB] mt-0.5">@{third.username}</p>
              <span className="text-[#826AF9] font-mono font-extrabold text-base mt-4 block">
                {third.points.toLocaleString()} PTS
              </span>
            </div>
          )}

        </section>
      )}

      {/* Rest of Standings Table */}
      <div className="minimal-card overflow-hidden shadow-xl">
        <div className="p-5 border-b border-[#919EAB]/12 bg-[#1A2332]/50 hidden sm:grid grid-cols-[5rem_1fr_10rem_10rem] text-sm font-mono text-[#919EAB] font-bold">
          <span>Rank</span>
          <span>Engineer</span>
          <span>Status</span>
          <span className="text-right">Points</span>
        </div>

        <div className="divide-y divide-[#919EAB]/12">
          {learners.map((user, index) => {
            const rank = index + 1;
            return (
              <div 
                key={user.id} 
                className={cn(
                  'p-5 flex flex-col sm:grid sm:grid-cols-[5rem_1fr_10rem_10rem] items-start sm:items-center gap-4 hover:bg-[#1A2332]/30 transition-colors',
                  rank === 1 && 'bg-[#FFC107]/5'
                )}
              >
                <div className="flex items-center gap-2">
                  <span className="font-mono text-lg font-extrabold text-white">
                    #{String(rank).padStart(2, '0')}
                  </span>
                </div>

                <div className="flex items-center gap-4">
                  <Avatar className="size-12 rounded-2xl border border-[#919EAB]/20">
                    <AvatarImage src={user.avatarUrl || undefined} />
                    <AvatarFallback className="bg-[#00AB55]/20 text-[#00AB55] font-extrabold text-sm">
                      {user.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h4 className="text-base font-extrabold text-white">{user.name}</h4>
                    <p className="text-xs font-mono text-[#919EAB]">@{user.username}</p>
                  </div>
                </div>

                <div>
                  <Badge variant="outline" className="bg-[#212B36] text-[#00AB55] border-[#00AB55]/30 text-xs font-mono px-3 py-1 font-bold">
                    {rank === 1 ? '🥇 LEADER' : rank <= 3 ? '🏆 TOP 3' : 'ACTIVE'}
                  </Badge>
                </div>

                <div className="text-right font-mono text-base font-extrabold text-[#00AB55]">
                  {user.points.toLocaleString()} PTS
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}
