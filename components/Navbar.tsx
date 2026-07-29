'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import type { SessionUser } from '@/lib/auth';
import {
  Activity,
  ArrowRight,
  BookOpen,
  BriefcaseBusiness,
  CheckSquare,
  Code2,
  HelpCircle,
  LayoutDashboard,
  LogOut,
  Menu,
  MessageSquare,
  Trophy,
  Users,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import styles from './Navbar.module.css';

interface NavbarProps {
  user?: SessionUser | null;
}

const studentLinks = [
  { href: '/dashboard', label: 'Overview', code: '01', icon: LayoutDashboard },
  { href: '/dashboard/leaderboard', label: 'Leaderboard', code: '02', icon: Trophy },
  { href: '/dashboard/community', label: 'Community', code: '03', icon: MessageSquare },
  { href: '/dashboard/jobs', label: 'Job board', code: '04', icon: BriefcaseBusiness },
  { href: '/code-editor', label: 'Code editor', code: '05', icon: Code2 },
];

const adminLinks = [
  { href: '/admin', label: 'Operations', code: '01', icon: LayoutDashboard },
  { href: '/admin/courses', label: 'Courses', code: '02', icon: BookOpen },
  { href: '/admin/users', label: 'Users', code: '03', icon: Users },
  { href: '/admin/progress', label: 'Progress', code: '04', icon: Activity },
  { href: '/admin/quizzes', label: 'Quizzes', code: '05', icon: HelpCircle },
  { href: '/admin/assignments', label: 'Reviews', code: '06', icon: CheckSquare },
  { href: '/admin/jobs', label: 'Job board', code: '07', icon: BriefcaseBusiness },
  { href: '/code-editor', label: 'Code editor', code: '08', icon: Code2 },
];

function Brand({ compact = false }: { compact?: boolean }) {
  return (
    <Link href="/" className={styles.brand} aria-label="AUMINDS home">
      <span className={styles.brandMark} aria-hidden="true">A/</span>
      {!compact && (
        <span className={styles.brandText}>
          <strong>AUMINDS</strong>
          <small>Engineering Academy</small>
        </span>
      )}
    </Link>
  );
}

export default function Navbar({ user }: NavbarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const links = user?.role === 'admin' ? adminLinks : studentLinks;

  useEffect(() => setIsMobileOpen(false), [pathname]);

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

  const isActive = (href: string) =>
    pathname === href || (href !== '/dashboard' && href !== '/admin' && pathname.startsWith(href));

  const LinkList = ({ mobile = false }: { mobile?: boolean }) => (
    <nav aria-label={mobile ? 'Mobile navigation' : 'Primary navigation'} className={styles.navList}>
      {links.map(({ href, label, code, icon: Icon }) => {
        const active = isActive(href);
        const className = cn(styles.navLink, active && styles.navLinkActive);
        const content = (
          <>
            <span className={styles.navCode}>{code}</span>
            <Icon aria-hidden="true" />
            <span>{label}</span>
            {active && <span className={styles.activeSignal} aria-hidden="true" />}
          </>
        );

        if (href === '/code-editor') {
          return (
            <a
              key={href}
              href={href}
              onClick={mobile ? () => setIsMobileOpen(false) : undefined}
              aria-current={active ? 'page' : undefined}
              className={className}
            >
              {content}
            </a>
          );
        }

        return (
          <Link
            key={href}
            href={href}
            onClick={mobile ? () => setIsMobileOpen(false) : undefined}
            aria-current={active ? 'page' : undefined}
            className={className}
          >
            {content}
          </Link>
        );
      })}
    </nav>
  );

  if (!user) {
    return (
      <header className={styles.publicHeader}>
        <Brand />
        <Link className={styles.publicCta} href="/login">Enter academy <ArrowRight aria-hidden="true" /></Link>
      </header>
    );
  }

  return (
    <>
      <aside className={cn('app-rail', styles.rail, pathname.startsWith('/dashboard/course/') && styles.railHidden)}>
        <div className={styles.railBrand}><Brand /></div>

        <div className={styles.portalState}>
          <span>{user.role === 'admin' ? 'Admin portal' : 'Student portal'}</span>
          <strong>Active session</strong>
        </div>

        <div className={styles.navigation}>
          <p>Navigation</p>
          <LinkList />
        </div>

        <div className={styles.account}>
          <div className={styles.accountIdentity}>
            <Avatar className={styles.avatar}>
              <AvatarFallback className={styles.avatarFallback}>{user.name.charAt(0).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div>
              <strong>{user.name}</strong>
              <span>{user.role}</span>
            </div>
          </div>
          <Button
            type="button"
            variant="ghost"
            className={styles.logoutButton}
            onClick={logout}
            disabled={isSigningOut}
          >
            <LogOut aria-hidden="true" /> {isSigningOut ? 'Signing out…' : 'Sign out'}
          </Button>
        </div>
      </aside>

      <header className={styles.mobileHeader}>
        <Brand compact />
        <span className={styles.mobileTitle}>{user.name}</span>
        <Sheet open={isMobileOpen} onOpenChange={setIsMobileOpen}>
          <SheetTrigger asChild>
            <Button type="button" variant="outline" size="icon" aria-label="Open navigation" className={styles.menuButton}>
              <Menu aria-hidden="true" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className={styles.mobileSheet}>
            <SheetHeader className={styles.mobileSheetHeader}>
              <SheetTitle><Brand /></SheetTitle>
              <SheetDescription className={styles.sheetDescription}>
                {user.role === 'admin' ? 'Academy operations' : 'Your learning workspace'}
              </SheetDescription>
            </SheetHeader>
            <div className={styles.mobileNavigation}><LinkList mobile /></div>
            <div className={styles.mobileAccount}>
              <div className={styles.accountIdentity}>
                <Avatar className={styles.avatar}>
                  <AvatarFallback className={styles.avatarFallback}>{user.name.charAt(0).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div><strong>{user.name}</strong><span>{user.role}</span></div>
              </div>
              <Button type="button" variant="ghost" className={styles.logoutButton} onClick={logout} disabled={isSigningOut}>
                <LogOut aria-hidden="true" /> {isSigningOut ? 'Signing out…' : 'Sign out'}
              </Button>
            </div>
          </SheetContent>
        </Sheet>
      </header>
    </>
  );
}
