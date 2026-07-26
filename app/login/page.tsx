'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ArrowRight, Loader2, Lock, ShieldCheck, User } from 'lucide-react';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const login = async (event: React.FormEvent) => {
    event.preventDefault(); setLoading(true);
    try {
      const response = await fetch('/api/auth/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username, password }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'We could not sign you in. Check your credentials and try again.');
      router.push(data.role === 'admin' ? '/admin' : '/dashboard'); router.refresh();
    } catch (error) { toast.error(error instanceof Error ? error.message : 'Sign-in failed. Try again.'); }
    finally { setLoading(false); }
  };
  return <main className="grid min-h-screen bg-background lg:grid-cols-[.8fr_1.2fr]">
    <section className="flex flex-col justify-between border-b border-border bg-card p-6 sm:p-10 lg:border-b-0 lg:border-r">
      <Link href="/" className="inline-flex w-fit items-center gap-2 text-sm text-muted-foreground hover:text-foreground"><ArrowLeft className="size-4" /> Back to AUMINDS</Link>
      <div className="my-16 max-w-lg"><div className="mb-6 flex items-center gap-3"><span className="signal-dot" /><span className="board-label">Access control · online</span></div><h1 className="board-value text-5xl leading-[.94] sm:text-7xl">YOUR WORKSPACE IS ONE STOP AWAY.</h1><p className="mt-6 max-w-md text-lg text-muted-foreground">Continue lessons, run code, submit projects, or manage the academy network.</p></div>
      <p className="board-label">Secure academy portal · session protected</p>
    </section>
    <section className="flex items-center justify-center p-5 sm:p-10"><div className="w-full max-w-md">
      <div className="mb-8"><p className="board-label text-primary">Identity check</p><h2 className="board-value mt-3 text-3xl">SIGN IN</h2><p className="mt-2 text-sm text-muted-foreground">Use the credentials assigned to your account.</p></div>
      <div className="mb-6 grid grid-cols-2 border border-border"><button type="button" onClick={() => { setUsername('admin'); setPassword('admin123'); }} className="p-4 text-left transition-colors hover:bg-muted"><ShieldCheck className="mb-3 size-4 text-primary" /><span className="block text-sm font-bold">Admin demo</span><span className="mt-1 block font-mono text-[10px] text-muted-foreground">admin / admin123</span></button><button type="button" onClick={() => { setUsername('alex_coder'); setPassword('student123'); }} className="border-l border-border p-4 text-left transition-colors hover:bg-muted"><User className="mb-3 size-4 text-primary" /><span className="block text-sm font-bold">Student demo</span><span className="mt-1 block font-mono text-[10px] text-muted-foreground">alex_coder / student123</span></button></div>
      <form onSubmit={login} className="space-y-5">
        <div className="space-y-2"><Label htmlFor="username">Username</Label><div className="relative"><User className="absolute left-3.5 top-3.5 size-4 text-muted-foreground" /><Input id="username" autoComplete="username" value={username} onChange={(event) => setUsername(event.target.value)} placeholder="Your username" className="pl-10" required /></div></div>
        <div className="space-y-2"><Label htmlFor="password">Password</Label><div className="relative"><Lock className="absolute left-3.5 top-3.5 size-4 text-muted-foreground" /><Input id="password" type="password" autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Your password" className="pl-10" required /></div></div>
        <Button type="submit" disabled={loading} size="lg" className="w-full">{loading ? <><Loader2 className="size-4 animate-spin" /> Checking credentials</> : <>Open workspace <ArrowRight className="size-4" /></>}</Button>
      </form>
      <p className="mt-6 text-center text-xs text-muted-foreground">Need access? Contact your academy administrator.</p>
    </div></section>
  </main>;
}
