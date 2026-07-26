import Link from 'next/link';
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  FileCheck2,
  Play,
  Terminal,
  Trophy,
  Users,
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { getCurrentUser } from '@/lib/auth';

const learningLoop = [
  {
    code: 'STUDY',
    title: 'Understand the system',
    description: 'Protected video, technical notes, and working examples live in one focused lesson.',
    icon: BookOpen,
  },
  {
    code: 'BUILD',
    title: 'Turn theory into code',
    description: 'Open the Monaco workspace, run the project, and iterate without leaving the academy.',
    icon: Terminal,
  },
  {
    code: 'PROVE',
    title: 'Show what you know',
    description: 'Complete quizzes and submit executable work for an instructor to review.',
    icon: CheckCircle2,
  },
  {
    code: 'ADVANCE',
    title: 'Make the next move',
    description: 'Track verified progress, learn with peers, and explore curated engineering roles.',
    icon: Users,
  },
];

const academySignals = [
  {
    label: 'Instructor review',
    title: 'Feedback is attached to the work.',
    description: 'Assignments move through submission and review, so progress means more than watching a video.',
    icon: FileCheck2,
  },
  {
    label: 'Visible progress',
    title: 'Mastery leaves a record.',
    description: 'Quiz results, points, completion, leaderboards, and certificates keep the learning path accountable.',
    icon: Trophy,
  },
  {
    label: 'Learning network',
    title: 'The academy continues after the lesson.',
    description: 'Community chat and the career board connect practice, peers, and the next opportunity.',
    icon: Users,
  },
];

