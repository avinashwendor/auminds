import Link from 'next/link';
import {
  ArrowRight,
  Award,
  BookOpen,
  BriefcaseBusiness,
  Check,
  Code2,
  FileCheck2,
  Menu,
  MessageSquareText,
  Play,
  TerminalSquare,
  Trophy,
  Users,
  Video,
} from 'lucide-react';
import styles from './LandingPage.module.css';

interface LandingUser {
  id: string;
  username: string;
  name: string;
  role: string;
}

interface LandingPageProps {
  user: LandingUser | null;
  destination: string;
  primaryAction: string;
}

const learningRoute = [
  {
    number: '01',
    label: 'Learn',
    title: 'Build the mental model',
    description: 'Move through focused video and written lessons that explain the decisions behind production code.',
    icon: Video,
  },
  {
    number: '02',
    label: 'Practice',
    title: 'Work in a real editor',
    description: 'Write and run code inside a Monaco workspace designed to feel like the tools engineers use every day.',
    icon: Code2,
  },
  {
    number: '03',
    label: 'Prove',
    title: 'Submit work for review',
    description: 'Complete quizzes and assignments, receive instructor feedback, and improve the work—not just the score.',
    icon: FileCheck2,
  },
  {
    number: '04',
    label: 'Advance',
    title: 'Turn progress into proof',
    description: 'Earn points, climb the leaderboard, claim verified certificates, and move toward career opportunities.',
    icon: Trophy,
  },
];

const courseQueue = [
  { code: 'FS-101', route: 'Full-stack foundations', type: 'Core', status: 'Ready' },
  { code: 'TS-204', route: 'Production TypeScript', type: 'Code lab', status: 'Next' },
  { code: 'DB-310', route: 'PostgreSQL systems', type: 'Project', status: 'Review' },
  { code: 'AI-402', route: 'Applied AI workflows', type: 'Advanced', status: 'Locked' },
];

const platformFeatures = [
  { icon: TerminalSquare, title: 'Monaco code workspace', copy: 'Write, run, and refine code without leaving the lesson.' },
  { icon: MessageSquareText, title: 'Instructor review', copy: 'Get accountable feedback on the work you submit.' },
  { icon: Users, title: 'Learning community', copy: 'Ask better questions and learn alongside ambitious peers.' },
  { icon: BriefcaseBusiness, title: 'Career runway', copy: 'Connect proven progress to a curated engineering job board.' },
];

const outcomes = [
  { icon: BookOpen, value: 'Structured', label: 'Courses assigned with a clear path' },
  { icon: FileCheck2, value: 'Reviewed', label: 'Assignments graded by instructors' },
  { icon: Award, value: 'Verified', label: 'Certificates tied to completed work' },
];

function Brand() {
  return (
    <span className={styles.brand}>
      <span className={styles.brandMark} aria-hidden="true">A/</span>
      <span className={styles.brandText}>
        <strong>AUMINDS</strong>
        <small>Engineering Academy</small>
      </span>
    </span>
  );
}

function WorkspacePreview() {
  return (
    <div className={styles.workspace} aria-label="AUMINDS course workspace preview">
      <div className={styles.workspaceTopbar}>
        <div className={styles.windowControls} aria-hidden="true">
          <span />
          <span />
          <span />
        </div>
        <span className={styles.workspacePath}>courses / production-typescript / module-04</span>
        <span className={styles.liveState}><i /> Workspace live</span>
      </div>

      <div className={styles.workspaceBody}>
        <aside className={styles.lessonRail}>
          <div className={styles.railHeading}>
            <span>TS-204</span>
            <strong>Module 04</strong>
          </div>
          <ol>
            <li className={styles.lessonDone}><Check aria-hidden="true" /> Domain modelling</li>
            <li className={styles.lessonDone}><Check aria-hidden="true" /> Query contracts</li>
            <li className={styles.lessonCurrent}><Play aria-hidden="true" /> Repository patterns</li>
            <li><span>04</span> Failure boundaries</li>
          </ol>
          <div className={styles.moduleProgress}>
            <div><span>Module progress</span><strong>62%</strong></div>
            <span className={styles.progressTrack}><i /></span>
          </div>
        </aside>

        <div className={styles.editorPanel}>
          <div className={styles.editorTabs}>
            <span className={styles.activeTab}>repository.ts <i /></span>
            <span>repository.test.ts</span>
          </div>
          <div className={styles.codeArea} aria-label="TypeScript code example">
            <div className={styles.lineNumbers} aria-hidden="true">1<br />2<br />3<br />4<br />5<br />6<br />7<br />8<br />9<br />10<br />11</div>
            <pre><code><span className={styles.codeMuted}>// A contract the database cannot quietly break</span>{'\n'}<span className={styles.codeKeyword}>type</span> CourseProgress = {'{'}{'\n'}  studentId: <span className={styles.codeType}>StudentId</span>;{'\n'}  completed: <span className={styles.codeType}>LessonId</span>[];{'\n'}  score: <span className={styles.codeType}>number</span>;{'\n'}{'}'};{'\n\n'}<span className={styles.codeKeyword}>export async function</span> <span className={styles.codeFunction}>saveProgress</span>({'\n'}  progress: CourseProgress{'\n'}) {'{'} <span className={styles.codeMuted}>/* implementation */</span> {'}'}</code></pre>
          </div>
          <div className={styles.testBar}>
            <span><Check aria-hidden="true" /> 14 tests passed</span>
            <span>TypeScript 5.6</span>
            <span>UTF-8</span>
          </div>
        </div>
      </div>

      <div className={styles.reviewToast}>
        <span className={styles.reviewer}>AU</span>
        <span><strong>Instructor review ready</strong><small>2 notes on your latest submission</small></span>
        <ArrowRight aria-hidden="true" />
      </div>
    </div>
  );
}

