import Link from 'next/link';
import { ArrowLeft, Clock, ShieldAlert, ShieldX, MailQuestion } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

type Status = 'pending' | 'rejected' | 'suspended';

const COPY: Record<Status, { badge: string; title: string; body: string; icon: typeof Clock; accent: string }> = {
  pending: {
    badge: 'AWAITING APPROVAL',
    title: 'Your account is under review',
    body:
      'An academy administrator needs to approve your request before you can sign in. You will get access as soon as the review is complete and courses are assigned to your workspace.',
    icon: Clock,
    accent: '#FFC107',
  },
  rejected: {
    badge: 'REQUEST DECLINED',
    title: 'Your access request was declined',
    body:
      'An administrator reviewed your request and did not approve it. If you believe this is a mistake, reach out to the academy team and ask them to re-open your application.',
    icon: ShieldX,
    accent: '#FF4842',
  },
  suspended: {
    badge: 'ACCOUNT SUSPENDED',
    title: 'Your account is suspended',
    body:
      'Access to the academy has been paused by an administrator. Contact the academy team to review your account and restore access.',
    icon: ShieldAlert,
    accent: '#FF4842',
  },
};

export default async function PendingApprovalPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  const key: Status = status === 'rejected' || status === 'suspended' ? status : 'pending';
  const copy = COPY[key];
  const Icon = copy.icon;

  return (
    <main className="min-h-screen bg-[#0B0F17] text-white flex flex-col justify-between p-4 sm:p-6 lg:p-8">
      <header className="mx-auto w-full max-w-7xl flex items-center justify-between">
        <Link href="/" className="inline-flex items-center gap-2 text-xs font-mono font-bold text-[#919EAB] hover:text-[#00AB55] transition-colors">
          <ArrowLeft className="size-4" /> Return to Academy
        </Link>
        <Badge variant="outline" className="font-mono text-xs" style={{ color: copy.accent, borderColor: `${copy.accent}55`, backgroundColor: `${copy.accent}1A` }}>
          {copy.badge}
        </Badge>
      </header>

      <div className="mx-auto w-full max-w-lg my-12">
        <div className="minimal-card p-8 border border-[#919EAB]/20 shadow-2xl space-y-6 text-center">
          <div
            className="size-16 rounded-2xl grid place-items-center mx-auto"
            style={{ backgroundColor: `${copy.accent}1F`, color: copy.accent }}
          >
            <Icon className="size-8" aria-hidden="true" />
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl font-extrabold text-white tracking-tight">{copy.title}</h1>
            <p className="text-sm text-[#919EAB] leading-relaxed">{copy.body}</p>
          </div>

          <div className="rounded-2xl bg-[#212B36] border border-[#919EAB]/16 p-4 text-left space-y-2">
            <p className="text-xs font-bold text-white inline-flex items-center gap-2">
              <MailQuestion className="size-4 text-[#00AB55]" aria-hidden="true" /> Need a faster decision?
            </p>
            <p className="text-xs text-[#919EAB] leading-relaxed">
              Message the academy team with your username so an admin can prioritise your review.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
            <Button asChild className="bg-[#00AB55] hover:bg-[#007B55] text-white font-bold rounded-xl">
              <Link href="/login">Back to sign in</Link>
            </Button>
            <Button asChild variant="outline" className="bg-[#212B36] border-[#919EAB]/20 text-white rounded-xl">
              <Link href="/">Explore the academy</Link>
            </Button>
          </div>
        </div>
      </div>

      <footer className="mx-auto w-full max-w-7xl text-center text-xs font-mono text-[#637381]">
        © 2026 AUMINDS Academy. All rights reserved.
      </footer>
    </main>
  );
}
