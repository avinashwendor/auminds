'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Briefcase, Plus, Trash2, ArrowLeft, Building2, MapPin, DollarSign } from 'lucide-react';

interface JobManagementClientProps {
  initialJobs: any[];
}

export default function JobManagementClient({ initialJobs }: JobManagementClientProps) {
  const [jobs, setJobs] = useState(initialJobs);
  const [title, setTitle] = useState('');
  const [company, setCompany] = useState('');
  const [location, setLocation] = useState('');
  const [type, setType] = useState('Full-time');
  const [salary, setSalary] = useState('');
  const [description, setDescription] = useState('');
  const [applyUrl, setApplyUrl] = useState('');

  const [isCreating, setIsCreating] = useState(false);

  const handleCreateJob = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !company || !location || !description || !applyUrl) return;

    try {
      const res = await fetch('/api/admin/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          company,
          location,
          type,
          salary,
          description,
          applyUrl,
        }),
      });
      const data = await res.json();
      if (data.job) {
        setJobs([data.job, ...jobs]);
        setIsCreating(false);
        setTitle('');
        setCompany('');
        setLocation('');
        setDescription('');
        setApplyUrl('');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteJob = async (jobId: string) => {
    if (!confirm('Are you sure you want to delete this job posting?')) return;
    try {
      await fetch(`/api/admin/jobs?jobId=${jobId}`, { method: 'DELETE' });
      setJobs(jobs.filter(j => j.id !== jobId));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl glass-card border border-indigo-500/20 bg-slate-900/90 shadow-2xl">
        <div className="flex items-center gap-3">
          <Link href="/admin" className="p-2.5 rounded-2xl bg-slate-800 text-slate-300 hover:text-white border border-slate-700 transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-black text-white flex items-center gap-2">
              <Briefcase className="w-6 h-6 text-emerald-400" /> Career Job Postings Manager
            </h1>
            <p className="text-xs text-slate-400 font-mono mt-0.5">
              Post high-paying developer jobs directly for enrolled students on the Job Board.
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsCreating(!isCreating)}
          className="px-5 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/30 flex items-center gap-2 transition-all"
        >
          <Plus className="w-4 h-4" /> Post New Job
        </button>
      </div>

      {/* New Job Form */}
      {isCreating && (
        <form onSubmit={handleCreateJob} className="p-6 rounded-3xl glass-card border border-emerald-500/30 space-y-4 bg-slate-900/95 shadow-2xl">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-emerald-400" /> Fill Opportunity Details
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-mono text-slate-400 block mb-1">Job Title</label>
              <input
                type="text"
                placeholder="e.g. Senior Frontend Engineer"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-950 text-slate-200 border border-slate-800 text-xs focus:outline-none focus:border-emerald-500"
                required
              />
            </div>
            <div>
              <label className="text-xs font-mono text-slate-400 block mb-1">Company Name</label>
              <input
                type="text"
                placeholder="e.g. Vercel, Stripe"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-950 text-slate-200 border border-slate-800 text-xs focus:outline-none focus:border-emerald-500"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-mono text-slate-400 block mb-1">Location</label>
              <input
                type="text"
                placeholder="Remote / San Francisco"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-950 text-slate-200 border border-slate-800 text-xs focus:outline-none focus:border-emerald-500"
                required
              />
            </div>
            <div>
              <label className="text-xs font-mono text-slate-400 block mb-1">Employment Type</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-950 text-slate-200 border border-slate-800 text-xs focus:outline-none focus:border-emerald-500"
              >
                <option value="Full-time">Full-time</option>
                <option value="Part-time">Part-time</option>
                <option value="Contract">Contract</option>
                <option value="Internship">Internship</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-mono text-slate-400 block mb-1">Salary Range</label>
              <input
                type="text"
                placeholder="$120,000 - $160,000"
                value={salary}
                onChange={(e) => setSalary(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-950 text-slate-200 border border-slate-800 text-xs focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-mono text-slate-400 block mb-1">Application URL</label>
            <input
              type="url"
              placeholder="https://company.com/careers/job-123"
              value={applyUrl}
              onChange={(e) => setApplyUrl(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-950 text-slate-200 border border-slate-800 text-xs focus:outline-none focus:border-emerald-500"
              required
            />
          </div>

          <div>
            <label className="text-xs font-mono text-slate-400 block mb-1">Job Description</label>
            <textarea
              placeholder="Responsibilities, requirements, perks..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-950 text-slate-200 border border-slate-800 text-xs focus:outline-none focus:border-emerald-500 h-24"
              required
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setIsCreating(false)}
              className="px-4 py-2 rounded-xl text-slate-400 hover:text-slate-200 text-xs font-mono"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/30"
            >
              Publish Job
            </button>
          </div>
        </form>
      )}

      {/* Jobs List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {jobs.map((job) => (
          <div key={job.id} className="p-5 rounded-3xl glass-card border border-slate-800 space-y-3 relative">
            <div className="flex items-start justify-between">
              <div>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  {job.type}
                </span>
                <h3 className="font-bold text-base text-white mt-1">{job.title}</h3>
                <span className="text-xs text-indigo-400 font-medium">{job.company}</span>
              </div>

              <button
                onClick={() => handleDeleteJob(job.id)}
                className="p-1.5 rounded-xl text-slate-500 hover:text-rose-400 hover:bg-rose-500/10"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-center gap-4 text-xs font-mono text-slate-400">
              <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5 text-slate-500" /> {job.location}</span>
              {job.salary && <span className="flex items-center gap-1 text-emerald-400"><DollarSign className="w-3.5 h-3.5" /> {job.salary}</span>}
            </div>

            <p className="text-xs text-slate-400 line-clamp-2">{job.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
