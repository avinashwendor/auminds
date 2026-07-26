'use client';

import { useEffect, useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { toast } from 'sonner';
import LessonShimmerSkeleton from '@/components/LessonShimmerSkeleton';
import { useRouter } from 'next/navigation';
import VideoPlayer from '@/components/VideoPlayer';
import MarkdownViewer from '@/components/MarkdownViewer';
const MonacoCodeEditor = dynamic(() => import('@/components/MonacoCodeEditor'), {
  ssr: false,
  loading: () => <div className="grid min-h-[420px] place-items-center border border-border bg-card"><span className="board-label">Loading code workspace…</span></div>,
});
import QuizModal from '@/components/QuizModal';
import AssignmentModal from '@/components/AssignmentModal';
import CertificateModal from '@/components/CertificateModal';

import { 
  PlayCircle, FileText, Code2, CheckCircle2, 
  HelpCircle, UploadCloud, ChevronDown, ChevronUp, 
  ArrowLeft, Menu, Award, Search, Check, ChevronLeft, ChevronRight, Loader2
} from 'lucide-react';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetHeader, SheetDescription } from '@/components/ui/sheet';
import { Separator } from '@/components/ui/separator';

interface CourseWorkspaceClientProps {
  course: any;
  activeLesson: any;
  completedLessonIds: string[];
  activeQuiz: any;
  activeAssignment: any;
  existingSubmission: any;
  studentName?: string;
}

