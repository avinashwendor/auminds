'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ArrowRight, Loader2, Lock, User, Code2, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const login = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'We could not sign you in. Check your credentials and try again.');
      }
      router.push(data.role === 'admin' ? '/admin' : '/dashboard');
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Sign-in failed. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#0B0F17] text-white flex flex-col justify-between p-4 sm:p-6 lg:p-8">
      {/* Top Header */}
      <header className="mx-auto w-full max-w-7xl flex items-center justify-between">
        <Link href="/" className="inline-flex items-center gap-2 text-xs font-mono font-bold text-[#919EAB] hover:text-[#00AB55] transition-colors">
          <ArrowLeft className="size-4" /> Return to Academy
        </Link>
        <Badge variant="outline" className="bg-[#00AB55]/10 text-[#00AB55] border-[#00AB55]/30 font-mono text-xs">
          <Sparkles className="size-3 mr-1" /> OS VERSION 2.0
        </Badge>
      </header>

      {/* Main Login Card */}
      <div className="mx-auto w-full max-w-md my-12">
        <div className="minimal-card p-8 border border-[#919EAB]/20 shadow-2xl space-y-6">
          <div className="text-center space-y-2">
            <div className="size-12 rounded-2xl bg-gradient-to-br from-[#00AB55] to-[#007B55] grid place-items-center mx-auto text-white shadow-lg shadow-[#00AB55]/30 mb-4">
              <Code2 className="size-6" />
            </div>
            <h1 className="text-2xl font-extrabold text-white tracking-tight">Sign In to AUMINDS</h1>
            <p className="text-xs text-[#919EAB]">Enter your academy credentials to access your workspace</p>
          </div>

          <form onSubmit={login} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username" className="text-xs font-bold text-[#919EAB]">Username</Label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-[#637381]" />
                <Input
                  id="username"
                  autoComplete="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter student or admin username"
                  className="bg-[#212B36] border-[#919EAB]/20 text-white placeholder:text-[#637381] rounded-xl pl-10 text-xs"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-xs font-bold text-[#919EAB]">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-[#637381]" />
                <Input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter account password"
                  className="bg-[#212B36] border-[#919EAB]/20 text-white placeholder:text-[#637381] rounded-xl pl-10 text-xs"
                  required
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-[#00AB55] hover:bg-[#007B55] text-white font-bold rounded-xl py-3 shadow-lg shadow-[#00AB55]/20 mt-2"
            >
              {loading ? (
                <>
                  <Loader2 className="size-4 animate-spin mr-2" /> Authenticating…
                </>
              ) : (
                <>
                  Enter Workspace <ArrowRight className="size-4 ml-2" />
                </>
              )}
            </Button>
          </form>

          <div className="pt-4 border-t border-[#919EAB]/12 text-center text-xs font-mono text-[#637381]">
            Protected Academy Authentication Engine
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="mx-auto w-full max-w-7xl text-center text-xs font-mono text-[#637381]">
        © 2026 AUMINDS Academy. All rights reserved.
      </footer>
    </main>
  );
}
