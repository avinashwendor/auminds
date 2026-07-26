'use client';

import { useEffect, useRef, useState } from 'react';
import { AlertCircle, MessageSquare, RefreshCw, Send, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

interface ChatMessage {
  id: string;
  content: string;
  createdAt: string;
  user?: { id: string; name: string; username: string; role: string } | null;
}
interface CommunityChatWidgetProps { courseId?: string; currentUserId: string }

function messageTime(value: string) {
  const date = new Date(value);
  return `${date.toLocaleDateString([], { month: 'short', day: 'numeric' })} · ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
}

export default function CommunityChatWidget({ courseId, currentUserId }: CommunityChatWidgetProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);
  const endRef = useRef<HTMLDivElement>(null);
  const requestIdRef = useRef(0);

  useEffect(() => {
    let active = true;
    const load = async () => {
      if (document.hidden) { if (active) setLoading(false); return; }
      const requestId = ++requestIdRef.current;
      try {
        const response = await fetch(courseId ? `/api/community?courseId=${courseId}` : '/api/community');
        if (!response.ok) throw new Error('Discussion could not be refreshed.');
        const data = await response.json();
        if (active && requestId === requestIdRef.current) { setMessages(data.messages || []); setError(''); }
      } catch (reason) {
        if (active && requestId === requestIdRef.current) setError(reason instanceof Error ? reason.message : 'Discussion could not be refreshed.');
      } finally {
        if (active && requestId === requestIdRef.current) setLoading(false);
      }
    };
    load();
    const interval = window.setInterval(load, 10000);
    const onVisible = () => { if (!document.hidden) load(); };
    document.addEventListener('visibilitychange', onVisible);
    return () => { active = false; window.clearInterval(interval); document.removeEventListener('visibilitychange', onVisible); };
  }, [courseId, refreshKey]);

  useEffect(() => {
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    endRef.current?.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth', block: 'nearest' });
  }, [messages.length]);

  const send = async (event: React.FormEvent) => {
    event.preventDefault();
    const content = message.trim();
    if (!content) return;
    setSending(true);
    setError('');
    try {
      const response = await fetch('/api/community', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, courseId }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Message could not be sent.');
      requestIdRef.current += 1;
      setMessages((current) => [...current, data.message]);
      setMessage('');
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Message could not be sent.');
    } finally {
      setSending(false);
    }
  };

  return (
    <section className="grid min-h-[36rem] border border-border bg-card lg:h-[calc(100svh-13rem)] lg:max-h-[52rem] lg:grid-cols-[minmax(0,1fr)_17rem]" aria-labelledby="channel-title">
      <div className="flex min-h-0 flex-col">
        <header className="flex items-start justify-between gap-4 border-b border-border px-4 py-4 sm:px-6">
          <div>
            <div className="flex items-center gap-2"><Users className="size-4 text-primary" /><span className="board-label text-primary">Open channel / Live</span></div>
            <h2 id="channel-title" className="mt-2 text-lg font-bold">Student lounge</h2>
          </div>
          <div className="text-right"><strong className="board-value block text-2xl">{messages.length}</strong><span className="board-label">Messages</span></div>
        </header>

        {error && (
          <div role="alert" className="flex items-center justify-between gap-4 border-b border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive sm:px-6">
            <span className="flex items-center gap-2"><AlertCircle className="size-4 shrink-0" />{error}</span>
            <Button type="button" variant="ghost" size="sm" onClick={() => { setLoading(true); setRefreshKey((value) => value + 1); }}><RefreshCw className="size-4" />Retry</Button>
          </div>
        )}

        <div className="min-h-[20rem] flex-1 overflow-y-auto" aria-live="polite" aria-busy={loading}>
          {loading ? (
            <div className="divide-y divide-border" aria-label="Loading discussion">
              {[0, 1, 2].map((item) => <div key={item} className="flex gap-4 px-4 py-6 sm:px-6"><div className="size-9 animate-pulse bg-muted" /><div className="flex-1"><div className="h-3 w-28 animate-pulse bg-muted" /><div className="mt-3 h-4 max-w-xl animate-pulse bg-muted" /><div className="mt-2 h-4 max-w-md animate-pulse bg-muted" /></div></div>)}
            </div>
          ) : messages.length === 0 ? (
            <div className="grid h-full min-h-[20rem] place-items-center px-6 text-center">
              <div><MessageSquare className="mx-auto mb-4 size-7 text-muted-foreground" /><h3 className="text-lg font-bold">Start a useful discussion</h3><p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-muted-foreground">Share the problem, what you tried, and the result you expected. Specific context gets better answers.</p></div>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {messages.map((item) => {
                const mine = item.user?.id === currentUserId;
                return (
                  <article key={item.id} className={cn('flex gap-4 px-4 py-5 sm:px-6', mine && 'bg-primary/[.035]')}>
                    <div className={cn('grid size-9 shrink-0 place-items-center rounded-sm border bg-muted text-xs font-bold', mine ? 'border-primary/50 text-primary' : 'border-border text-foreground')}>
                      {item.user?.name?.charAt(0).toUpperCase() || '?'}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1"><span className="text-sm font-bold">{mine ? 'You' : item.user?.name || 'Student'}</span><time className="font-mono text-[10px] text-muted-foreground" dateTime={item.createdAt}>{messageTime(item.createdAt)}</time></div>
                      <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-6 text-foreground/90">{item.content}</p>
                    </div>
                  </article>
                );
              })}
              <div ref={endRef} />
            </div>
          )}
        </div>

        <footer className="border-t border-border bg-background p-3 sm:p-4">
          <form onSubmit={send}>
            <Textarea
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              onKeyDown={(event) => { if ((event.metaKey || event.ctrlKey) && event.key === 'Enter') event.currentTarget.form?.requestSubmit(); }}
              maxLength={1000}
              rows={3}
              placeholder="Describe the question, what you tried, and where you are blocked…"
              aria-label="Community message"
              className="min-h-24 resize-none rounded-sm"
            />
            <div className="mt-3 flex items-center justify-between gap-3">
              <span className="font-mono text-[10px] text-muted-foreground">⌘ Enter to send · {message.length}/1000</span>
              <Button type="submit" disabled={sending || !message.trim()}><Send className="size-4" />{sending ? 'Sending…' : 'Send message'}</Button>
            </div>
          </form>
        </footer>
      </div>

      <aside className="border-t border-border bg-background p-5 lg:border-l lg:border-t-0" aria-label="Community posting guide">
        <p className="board-label text-primary">Before you post</p>
        <ol className="mt-5 space-y-5">
          <li className="grid grid-cols-[1.75rem_1fr] gap-3"><span className="font-mono text-xs text-primary">01</span><div><strong className="text-sm">Name the problem</strong><p className="mt-1 text-xs leading-5 text-muted-foreground">What are you building or trying to understand?</p></div></li>
          <li className="grid grid-cols-[1.75rem_1fr] gap-3"><span className="font-mono text-xs text-primary">02</span><div><strong className="text-sm">Show your attempt</strong><p className="mt-1 text-xs leading-5 text-muted-foreground">Include the approach, result, or error that brought you here.</p></div></li>
          <li className="grid grid-cols-[1.75rem_1fr] gap-3"><span className="font-mono text-xs text-primary">03</span><div><strong className="text-sm">Close the loop</strong><p className="mt-1 text-xs leading-5 text-muted-foreground">Share what worked so the next learner can use it.</p></div></li>
        </ol>
        <div className="mt-8 border-t border-border pt-5"><p className="board-label">Channel refresh</p><p className="mt-2 text-xs leading-5 text-muted-foreground">New messages are checked every 10 seconds while this tab is active.</p></div>
      </aside>
    </section>
  );
}