export default function CourseWorkspaceClient({
  course,
  activeLesson,
  completedLessonIds: initialCompletedIds,
  activeQuiz,
  activeAssignment,
  existingSubmission,
  studentName = 'Student',
}: CourseWorkspaceClientProps) {
  const router = useRouter();
  const [currentLesson, setCurrentLesson] = useState<any>(activeLesson);
  const [isShimmering, setIsShimmering] = useState<boolean>(false);
  const [completedIds, setCompletedIds] = useState<string[]>(initialCompletedIds);
  const [activeTab, setActiveTab] = useState<'lecture' | 'quiz' | 'assignment'>('lecture');
  const [expandedModules, setExpandedModules] = useState<Record<string, boolean>>(() => {
    const state: Record<string, boolean> = {};
    course.modules.forEach((m: any) => { state[m.id] = true; });
    return state;
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [isCertOpen, setIsCertOpen] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [sidebarWidth, setSidebarWidth] = useState(320);
  const [isResizingSidebar, setIsResizingSidebar] = useState(false);

  const courseLessons = useMemo(
    () => course.modules.flatMap((module: any) => module.lessons || []),
    [course.modules],
  );
  const firstCodeLesson = useMemo(
    () => courseLessons.find((lesson: any) => lesson.type === 'code'),
    [courseLessons],
  );
  const courseLessonIds = useMemo(
    () => new Set(courseLessons.map((lesson: any) => lesson.id)),
    [courseLessons],
  );
  const totalLessons = courseLessons.length;
  const completedCount = useMemo(
    () => completedIds.filter((id) => courseLessonIds.has(id)).length,
    [completedIds, courseLessonIds],
  );
  const progressPercent = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;
  const activeLessonIndex = courseLessons.findIndex((lesson: any) => lesson.id === currentLesson?.id);
  const previousLesson = activeLessonIndex > 0 ? courseLessons[activeLessonIndex - 1] : null;
  const nextLesson = activeLessonIndex >= 0 && activeLessonIndex < courseLessons.length - 1 ? courseLessons[activeLessonIndex + 1] : null;

  useEffect(() => {
    setCurrentLesson(activeLesson);
    setIsShimmering(false);
    setActiveTab('lecture');
    setIsMobileSidebarOpen(false);
  }, [activeLesson?.id]);

  const updateSidebarWidth = (clientX: number, sidebarLeft: number) => {
    setSidebarWidth(Math.min(520, Math.max(280, clientX - sidebarLeft)));
  };

  const handleSidebarResizeStart = (event: React.PointerEvent<HTMLDivElement>) => {
    event.currentTarget.setPointerCapture(event.pointerId);
    setIsResizingSidebar(true);
  };

  const handleSidebarResizeMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!isResizingSidebar) return;
    const sidebarLeft = event.currentTarget.parentElement?.getBoundingClientRect().left ?? 0;
    updateSidebarWidth(event.clientX, sidebarLeft);
  };

  const handleSidebarResizeEnd = (event: React.KeyboardEvent<HTMLDivElement> | React.PointerEvent<HTMLDivElement>) => {
    if ('pointerId' in event && 'releasePointerCapture' in event.currentTarget && event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    setIsResizingSidebar(false);
  };

  const handleSidebarResizeKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
    event.preventDefault();
    const step = event.shiftKey ? 40 : 16;
    setSidebarWidth((currentWidth) => Math.min(520, Math.max(280, currentWidth + (event.key === 'ArrowRight' ? step : -step))));
  };

  const navigateToLesson = (lessonId: string, e?: React.MouseEvent) => {
    if (e) e.preventDefault();
    if (currentLesson?.id === lessonId && !isShimmering) return;

    setIsMobileSidebarOpen(false);
    setIsShimmering(true);

    if (typeof window !== 'undefined') {
      window.history.pushState(null, '', `/dashboard/course/${course.slug}?lessonId=${encodeURIComponent(lessonId)}`);
    }

    const target = courseLessons.find((lesson: any) => lesson.id === lessonId);
    if (target) {
      setTimeout(() => {
        setCurrentLesson(target);
        setActiveTab('lecture');
        setIsShimmering(false);
      }, 140);
    } else {
      router.push(`/dashboard/course/${course.slug}?lessonId=${encodeURIComponent(lessonId)}`);
    }
  };

  const toggleModule = (modId: string) => {
    setExpandedModules(prev => ({ ...prev, [modId]: !prev[modId] }));
  };

  const handleLessonComplete = async (lessonId: string) => {
    if (completedIds.includes(lessonId)) return;
    const previousCompleted = completedIds;
    const nextCompleted = [...completedIds, lessonId];
    setCompletedIds(nextCompleted);
    const lessonTitle = courseLessons.find((lesson: any) => lesson.id === lessonId)?.title || 'Lesson';
    try {
      const response = await fetch('/api/student/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lessonId }),
      });
      if (!response.ok) throw new Error('Completion could not be saved.');
      toast.success(`${lessonTitle} marked complete`, { icon: <Check className="w-4 h-4 text-emerald-500" /> });
    } catch (error) {
      setCompletedIds(previousCompleted);
      toast.error(error instanceof Error ? error.message : 'Completion could not be saved. Try again.');
    }
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-slate-950 border-r border-slate-800">
      <div className="p-5 space-y-4 shrink-0">
        <Link href="/dashboard" className="hidden lg:flex items-center gap-2 text-xs text-indigo-400 hover:text-indigo-300 font-mono transition-colors w-fit">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Dashboard
        </Link>
        <h2 className="font-bold text-lg text-slate-100 leading-snug">{course.title}</h2>
        {firstCodeLesson && (
          <Link
            href={`/dashboard/course/${course.slug}?lessonId=${encodeURIComponent(firstCodeLesson.id)}`}
            onClick={(e) => navigateToLesson(firstCodeLesson.id, e)}
            className={cn(
              'flex min-h-11 flex-col items-start justify-center gap-1 border px-3 py-2.5 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
              currentLesson?.id === firstCodeLesson.id
                ? 'border-indigo-500/40 bg-indigo-500/10 text-slate-100'
                : 'border-slate-800 bg-slate-900/60 text-slate-300 hover:border-indigo-500/40 hover:bg-slate-900 hover:text-slate-100'
            )}
          >
            <span className="flex min-w-0 items-center gap-2"><Code2 className="size-4 shrink-0 text-primary" /> Open Code Editor</span>
            <span className="w-full break-words pl-6 text-left text-[10px] font-mono leading-tight text-muted-foreground">{firstCodeLesson.title}</span>
          </Link>
        )}
        
        {/* Progress Indicator */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-slate-400">Course Completion</span>
            <span className="text-indigo-400 font-bold">{progressPercent}%</span>
          </div>
          <Progress value={progressPercent} className="h-2 bg-slate-800" indicatorClassName="bg-gradient-to-r from-indigo-500 to-emerald-400" />
        </div>

        {/* Certificate Trigger Button */}
        {progressPercent >= 100 && (
          <Button
            onClick={() => setIsCertOpen(true)}
            className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold shadow-lg shadow-amber-500/20 group relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500" />
            <Award className="w-4 h-4 mr-2" /> Claim Official Certificate
          </Button>
        )}

        {/* Search Box */}
        <div className="relative group">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
          <Input
            type="text"
            placeholder="Search syllabus..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 bg-slate-900 border-slate-800 focus-visible:ring-indigo-500 text-slate-200"
          />
        </div>
      </div>

      <Separator className="bg-slate-800" />

      {/* Modules & Lessons List */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4 pb-20">
          {course.modules.map((module: any, modIdx: number) => {
            const isExpanded = expandedModules[module.id];
            const filteredLessons = module.lessons.filter((l: any) => 
              !searchQuery || l.title.toLowerCase().includes(searchQuery.toLowerCase())
            );

            if (searchQuery && filteredLessons.length === 0) return null;

            return (
              <Card key={module.id} className="border-slate-800 bg-slate-900/50 overflow-hidden shadow-none rounded-xl">
                <CardHeader className="p-0">
                  <button
                    onClick={() => toggleModule(module.id)}
                    className="w-full p-4 flex items-center justify-between text-left hover:bg-slate-900 transition-colors group"
                  >
                    <div className="flex items-center gap-2 overflow-hidden">
                      <span className="text-indigo-400 font-mono text-xs font-semibold shrink-0">M{modIdx + 1}.</span>
                      <span className="text-sm font-semibold text-slate-200 truncate group-hover:text-slate-100 transition-colors">{module.title}</span>
                    </div>
                    {isExpanded ? <ChevronUp className="w-4 h-4 shrink-0 text-slate-500" /> : <ChevronDown className="w-4 h-4 shrink-0 text-slate-500" />}
                  </button>
                </CardHeader>

                {isExpanded && (
                  <CardContent className="p-1.5 pt-0 space-y-1 bg-slate-950/30">
                    {filteredLessons.map((lesson: any) => {
                      const isActive = currentLesson?.id === lesson.id;
                      const isDone = completedIds.includes(lesson.id);

                      let Icon = PlayCircle;
                      if (lesson.type === 'markdown') Icon = FileText;
                      if (lesson.type === 'code') Icon = Code2;

                      return (
                        <Link
                          key={lesson.id}
                          href={`/dashboard/course/${course.slug}?lessonId=${encodeURIComponent(lesson.id)}`}
                          onClick={(e) => navigateToLesson(lesson.id, e)}
                          className={cn(
                            "w-full px-3 py-2.5 rounded-lg flex items-center justify-between transition-all group",
                            isActive 
                              ? "bg-indigo-500/10 border border-indigo-500/20" 
                              : "hover:bg-slate-900/80 border border-transparent"
                          )}
                        >
                          <div className="flex items-center gap-3 overflow-hidden pr-2">
                            <Icon className={cn("w-4 h-4 shrink-0", isActive ? "text-indigo-400" : "text-slate-500 group-hover:text-indigo-400")} />
                            <span className={cn("text-xs truncate transition-colors", isActive ? "text-slate-100 font-semibold" : "text-slate-400 group-hover:text-slate-200")}>{lesson.title}</span>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            {isActive && <Badge variant="secondary" className="bg-indigo-500/20 text-indigo-300 hover:bg-indigo-500/20 text-[9px] px-1.5 py-0">Active</Badge>}
                            {isDone ? (
                              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                            ) : (
                              <span className="text-[10px] font-mono text-slate-500">{lesson.durationMinutes}m</span>
                            )}
                          </div>
                        </Link>
                      );
                    })}
                  </CardContent>
                )}
              </Card>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );

  const isCompleted = currentLesson ? completedIds.includes(currentLesson.id) : false;

  return (
    <div className={cn(
      'course-workspace flex h-[calc(100svh-4rem)] w-full overflow-hidden bg-slate-950 text-slate-200 relative md:h-screen',
      isResizingSidebar && 'select-none'
    )}>
      {/* Mobile Header & Sheet */}
      <div className="lg:hidden absolute top-0 left-0 right-0 z-30 p-3 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
        <Link href="/dashboard" className="text-xs text-indigo-400 flex items-center gap-1.5 font-mono">
          <ArrowLeft className="w-4 h-4" /> My Courses
        </Link>
        <Sheet open={isMobileSidebarOpen} onOpenChange={setIsMobileSidebarOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" size="sm" className="bg-slate-900 border-slate-800 text-slate-200 gap-2">
              <Menu className="w-4 h-4" /> Course Outline
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-80 bg-slate-950 border-r-slate-800 sm:max-w-xs">
            <SheetHeader className="sr-only">
              <SheetTitle>Course Outline</SheetTitle>
              <SheetDescription>Navigate course syllabus</SheetDescription>
            </SheetHeader>
            <SidebarContent />
          </SheetContent>
        </Sheet>
      </div>

      {/* Desktop Sidebar */}
      <aside
        className="relative hidden lg:block h-full shrink-0 border-r border-slate-800 bg-slate-950"
        style={{ width: `${sidebarWidth}px` }}
      >
        <SidebarContent />
        <div
          role="separator"
          aria-orientation="vertical"
          aria-label="Resize course sidebar"
          aria-valuemin={280}
          aria-valuemax={520}
          aria-valuenow={sidebarWidth}
          tabIndex={0}
          onPointerDown={handleSidebarResizeStart}
          onPointerMove={handleSidebarResizeMove}
          onPointerUp={handleSidebarResizeEnd}
          onPointerCancel={handleSidebarResizeEnd}
          onKeyDown={handleSidebarResizeKeyDown}
          className={cn(
            'group absolute inset-y-0 -right-1 z-20 hidden w-2 touch-none cursor-col-resize items-center justify-center lg:flex',
            isResizingSidebar && 'bg-primary/10'
          )}
        >
          <span className="h-full w-px bg-transparent transition-colors group-hover:bg-primary/70 group-focus-visible:bg-primary" />
        </div>
      </aside>

      {/* Main Lesson Workspace */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto mt-14 lg:mt-0 p-4 sm:p-6 lg:p-8">
        {isShimmering ? (
          <div className="max-w-[1200px] mx-auto w-full">
            <LessonShimmerSkeleton />
          </div>
        ) : currentLesson ? (
          <Tabs 
            value={activeTab} 
            onValueChange={(val) => setActiveTab(val as any)} 
            className="flex-1 flex flex-col space-y-6 max-w-[1200px] mx-auto w-full"
          >
            <div className="grid gap-4 border-b border-border pb-5 sm:grid-cols-[1fr_auto] sm:items-end">
              <div><p className="board-label text-primary">Lesson {activeLessonIndex + 1} of {totalLessons}</p><h1 className="board-value mt-2 text-2xl text-foreground sm:text-3xl">{currentLesson.title}</h1><p className="mt-2 text-sm text-muted-foreground">{course.title} · {currentLesson.durationMinutes || 0} min</p></div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" disabled={!previousLesson} onClick={(e) => previousLesson && navigateToLesson(previousLesson.id, e)}><ChevronLeft className="size-4" /> Previous</Button>
                <Button variant="outline" size="sm" disabled={!nextLesson} onClick={(e) => nextLesson && navigateToLesson(nextLesson.id, e)}>Next <ChevronRight className="size-4" /></Button>
              </div>
            </div>

            {/* Top Workspace Navigation Tabs */}
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <TabsList className="bg-slate-900 border border-slate-800">
                <TabsTrigger value="lecture" className="text-xs data-[state=active]:bg-indigo-600 data-[state=active]:text-white">
                  {currentLesson.type === 'video' && <PlayCircle className="w-4 h-4 mr-2" />}
                  {currentLesson.type === 'markdown' && <FileText className="w-4 h-4 mr-2" />}
                  {currentLesson.type === 'code' && <Code2 className="w-4 h-4 mr-2" />}
                  Lecture & Workspace
                </TabsTrigger>

                {activeQuiz && (
                  <TabsTrigger value="quiz" className="text-xs data-[state=active]:bg-amber-600 data-[state=active]:text-white">
                    <HelpCircle className="w-4 h-4 mr-2 text-amber-400 data-[state=active]:text-white" /> Knowledge Quiz
                  </TabsTrigger>
                )}

                {activeAssignment && (
                  <TabsTrigger value="assignment" className="text-xs data-[state=active]:bg-purple-600 data-[state=active]:text-white">
                    <UploadCloud className="w-4 h-4 mr-2 text-purple-400 data-[state=active]:text-white" /> Submit Project
                  </TabsTrigger>
                )}
              </TabsList>

              {progressPercent >= 100 && (
                <Button
                  onClick={() => setIsCertOpen(true)}
                  variant="outline"
                  className="bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border-amber-500/30 font-bold text-xs"
                >
                  <Award className="w-4 h-4 mr-2" /> View Certificate
                </Button>
              )}
            </div>

            {/* Active Content Renderer */}
            <div className="flex-1 min-h-0">
              <TabsContent value="lecture" className="h-full m-0 data-[state=active]:flex flex-col">
                {currentLesson.type === 'video' && (
                  <VideoPlayer
                    videoUrl={currentLesson.videoUrl || 'https://www.youtube.com/watch?v=wm5gMKCORL4'}
                    title={currentLesson.title}
                    isCompleted={isCompleted}
                    onComplete={() => handleLessonComplete(currentLesson.id)}
                  />
                )}

                {currentLesson.type === 'markdown' && (
                  <MarkdownViewer
                    content={currentLesson.markdownContent || '# Lecture Content'}
                    title={currentLesson.title}
                    isCompleted={isCompleted}
                    onComplete={() => handleLessonComplete(currentLesson.id)}
                  />
                )}

                {currentLesson.type === 'code' && (
                  <MonacoCodeEditor
                    initialCode={currentLesson.initialCode}
                    solutionCode={currentLesson.solutionCode}
                    language={currentLesson.language || 'javascript'}
                    title={currentLesson.title}
                    isCompleted={isCompleted}
                    onComplete={() => handleLessonComplete(currentLesson.id)}
                  />
                )}
              </TabsContent>

              {activeQuiz && (
                <TabsContent value="quiz" className="m-0">
                  <QuizModal
                    quiz={activeQuiz}
                    onComplete={() => handleLessonComplete(currentLesson.id)}
                  />
                </TabsContent>
              )}

              {activeAssignment && (
                <TabsContent value="assignment" className="m-0">
                  <AssignmentModal
                    assignment={activeAssignment}
                    existingSubmission={existingSubmission}
                  />
                </TabsContent>
              )}
            </div>
          </Tabs>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <Card className="w-full max-w-md bg-slate-900/50 border-slate-800 glass-card">
              <CardContent className="p-12 text-center flex flex-col items-center">
                <FileText className="w-12 h-12 text-slate-700 mb-4" />
                <h3 className="text-lg font-semibold text-slate-300 mb-2">Ready to learn?</h3>
                <p className="text-sm text-slate-500">Select a lesson from the syllabus on the left to start learning.</p>
              </CardContent>
            </Card>
          </div>
        )}
      </main>

      {/* Certificate Modal Component */}
      <CertificateModal
        isOpen={isCertOpen}
        onClose={() => setIsCertOpen(false)}
        studentName={studentName}
        courseTitle={course.title}
      />
    </div>
  );
}
