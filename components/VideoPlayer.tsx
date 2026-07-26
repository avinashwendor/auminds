'use client';

import { useRef, useState } from 'react';
import { BookOpen, CheckCircle2, Clock, MessageSquare, Plus, ShieldCheck, Subtitles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface TranscriptItem { timestamp: number; timeLabel: string; text: string }
interface TimedNote { id: string; timestamp: number; timeLabel: string; text: string }
interface VideoPlayerProps { videoUrl: string; title: string; isCompleted?: boolean; onComplete?: () => void; transcripts?: TranscriptItem[] }

const fallbackTranscript: TranscriptItem[] = [
  { timestamp: 0, timeLabel: '00:00', text: 'Introduction and learning objectives.' },
  { timestamp: 15, timeLabel: '00:15', text: 'Core architecture and system design concepts.' },
  { timestamp: 45, timeLabel: '00:45', text: 'Following data through the application pipeline.' },
  { timestamp: 90, timeLabel: '01:30', text: 'Deterministic state and implementation details.' },
];

export default function VideoPlayer({ videoUrl, title, isCompleted = false, onComplete, transcripts = fallbackTranscript }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [completed, setCompleted] = useState(isCompleted);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [tab, setTab] = useState<'transcript' | 'notes'>('transcript');
  const [notes, setNotes] = useState<TimedNote[]>([]);
  const [noteText, setNoteText] = useState('');
  const isYouTube = videoUrl.includes('youtube.com') || videoUrl.includes('youtu.be');
  const videoId = videoUrl.includes('watch?v=') ? videoUrl.split('watch?v=')[1]?.split('&')[0] : videoUrl.split('youtu.be/')[1]?.split('?')[0];
  const embedUrl = `https://www.youtube-nocookie.com/embed/${videoId || 'wm5gMKCORL4'}?modestbranding=1&rel=0`;
  const formatTime = (seconds: number) => `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(Math.floor(seconds % 60)).padStart(2, '0')}`;
  const seek = (seconds: number) => { if (videoRef.current) { videoRef.current.currentTime = seconds; videoRef.current.focus(); } };
  const markComplete = () => { if (completed) return; setCompleted(true); onComplete?.(); };
  const addNote = () => { if (!noteText.trim()) return; setNotes((items) => [...items, { id: crypto.randomUUID(), timestamp: currentTime, timeLabel: formatTime(currentTime), text: noteText.trim() }]); setNoteText(''); };

  return <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_22rem]">
    <section className="min-w-0">
      <div className="aspect-video overflow-hidden border border-border bg-black">
        {isYouTube ? <iframe src={embedUrl} title={title} loading="lazy" className="h-full w-full border-0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen /> : <video ref={videoRef} src={videoUrl} controls preload="metadata" className="h-full w-full object-contain" onLoadedMetadata={(event) => setDuration(event.currentTarget.duration)} onTimeUpdate={(event) => { const time = event.currentTarget.currentTime; setCurrentTime(time); if (duration > 0 && time / duration >= .9) markComplete(); }} />}
      </div>
      <div className="flex flex-col justify-between gap-4 border border-t-0 border-border bg-card p-4 sm:flex-row sm:items-center">
        <div><div className="flex items-center gap-2"><ShieldCheck className="size-4 text-primary" /><span className="board-label">Protected lesson stream</span></div><h2 className="mt-2 font-bold text-foreground">{title}</h2><p className="mt-1 text-xs text-muted-foreground">{isYouTube ? 'Use the native player controls. Mark complete when you finish.' : duration ? `${formatTime(currentTime)} of ${formatTime(duration)}` : 'Loading media metadata…'}</p></div>
        <Button onClick={markComplete} disabled={completed} variant={completed ? 'secondary' : 'default'}><CheckCircle2 className="size-4" />{completed ? 'Lesson complete' : 'Mark complete'}</Button>
      </div>
    </section>
    <aside className="flex min-h-[28rem] flex-col border border-border bg-card xl:min-h-0">
      <div className="grid grid-cols-2 border-b border-border"><button onClick={() => setTab('transcript')} className={cn('flex min-h-11 items-center justify-center gap-2 text-xs font-bold', tab === 'transcript' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted')}><Subtitles className="size-4" /> Transcript</button><button onClick={() => setTab('notes')} className={cn('flex min-h-11 items-center justify-center gap-2 border-l border-border text-xs font-bold', tab === 'notes' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted')}><BookOpen className="size-4" /> Notes ({notes.length})</button></div>
      {tab === 'transcript' ? <div className="flex-1 overflow-y-auto">{transcripts.map((item, index) => { const active = !isYouTube && currentTime >= item.timestamp && (index === transcripts.length - 1 || currentTime < transcripts[index + 1].timestamp); return <button key={`${item.timestamp}-${index}`} type="button" onClick={() => seek(item.timestamp)} disabled={isYouTube} className={cn('grid w-full grid-cols-[3.5rem_1fr] gap-3 border-b border-border p-4 text-left transition-colors', active ? 'bg-primary/10' : 'hover:bg-muted', isYouTube && 'cursor-default')}><span className="font-mono text-[10px] font-bold text-primary">{item.timeLabel}</span><span className="text-sm leading-relaxed text-foreground">{item.text}</span></button>; })}<p className="p-4 text-xs text-muted-foreground">{isYouTube ? 'Chapter seeking is available from the native player timeline.' : 'Select a transcript row to jump to that point.'}</p></div> : <div className="flex min-h-0 flex-1 flex-col"><div className="flex-1 overflow-y-auto">{notes.length === 0 ? <div className="grid h-full min-h-64 place-items-center p-6 text-center"><div><MessageSquare className="mx-auto mb-3 size-6 text-muted-foreground" /><p className="text-sm text-muted-foreground">No notes yet. Capture a point you want to revisit.</p></div></div> : notes.map((note) => <button key={note.id} onClick={() => seek(note.timestamp)} disabled={isYouTube} className="grid w-full grid-cols-[3.5rem_1fr] gap-3 border-b border-border p-4 text-left hover:bg-muted"><span className="font-mono text-[10px] text-primary">{note.timeLabel}</span><span className="text-sm">{note.text}</span></button>)}</div><div className="border-t border-border p-3"><label htmlFor="video-note" className="board-label mb-2 block">Note at {formatTime(currentTime)}</label><div className="flex gap-2"><Input id="video-note" value={noteText} onChange={(event) => setNoteText(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter') addNote(); }} placeholder="Write a note…" /><Button size="icon" onClick={addNote} disabled={!noteText.trim()} aria-label="Add note"><Plus className="size-4" /></Button></div></div></div>}
    </aside>
  </div>;
}
