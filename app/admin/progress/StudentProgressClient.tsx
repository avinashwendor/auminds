'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import {
  Activity,
  BookOpen,
  CheckCircle2,
  ChevronRight,
  Clock,
  Code2,
  FileText,
  Search,
  UploadCloud,
  User,
  XCircle,
} from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import type {
  AdminStudentProgressRecord,
  AdminStudentProgressResponse,
  StudentActivityItem,
} from '@/lib/types/admin-progress';

interface StudentProgressClientProps {
  initialData: AdminStudentProgressResponse;
  initialSelectedUserId?: string;
}

function formatRelativeTime(iso: string) {
  const date = new Date(iso);
  const diffMs = Date.now() - date.getTime();
  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString();
}

function ActivityIcon({ item }: { item: StudentActivityItem }) {
  if (item.type === 'lesson') {
    if (item.meta.lessonType === 'code') return <Code2 className="size-4 text-[#3366FF]" />;
    if (item.meta.lessonType === 'video') return <BookOpen className="size-4 text-[#826AF9]" />;
    return <FileText className="size-4 text-[#00AB55]" />;
  }
  if (item.type === 'quiz') {
    return item.meta.passed
      ? <CheckCircle2 className="size-4 text-[#00AB55]" />
      : <XCircle className="size-4 text-[#EE6A5F]" />;
  }
  return <UploadCloud className="size-4 text-[#F3B61F]" />;
}

function activityLabel(item: StudentActivityItem) {
  if (item.type === 'lesson') return 'Completed lesson';
  if (item.type === 'quiz') {
    return item.meta.passed
      ? `Passed quiz · ${item.meta.score}%`
      : `Quiz attempt · ${item.meta.score}%`;
  }
  return `Assignment · ${item.meta.status || 'submitted'}`;
}