export default async function LandingPage() {
  const user = await getCurrentUser();
  const destination = user ? (user.role === 'admin' ? '/admin' : '/dashboard') : '/login';
  const primaryAction = user ? 'Open your workspace' : 'Enter the academy';

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar user={user} />
      <main>
        <section className="relative overflow-hidden border-b border-border" aria-labelledby="landing-title">
          <div className="mx-auto grid min-h-[calc(100svh-4rem)] max-w-[90rem] lg:grid-cols-[minmax(0,.88fr)_minmax(34rem,1.12fr)]">
            <div className="landing-hero-copy flex flex-col justify-center px-5 py-16 sm:px-8 lg:px-12 lg:py-20 xl:px-16">
              <div className="mb-8 flex items-center gap-3">
                <span className="signal-dot" />
                <span className="board-label">AUM / Engineering academy / Online</span>
              </div>
              <h1 id="landing-title" className="board-value max-w-4xl text-[clamp(2.65rem,13vw,6rem)] leading-[.88] tracking-[-.03em]">
                AUMINDS.<br />LEARN CODE BY<br /><span className="text-primary">SHIPPING IT.</span>
              </h1>
              <p className="mt-8 max-w-xl text-lg leading-relaxed text-muted-foreground sm:text-xl">
                Study the idea, build it in a real editor, prove your understanding, and submit work an instructor can review.
              </p>
              <div className="mt-10 flex flex-col gap-3 sm:flex-row">
                <Button asChild size="lg" className="sm:min-w-52">
                  <Link href={destination}>{primaryAction}<ArrowRight className="size-4" /></Link>
                </Button>
                <Button asChild size="lg" variant="outline">
                  <a href="#method">See how learning works</a>
                </Button>
              </div>
            </div>

            <div id="workspace" className="landing-workspace flex items-center border-t border-border bg-card px-5 py-10 sm:px-8 lg:border-l lg:border-t-0 lg:px-10 xl:px-14">
              <figure className="w-full border border-border bg-background" aria-label="Illustration of the AUMINDS lesson workspace">
                <figcaption className="flex items-center justify-between gap-4 border-b border-border px-4 py-3 sm:px-5">
                  <span className="board-label text-foreground">Live lesson workspace</span>
                  <span className="flex items-center gap-2 board-label text-primary"><span className="signal-dot" />Session active</span>
                </figcaption>
                <div className="grid md:grid-cols-[10.5rem_1fr]">
                  <div className="border-b border-border md:border-b-0 md:border-r">
                    <div className="border-b border-border px-4 py-4">
                      <p className="board-label">Course / TypeScript</p>
                      <p className="board-value mt-2 text-lg">Production patterns</p>
                    </div>
                    <div className="grid grid-cols-3 md:block">
                      {['01 / Types', '02 / API client', '03 / Testing'].map((lesson, index) => (
                        <div key={lesson} className={`border-border px-3 py-3 font-mono text-[10px] font-bold uppercase sm:px-4 md:border-b ${index === 1 ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'}`}>
                          {lesson}
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="min-w-0">
                    <div className="border-b border-border px-4 py-5 sm:px-6">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="board-label text-primary">Current task</p>
                          <h2 className="board-value mt-2 text-2xl sm:text-3xl">Build a typed API client</h2>
                        </div>
                        <Play className="mt-1 size-5 shrink-0 text-primary" />
                      </div>
                      <p className="mt-3 max-w-lg text-sm leading-relaxed text-muted-foreground">Handle the response, narrow failures, and make every test pass.</p>
                    </div>
                    <div className="overflow-x-auto bg-[#0d0f10] p-4 font-mono text-xs leading-7 sm:p-6 sm:text-sm" aria-label="TypeScript code example">
                      <code className="block min-w-[26rem]">
                        <span className="block text-muted-foreground">// api/client.ts</span>
                        <span className="block"><span className="text-primary">export async function</span> getCourse(id: string) {'{'}</span>
                        <span className="block pl-5">const response = await fetch(`/api/courses/${'{'}id{'}'}`);</span>
                        <span className="block pl-5"><span className="text-primary">if</span> (!response.ok) throw new CourseError(response.status);</span>
                        <span className="block pl-5">return CourseSchema.parse(await response.json());</span>
                        <span className="block">{'}'}</span>
                      </code>
                    </div>
                    <div className="grid border-t border-border sm:grid-cols-[1fr_auto]">
                      <div className="flex items-center gap-3 px-4 py-4 sm:px-6">
                        <CheckCircle2 className="size-4 text-primary" />
                        <span className="font-mono text-xs font-bold">8 checks passed</span>
                      </div>
                      <div className="flex items-center justify-between gap-5 border-t border-border px-4 py-4 sm:border-l sm:border-t-0 sm:px-6">
                        <span className="board-label">Next action</span>
                        <span className="board-label text-primary">Submit for review →</span>
                      </div>
                    </div>
                  </div>
                </div>
              </figure>
            </div>
          </div>
          <div className="border-t border-border bg-background">
            <div className="mx-auto flex max-w-[90rem] overflow-hidden px-5 sm:px-8 lg:px-12">
              {['Study the system', 'Build the feature', 'Prove the result', 'Advance with evidence'].map((item, index) => (
                <div key={item} className="flex min-w-[16rem] flex-1 items-center gap-4 border-r border-border px-5 py-4 first:border-l">
                  <span className="font-mono text-xs font-bold text-primary">0{index + 1}</span>
                  <span className="board-label text-foreground">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="method" className="bg-foreground text-background" aria-labelledby="method-title">
          <div className="mx-auto grid max-w-[90rem] lg:grid-cols-[.72fr_1.28fr]">
            <div className="border-b border-background/20 px-5 py-16 sm:px-8 lg:border-b-0 lg:border-r lg:px-12 lg:py-28 xl:px-16">
              <p className="font-mono text-xs font-bold uppercase tracking-[.08em] text-background/60">The mastery loop</p>
              <h2 id="method-title" className="board-value mt-5 max-w-xl text-5xl leading-[.92] tracking-[-.025em] sm:text-6xl">
                THE LESSON DOESN&apos;T END WHEN THE VIDEO DOES.
              </h2>
              <p className="mt-7 max-w-md text-lg leading-relaxed text-background/70">Every stage produces a clearer signal: understanding, executable work, reviewed proof, and a next step.</p>
            </div>
            <div>
              {learningLoop.map(({ code, title, description, icon: Icon }, index) => (
                <article key={code} className="landing-stage grid gap-5 border-b border-background/20 px-5 py-8 last:border-b-0 sm:grid-cols-[5rem_1fr_auto] sm:items-start sm:px-8 lg:px-12 lg:py-10">
                  <span className="landing-stage-index font-mono text-xs font-bold text-background/55">0{index + 1} / {code}</span>
                  <div>
                    <h3 className="board-value text-2xl sm:text-3xl">{title}</h3>
                    <p className="mt-3 max-w-xl leading-relaxed text-background/65">{description}</p>
                  </div>
                  <Icon className="size-5 text-background/50" />
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="network" className="border-y border-border bg-card" aria-labelledby="network-title">
          <div className="mx-auto max-w-[90rem] px-5 py-20 sm:px-8 lg:px-12 lg:py-28 xl:px-16">
            <div className="grid gap-8 border-b border-border pb-12 lg:grid-cols-[1.15fr_.85fr] lg:items-end">
              <h2 id="network-title" className="board-value max-w-4xl text-5xl leading-[.92] tracking-[-.025em] sm:text-6xl">THE WORK IS VISIBLE.<br />SO IS THE PROGRESS.</h2>
              <p className="max-w-lg text-lg leading-relaxed text-muted-foreground lg:justify-self-end">AUMINDS connects the lesson, the editor, the review queue, and the wider learning community into one accountable path.</p>
            </div>
            <div>
              {academySignals.map(({ label, title, description, icon: Icon }) => (
                <article key={label} className="landing-signal-row grid gap-5 border-b border-border py-8 sm:grid-cols-[11rem_1fr_1fr_auto] sm:items-start lg:py-10">
                  <span className="board-label text-primary">{label}</span>
                  <h3 className="board-value text-2xl">{title}</h3>
                  <p className="max-w-lg leading-relaxed text-muted-foreground">{description}</p>
                  <Icon className="size-5 text-muted-foreground" />
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="relative overflow-hidden" aria-labelledby="final-cta-title">
          <div className="mx-auto grid min-h-[34rem] max-w-[90rem] items-end px-5 py-16 sm:px-8 lg:grid-cols-[1fr_auto] lg:px-12 lg:py-20 xl:px-16">
            <div>
              <div className="mb-7 flex items-center gap-3"><span className="signal-dot" /><span className="board-label">Next departure / Your workspace</span></div>
              <h2 id="final-cta-title" className="board-value max-w-5xl text-5xl leading-[.9] tracking-[-.03em] sm:text-7xl lg:text-[5.5rem]">READY TO TURN<br />LEARNING INTO WORK?</h2>
            </div>
            <Button asChild size="lg" className="mt-10 lg:mb-2 lg:min-w-56">
              <Link href={destination}>{primaryAction}<ArrowRight className="size-4" /></Link>
            </Button>
          </div>
        </section>
      </main>
      <footer className="border-t border-border px-5 py-6 sm:px-8">
        <div className="mx-auto flex max-w-[90rem] flex-wrap justify-between gap-3 board-label">
          <span>© {new Date().getFullYear()} AUMINDS</span>
          <span>Engineering education / Operational</span>
        </div>
      </footer>
    </div>
  );
}
