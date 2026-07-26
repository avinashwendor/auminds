'use client';

import { useDeferredValue, useState } from 'react';
import { ArrowUpRight, Briefcase, Building2, MapPin, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface JobPosting { id: string; title: string; company: string; logoUrl?: string | null; location: string; type: string; salary?: string | null; description: string; applyUrl: string; createdAt: string }
interface JobBoardWidgetProps { jobs: JobPosting[] }

export default function JobBoardWidget({ jobs }: JobBoardWidgetProps) {
  const [search, setSearch] = useState('');
  const [type, setType] = useState('All');
  const deferredSearch = useDeferredValue(search.trim().toLowerCase());
  const types = ['All', ...Array.from(new Set(jobs.map((job) => job.type)))];
  const visible = jobs.filter((job) => (type === 'All' || job.type === type) && (!deferredSearch || `${job.title} ${job.company} ${job.location} ${job.description}`.toLowerCase().includes(deferredSearch)));
  return <section>
    <header className="grid gap-6 border-b border-border pb-8 lg:grid-cols-[1fr_22rem] lg:items-end"><div><div className="flex items-center gap-2"><Briefcase className="size-4 text-primary" /><span className="board-label text-primary">Career network · {jobs.length} active roles</span></div><h1 className="board-value mt-3 text-4xl sm:text-5xl">OPPORTUNITY BOARD</h1><p className="mt-3 max-w-2xl text-muted-foreground">Engineering roles curated for AUMINDS learners. Review the requirements, then apply directly with the employer.</p></div><div><label htmlFor="job-search" className="board-label mb-2 block">Search roles</label><div className="relative"><Search className="absolute left-3.5 top-3.5 size-4 text-muted-foreground" /><Input id="job-search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Title, company, location…" className="pl-10" /></div></div></header>
    <div className="flex gap-2 overflow-x-auto border-b border-border py-4" aria-label="Filter by employment type">{types.map((item) => <button key={item} onClick={() => setType(item)} className={cn('min-h-9 whitespace-nowrap border px-3 font-mono text-[10px] font-bold uppercase tracking-wider', type === item ? 'border-primary bg-primary text-primary-foreground' : 'border-border text-muted-foreground hover:text-foreground')}>{item}</button>)}</div>
    <div className="hidden grid-cols-[1fr_10rem_8rem_8rem] gap-5 border-b border-border py-3 board-label lg:grid"><span>Role</span><span>Location</span><span>Type</span><span>Apply</span></div>
    {visible.length === 0 ? <div className="py-16 text-center"><Briefcase className="mx-auto mb-4 size-8 text-muted-foreground" /><h2 className="board-value text-2xl">NO MATCHING ROLES</h2><p className="mt-2 text-sm text-muted-foreground">Try a broader search or choose another employment type.</p></div> : visible.map((job) => <article key={job.id} className="group grid gap-5 border-b border-border py-6 lg:grid-cols-[1fr_10rem_8rem_8rem] lg:items-center"><div className="flex gap-4"><div className="grid size-11 shrink-0 place-items-center border border-border bg-card"><Building2 className="size-5 text-primary" /></div><div><h2 className="board-value text-xl group-hover:text-primary sm:text-2xl">{job.title}</h2><p className="mt-1 text-sm font-bold">{job.company}</p><p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground lg:line-clamp-2">{job.description}</p>{job.salary && <p className="mt-2 font-mono text-xs text-emerald-400">{job.salary}</p>}</div></div><p className="flex items-center gap-2 text-sm text-muted-foreground"><MapPin className="size-4 shrink-0" />{job.location}</p><span className="board-label text-foreground">{job.type}</span><Button asChild variant="outline"><a href={job.applyUrl} target="_blank" rel="noreferrer">Apply <ArrowUpRight className="size-4" /></a></Button></article>)}
  </section>;
}
