'use client';

import { useState } from 'react';
import { AlertCircle, CheckCircle2, Clock, ExternalLink, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface AssignmentModalProps { assignment: { id: string; title: string; instructions: string; maxPoints: number }; existingSubmission?: any }

export default function AssignmentModal({ assignment, existingSubmission }: AssignmentModalProps) {
  const [repoUrl, setRepoUrl] = useState(existingSubmission?.repoUrl || '');
  const [demoUrl, setDemoUrl] = useState(existingSubmission?.demoUrl || '');
  const [notes, setNotes] = useState(existingSubmission?.notes || '');
  const [submission, setSubmission] = useState(existingSubmission || null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const submit = async (event: React.FormEvent) => {
    event.preventDefault(); setSaving(true); setError('');
    try {
      const response = await fetch('/api/student/assignments', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ assignmentId: assignment.id, submissionId: submission?.id, repoUrl: repoUrl.trim(), demoUrl: demoUrl.trim() || undefined, notes: notes.trim() || undefined }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Your project could not be submitted.');
      setSubmission(data.submission);
    } catch (reason) { setError(reason instanceof Error ? reason.message : 'Your project could not be submitted.'); }
    finally { setSaving(false); }
  };
  const status = submission?.status as 'accepted' | 'rejected' | 'pending' | undefined;
  return <section className="border border-border bg-card">
    <header className="grid gap-5 border-b border-border p-5 sm:grid-cols-[1fr_auto] sm:items-start"><div><p className="board-label text-primary">Project submission · {assignment.maxPoints} points</p><h2 className="board-value mt-2 text-2xl">{assignment.title}</h2><p className="mt-2 text-sm text-muted-foreground">Submit a repository for instructor review. You can update it while review is pending.</p></div>{status && <div className={`border px-4 py-3 ${status === 'accepted' ? 'border-emerald-500/40 bg-emerald-500/10' : status === 'rejected' ? 'border-rose-500/40 bg-rose-500/10' : 'border-primary/40 bg-primary/10'}`}><div className="flex items-center gap-2">{status === 'accepted' ? <CheckCircle2 className="size-4 text-emerald-400" /> : <Clock className="size-4 text-primary" />}<span className="board-label">{status}</span></div><p className="mt-1 font-mono text-xs">{submission.pointsAwarded || 0} / {assignment.maxPoints} PTS</p></div>}</header>
    <div className="grid lg:grid-cols-[.8fr_1.2fr]"><div className="border-b border-border p-5 lg:border-b-0 lg:border-r"><p className="board-label mb-4 text-primary">Project brief</p><div className="whitespace-pre-line text-sm leading-7 text-foreground/90">{assignment.instructions}</div>{submission?.feedback && <div className="mt-6 border border-border bg-muted p-4"><p className="board-label mb-2 text-primary">Instructor feedback</p><p className="text-sm leading-relaxed">{submission.feedback}</p></div>}</div>
      <form onSubmit={submit} className="space-y-5 p-5">{error && <div role="alert" className="flex items-start gap-2 border border-rose-500/40 bg-rose-500/10 p-3 text-sm text-rose-300"><AlertCircle className="mt-0.5 size-4 shrink-0" />{error}</div>}<div className="space-y-2"><Label htmlFor="repo-url">GitHub repository *</Label><Input id="repo-url" type="url" value={repoUrl} onChange={(event) => setRepoUrl(event.target.value)} placeholder="https://github.com/username/project" required /></div><div className="space-y-2"><Label htmlFor="demo-url">Live demo <span className="text-muted-foreground">(optional)</span></Label><Input id="demo-url" type="url" value={demoUrl} onChange={(event) => setDemoUrl(event.target.value)} placeholder="https://project.example.com" /></div><div className="space-y-2"><Label htmlFor="implementation-notes">Implementation notes <span className="text-muted-foreground">(optional)</span></Label><Textarea id="implementation-notes" value={notes} onChange={(event) => setNotes(event.target.value)} rows={6} maxLength={2000} placeholder="Explain key decisions, tradeoffs, and anything the reviewer should test." /></div><Button type="submit" size="lg" className="w-full" disabled={saving || !repoUrl.trim()}><Send className="size-4" />{saving ? 'Saving submission…' : submission ? 'Update submission' : 'Submit for review'}</Button>{submission && <div className="flex flex-wrap gap-3 text-xs"><a href={submission.repoUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-primary underline underline-offset-4">Open submitted repository <ExternalLink className="size-3" /></a>{submission.demoUrl && <a href={submission.demoUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-primary underline underline-offset-4">Open live demo <ExternalLink className="size-3" /></a>}</div>}</form>
    </div>
  </section>;
}
