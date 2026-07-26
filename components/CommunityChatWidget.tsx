'use client';

import { useEffect, useRef, useState } from 'react';
import { 
  AlertCircle, MessageSquare, RefreshCw, Send, Users, 
  Sparkles, Code2, ShieldCheck, CheckCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface ChatMessage {
  id: string;
  content: string;
  createdAt: string;
  user?: { id: string; name: string; username: string; role: string } | null;
}

interface CommunityChatWidgetProps {
  courseId?: string;
  currentUserId: string;
}

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
    let timeoutId: number | undefined;
    let failureCount = 0;

    const schedule = (delay: number) => {
      if (!active) return;
      if (timeoutId) window.clearTimeout(timeoutId);
      timeoutId = window.setTimeout(load, delay);
    };

    const load = async () => {
      if (!active) return;
      if (document.hidden) {
        setLoading(false);
        schedule(30_000);
        return;
      }

      const requestId = ++requestIdRef.current;
      try {
        const response = await fetch(courseId ? `/api/community?courseId=${courseId}` : '/api/community');
        const data = await response.json();
        if (!response.ok) {
          const retryAfter = Number(data.retryAfterMs) || Math.min(30_000 * 2 ** failureCount, 120_000);
          failureCount += 1;
          if (active && requestId === requestIdRef.current) {
            setError(data.error || 'Discussion is temporarily unavailable.');
            schedule(retryAfter);
          }
          return;
        }

        failureCount = 0;
        if (active && requestId === requestIdRef.current) {
          setMessages(data.messages || []);
          setError('');
          schedule(10_000);
        }
      } catch (reason) {
        failureCount += 1;
        if (active && requestId === requestIdRef.current) {
          setError(reason instanceof Error ? reason.message : 'Discussion could not be refreshed.');
          schedule(Math.min(15_000 * 2 ** failureCount, 120_000));
        }
      } finally {
        if (active && requestId === requestIdRef.current) setLoading(false);
      }
    };

    load();
    const onVisible = () => {
      if (!document.hidden) load();
    };
    document.addEventListener('visibilitychange', onVisible);
    return () => {
      active = false;
      if (timeoutId) window.clearTimeout(timeoutId);
      document.removeEventListener('visibilitychange', onVisible);
    };
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
    <div className="minimal-card overflow-hidden grid lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-[#919EAB]/12 border border-[#919EAB]/20 shadow-2xl">
      
      {/* Main Chat Feed */}
      <div className="lg:col-span-8 flex flex-col h-[calc(100vh-12rem)] min-h-[600px]">
        
        {/* Chat Header */}
        <header className="p-6 border-b border-[#919EAB]/12 bg-[#1A2332]/50 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="size-12 rounded-2xl bg-[#00AB55]/15 text-[#00AB55] grid place-items-center shrink-0">
              <Users className="size-6" />
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-xl font-extrabold text-white">Student Lounge & Peer Channel</h2>
                <Badge variant="outline" className="bg-[#00AB55]/15 text-[#00AB55] border-[#00AB55]/30 text-xs font-mono font-bold">
                  LIVE
                </Badge>
              </div>
              <p className="text-xs text-[#919EAB] mt-0.5">Ask questions, share code snippets, and help fellow learners.</p>
            </div>
          </div>

          <div className="text-right font-mono text-xs text-[#919EAB] hidden sm:block">
            <strong className="text-white font-extrabold block text-base">{messages.length}</strong> Messages
          </div>
        </header>

        {/* Error Alert */}
        {error && (
          <div className="p-4 bg-[#FF4842]/15 border-b border-[#FF4842]/30 text-xs font-bold text-[#FF4842] flex items-center justify-between">
            <span className="flex items-center gap-2">
              <AlertCircle className="size-4 shrink-0" /> {error}
            </span>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                setLoading(true);
                setRefreshKey((v) => v + 1);
              }}
              className="text-[#FF4842] hover:bg-[#FF4842]/20 text-xs h-8 font-bold"
            >
              <RefreshCw className="size-4 mr-1.5" /> Retry
            </Button>
          </div>
        )}

        {/* Messages Scroll Area */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6 bg-[#161C24]">
          {loading ? (
            <div className="space-y-6">
              {[0, 1, 2].map((i) => (
                <div key={i} className="flex items-start gap-4 animate-pulse">
                  <div className="size-11 rounded-2xl bg-[#212B36]" />
                  <div className="space-y-2 flex-1">
                    <div className="h-5 w-40 bg-[#212B36] rounded" />
                    <div className="h-14 w-full bg-[#212B36] rounded-2xl" />
                  </div>
                </div>
              ))}
            </div>
          ) : messages.length === 0 ? (
            <div className="h-full grid place-items-center text-center p-12">
              <div>
                <MessageSquare className="size-12 text-[#637381] mx-auto mb-4" />
                <h3 className="text-xl font-extrabold text-white">Start the Discussion</h3>
                <p className="text-sm text-[#919EAB] mt-2 max-w-sm">
                  Be the first to post a question or introduce yourself to the academy community.
                </p>
              </div>
            </div>
          ) : (
            messages.map((msg) => {
              const isMine = msg.user?.id === currentUserId;
              return (
                <div
                  key={msg.id}
                  className={cn(
                    'flex items-start gap-4 group',
                    isMine && 'flex-row-reverse'
                  )}
                >
                  <Avatar className="size-11 rounded-2xl border border-[#919EAB]/20 shrink-0 shadow-md">
                    <AvatarFallback className={cn(
                      'font-extrabold text-sm rounded-2xl',
                      isMine ? 'bg-[#00AB55]/20 text-[#00AB55]' : 'bg-[#3366FF]/20 text-[#3366FF]'
                    )}>
                      {msg.user?.name?.charAt(0).toUpperCase() || '?'}
                    </AvatarFallback>
                  </Avatar>

                  <div className={cn('max-w-[85%]', isMine && 'text-right')}>
                    <div className={cn('flex items-center gap-2.5 text-xs font-mono text-[#919EAB] mb-1.5', isMine && 'justify-end')}>
                      <span className="font-extrabold text-white text-sm">{isMine ? 'You' : msg.user?.name || 'Student'}</span>
                      <span>· {messageTime(msg.createdAt)}</span>
                    </div>

                    <div className={cn(
                      'p-5 rounded-3xl text-sm sm:text-base leading-relaxed text-white whitespace-pre-wrap break-words border shadow-md',
                      isMine
                        ? 'bg-[#00AB55]/15 border-[#00AB55]/35 rounded-tr-none text-right font-medium'
                        : 'bg-[#212B36] border-[#919EAB]/20 rounded-tl-none font-normal'
                    )}>
                      {msg.content}
                    </div>
                  </div>
                </div>
              );
            })
          )}
          <div ref={endRef} />
        </div>

        {/* Message Input Footer */}
        <footer className="p-6 border-t border-[#919EAB]/12 bg-[#1A2332]/50">
          <form onSubmit={send} className="space-y-4">
            <Textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => {
                if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') e.currentTarget.form?.requestSubmit();
              }}
              maxLength={1000}
              rows={3}
              placeholder="Ask a technical question, share code context, or offer help…"
              className="bg-[#212B36] border-[#919EAB]/20 text-white placeholder:text-[#637381] rounded-2xl text-sm sm:text-base p-4 resize-none"
            />
            <div className="flex items-center justify-between text-xs font-mono text-[#919EAB]">
              <span className="font-bold">Press ⌘ + Enter to send · {message.length}/1000</span>
              <Button
                type="submit"
                disabled={sending || !message.trim()}
                className="bg-[#00AB55] hover:bg-[#007B55] text-white font-extrabold rounded-2xl text-sm px-6 py-3 shadow-lg shadow-[#00AB55]/20"
              >
                <Send className="size-4 mr-2" /> {sending ? 'Sending…' : 'Send Message'}
              </Button>
            </div>
          </form>
        </footer>

      </div>

      {/* Community Posting Rules Sidebar */}
      <aside className="lg:col-span-4 p-8 bg-[#161C24] space-y-8">
        <div>
          <Badge variant="outline" className="bg-[#00AB55]/15 text-[#00AB55] border-[#00AB55]/30 font-mono text-xs mb-3 px-3 py-1 font-bold">
            <Code2 className="size-4 mr-1.5" /> GUIDELINES
          </Badge>
          <h3 className="text-xl font-extrabold text-white">Community Principles</h3>
          <p className="text-xs text-[#919EAB] mt-1">High quality engineering discussions get faster answers.</p>
        </div>

        <ol className="space-y-5 text-sm">
          <li className="p-4 rounded-2xl bg-[#212B36] border border-[#919EAB]/12 flex items-start gap-4">
            <span className="font-mono font-extrabold text-[#00AB55] text-base">01</span>
            <div>
              <strong className="text-white block font-extrabold">Be Specific & Concise</strong>
              <span className="text-[#919EAB] mt-1 block leading-relaxed text-xs">Describe the exact error, file, or component behavior.</span>
            </div>
          </li>

          <li className="p-4 rounded-2xl bg-[#212B36] border border-[#919EAB]/12 flex items-start gap-4">
            <span className="font-mono font-extrabold text-[#3366FF] text-base">02</span>
            <div>
              <strong className="text-white block font-extrabold">Show What You Tried</strong>
              <span className="text-[#919EAB] mt-1 block leading-relaxed text-xs">Paste your code snippet or terminal output.</span>
            </div>
          </li>

          <li className="p-4 rounded-2xl bg-[#212B36] border border-[#919EAB]/12 flex items-start gap-4">
            <span className="font-mono font-extrabold text-[#FFC107] text-base">03</span>
            <div>
              <strong className="text-white block font-extrabold">Help Fellow Learners</strong>
              <span className="text-[#919EAB] mt-1 block leading-relaxed text-xs">If you find the fix, post the solution to help others.</span>
            </div>
          </li>
        </ol>

        <div className="p-5 rounded-2xl bg-[#00AB55]/10 border border-[#00AB55]/20 text-xs text-[#00AB55] font-mono font-bold flex items-center gap-3">
          <ShieldCheck className="size-5 shrink-0" />
          <span>Auto-refreshes every 10s while tab is open.</span>
        </div>
      </aside>

    </div>
  );
}