export default function LandingPage({ user, destination, primaryAction }: LandingPageProps) {
  const ctaLabel = user ? primaryAction : 'Start learning';

  return (
    <main className={styles.page}>
      <a className={styles.skipLink} href="#main-content">Skip to content</a>

      <header className={styles.header}>
        <Link href="/" aria-label="AUMINDS home"><Brand /></Link>

        <nav className={styles.desktopNav} aria-label="Main navigation">
          <a href="#system">How it works</a>
          <a href="#platform">Platform</a>
          <a href="#outcomes">Outcomes</a>
        </nav>

        <div className={styles.headerActions}>
          {!user ? (
            <>
              <Link className={styles.signInLink} href="/login">Sign in</Link>
              <Link className={styles.headerCta} href="/signup">
                Request Access <ArrowRight aria-hidden="true" />
              </Link>
            </>
          ) : (
            <Link className={styles.headerCta} href={destination}>
              Open workspace <ArrowRight aria-hidden="true" />
            </Link>
          )}
        </div>

        <details className={styles.mobileMenu}>
          <summary><Menu aria-hidden="true" /><span>Menu</span></summary>
          <nav aria-label="Mobile navigation">
            <a href="#system">How it works</a>
            <a href="#platform">Platform</a>
            <a href="#outcomes">Outcomes</a>
            {!user ? (
              <>
                <Link href="/signup">Request Access <ArrowRight aria-hidden="true" /></Link>
                <Link href="/login">Sign In</Link>
              </>
            ) : (
              <Link href={destination}>{ctaLabel}<ArrowRight aria-hidden="true" /></Link>
            )}
          </nav>
        </details>
      </header>

      <section className={styles.hero} id="main-content">
        <div className={styles.heroGrid}>
          <div className={styles.heroCopy}>
            <p className={styles.kicker}><span>Now boarding</span> Your engineering career</p>
            <h1>Learn to ship software that <em>holds up.</em></h1>
            <p className={styles.heroLead}>A rigorous coding academy where clear instruction, a real browser IDE, reviewed assignments, and visible progress turn learning into engineering proof.</p>
            <div className={styles.heroActions}>
              {!user ? (
                <>
                  <Link className={styles.primaryCta} href="/signup">
                    Request Access <ArrowRight aria-hidden="true" />
                  </Link>
                  <Link className={styles.secondaryCta} href="/login">
                    Sign in
                  </Link>
                </>
              ) : (
                <>
                  <Link className={styles.primaryCta} href={destination}>
                    {primaryAction}<ArrowRight aria-hidden="true" />
                  </Link>
                  <a className={styles.secondaryCta} href="#system">
                    See the learning system<span aria-hidden="true">↓</span>
                  </a>
                </>
              )}
            </div>
            <p className={styles.ctaNote}>One workspace. Lessons, code, feedback, and momentum.</p>
          </div>

          <div className={styles.heroVisual}>
            <div className={styles.visualIndex} aria-hidden="true">01 / WORKSPACE</div>
            <WorkspacePreview />
          </div>
        </div>

        <div className={styles.heroBoard} aria-label="Academy format">
          <div><span>Program</span><strong>Software engineering</strong></div>
          <div><span>Format</span><strong>Learn · build · review</strong></div>
          <div><span>Workspace</span><strong>Browser based</strong></div>
          <div className={styles.boardStatus}><span>Status</span><strong><i /> Ready when you are</strong></div>
        </div>
      </section>

      <section className={styles.statement}>
        <p>Syntax is everywhere.</p>
        <h2>Engineering judgment is earned by doing the work—and getting the work reviewed.</h2>
      </section>

      <section className={styles.systemSection} id="system">
        <div className={styles.sectionIntro}>
          <p className={styles.sectionNumber}>02 / THE SYSTEM</p>
          <div>
            <p className={styles.eyebrow}>A clear route from lesson to proof</p>
            <h2>Progress you can see.<br />Skills you can defend.</h2>
          </div>
          <p className={styles.sectionLead}>Every part of AUMINDS moves you toward the next useful action. No content maze. No passive completion theatre.</p>
        </div>

        <div className={styles.routeList}>
          {learningRoute.map((item) => {
            const Icon = item.icon;
            return (
              <article className={styles.routeRow} key={item.number}>
                <span className={styles.routeNumber}>{item.number}</span>
                <span className={styles.routeIcon}><Icon aria-hidden="true" /></span>
                <div>
                  <span className={styles.routeLabel}>{item.label}</span>
                  <h3>{item.title}</h3>
                </div>
                <p>{item.description}</p>
                <ArrowRight className={styles.routeArrow} aria-hidden="true" />
              </article>
            );
          })}
        </div>
      </section>

      <section className={styles.platformSection} id="platform">
        <div className={styles.platformHeader}>
          <p className={styles.sectionNumber}>03 / THE PLATFORM</p>
          <h2>One place to learn,<br />build, and advance.</h2>
          <p>Professional-grade tools remove the distance between understanding a concept and proving you can use it.</p>
        </div>

        <div className={styles.queue}>
          <div className={styles.queueHeader}>
            <span>Course</span><span>Learning route</span><span>Format</span><span>Status</span>
          </div>
          {courseQueue.map((course, index) => (
            <div className={`${styles.queueRow} ${index === 1 ? styles.queueActive : ''}`} key={course.code}>
              <span className={styles.courseCode}>{course.code}</span>
              <strong>{course.route}</strong>
              <span>{course.type}</span>
              <span className={styles.courseStatus}><i /> {course.status}</span>
            </div>
          ))}
        </div>

        <div className={styles.featureList}>
          {platformFeatures.map((feature) => {
            const Icon = feature.icon;
            return (
              <div className={styles.feature} key={feature.title}>
                <Icon aria-hidden="true" />
                <h3>{feature.title}</h3>
                <p>{feature.copy}</p>
              </div>
            );
          })}
        </div>
      </section>

      <section className={styles.outcomesSection} id="outcomes">
        <div className={styles.outcomesCopy}>
          <p className={styles.sectionNumber}>04 / THE OUTCOME</p>
          <p className={styles.eyebrow}>More than course completion</p>
          <h2>Leave with evidence, not just exposure.</h2>
          <p>AUMINDS connects the full journey: assigned learning, hands-on practice, instructor review, community momentum, verified certificates, and curated opportunities.</p>
          <Link className={styles.textLink} href={destination}>{ctaLabel}<ArrowRight aria-hidden="true" /></Link>
        </div>

        <div className={styles.outcomeBoard}>
          {outcomes.map((outcome, index) => {
            const Icon = outcome.icon;
            return (
              <div className={styles.outcomeRow} key={outcome.value}>
                <span>0{index + 1}</span>
                <Icon aria-hidden="true" />
                <strong>{outcome.value}</strong>
                <p>{outcome.label}</p>
              </div>
            );
          })}
          <div className={styles.certificatePreview}>
            <div className={styles.certificateSeal}><Award aria-hidden="true" /></div>
            <div><span>AUMINDS / VERIFIED</span><strong>Certificate of completion</strong><small>Issued against completed coursework</small></div>
            <span className={styles.certificateCode}>AU—204—VER</span>
          </div>
        </div>
      </section>

      <section className={styles.finalCta}>
        <div className={styles.finalRule}><span>05 / YOUR NEXT MOVE</span><i /></div>
        <div className={styles.finalContent}>
          <h2>Stop collecting tutorials.<br /><em>Start building proof.</em></h2>
          <div>
            <p>Your next lesson, coding workspace, review, and milestone are waiting in one focused academy.</p>
            <Link className={styles.finalButton} href={user ? destination : "/signup"}>
              {user ? primaryAction : "Request Access"}<ArrowRight aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>

      <footer className={styles.footer}>
        <Brand />
        <p>Where technical depth becomes practical ability.</p>
        <nav aria-label="Footer navigation">
          <a href="#system">System</a>
          <a href="#platform">Platform</a>
          <Link href="/signup">Request Access</Link>
          <Link href="/login">Portal</Link>
        </nav>
        <span>© {new Date().getFullYear()} AUMINDS</span>
      </footer>
    </main>
  );
}
