import Link from 'next/link';
import Navbar from '@/components/Navbar';
import { getCurrentUser } from '@/lib/auth';
import { getAllUsers, getAllCourses, getAllPendingSubmissions, getAllJobPostings } from '@/lib/db/queries';
import { redirect } from 'next/navigation';
import { 
  ArrowRight, BookOpen, Briefcase, CheckSquare, HelpCircle, Users, 
  ShieldAlert, Sparkles, Activity, Layers, Terminal
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const actions = [
  { href: '/admin/courses', label: 'Curriculum Network', detail: 'Create & manage courses, modules, and video/code lessons', icon: BookOpen, color: '#00AB55' },
  { href: '/admin/users', label: 'People & Access', detail: 'Manage student accounts and course enrollments', icon: Users, color: '#3366FF' },
  { href: '/admin/quizzes', label: 'Assessment Builder', detail: 'Build quizzes with multiple choice options & explanations', icon: HelpCircle, color: '#FFC107' },
  { href: '/admin/assignments', label: 'Submission Queue', detail: 'Grade student GitHub submissions and issue feedback', icon: CheckSquare, color: '#826AF9' },
  { href: '/admin/jobs', label: 'Opportunity Board', detail: 'Publish & curate engineering jobs for students', icon: Briefcase, color: '#FF4842' },
];

export default async function AdminDashboardPage() {
  const user = await getCurrentUser();
  if (!user || user.role !== 'admin') redirect('/login');
  
  const [users, courses, submissions, jobs] = await Promise.all([
    getAllUsers(), 
    getAllCourses(), 
    getAllPendingSubmissions(), 
    getAllJobPostings()
  ]);

  const metrics = [
    { label: 'Active Students', value: users.filter((item: any) => item.role === 'student').length, icon: Users, color: '#00AB55' },
    { label: 'Published Courses', value: courses.length, icon: BookOpen, color: '#3366FF' },
    { label: 'Pending Reviews', value: submissions.length, icon: CheckSquare, color: '#FFC107', actionRequired: submissions.length > 0 },
    { label: 'Live Job Openings', value: jobs.length, icon: Briefcase, color: '#826AF9' },
  ];

  return (
    <div className="min-h-screen bg-[#0B0F17] text-white flex">
      <Navbar user={user} />
      
      <main className="min-h-screen p-6 md:p-10 w-full space-y-8">
        
        {/* Header */}
        <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 border-b border-[#919EAB]/12 pb-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="outline" className="bg-[#00AB55]/10 text-[#00AB55] border-[#00AB55]/30 font-mono text-xs">
                <Terminal className="size-3 mr-1" /> OPERATIONS CONTROL CENTER
              </Badge>
              <span className="text-xs font-mono text-[#919EAB]">SYSTEM HEALTH ONLINE</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">ACADEMY MANAGEMENT</h1>
            <p className="mt-2 text-xs text-[#919EAB] max-w-xl leading-relaxed">
              Monitor academy activity, publish curriculum routes, manage user enrollments, and clear project submissions.
            </p>
          </div>
        </header>

        {/* Action Required Banner */}
        {submissions.length > 0 && (
          <div className="minimal-card p-6 border-[#FFC107]/40 bg-gradient-to-r from-[#FFC107]/10 via-[#161C24] to-[#161C24] flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xl">
            <div className="flex items-center gap-3">
              <div className="size-12 rounded-xl bg-[#FFC107]/20 border border-[#FFC107]/40 grid place-items-center text-[#FFC107] shrink-0">
                <ShieldAlert className="size-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Review Queue Alert</h3>
                <p className="text-xs text-[#919EAB] mt-0.5">
                  <strong className="text-[#FFC107]">{submissions.length} student submissions</strong> are awaiting your review and grading.
                </p>
              </div>
            </div>

            <Button asChild className="bg-[#FFC107] hover:bg-[#FFC107]/80 text-[#161C24] font-bold rounded-xl shrink-0">
              <Link href="/admin/assignments">
                Open Review Queue <ArrowRight className="size-4 ml-1.5" />
              </Link>
            </Button>
          </div>
        )}

        {/* 4 Summary Stat Cards */}
        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {metrics.map((m) => {
            const Icon = m.icon;
            return (
              <div key={m.label} className="minimal-card p-5 flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="board-label">{m.label}</span>
                  <div className="size-10 rounded-xl grid place-items-center" style={{ backgroundColor: `${m.color}20`, color: m.color }}>
                    <Icon className="size-5" />
                  </div>
                </div>
                <strong className="text-3xl font-extrabold text-white mt-4 block" style={{ color: m.actionRequired ? '#FFC107' : 'white' }}>
                  {m.value}
                </strong>
              </div>
            );
          })}
        </section>

        {/* Destination Workspaces Grid */}
        <section className="space-y-4">
          <span className="board-label text-[#00AB55]">Management Workspaces</span>
          <h2 className="text-2xl font-extrabold text-white tracking-tight">CONTROL MODULES</h2>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {actions.map((act) => {
              const Icon = act.icon;
              return (
                <Link 
                  key={act.href} 
                  href={act.href}
                  className="minimal-card p-6 flex flex-col justify-between group hover:border-[#00AB55]/50 transition-all"
                >
                  <div>
                    <div className="size-12 rounded-xl border grid place-items-center mb-4 transition-transform group-hover:scale-105" style={{ backgroundColor: `${act.color}15`, borderColor: `${act.color}30`, color: act.color }}>
                      <Icon className="size-6" />
                    </div>
                    <h3 className="text-lg font-extrabold text-white group-hover:text-[#00AB55] transition-colors">
                      {act.label}
                    </h3>
                    <p className="text-xs text-[#919EAB] mt-2 leading-relaxed">
                      {act.detail}
                    </p>
                  </div>

                  <div className="mt-6 pt-4 border-t border-[#919EAB]/12 flex items-center justify-between text-xs font-bold text-[#00AB55]">
                    <span>Access Workspace</span>
                    <ArrowRight className="size-4 transform group-hover:translate-x-1 transition-transform" />
                  </div>
                </Link>
              );
            })}
          </div>
        </section>

      </main>
    </div>
  );
}
