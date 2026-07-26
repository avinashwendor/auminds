'use client';

import { useState } from 'react';
import Link from 'next/link';
import { 
  BookOpen, Plus, Trash2, Edit3, Video, FileText, Code2, 
  Layers, ChevronRight, CheckCircle, ArrowLeft, Sparkles, FolderPlus, FilePlus
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

interface CourseManagementClientProps {
  initialCourses: any[];
}

export default function CourseManagementClient({ initialCourses }: CourseManagementClientProps) {
  const [courses, setCourses] = useState(initialCourses);
  const [isCreatingCourse, setIsCreatingCourse] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<any>(null);

  // New Course Form State
  const [courseTitle, setCourseTitle] = useState('');
  const [courseSlug, setCourseSlug] = useState('');
  const [courseDesc, setCourseDesc] = useState('');
  const [courseLevel, setCourseLevel] = useState('Beginner');

  // Module / Lesson Form State
  const [isAddingModule, setIsAddingModule] = useState(false);
  const [modTitle, setModTitle] = useState('');

  const [isAddingLesson, setIsAddingLesson] = useState(false);
  const [targetModId, setTargetModId] = useState('');
  const [lessonTitle, setLessonTitle] = useState('');
  const [lessonType, setLessonType] = useState<'video' | 'markdown' | 'code'>('video');
  const [videoUrl, setVideoUrl] = useState('');
  const [markdownContent, setMarkdownContent] = useState('');
  const [initialCode, setInitialCode] = useState('');
  const [solutionCode, setSolutionCode] = useState('');
  const [language, setLanguage] = useState('javascript');

  const handleCreateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!courseTitle || !courseDesc) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      const res = await fetch('/api/admin/courses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'createCourse',
          title: courseTitle,
          slug: courseSlug || courseTitle.toLowerCase().replace(/\s+/g, '-'),
          description: courseDesc,
          level: courseLevel,
        }),
      });
      const data = await res.json();
      if (data.course) {
        setCourses([data.course, ...courses]);
        setIsCreatingCourse(false);
        setCourseTitle('');
        setCourseDesc('');
        setCourseSlug('');
        toast.success('Course created successfully');
      } else {
        toast.error('Failed to create course');
      }
    } catch (err) {
      console.error(err);
      toast.error('An error occurred while creating course');
    }
  };

  const handleDeleteCourse = async (courseId: string) => {
    if (!confirm('Are you sure you want to delete this course?')) return;
    try {
      await fetch(`/api/admin/courses?courseId=${courseId}`, { method: 'DELETE' });
      setCourses(courses.filter(c => c.id !== courseId));
      toast.success('Course deleted');
    } catch (err) {
      console.error(err);
      toast.error('Failed to delete course');
    }
  };

  const handleAddModule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!modTitle || !selectedCourse) return;

    try {
      const res = await fetch('/api/admin/courses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'createModule',
          courseId: selectedCourse.id,
          title: modTitle,
        }),
      });
      const data = await res.json();
      if (data.module) {
        const moduleWithLessons = { ...data.module, lessons: [] };
        setCourses((current: any[]) => current.map((course) => course.id === selectedCourse.id ? { ...course, modules: [...(course.modules || []), moduleWithLessons] } : course));
        setSelectedCourse((current: any) => ({ ...current, modules: [...(current.modules || []), moduleWithLessons] }));
        setIsAddingModule(false);
        setModTitle('');
        toast.success('Module added to the curriculum.');
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to create module');
    }
  };

  const handleAddLesson = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!lessonTitle || !targetModId) return;

    try {
      const res = await fetch('/api/admin/courses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'createLesson',
          moduleId: targetModId,
          title: lessonTitle,
          type: lessonType,
          videoUrl,
          markdownContent,
          initialCode,
          solutionCode,
          language,
        }),
      });
      const data = await res.json();
      if (data.lesson) {
        const applyLesson = (course: any) => ({ ...course, modules: (course.modules || []).map((module: any) => module.id === targetModId ? { ...module, lessons: [...(module.lessons || []), data.lesson] } : module) });
        setCourses((current: any[]) => current.map((course) => course.id === selectedCourse?.id ? applyLesson(course) : course));
        setSelectedCourse((current: any) => applyLesson(current));
        setIsAddingLesson(false);
        setLessonTitle('');
        toast.success('Lesson added to the module.');
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to create lesson');
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <Card className="glass-card border-indigo-500/20 bg-slate-900/90 shadow-2xl">
        <CardContent className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="icon" asChild className="rounded-2xl bg-slate-800 text-slate-300 hover:text-white border-slate-700 h-10 w-10">
              <Link href="/admin">
                <ArrowLeft className="w-5 h-5" />
              </Link>
            </Button>
            <div>
              <h1 className="text-2xl font-black text-white flex items-center gap-2">
                <BookOpen className="w-6 h-6 text-indigo-400" /> Curriculum & Course Manager
              </h1>
              <p className="text-xs text-slate-400 font-mono mt-1">
                Build and publish courses, modules, video lectures, and Monaco IDE coding exercises.
              </p>
            </div>
          </div>

          <Button
            onClick={() => setIsCreatingCourse(true)}
            className="rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold shadow-lg shadow-indigo-600/30 transition-all px-5 h-10"
          >
            <Plus className="w-4 h-4 mr-2" /> Create New Course
          </Button>
        </CardContent>
      </Card>

      {/* New Course Modal / Inline Form */}
      {isCreatingCourse && (
        <Card className="glass-card border-indigo-500/30 bg-slate-900/95 shadow-2xl">
          <CardHeader>
            <CardTitle className="text-lg font-bold text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-indigo-400" /> Create Course Curriculum
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateCourse} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <Label className="text-xs font-mono text-slate-400">Course Title</Label>
                  <Input
                    type="text"
                    placeholder="e.g. Advanced Rust System Design"
                    value={courseTitle}
                    onChange={(e) => setCourseTitle(e.target.value)}
                    className="bg-slate-950 text-slate-200 border-slate-800 focus-visible:ring-indigo-500 rounded-xl h-11"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-mono text-slate-400">Course Level</Label>
                  <Select value={courseLevel} onValueChange={setCourseLevel}>
                    <SelectTrigger className="bg-slate-950 text-slate-200 border-slate-800 focus:ring-indigo-500 rounded-xl h-11">
                      <SelectValue placeholder="Select Level" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-900 border-slate-800 text-slate-200">
                      <SelectItem value="Beginner">Beginner</SelectItem>
                      <SelectItem value="Intermediate">Intermediate</SelectItem>
                      <SelectItem value="Advanced">Advanced</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-mono text-slate-400">Course Description</Label>
                <Textarea
                  placeholder="Detailed course overview..."
                  value={courseDesc}
                  onChange={(e) => setCourseDesc(e.target.value)}
                  className="bg-slate-950 text-slate-200 border-slate-800 focus-visible:ring-indigo-500 rounded-xl min-h-[100px] resize-none"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setIsCreatingCourse(false)}
                  className="rounded-xl text-slate-400 hover:text-slate-200 font-mono text-xs"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold shadow-lg shadow-indigo-600/30"
                >
                  Publish Course
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {courses.length === 0 && !isCreatingCourse && <div className="border-y border-border py-12 text-center text-sm text-muted-foreground">No courses yet. Create the first curriculum route.</div>}
      <div className="border-t border-border">
        {courses.map((course: any, index: number) => (
          <div key={course.id} className="grid gap-4 border-b border-border py-5 sm:grid-cols-[4rem_1fr_auto] sm:items-center">
            <span className="font-mono text-xs font-bold text-primary">AUM-{String(index + 1).padStart(2, '0')}</span>
            <div><h3 className="board-value text-xl">{course.title}</h3><p className="mt-1 text-sm text-muted-foreground">{course.level} · {(course.modules || []).length} modules</p></div>
            <div className="flex gap-2"><Button variant="outline" onClick={() => setSelectedCourse(course)}><Edit3 className="size-4" /> Manage</Button><Button variant="ghost" size="icon" onClick={() => handleDeleteCourse(course.id)} title="Delete course"><Trash2 className="size-4" /></Button></div>
          </div>
        ))}
      </div>

      {selectedCourse && <section className="border border-border bg-card">
        <header className="flex flex-col justify-between gap-4 border-b border-border p-5 sm:flex-row sm:items-center"><div><p className="board-label text-primary">Curriculum editor</p><h2 className="board-value mt-2 text-2xl">{selectedCourse.title}</h2></div><div className="flex gap-2"><Button variant="outline" onClick={() => setIsAddingModule(!isAddingModule)}><FolderPlus className="size-4" /> Add module</Button><Button variant="ghost" onClick={() => setSelectedCourse(null)}>Close</Button></div></header>
        {isAddingModule && <form onSubmit={handleAddModule} className="flex flex-col gap-3 border-b border-border p-5 sm:flex-row"><Input value={modTitle} onChange={(event) => setModTitle(event.target.value)} placeholder="Module title" required /><Button type="submit">Save module</Button></form>}
        <div>{(selectedCourse.modules || []).length === 0 ? <p className="p-8 text-sm text-muted-foreground">No modules yet. Add one to begin the syllabus.</p> : selectedCourse.modules.map((module: any, index: number) => <div key={module.id} className="border-b border-border last:border-b-0">
          <div className="flex items-center justify-between gap-4 p-5"><div><span className="font-mono text-xs text-primary">M{String(index + 1).padStart(2, '0')}</span><h3 className="mt-1 font-bold">{module.title}</h3><p className="text-xs text-muted-foreground">{(module.lessons || []).length} lessons</p></div><Button variant="outline" size="sm" onClick={() => { setTargetModId(module.id); setIsAddingLesson(true); }}><FilePlus className="size-4" /> Add lesson</Button></div>
          {(module.lessons || []).map((lesson: any, lessonIndex: number) => <div key={lesson.id} className="grid grid-cols-[3rem_1fr_auto] items-center gap-3 border-t border-border px-5 py-3 text-sm"><span className="font-mono text-[10px] text-muted-foreground">{String(lessonIndex + 1).padStart(2, '0')}</span><span>{lesson.title}</span><Badge variant="outline">{lesson.type}</Badge></div>)}
        </div>)}</div>
      </section>}

      {isAddingLesson && <Card className="border-primary/35"><CardHeader><CardTitle className="text-lg">Add lesson</CardTitle><CardDescription>Attach the lesson to the selected curriculum module.</CardDescription></CardHeader><CardContent><form onSubmit={handleAddLesson} className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2"><div className="space-y-2"><Label>Lesson title</Label><Input value={lessonTitle} onChange={(event) => setLessonTitle(event.target.value)} required /></div><div className="space-y-2"><Label>Lesson format</Label><Select value={lessonType} onValueChange={(value) => setLessonType(value as any)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="video">Video</SelectItem><SelectItem value="markdown">Markdown</SelectItem><SelectItem value="code">Code workspace</SelectItem></SelectContent></Select></div></div>
        {lessonType === 'video' && <div className="space-y-2"><Label>Video URL</Label><Input type="url" value={videoUrl} onChange={(event) => setVideoUrl(event.target.value)} placeholder="https://youtube.com/watch?v=..." /></div>}
        {lessonType === 'markdown' && <div className="space-y-2"><Label>Lesson content</Label><Textarea value={markdownContent} onChange={(event) => setMarkdownContent(event.target.value)} className="min-h-48 font-mono" placeholder="# Lesson title" /></div>}
        {lessonType === 'code' && <div className="grid gap-4 md:grid-cols-2"><div className="space-y-2"><Label>Starter code</Label><Textarea value={initialCode} onChange={(event) => setInitialCode(event.target.value)} className="min-h-48 font-mono" /></div><div className="space-y-2"><Label>Reference solution</Label><Textarea value={solutionCode} onChange={(event) => setSolutionCode(event.target.value)} className="min-h-48 font-mono" /></div></div>}
        <div className="flex justify-end gap-2"><Button type="button" variant="ghost" onClick={() => setIsAddingLesson(false)}>Cancel</Button><Button type="submit">Add lesson</Button></div>
      </form></CardContent></Card>}
    </div>
  );
}
