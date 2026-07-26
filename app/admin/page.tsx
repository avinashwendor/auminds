import Link from 'next/link';
import Navbar from '@/components/Navbar';
import { getCurrentUser } from '@/lib/auth';
import { getAllUsers, getAllCourses, getAllPendingSubmissions, getAllJobPostings } from '@/lib/db/queries';
import { redirect } from 'next/navigation';
import { ArrowRight, BookOpen, Briefcase, CheckSquare, HelpCircle, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';

const actions = [
  { href: '/admin/courses', label: 'Curriculum network', detail: 'Create courses, modules, and lessons', icon: BookOpen },
  { href: '/admin/users', label: 'People and access', detail: 'Create accounts and assign courses', icon: Users },
  { href: '/admin/quizzes', label: 'Assessment builder', detail: 'Attach quizzes to lesson routes', icon: HelpCircle },
  { href: '/admin/assignments', label: 'Review queue', detail: 'Grade submissions and issue feedback', icon: CheckSquare },
  { href: '/admin/jobs', label: 'Opportunity board', detail: 'Publish and manage engineering roles', icon: Briefcase },
];

export default async function AdminDashboardPage() {
  const user = await getCurrentUser();
  if (!user || user.role !== 'admin') redirect('/login');
  const [users, courses, submissions, jobs] = await Promise.all([getAllUsers(), getAllCourses(), getAllPendingSubmissions(), getAllJobPostings()]);
  const metrics = [
    { label: 'Students', value: users.filter((item: any) => item.role === 'student').length, status: 'ACTIVE' },
    { label: 'Courses', value: courses.length, status: 'PUBLISHED' },
    { label: 'Reviews', value: submissions.length, status: submissions.length ? 'ACTION' : 'CLEAR' },
    { label: 'Jobs', value: jobs.length, status: 'LIVE' },
  ];
  return <div className="min-h-screen bg-background text-foreground"><Navbar user={user} />
    <main className="mx-auto max-w-7xl p-5 sm:p-8 md:py-10">
      <header className="border-b border-border pb-10"><div className="mb-5 flex items-center gap-3"><span className="signal-dot" /><span className="board-label">Academy operations · all systems available</span></div><h1 className="board-value text-4xl leading-none sm:text-6xl">OPERATIONS CONTROL</h1><p className="mt-5 max-w-2xl text-muted-foreground">Monitor the learning network, publish curriculum, manage access, and clear work awaiting review.</p></header>
      <section className="grid border-b border-border sm:grid-cols-2 lg:grid-cols-4">{metrics.map((metric, index) => <div key={metric.label} className="border-border p-5 sm:border-r last:border-r-0"><div className="flex items-center justify-between"><span className="board-label">{metric.label}</span><span className={metric.status === 'ACTION' ? 'board-label text-primary' : 'board-label'}>{metric.status}</span></div><p className="board-value mt-6 text-5xl">{metric.value}</p><p className="mt-2 font-mono text-[10px] text-muted-foreground">AUM-{String(index + 1).padStart(2, '0')}</p></div>)}</section>
      <section className="pt-10"><div className="mb-5"><p className="board-label">Management destinations</p><h2 className="board-value mt-2 text-3xl">CHOOSE A WORKSPACE</h2></div><div className="border-t border-border">{actions.map(({ href, label, detail, icon: Icon }, index) => <Link key={href} href={href} className="group grid min-h-24 grid-cols-[3rem_1fr_auto] items-center gap-4 border-b border-border py-4 transition-colors hover:bg-card sm:grid-cols-[5rem_1fr_13rem_auto]"><span className="font-mono text-xs font-bold text-primary">{String(index + 1).padStart(2, '0')}</span><div><h3 className="board-value text-xl group-hover:text-primary sm:text-2xl">{label}</h3><p className="mt-1 text-sm text-muted-foreground sm:hidden">{detail}</p></div><p className="hidden text-sm text-muted-foreground sm:block">{detail}</p><Icon className="size-5 text-muted-foreground group-hover:hidden" /><ArrowRight className="hidden size-5 text-primary group-hover:block" /></Link>)}</div></section>
      {submissions.length > 0 && <div className="mt-10 flex flex-col justify-between gap-4 border border-primary/40 bg-primary/5 p-5 sm:flex-row sm:items-center"><div><p className="board-label text-primary">Action required</p><p className="mt-2 font-bold">{submissions.length} submission{submissions.length === 1 ? '' : 's'} waiting for instructor review.</p></div><Button asChild><Link href="/admin/assignments">Open review queue <ArrowRight className="size-4" /></Link></Button></div>}
    </main>
  </div>;
}
