'use client';

import { useState } from 'react';
import { CheckSquare, ExternalLink, Check, X, Award, MessageSquare, AlertCircle } from 'lucide-react';

interface SubmissionItem {
  id: string;
  assignmentId: string;
  userId: string;
  repoUrl: string;
  demoUrl?: string | null;
  notes?: string | null;
  status: string;
  submittedAt: string;
  user?: { id: string; name: string; username: string };
  assignment?: { id: string; title: string; maxPoints: number };
}

interface AssignmentReviewerClientProps {
  submissions: SubmissionItem[];
}

export default function AssignmentReviewerClient({ submissions: initialSubmissions }: AssignmentReviewerClientProps) {
  const [submissions, setSubmissions] = useState<SubmissionItem[]>(initialSubmissions);
  const [gradingState, setGradingState] = useState<Record<string, { points: number; feedback: string }>>({});
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const handlePointChange = (id: string, pts: number) => {
    setGradingState(prev => ({
      ...prev,
      [id]: { ...(prev[id] || { feedback: '' }), points: pts }
    }));
  };

  const handleFeedbackChange = (id: string, fb: string) => {
    setGradingState(prev => ({
      ...prev,
      [id]: { ...(prev[id] || { points: 50 }), feedback: fb }
    }));
  };

  const handleReview = async (id: string, status: 'accepted' | 'rejected', maxPoints: number) => {
    setLoadingId(id);
    const itemGrading = gradingState[id] || { points: status === 'accepted' ? maxPoints : 0, feedback: '' };

    try {
      const res = await fetch('/api/admin/assignments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          submissionId: id,
          status,
          pointsAwarded: status === 'accepted' ? itemGrading.points : 0,
          feedback: itemGrading.feedback || (status === 'accepted' ? 'Great submission!' : 'Needs improvement.'),
        }),
      });

      if (res.ok) {
        setSubmissions(prev => prev.filter(s => s.id !== id));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between p-6 rounded-2xl glass-panel border border-amber-500/20">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <CheckSquare className="w-6 h-6" />
          </div>
          <div>
            <h2 className="font-bold text-xl text-white">Pending Student Assignment Submissions</h2>
            <p className="text-xs text-slate-400">Review student code repositories, award points, and send feedback.</p>
          </div>
        </div>

        <span className="px-3.5 py-1.5 rounded-xl bg-amber-500/20 text-amber-300 font-mono text-xs border border-amber-500/30">
          {submissions.length} Pending
        </span>
      </div>

      {/* Submissions List */}
      {submissions.length === 0 ? (
        <div className="p-12 rounded-2xl glass-panel text-center text-slate-400 text-sm">
          🎉 All student assignments have been reviewed and graded!
        </div>
      ) : (
        <div className="space-y-4">
          {submissions.map((sub) => {
            const currentGrading = gradingState[sub.id] || { points: sub.assignment?.maxPoints || 50, feedback: '' };

            return (
              <div key={sub.id} className="p-6 rounded-2xl glass-card border border-slate-800 space-y-4">
                {/* Header row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800">
                  <div>
                    <span className="text-xs font-mono text-indigo-400">Student: {sub.user?.name} (@{sub.user?.username})</span>
                    <h3 className="font-bold text-lg text-white">{sub.assignment?.title || 'Assignment'}</h3>
                  </div>

                  <span className="text-xs text-slate-500 font-mono">
                    Submitted: {new Date(sub.submittedAt).toLocaleString()}
                  </span>
                </div>

                {/* Submission Links */}
                <div className="flex flex-wrap items-center gap-3 text-xs font-mono">
                  <a
                    href={sub.repoUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-indigo-300 border border-slate-800 flex items-center gap-1.5 transition-colors"
                  >
                    <ExternalLink className="w-3.5 h-3.5" /> GitHub Repository Link
                  </a>

                  {sub.demoUrl && (
                    <a
                      href={sub.demoUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-emerald-300 border border-slate-800 flex items-center gap-1.5 transition-colors"
                    >
                      <ExternalLink className="w-3.5 h-3.5" /> Live Demo Deployment
                    </a>
                  )}
                </div>

                {sub.notes && (
                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300">
                    <span className="font-semibold text-slate-400">Student Notes:</span> {sub.notes}
                  </div>
                )}

                {/* Grading Controls */}
                <div className="pt-2 grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
                  <div className="sm:col-span-3">
                    <label className="block text-[11px] font-mono text-slate-400 mb-1">Award Points (Max {sub.assignment?.maxPoints || 50}):</label>
                    <input
                      type="number"
                      value={currentGrading.points}
                      onChange={(e) => handlePointChange(sub.id, parseInt(e.target.value) || 0)}
                      max={sub.assignment?.maxPoints || 100}
                      min={0}
                      className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-amber-400 font-mono font-bold focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div className="sm:col-span-6">
                    <label className="block text-[11px] font-mono text-slate-400 mb-1">Instructor Review Feedback:</label>
                    <input
                      type="text"
                      value={currentGrading.feedback}
                      onChange={(e) => handleFeedbackChange(sub.id, e.target.value)}
                      placeholder="e.g. Excellent QueryBuilder architecture and clean code!"
                      className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div className="sm:col-span-3 flex items-center gap-2 pt-4 sm:pt-0">
                    <button
                      onClick={() => handleReview(sub.id, 'accepted', sub.assignment?.maxPoints || 50)}
                      disabled={loadingId === sub.id}
                      className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-1 transition-all"
                    >
                      <Check className="w-4 h-4" /> Accept
                    </button>
                    <button
                      onClick={() => handleReview(sub.id, 'rejected', sub.assignment?.maxPoints || 50)}
                      disabled={loadingId === sub.id}
                      className="py-2.5 px-3 rounded-xl bg-rose-600/20 hover:bg-rose-600 text-rose-300 hover:text-white border border-rose-500/30 text-xs font-bold transition-all"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
