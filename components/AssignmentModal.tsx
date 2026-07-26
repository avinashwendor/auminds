'use client';

import { useState } from 'react';
import { 
  AlertCircle, CheckCircle2, Clock, ExternalLink, Send, 
  UploadCloud, GitBranch, Globe, FileText, Check, Award
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface AssignmentModalProps {
  assignment: {
    id: string;
    title: string;
    instructions: string;
    maxPoints: number;
  };
  existingSubmission?: any;
}

export default function AssignmentModal({ assignment, existingSubmission }: AssignmentModalProps) {
  const [repoUrl, setRepoUrl] = useState(existingSubmission?.repoUrl || '');
  const [demoUrl, setDemoUrl] = useState(existingSubmission?.demoUrl || '');
  const [notes, setNotes] = useState(existingSubmission?.notes || '');
  const [submission, setSubmission] = useState(existingSubmission || null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setError('');

    try {
      const response = await fetch('/api/student/assignments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          assignmentId: assignment.id,
          submissionId: submission?.id,
          repoUrl: repoUrl.trim(),
          demoUrl: demoUrl.trim() || undefined,
          notes: notes.trim() || undefined,
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Your project could not be submitted.');
      setSubmission(data.submission);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Your project could not be submitted.');
    } finally {
      setSaving(false);
    }
  };

  const status = submission?.status as 'accepted' | 'rejected' | 'pending' | undefined;

  return (
    <div className="minimal-card overflow-hidden shadow-2xl border border-[#919EAB]/20">
      
      {/* Header */}
      <header className="p-6 border-b border-[#919EAB]/12 bg-[#1A2332]/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <Badge variant="outline" className="bg-[#826AF9]/10 text-[#826AF9] border-[#826AF9]/30 font-mono text-xs">
              <UploadCloud className="size-3 mr-1" /> PROJECT SUBMISSION
            </Badge>
            <span className="text-xs font-mono text-[#919EAB]">
              Max Score: <strong className="text-white">{assignment.maxPoints} Points</strong>
            </span>
          </div>
          <h2 className="text-2xl font-extrabold text-white tracking-tight">{assignment.title}</h2>
        </div>

        {status && (
          <div className={cn(
            'p-3.5 rounded-xl border flex items-center gap-3 text-xs font-mono font-bold shrink-0',
            status === 'accepted' && 'bg-[#00AB55]/15 border-[#00AB55]/40 text-[#00AB55]',
            status === 'rejected' && 'bg-[#FF4842]/15 border-[#FF4842]/40 text-[#FF4842]',
            status === 'pending' && 'bg-[#FFC107]/15 border-[#FFC107]/40 text-[#FFC107]'
          )}>
            {status === 'accepted' && <CheckCircle2 className="size-5" />}
            {status === 'rejected' && <AlertCircle className="size-5" />}
            {status === 'pending' && <Clock className="size-5" />}
            <div>
              <span className="uppercase block text-[10px] opacity-75">Status</span>
              <span className="text-sm">{status.toUpperCase()} ({submission.pointsAwarded || 0} / {assignment.maxPoints} PTS)</span>
            </div>
          </div>
        )}
      </header>

      {/* Grid Layout */}
      <div className="grid lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-[#919EAB]/12">
        
        {/* Left Column: Brief & Feedback */}
        <div className="p-6 lg:col-span-5 space-y-6 bg-[#161C24]">
          <div>
            <span className="board-label text-[#00AB55] block mb-2">Project Requirements</span>
            <div className="text-xs leading-relaxed text-[#919EAB] whitespace-pre-line bg-[#1A2332]/40 p-4 rounded-xl border border-[#919EAB]/12 font-sans">
              {assignment.instructions}
            </div>
          </div>

          {/* Instructor Feedback Box */}
          {submission?.feedback && (
            <div className="p-4 rounded-xl bg-[#FFC107]/10 border border-[#FFC107]/30 space-y-2">
              <span className="text-xs font-mono font-bold text-[#FFC107] uppercase block">Instructor Feedback</span>
              <p className="text-xs text-white leading-relaxed">{submission.feedback}</p>
            </div>
          )}
        </div>

        {/* Right Column: Submission Form */}
        <form onSubmit={submit} className="p-6 lg:col-span-7 space-y-5 bg-[#161C24]">
          {error && (
            <div className="p-4 rounded-xl bg-[#FF4842]/15 border border-[#FF4842]/30 text-xs text-[#FF4842] flex items-center gap-2">
              <AlertCircle className="size-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="repo-url" className="text-xs font-bold text-white flex items-center gap-1.5">
              <GitBranch className="size-4 text-[#00AB55]" /> GitHub Repository URL *
            </Label>
            <Input
              id="repo-url"
              type="url"
              value={repoUrl}
              onChange={(e) => setRepoUrl(e.target.value)}
              placeholder="https://github.com/username/project-repo"
              required
              className="bg-[#212B36] border-[#919EAB]/20 text-white placeholder:text-[#637381] rounded-xl text-xs"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="demo-url" className="text-xs font-bold text-white flex items-center gap-1.5">
              <Globe className="size-4 text-[#3366FF]" /> Live Demo URL <span className="text-[#919EAB] font-normal">(optional)</span>
            </Label>
            <Input
              id="demo-url"
              type="url"
              value={demoUrl}
              onChange={(e) => setDemoUrl(e.target.value)}
              placeholder="https://my-app.vercel.app"
              className="bg-[#212B36] border-[#919EAB]/20 text-white placeholder:text-[#637381] rounded-xl text-xs"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="implementation-notes" className="text-xs font-bold text-white flex items-center gap-1.5">
              <FileText className="size-4 text-[#FFC107]" /> Implementation Notes <span className="text-[#919EAB] font-normal">(optional)</span>
            </Label>
            <Textarea
              id="implementation-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={4}
              maxLength={2000}
              placeholder="Detail architecture decisions, instructions for testing, or trade-offs made during development."
              className="bg-[#212B36] border-[#919EAB]/20 text-white placeholder:text-[#637381] rounded-xl text-xs leading-relaxed"
            />
          </div>

          <Button
            type="submit"
            disabled={saving || !repoUrl.trim()}
            className="w-full bg-[#00AB55] hover:bg-[#007B55] text-white font-bold rounded-xl py-3 shadow-lg shadow-[#00AB55]/20"
          >
            <Send className="size-4 mr-2" />
            {saving ? 'Submitting Project…' : submission ? 'Update Submission' : 'Submit Project for Review'}
          </Button>

          {submission && (
            <div className="pt-2 flex flex-wrap gap-4 text-xs font-mono">
              <a
                href={submission.repoUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-[#00AB55] hover:underline"
              >
                View Repository <ExternalLink className="size-3" />
              </a>
              {submission.demoUrl && (
                <a
                  href={submission.demoUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-[#3366FF] hover:underline"
                >
                  View Live Demo <ExternalLink className="size-3" />
                </a>
              )}
            </div>
          )}
        </form>

      </div>
    </div>
  );
}
