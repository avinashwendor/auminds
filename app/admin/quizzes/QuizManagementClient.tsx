'use client';

import { useState } from 'react';
import Link from 'next/link';
import { HelpCircle, Plus, ArrowLeft, CheckCircle, Sparkles } from 'lucide-react';

interface QuizManagementClientProps {
  courses: any[];
}

export default function QuizManagementClient({ courses }: QuizManagementClientProps) {
  const lessons = courses.flatMap((course: any) => (course.modules || []).flatMap((module: any) => (module.lessons || []).map((lesson: any) => ({ ...lesson, courseTitle: course.title, moduleTitle: module.title }))));
  const [title, setTitle] = useState('');
  const [selectedLessonId, setSelectedLessonId] = useState(lessons[0]?.id || '');
  const [passingScore, setPassingScore] = useState(70);

  // Question Form
  const [questionText, setQuestionText] = useState('');
  const [opt1, setOpt1] = useState('');
  const [opt2, setOpt2] = useState('');
  const [opt3, setOpt3] = useState('');
  const [opt4, setOpt4] = useState('');
  const [correctIdx, setCorrectIdx] = useState(0);
  const [explanation, setExplanation] = useState('');

  const [activeQuizId, setActiveQuizId] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState('');

  const handleCreateQuiz = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) return;

    try {
      const res = await fetch('/api/admin/quizzes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'createQuiz',
          lessonId: selectedLessonId,
          title,
          passingScore,
        }),
      });
      const data = await res.json();
      if (data.quiz) {
        setActiveQuizId(data.quiz.id);
        setSuccessMsg(`Quiz "${data.quiz.title}" created! Now add assessment questions below.`);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeQuizId || !questionText || !opt1 || !opt2) return;

    try {
      const res = await fetch('/api/admin/quizzes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'addQuestion',
          quizId: activeQuizId,
          question: questionText,
          options: [opt1, opt2, opt3, opt4].filter(Boolean),
          correctOptionIndex: Number(correctIdx),
          explanation,
        }),
      });
      const data = await res.json();
      if (data.question) {
        setSuccessMsg('Question added successfully!');
        setQuestionText('');
        setOpt1('');
        setOpt2('');
        setOpt3('');
        setOpt4('');
        setExplanation('');
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3 p-6 rounded-3xl glass-card border border-indigo-500/20 bg-slate-900/90 shadow-2xl">
        <Link href="/admin" className="p-2.5 rounded-2xl bg-slate-800 text-slate-300 hover:text-white border border-slate-700 transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2">
            <HelpCircle className="w-6 h-6 text-amber-400" /> Quiz & Assessment Builder
          </h1>
          <p className="text-xs text-slate-400 font-mono mt-0.5">
            Create quizzes, set multiple choice questions, correct option indexes, and explanations.
          </p>
        </div>
      </div>

      {successMsg && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-mono flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-400" /> {successMsg}
        </div>
      )}

      {/* Step 1: Create Quiz */}
      <form onSubmit={handleCreateQuiz} className="p-6 rounded-3xl glass-card border border-slate-800 space-y-4 bg-slate-900/60">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-amber-400" /> Step 1: Initialize New Quiz
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="text-xs font-mono text-slate-400 block mb-1">Quiz Title</label>
            <input
              type="text"
              placeholder="e.g. Masterclass Final Quiz"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-950 text-slate-200 border border-slate-800 text-xs focus:outline-none focus:border-amber-500"
              required
            />
          </div>

          <div>
            <label className="text-xs font-mono text-slate-400 block mb-1">Target Lesson</label>
            <select
              value={selectedLessonId}
              onChange={(e) => setSelectedLessonId(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-950 text-slate-200 border border-slate-800 text-xs focus:outline-none focus:border-amber-500"
              required
            >
              {lessons.length === 0 && <option value="">Create a course lesson first</option>}
              {lessons.map((lesson: any) => <option key={lesson.id} value={lesson.id}>{lesson.courseTitle} · {lesson.moduleTitle} · {lesson.title}</option>)}
            </select>
          </div>

          <div>
            <label className="text-xs font-mono text-slate-400 block mb-1">Passing Score (%)</label>
            <input
              type="number"
              value={passingScore}
              onChange={(e) => setPassingScore(Number(e.target.value))}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-950 text-slate-200 border border-slate-800 text-xs focus:outline-none focus:border-amber-500"
            />
          </div>
        </div>

        <button
          type="submit"
          className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs shadow-lg shadow-amber-600/20 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Create Quiz Header
        </button>
      </form>

      {/* Step 2: Add Questions */}
      {activeQuizId && (
        <form onSubmit={handleAddQuestion} className="p-6 rounded-3xl glass-card border border-amber-500/30 space-y-4 bg-slate-900/90">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Plus className="w-5 h-5 text-amber-400" /> Step 2: Add Multiple Choice Questions
          </h3>

          <div>
            <label className="text-xs font-mono text-slate-400 block mb-1">Question Prompt</label>
            <input
              type="text"
              placeholder="e.g. What is the time complexity of binary search?"
              value={questionText}
              onChange={(e) => setQuestionText(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-950 text-slate-200 border border-slate-800 text-xs focus:outline-none focus:border-amber-500"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-mono text-slate-400 block mb-1">Option A</label>
              <input type="text" value={opt1} onChange={(e) => setOpt1(e.target.value)} className="w-full px-4 py-2 rounded-xl bg-slate-950 text-slate-200 border border-slate-800 text-xs" required />
            </div>
            <div>
              <label className="text-xs font-mono text-slate-400 block mb-1">Option B</label>
              <input type="text" value={opt2} onChange={(e) => setOpt2(e.target.value)} className="w-full px-4 py-2 rounded-xl bg-slate-950 text-slate-200 border border-slate-800 text-xs" required />
            </div>
            <div>
              <label className="text-xs font-mono text-slate-400 block mb-1">Option C</label>
              <input type="text" value={opt3} onChange={(e) => setOpt3(e.target.value)} className="w-full px-4 py-2 rounded-xl bg-slate-950 text-slate-200 border border-slate-800 text-xs" />
            </div>
            <div>
              <label className="text-xs font-mono text-slate-400 block mb-1">Option D</label>
              <input type="text" value={opt4} onChange={(e) => setOpt4(e.target.value)} className="w-full px-4 py-2 rounded-xl bg-slate-950 text-slate-200 border border-slate-800 text-xs" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-mono text-slate-400 block mb-1">Correct Answer</label>
              <select
                value={correctIdx}
                onChange={(e) => setCorrectIdx(Number(e.target.value))}
                className="w-full px-4 py-2 rounded-xl bg-slate-950 text-slate-200 border border-slate-800 text-xs"
              >
                <option value={0}>Option A</option>
                <option value={1}>Option B</option>
                <option value={2}>Option C</option>
                <option value={3}>Option D</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-mono text-slate-400 block mb-1">Explanation (Optional)</label>
              <input type="text" value={explanation} onChange={(e) => setExplanation(e.target.value)} className="w-full px-4 py-2 rounded-xl bg-slate-950 text-slate-200 border border-slate-800 text-xs" placeholder="Why this option is correct..." />
            </div>
          </div>

          <button
            type="submit"
            className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> Save Question to Quiz
          </button>
        </form>
      )}
    </div>
  );
}
