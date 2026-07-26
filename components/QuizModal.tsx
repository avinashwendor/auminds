'use client';

import { useState } from 'react';
import { 
  ArrowRight, CheckCircle2, HelpCircle, RotateCcw, XCircle, 
  Sparkles, Award, AlertCircle, Check, HelpCircle as QuestionIcon, Clock
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctOptionIndex: number;
  explanation?: string | null;
}

interface QuizModalProps {
  quiz: {
    id: string;
    title: string;
    passingScore: number;
    points: number;
    questions: QuizQuestion[];
  };
  onComplete?: (score: number, passed: boolean) => void;
}

export default function QuizModal({ quiz, onComplete }: QuizModalProps) {
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const questionCount = quiz.questions.length;
  const answeredCount = Object.keys(answers).length;
  const progress = questionCount ? Math.round((answeredCount / questionCount) * 100) : 0;
  const passed = score !== null && score >= quiz.passingScore;

  const submit = async () => {
    if (!questionCount || answeredCount !== questionCount) return;
    const correct = quiz.questions.filter(
      (question, index) => answers[index] === question.correctOptionIndex
    ).length;
    const nextScore = Math.round((correct / questionCount) * 100);
    const didPass = nextScore >= quiz.passingScore;
    
    setSaving(true);
    setError('');
    
    try {
      const response = await fetch('/api/student/quizzes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quizId: quiz.id, score: nextScore, passed: didPass }),
      });
      if (!response.ok) throw new Error('Your attempt could not be saved. Try again.');
      setScore(nextScore);
      setSubmitted(true);
      onComplete?.(nextScore, didPass);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Your attempt could not be saved. Try again.');
    } finally {
      setSaving(false);
    }
  };

  const reset = () => {
    setAnswers({});
    setSubmitted(false);
    setScore(null);
    setError('');
  };

  if (!questionCount) {
    return (
      <div className="minimal-card p-12 text-center flex flex-col items-center">
        <div className="size-16 rounded-2xl bg-[#FFC107]/15 text-[#FFC107] grid place-items-center mb-4">
          <HelpCircle className="size-8" />
        </div>
        <h2 className="text-2xl font-bold text-white">Assessment Under Construction</h2>
        <p className="mt-2 text-sm text-[#919EAB] max-w-md">
          This quiz has no questions attached yet. Continue with the lecture and check back later.
        </p>
      </div>
    );
  }

  const optionLetters = ['A', 'B', 'C', 'D', 'E', 'F'];

  return (
    <div className="minimal-card overflow-hidden shadow-2xl border border-[#919EAB]/20">
      
      {/* Quiz Header */}
      <header className="p-8 border-b border-[#919EAB]/12 bg-[#1A2332]/50 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <Badge variant="outline" className="bg-[#00AB55]/15 text-[#00AB55] border-[#00AB55]/40 font-mono text-xs px-3 py-1 font-bold">
              <Sparkles className="size-3.5 mr-1.5" /> KNOWLEDGE CHECK
            </Badge>
            <span className="text-xs font-mono text-[#919EAB]">
              Pass Threshold: <strong className="text-white font-bold">{quiz.passingScore}%</strong>
            </span>
          </div>
          <h2 className="text-3xl font-extrabold text-white tracking-tight pt-1">{quiz.title}</h2>
        </div>

        <div className="flex items-center gap-4 shrink-0">
          <div className="px-5 py-3 rounded-2xl bg-[#212B36] border border-[#919EAB]/16 text-right">
            <span className="text-xs font-mono text-[#919EAB] uppercase block font-bold">Reward</span>
            <strong className="text-base font-extrabold text-[#FFC107] flex items-center gap-1.5 font-mono">
              <Award className="size-4" /> +{quiz.points} PTS
            </strong>
          </div>
        </div>
      </header>

      {/* Progress Bar Header */}
      {!submitted && (
        <div className="px-8 py-4 border-b border-[#919EAB]/12 bg-[#161C24] flex items-center justify-between gap-6 text-sm font-mono text-[#919EAB]">
          <span>Progress: <strong className="text-white font-bold">{answeredCount}</strong> of {questionCount} Answered</span>
          <div className="flex-1 max-w-sm mx-4">
            <Progress value={progress} className="h-3 bg-[#212B36]" indicatorClassName="bg-[#00AB55]" />
          </div>
          <span className="text-[#00AB55] font-extrabold text-base">{progress}%</span>
        </div>
      )}

      {/* Results View */}
      {submitted ? (
        <div className="p-12 text-center space-y-8">
          <div className="inline-flex flex-col items-center justify-center p-6 rounded-full bg-[#212B36] border-4 border-[#00AB55]/40 size-44 mx-auto shadow-2xl">
            <span className="text-5xl font-extrabold text-white font-mono">{score}%</span>
            <span className={cn('text-sm font-extrabold font-mono uppercase mt-1', passed ? 'text-[#00AB55]' : 'text-[#FF4842]')}>
              {passed ? 'PASSED' : 'RETRY NEEDED'}
            </span>
          </div>

          <div className="max-w-lg mx-auto space-y-2">
            <h3 className="text-2xl font-extrabold text-white">
              {passed ? '🎉 Congratulations! Assessment Cleared' : 'Keep Trying! Practice Makes Perfect'}
            </h3>
            <p className="text-sm text-[#919EAB] leading-relaxed">
              {passed 
                ? `You scored ${score}%, meeting the passing threshold of ${quiz.passingScore}%. ${quiz.points} points have been added to your profile!`
                : `You scored ${score}%. You need at least ${quiz.passingScore}% to pass. Review the lesson materials and retake the assessment.`}
            </p>
          </div>

          <div className="flex justify-center gap-4 pt-4">
            <Button onClick={reset} variant="outline" size="lg" className="bg-[#212B36] hover:bg-[#919EAB]/20 text-white font-extrabold rounded-2xl border-[#919EAB]/20 px-8 py-3.5 text-sm">
              <RotateCcw className="size-5 mr-2" /> Retake Assessment
            </Button>
          </div>
        </div>
      ) : (
        /* Question List */
        <div className="divide-y divide-[#919EAB]/12">
          {quiz.questions.map((question, qIdx) => {
            const isAnswered = answers[qIdx] !== undefined;
            
            return (
              <article key={question.id || qIdx} className="p-8 space-y-6 hover:bg-[#1A2332]/20 transition-colors">
                <div className="flex gap-4 items-start">
                  <Badge variant="outline" className="bg-[#00AB55]/15 text-[#00AB55] border-[#00AB55]/40 font-mono text-sm px-3 py-1 font-bold shrink-0 mt-0.5">
                    Q{String(qIdx + 1).padStart(2, '0')}
                  </Badge>
                  <h3 className="text-lg sm:text-xl font-extrabold text-white leading-relaxed">
                    {question.question}
                  </h3>
                </div>

                {/* Option Buttons */}
                <div className="grid gap-4 sm:grid-cols-2 pt-2">
                  {question.options.map((option, oIdx) => {
                    const isSelected = answers[qIdx] === oIdx;
                    const letter = optionLetters[oIdx] || String(oIdx + 1);

                    return (
                      <button
                        key={oIdx}
                        type="button"
                        onClick={() => setAnswers(prev => ({ ...prev, [qIdx]: oIdx }))}
                        className={cn(
                          'flex items-center gap-4 p-5 rounded-2xl border text-left text-sm sm:text-base font-bold transition-all duration-200',
                          isSelected
                            ? 'bg-[#00AB55]/15 border-[#00AB55] text-white shadow-lg shadow-[#00AB55]/10'
                            : 'bg-[#212B36] border-[#919EAB]/16 text-[#919EAB] hover:border-[#919EAB]/40 hover:text-white'
                        )}
                      >
                        <span className={cn(
                          'size-9 rounded-xl grid place-items-center font-mono font-extrabold text-sm shrink-0 transition-colors',
                          isSelected ? 'bg-[#00AB55] text-white' : 'bg-[#161C24] text-[#919EAB]'
                        )}>
                          {letter}
                        </span>
                        <span className="flex-1 leading-snug">{option}</span>
                        {isSelected && <Check className="size-5 text-[#00AB55] shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </article>
            );
          })}
        </div>
      )}

      {/* Footer Controls */}
      {!submitted && (
        <footer className="p-8 border-t border-[#919EAB]/12 bg-[#1A2332]/50 flex flex-col sm:flex-row items-center justify-between gap-6">
          {error ? (
            <p className="text-sm font-bold text-[#FF4842] flex items-center gap-2">
              <AlertCircle className="size-5" /> {error}
            </p>
          ) : (
            <p className="text-xs font-mono text-[#919EAB]">
              Make sure to answer all {questionCount} questions before submitting.
            </p>
          )}

          <Button
            onClick={submit}
            disabled={saving || answeredCount !== questionCount}
            size="lg"
            className="w-full sm:w-auto bg-[#00AB55] hover:bg-[#007B55] text-white font-extrabold rounded-2xl px-8 py-3.5 text-sm shadow-xl shadow-[#00AB55]/20 disabled:opacity-50"
          >
            {saving ? 'Saving attempt…' : 'Submit Assessment Answers'} <ArrowRight className="size-5 ml-2" />
          </Button>
        </footer>
      )}

    </div>
  );
}
