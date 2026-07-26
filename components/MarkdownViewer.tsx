'use client';

import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Check, CheckCircle2, Copy, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface MarkdownViewerProps { content: string; title: string; isCompleted?: boolean; onComplete?: () => void }

export default function MarkdownViewer({ content, title, isCompleted = false, onComplete }: MarkdownViewerProps) {
  const [completed, setCompleted] = useState(isCompleted);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const complete = () => { if (completed) return; setCompleted(true); onComplete?.(); };
  const copy = async (code: string) => { await navigator.clipboard.writeText(code); setCopiedCode(code); window.setTimeout(() => setCopiedCode(null), 1800); };
  return <div className="w-full">
    <header className="flex flex-col justify-between gap-5 border-b border-border bg-card p-5 sm:flex-row sm:items-center"><div><div className="flex items-center gap-2"><FileText className="size-4 text-primary" /><span className="board-label text-primary">Technical reading</span></div><h1 className="board-value mt-2 text-2xl sm:text-3xl">{title}</h1><p className="mt-2 text-sm text-muted-foreground">Read the material, test the examples, then mark the lesson complete.</p></div><Button onClick={complete} disabled={completed} variant={completed ? 'secondary' : 'default'}><CheckCircle2 className="size-4" />{completed ? 'Reading complete' : 'Finish reading'}</Button></header>
    <article className="mx-auto max-w-[74ch] px-5 py-8 text-[1.02rem] leading-8 text-foreground sm:px-8 sm:py-12">
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={{
        h1: ({ children }) => <h1 className="board-value mb-6 mt-12 border-b border-border pb-4 text-4xl first:mt-0">{children}</h1>,
        h2: ({ children }) => <h2 className="board-value mb-4 mt-12 text-3xl">{children}</h2>,
        h3: ({ children }) => <h3 className="mb-3 mt-9 text-xl font-bold text-primary">{children}</h3>,
        p: ({ children }) => <p className="mb-6 text-foreground/90">{children}</p>,
        ul: ({ children }) => <ul className="mb-6 list-disc space-y-2 pl-6 marker:text-primary">{children}</ul>,
        ol: ({ children }) => <ol className="mb-6 list-decimal space-y-2 pl-6 marker:font-mono marker:text-primary">{children}</ol>,
        blockquote: ({ children }) => <blockquote className="my-8 border border-border bg-card p-5 text-muted-foreground"><span className="board-label mb-2 block text-primary">Note</span>{children}</blockquote>,
        a: ({ children, href }) => <a href={href} target="_blank" rel="noreferrer" className="font-semibold text-primary underline underline-offset-4">{children}</a>,
        table: ({ children }) => <div className="my-8 overflow-x-auto border border-border"><table className="w-full text-left text-sm">{children}</table></div>,
        th: ({ children }) => <th className="border-b border-border bg-card p-3 font-bold">{children}</th>,
        td: ({ children }) => <td className="border-b border-border p-3">{children}</td>,
        code({ className, children }) {
          const match = /language-(\w+)/.exec(className || '');
          const code = String(children).replace(/\n$/, '');
          if (!match) return <code className="rounded-sm border border-border bg-card px-1.5 py-0.5 font-mono text-sm text-primary">{children}</code>;
          const copied = copiedCode === code;
          return <div className="my-8 overflow-hidden border border-border bg-[#0b0d0e]"><div className="flex items-center justify-between border-b border-border bg-card px-4 py-2"><span className="board-label">{match[1]}</span><button onClick={() => copy(code)} className="flex min-h-8 items-center gap-2 px-2 text-xs text-muted-foreground hover:text-foreground">{copied ? <Check className="size-3.5 text-emerald-400" /> : <Copy className="size-3.5" />}{copied ? 'Copied' : 'Copy'}</button></div><pre className="overflow-x-auto p-4 text-sm leading-6 text-[#d7e0e8]"><code>{children}</code></pre></div>;
        },
      }}>{content}</ReactMarkdown>
    </article>
    <footer className="flex flex-col justify-between gap-4 border-t border-border bg-card p-5 sm:flex-row sm:items-center"><div><p className="board-label">End of reading</p><p className="mt-1 text-sm text-muted-foreground">Mark complete to update your course progress.</p></div><Button onClick={complete} disabled={completed} variant={completed ? 'secondary' : 'default'}><CheckCircle2 className="size-4" />{completed ? 'Completed' : 'Mark complete'}</Button></footer>
  </div>;
}
