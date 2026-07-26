'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { SessionUser } from '@/lib/auth';
import { ArrowRight, BookOpen, Briefcase, CheckSquare, Code2, HelpCircle, LayoutDashboard, LogOut, Menu, MessageSquare, ShieldCheck, Trophy, User, Users } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';

interface NavbarProps { user?: SessionUser | null }

const studentLinks = [
  { href: '/dashboard', label: 'My learning', icon: BookOpen },
  { href: '/dashboard/leaderboard', label: 'Standings', icon: Trophy },
  { href: '/dashboard/community', label: 'Community', icon: MessageSquare },
  { href: '/dashboard/jobs', label: 'Opportunities', icon: Briefcase },
];
const adminLinks = [
  { href: '/admin', label: 'Operations', icon: LayoutDashboard },
  { href: '/admin/courses', label: 'Curriculum', icon: BookOpen },
  { href: '/admin/users', label: 'People', icon: Users },
  { href: '/admin/quizzes', label: 'Assessments', icon: HelpCircle },
  { href: '/admin/assignments', label: 'Review queue', icon: CheckSquare },
  { href: '/admin/jobs', label: 'Opportunities', icon: Briefcase },
];

function Brand({ compact = false }: { compact?: boolean }) {
  return <Link href="/" className="flex items-center gap-3 focus-visible:outline-none">
    <span className="grid size-10 place-items-center rounded-sm bg-primary text-primary-foreground"><Code2 className="size-5" /></span>
    {!compact && <span><strong className="block text-lg leading-none tracking-[-.02em]">AUMINDS</strong><span className="board-label mt-1 block">Engineering academy</span></span>}
  </Link>;
}

export default function Navbar({ user }: NavbarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const links = user?.role === 'admin' ? adminLinks : studentLinks;

  useEffect(() => { setIsMobileOpen(false); }, [pathname]);

  const logout = async () => {
    if (isSigningOut) return;
    setIsSigningOut(true);
    setIsMobileOpen(false);
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.replace('/login');
    } finally {
      setIsSigningOut(false);
    }
  };
  const isActive = (href: string) => pathname === href || (href !== '/dashboard' && href !== '/admin' && pathname.startsWith(href));
  const LinkList = ({ mobile = false }: { mobile?: boolean }) => <nav aria-label={mobile ? 'Mobile navigation' : 'Primary navigation'} className="space-y-1">
    {links.map(({ href, label, icon: Icon }, index) => <Link key={href} href={href} onClick={mobile ? () => setIsMobileOpen(false) : undefined} aria-current={isActive(href) ? 'page' : undefined} className={cn('group flex min-h-11 items-center gap-3 rounded-sm px-3 text-sm transition-colors', isActive(href) ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted hover:text-foreground')}>
      <span className="w-5 font-mono text-[10px] opacity-70">{String(index + 1).padStart(2, '0')}</span><Icon className="size-4" /><span className="font-semibold">{label}</span>
    </Link>)}
  </nav>;

  if (!user) return <header className="sticky top-0 z-40 border-b border-border bg-background/95">
    <div className="mx-auto flex h-16 max-w-[90rem] items-center justify-between gap-6 px-4 sm:px-6 lg:px-12">
      <Brand />
      <div className="flex items-center gap-6">
        <nav aria-label="Landing page" className="hidden items-center gap-6 md:flex">
          <Link href="/#workspace" className="board-label transition-colors hover:text-foreground">Workspace</Link>
          <Link href="/#method" className="board-label transition-colors hover:text-foreground">Method</Link>
          <Link href="/#network" className="board-label transition-colors hover:text-foreground">Network</Link>
        </nav>
        <Button asChild><Link href="/login">Enter academy <ArrowRight className="size-4" /></Link></Button>
      </div>
    </div>
  </header>;

  return <>
    <aside className={cn('fixed inset-y-0 left-0 z-40 w-[16.5rem] flex-col border-r border-border bg-sidebar', pathname.startsWith('/dashboard/course/') ? 'hidden' : 'app-rail hidden md:flex')}>
      <div className="border-b border-border p-5"><Brand /></div>
      <div className="flex items-center gap-2 border-b border-border px-5 py-3"><span className="signal-dot" /><span className="board-label">{user.role === 'admin' ? 'Admin network online' : 'Learning network online'}</span></div>
      <div className="flex-1 overflow-y-auto p-3"><LinkList /></div>
      <div className="border-t border-border p-3">
        <div className="mb-2 flex items-center gap-3 px-2 py-2">
          <Avatar className="size-9 rounded-sm border border-border"><AvatarFallback className="rounded-sm bg-muted font-bold text-primary">{user.name.charAt(0).toUpperCase()}</AvatarFallback></Avatar>
          <div className="min-w-0"><p className="truncate text-sm font-bold">{user.name}</p><p className="board-label mt-1">{user.role}</p></div>
        </div>
        <Button variant="ghost" className="w-full justify-start text-muted-foreground" onClick={logout} disabled={isSigningOut}><LogOut className="size-4" /> {isSigningOut ? 'Signing out…' : 'Sign out'}</Button>
      </div>
    </aside>

    <header className="sticky top-0 z-40 border-b border-border bg-background md:hidden">
      <div className="flex h-16 items-center justify-between px-4"><Brand compact />
        <div className="flex items-center gap-2"><span className="board-label max-w-28 truncate">{user.name}</span>
          <Sheet open={isMobileOpen} onOpenChange={setIsMobileOpen}><SheetTrigger asChild><Button variant="outline" size="icon" aria-label="Open navigation"><Menu className="size-5" /></Button></SheetTrigger>
            <SheetContent side="left" className="w-[19rem] border-border bg-background p-0">
              <SheetHeader className="border-b border-border p-5 text-left"><SheetTitle><Brand /></SheetTitle><SheetDescription className="board-label">Choose a destination</SheetDescription></SheetHeader>
              <div className="p-3"><LinkList mobile /></div>
              <div className="absolute inset-x-3 bottom-4"><Button variant="outline" className="w-full justify-start" onClick={logout} disabled={isSigningOut}><LogOut className="size-4" /> {isSigningOut ? 'Signing out…' : 'Sign out'}</Button></div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  </>;
}
