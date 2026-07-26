'use client';

import { useDeferredValue, useState } from 'react';
import { 
  ArrowUpRight, Briefcase, Building2, MapPin, Search, 
  Sparkles, DollarSign, Filter
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface JobPosting {
  id: string;
  title: string;
  company: string;
  logoUrl?: string | null;
  location: string;
  type: string;
  salary?: string | null;
  description: string;
  applyUrl: string;
  createdAt: string | Date;
}

interface JobBoardWidgetProps {
  jobs: JobPosting[];
}

export default function JobBoardWidget({ jobs }: JobBoardWidgetProps) {
  const [search, setSearch] = useState('');
  const [type, setType] = useState('All');
  const deferredSearch = useDeferredValue(search.trim().toLowerCase());
  const types = ['All', ...Array.from(new Set(jobs.map((job) => job.type)))];

  const visible = jobs.filter(
    (job) =>
      (type === 'All' || job.type === type) &&
      (!deferredSearch ||
        `${job.title} ${job.company} ${job.location} ${job.description}`
          .toLowerCase()
          .includes(deferredSearch))
  );

  return (
    <div className="space-y-10">
      
      {/* Header */}
      <header className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 border-b border-[#919EAB]/12 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="outline" className="bg-[#00AB55]/15 text-[#00AB55] border-[#00AB55]/40 font-mono text-xs px-3 py-1 font-bold">
              <Briefcase className="size-4 mr-1.5" /> CAREER OPPORTUNITIES
            </Badge>
            <span className="text-xs font-mono font-bold text-[#919EAB]">{jobs.length} Active Positions</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight">ENGINEERING JOB BOARD</h1>
          <p className="mt-2 text-sm text-[#919EAB] max-w-xl leading-relaxed">
            Curated roles from top tech companies actively hiring software engineers from the AUMINDS academy network.
          </p>
        </div>

        {/* Search Input */}
        <div className="w-full lg:max-w-sm">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-[#919EAB]" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search title, company, stack…"
              className="bg-[#212B36] border-[#919EAB]/20 text-white placeholder:text-[#637381] rounded-2xl pl-12 py-3 text-sm"
            />
          </div>
        </div>
      </header>

      {/* Filter Tabs */}
      <div className="flex items-center gap-3 overflow-x-auto pb-3 border-b border-[#919EAB]/12">
        <Filter className="size-5 text-[#919EAB] shrink-0 mr-1" />
        {types.map((item) => (
          <button
            key={item}
            onClick={() => setType(item)}
            className={cn(
              'px-5 py-2.5 rounded-2xl font-mono text-xs font-bold transition-all shrink-0',
              type === item
                ? 'bg-[#00AB55] text-white shadow-lg shadow-[#00AB55]/30'
                : 'bg-[#212B36] text-[#919EAB] hover:text-white hover:bg-[#919EAB]/20 border border-[#919EAB]/16'
            )}
          >
            {item}
          </button>
        ))}
      </div>

      {/* Job Postings Grid */}
      {visible.length === 0 ? (
        <div className="minimal-card p-16 text-center">
          <Briefcase className="size-12 text-[#637381] mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white">No Matching Openings</h2>
          <p className="text-sm text-[#919EAB] mt-2">Try broadening your search query or choosing another employment filter.</p>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2">
          {visible.map((job) => (
            <div key={job.id} className="minimal-card p-8 flex flex-col justify-between group space-y-6">
              <div className="space-y-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="size-14 rounded-2xl bg-[#212B36] border border-[#919EAB]/20 grid place-items-center shrink-0">
                      <Building2 className="size-7 text-[#00AB55]" />
                    </div>
                    <div>
                      <h3 className="text-xl sm:text-2xl font-extrabold text-white group-hover:text-[#00AB55] transition-colors leading-tight">
                        {job.title}
                      </h3>
                      <p className="text-sm font-extrabold text-[#919EAB] mt-1">{job.company}</p>
                    </div>
                  </div>

                  <Badge variant="outline" className="bg-[#212B36] text-[#00AB55] border-[#00AB55]/30 text-xs font-mono px-3 py-1 font-bold shrink-0">
                    {job.type}
                  </Badge>
                </div>

                <p className="text-sm text-[#919EAB] line-clamp-3 leading-relaxed">
                  {job.description}
                </p>
              </div>

              <div className="pt-6 border-t border-[#919EAB]/12 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3 text-xs sm:text-sm font-mono">
                  <span className="flex items-center gap-1.5 text-[#919EAB]">
                    <MapPin className="size-4 text-[#3366FF]" /> {job.location}
                  </span>
                  {job.salary && (
                    <span className="flex items-center gap-1 text-[#00AB55] font-extrabold text-sm">
                      <DollarSign className="size-4" /> {job.salary}
                    </span>
                  )}
                </div>

                <Button asChild className="w-full bg-[#00AB55] hover:bg-[#007B55] text-white font-extrabold rounded-2xl py-3.5 text-sm shadow-lg shadow-[#00AB55]/20">
                  <a href={job.applyUrl} target="_blank" rel="noreferrer">
                    Apply Now <ArrowUpRight className="size-5 ml-2" />
                  </a>
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
}