export default function StudentProgressClient({
  initialData,
  initialSelectedUserId,
}: StudentProgressClientProps) {
  const [students, setStudents] = useState(initialData.students);
  const [searchQuery, setSearchQuery] = useState('');
  const [courseFilter, setCourseFilter] = useState('all');
  const [selectedUserId, setSelectedUserId] = useState(
    initialSelectedUserId || initialData.students[0]?.userId || '',
  );

  const filteredStudents = useMemo(() => {
    return students.filter((student) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch = !q
        || student.name.toLowerCase().includes(q)
        || student.username.toLowerCase().includes(q)
        || (student.email && student.email.toLowerCase().includes(q));

      const matchesCourse = courseFilter === 'all'
        || student.courses.some((course) => course.courseId === courseFilter);

      return matchesSearch && matchesCourse;
    });
  }, [students, searchQuery, courseFilter]);

  const selectedStudent = useMemo(
    () => students.find((student) => student.userId === selectedUserId) || null,
    [students, selectedUserId],
  );

  const summary = useMemo(() => ({
    activeStudents: students.filter((s) => s.status === 'approved').length,
    totalCompletions: students.reduce((sum, s) => sum + s.stats.lessonsCompleted, 0),
    totalQuizAttempts: students.reduce((sum, s) => sum + s.stats.quizzesAttempted, 0),
    pendingAssignments: students.reduce(
      (sum, s) => sum + s.recentActivity.filter((a) => a.type === 'assignment' && a.meta.status === 'pending').length,
      0,
    ),
  }), [students]);

  return (
    <div className="space-y-8">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#919EAB]/12 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="board-label text-[#3366FF]">LEARNER ANALYTICS</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">STUDENT PROGRESS & ACTIVITY</h1>
          <p className="text-xs text-[#919EAB] mt-1">
            Track lesson completions, quiz scores, assignment submissions, and course progress across all students.
          </p>
        </div>
        <Link
          href="/admin/users"
          className="px-4 py-2.5 rounded-xl bg-[#212B36] hover:bg-[#919EAB]/20 border border-[#919EAB]/20 text-white font-bold text-xs flex items-center gap-2 transition-all shrink-0"
        >
          <User className="size-4" /> Manage Users
        </Link>
      </header>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="minimal-card p-4">
          <span className="board-label">Active Students</span>
          <strong className="text-2xl font-extrabold text-white mt-2 block font-mono">{summary.activeStudents}</strong>
        </div>
        <div className="minimal-card p-4">
          <span className="board-label text-[#00AB55]">Lessons Completed</span>
          <strong className="text-2xl font-extrabold text-[#00AB55] mt-2 block font-mono">{summary.totalCompletions}</strong>
        </div>
        <div className="minimal-card p-4">
          <span className="board-label text-[#FFC107]">Quiz Attempts</span>
          <strong className="text-2xl font-extrabold text-[#FFC107] mt-2 block font-mono">{summary.totalQuizAttempts}</strong>
        </div>
        <div className="minimal-card p-4">
          <span className="board-label text-[#826AF9]">Recent Submissions</span>
          <strong className="text-2xl font-extrabold text-white mt-2 block font-mono">{summary.pendingAssignments}</strong>
        </div>
      </section>

      <div className="minimal-card p-4 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-[#919EAB]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search students by name, username, or email..."
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-[#212B36] border border-[#919EAB]/20 text-xs text-white placeholder:text-[#637381] focus:outline-none focus:border-[#3366FF]"
          />
        </div>
        <select
          value={courseFilter}
          onChange={(e) => setCourseFilter(e.target.value)}
          className="px-3 py-2 rounded-xl bg-[#212B36] border border-[#919EAB]/20 text-xs text-white focus:outline-none font-mono min-w-[180px]"
        >
          <option value="all">All courses</option>
          {initialData.courses.map((course) => (
            <option key={course.id} value={course.id}>{course.title}</option>
          ))}
        </select>
      </div>

      <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
        <div className="minimal-card overflow-hidden">
          <div className="p-4 border-b border-[#919EAB]/12">
            <h2 className="text-sm font-bold text-white">Students ({filteredStudents.length})</h2>
          </div>
          <div className="max-h-[640px] overflow-y-auto divide-y divide-[#919EAB]/12">
            {filteredStudents.length === 0 ? (
              <p className="p-6 text-xs text-[#919EAB] text-center">No students match your filters.</p>
            ) : (
              filteredStudents.map((student) => (
                <StudentListItem
                  key={student.userId}
                  student={student}
                  isSelected={student.userId === selectedUserId}
                  onSelect={() => setSelectedUserId(student.userId)}
                />
              ))
            )}
          </div>
        </div>

        <div className="space-y-6">
          {selectedStudent ? (
            <StudentDetailPanel student={selectedStudent} />
          ) : (
            <div className="minimal-card p-12 text-center">
              <Activity className="size-10 text-[#637381] mx-auto mb-3" />
              <p className="text-sm text-[#919EAB]">Select a student to view their progress and activity.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function StudentListItem({
  student,
  isSelected,
  onSelect,
}: {
  student: AdminStudentProgressRecord;
  isSelected: boolean;
  onSelect: () => void;
}) {
  const topCourse = student.courses[0];
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`w-full p-4 text-left transition-colors hover:bg-[#212B36]/60 ${isSelected ? 'bg-[#3366FF]/10 border-l-2 border-[#3366FF]' : ''}`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-sm font-bold text-white truncate">{student.name}</p>
          <p className="text-[11px] font-mono text-[#00AB55]">@{student.username}</p>
        </div>
        <ChevronRight className={`size-4 shrink-0 ${isSelected ? 'text-[#3366FF]' : 'text-[#637381]'}`} />
      </div>
      <div className="mt-2 flex flex-wrap gap-2 text-[10px] font-mono">
        <span className="text-[#919EAB]">{student.stats.lessonsCompleted} lessons</span>
        <span className="text-[#637381]">·</span>
        <span className="text-[#F3B61F]">{student.points} pts</span>
        {student.lastActiveAt && (
          <>
            <span className="text-[#637381]">·</span>
            <span className="text-[#919EAB]">{formatRelativeTime(student.lastActiveAt)}</span>
          </>
        )}
      </div>
      {topCourse && (
        <div className="mt-2">
          <div className="flex justify-between text-[10px] font-mono text-[#919EAB] mb-1">
            <span className="truncate pr-2">{topCourse.courseTitle}</span>
            <span>{topCourse.progressPercent}%</span>
          </div>
          <Progress value={topCourse.progressPercent} className="h-1.5" />
        </div>
      )}
    </button>
  );
}

function StudentDetailPanel({ student }: { student: AdminStudentProgressRecord }) {
  return (
    <>
      <div className="minimal-card p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="size-12 rounded-xl bg-[#3366FF]/15 border border-[#3366FF]/30 text-[#3366FF] font-bold text-lg flex items-center justify-center font-mono">
              {student.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-white">{student.name}</h2>
              <p className="text-xs font-mono text-[#00AB55]">@{student.username}</p>
              {student.email && <p className="text-xs text-[#919EAB] mt-0.5">{student.email}</p>}
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <span className="px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold bg-[#00AB55]/15 text-[#00AB55] border border-[#00AB55]/30">
              {student.stats.lessonsCompleted} lessons done
            </span>
            <span className="px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold bg-[#FFC107]/15 text-[#FFC107] border border-[#FFC107]/30">
              {student.stats.quizzesPassed}/{student.stats.quizzesAttempted} quizzes passed
            </span>
            <span className="px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold bg-[#826AF9]/15 text-[#826AF9] border border-[#826AF9]/30">
              {student.stats.assignmentsAccepted}/{student.stats.assignmentsSubmitted} assignments accepted
            </span>
          </div>
        </div>

        {student.lastActiveAt && (
          <p className="text-[11px] font-mono text-[#919EAB] flex items-center gap-1.5">
            <Clock className="size-3.5" />
            Last active {formatRelativeTime(student.lastActiveAt)}
          </p>
        )}
      </div>

      <div className="minimal-card p-6 space-y-4">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <BookOpen className="size-4 text-[#00AB55]" />
          Course Progress
        </h3>
        {student.courses.length === 0 ? (
          <p className="text-xs text-[#919EAB]">No courses assigned yet.</p>
        ) : (
          <div className="space-y-4">
            {student.courses.map((course) => (
              <div key={course.courseId} className="p-4 rounded-xl bg-[#212B36]/60 border border-[#919EAB]/12">
                <div className="flex items-center justify-between gap-3 mb-2">
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-white truncate">{course.courseTitle}</p>
                    <p className="text-[11px] font-mono text-[#919EAB]">
                      {course.completedLessons} / {course.totalLessons} lessons
                    </p>
                  </div>
                  <span className="text-sm font-mono font-bold text-[#00AB55] shrink-0">
                    {course.progressPercent}%
                  </span>
                </div>
                <Progress value={course.progressPercent} className="h-2" />
                {course.courseSlug && (
                  <Link
                    href={`/dashboard/course/${course.courseSlug}`}
                    className="inline-flex items-center gap-1 mt-3 text-[11px] font-mono text-[#3366FF] hover:underline"
                  >
                    View course <ChevronRight className="size-3" />
                  </Link>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="minimal-card p-6 space-y-4">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Activity className="size-4 text-[#3366FF]" />
          Recent Activity
        </h3>
        {student.recentActivity.length === 0 ? (
          <p className="text-xs text-[#919EAB]">No activity recorded yet.</p>
        ) : (
          <div className="space-y-3">
            {student.recentActivity.map((item) => (
              <div
                key={item.id}
                className="flex items-start gap-3 p-3 rounded-xl bg-[#212B36]/40 border border-[#919EAB]/10"
              >
                <div className="size-8 rounded-lg bg-[#101214] border border-[#919EAB]/16 grid place-items-center shrink-0">
                  <ActivityIcon item={item} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold text-white truncate">{item.title}</p>
                  <p className="text-[11px] text-[#919EAB]">{activityLabel(item)}</p>
                  <p className="text-[10px] font-mono text-[#637381] mt-0.5">
                    {item.courseTitle} · {formatRelativeTime(item.timestamp)}
                  </p>
                </div>
                {item.type === 'quiz' && (
                  <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold shrink-0 ${
                    item.meta.passed
                      ? 'bg-[#00AB55]/15 text-[#00AB55]'
                      : 'bg-[#EE6A5F]/15 text-[#EE6A5F]'
                  }`}>
                    {item.meta.score}%
                  </span>
                )}
                {item.type === 'assignment' && (
                  <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold capitalize shrink-0 ${
                    item.meta.status === 'accepted'
                      ? 'bg-[#00AB55]/15 text-[#00AB55]'
                      : item.meta.status === 'pending'
                        ? 'bg-[#F3B61F]/15 text-[#F3B61F]'
                        : 'bg-[#EE6A5F]/15 text-[#EE6A5F]'
                  }`}>
                    {item.meta.status}
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
