'use client';

import { useState } from 'react';
import { ArrowRight, CheckCircle2, HelpCircle, RotateCcw, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

interface QuizQuestion { id: string; question: string; options: string[]; correctOptionIndex: number; explanation?: string | null }
interface QuizModalProps { quiz: { id: string; title: string; passingScore: number; points: number; questions: QuizQuestion[] }; onComplete?: (score: number, passed: boolean) => void }

export default function QuizModal({ quiz, onComplete }: QuizModalProps) {
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const questionCount = quiz.questions.length;
  const answeredCount = Object.keys(answers).length;
  const progress = questionCount ? Math.round(answeredCount / questionCount * 100) : 0;
  const passed = score !== null && score >= quiz.passingScore;

  const submit = async () => {
    if (!questionCount || answeredCount !== questionCount) return;
    const correct = quiz.questions.filter((question, index) => answers[index] === question.correctOptionIndex).length;
    const nextScore = Math.round(correct / questionCount * 100);
    const didPass = nextScore >= quiz.passingScore;
    setSaving(true); setError('');
    try {
      const response = await fetch('/api/student/quizzes', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ quizId: quiz.id, score: nextScore, passed: didPass }) });
      if (!response.ok) throw new Error('Your attempt could not be saved. Try again.');
      setScore(nextScore); setSubmitted(true); onComplete?.(nextScore, didPass);
    } catch (reason) { setError(reason instanceof Error ? reason.message : 'Your attempt could not be saved. Try again.'); }
    finally { setSaving(false); }
  };
  const reset = () => { setAnswers({}); setSubmitted(false); setScore(null); setError(''); };

  if (!questionCount) return <div className="border border-border bg-card p-10 text-center"><HelpCircle className="mx-auto mb-4 size-7 text-muted-foreground" /><h2 className="board-value text-2xl">ASSESSMENT NOT READY</h2><p className="mt-2 text-sm text-muted-foreground">This quiz has no questions yet. Continue with the lesson and check back later.</p></div>;

  return <section className="border border-border bg-card">
    <header className="grid gap-5 border-b border-border p-5 sm:grid-cols-[1fr_auto] sm:items-start"><div><p className="board-label text-primary">Knowledge check · {questionCount} questions</p><h2 className="board-value mt-2 text-2xl">{quiz.title}</h2><p className="mt-2 text-sm text-muted-foreground">Pass at {quiz.passingScore}% · Earn {quiz.points} points on your first passing attempt</p></div>{submitted && <div className={cn('border px-4 py-3 text-right', passed ? 'border-emerald-500/40 bg-emerald-500/10' : 'border-rose-500/40 bg-rose-500/10')}><p className="board-label">Result</p><p className={cn('board-value mt-1 text-2xl', passed ? 'text-emerald-400' : 'text-rose-400')}>{score}% · {passed ? 'PASSED' : 'RETRY'}</p></div>}</header>
    {!submitted && <div className="border-b border-border p-5"><div className="mb-2 flex justify-between text-xs text-muted-foreground"><span>{answeredCount} of {questionCount} answered</span><span>{progress}%</span></div><Progress value={progress} className="h-1.5" /></div>}
    <div>{quiz.questions.map((question, questionIndex) => <article key={question.id || questionIndex} className="border-b border-border p-5 last:border-b-0"><div className="flex gap-4"><span className="font-mono text-xs font-bold text-primary">Q{String(questionIndex + 1).padStart(2, '0')}</span><div className="flex-1"><h3 className="font-bold leading-relaxed text-foreground">{question.question}</h3><div className="mt-4 grid gap-2 sm:grid-cols-2">{question.options.map((option, optionIndex) => { const selected = answers[questionIndex] === optionIndex; const correct = question.correctOptionIndex === optionIndex; const wrong = submitted && selected && !correct; return <button key={optionIndex} type="button" disabled={submitted} onClick={() => setAnswers((current) => ({ ...current, [questionIndex]: optionIndex }))} className={cn('flex min-h-12 items-center justify-between gap-3 border border-border bg-background p-3 text-left text-sm transition-colors hover:border-muted-foreground', selected && !submitted && 'border-primary bg-primary/10', submitted && correct && 'border-emerald-500/50 bg-emerald-500/10 text-emerald-200', wrong && 'border-rose-500/50 bg-rose-500/10 text-rose-200')}><span>{option}</span>{submitted && correct && <CheckCircle2 className="size-4 shrink-0 text-emerald-400" />}{wrong && <XCircle className="size-4 shrink-0 text-rose-400" />}</button>; })}</div>{submitted && question.explanation && <div className="mt-4 border border-border bg-muted p-4 text-sm leading-relaxed"><span className="board-label mb-2 block text-primary">Explanation</span>{question.explanation}</div>}</div></div></article>)}</div>
    <footer className="flex flex-col gap-3 border-t border-border p-5 sm:flex-row sm:items-center sm:justify-between">{error ? <p role="alert" className="text-sm text-rose-400">{error}</p> : <p className="text-xs text-muted-foreground">Answers lock after submission. You can retake if needed.</p>}{submitted ? <Button variant="outline" onClick={reset}><RotateCcw className="size-4" /> Retake quiz</Button> : <Button onClick={submit} disabled={saving || answeredCount !== questionCount}>{saving ? 'Saving attempt…' : 'Submit answers'}<ArrowRight className="size-4" /></Button>}</footer>
  </section>;
}
