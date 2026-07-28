'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  ArrowRight,
  AtSign,
  CheckCircle2,
  Clock,
  Code2,
  Loader2,
  Lock,
  ShieldCheck,
  Sparkles,
  Target,
  User,
} from 'lucide-react';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { PASSWORD_MIN_LENGTH, USERNAME_PATTERN } from '@/lib/auth/validation';

const steps = [
  { icon: CheckCircle2, label: 'Request submitted', detail: 'We capture your details instantly.' },
  { icon: Clock, label: 'Admin review', detail: 'An academy admin verifies your request.' },
  { icon: ShieldCheck, label: 'Access granted', detail: 'Approved accounts get assigned courses.' },
];

export default function SignupPage() {
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [goal, setGoal] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const usernameError = useMemo(() => {
    if (!username) return null;
    return USERNAME_PATTERN.test(username.toLowerCase())
      ? null
      : '3-24 characters, lowercase letters, numbers or underscores only.';
  }, [username]);

  const passwordError = useMemo(() => {
    if (!password) return null;
    return password.length < PASSWORD_MIN_LENGTH ? `Use at least ${PASSWORD_MIN_LENGTH} characters.` : null;
  }, [password]);

  const confirmError = useMemo(() => {
    if (!confirmPassword) return null;
    return confirmPassword === password ? null : 'Passwords do not match.';
  }, [confirmPassword, password]);

  const canSubmit =
    !loading && name && username && email && password && confirmPassword &&
    !usernameError && !passwordError && !confirmError;

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!canSubmit) return;
    setLoading(true);
    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          username: username.toLowerCase(),
          email,
          password,
          goal,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'We could not submit your request. Try again.');
      setSubmitted(true);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Signup failed. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#0B0F17] text-white flex flex-col justify-between p-4 sm:p-6 lg:p-8">
      <header className="mx-auto w-full max-w-7xl flex items-center justify-between">
        <Link href="/" className="inline-flex items-center gap-2 text-xs font-mono font-bold text-[#919EAB] hover:text-[#00AB55] transition-colors">
          <ArrowLeft className="size-4" /> Return to Academy
        </Link>
        <Badge variant="outline" className="bg-[#00AB55]/10 text-[#00AB55] border-[#00AB55]/30 font-mono text-xs">
          <Sparkles className="size-3 mr-1" /> ADMISSIONS OPEN
        </Badge>
      </header>

      <div className="mx-auto w-full max-w-5xl my-10 grid gap-8 lg:grid-cols-[1.1fr_0.9fr] items-start">
        <div className="minimal-card p-8 border border-[#919EAB]/20 shadow-2xl space-y-6">
          {submitted ? (
            <div className="space-y-6 text-center py-6" role="status" aria-live="polite">
              <div className="size-16 rounded-2xl bg-[#00AB55]/15 text-[#00AB55] grid place-items-center mx-auto">
                <CheckCircle2 className="size-8" />
              </div>
              <div className="space-y-2">
                <h1 className="text-2xl font-extrabold text-white">Request submitted</h1>
                <p className="text-sm text-[#919EAB] leading-relaxed max-w-sm mx-auto">
                  Your account <strong className="text-white font-mono">@{username.toLowerCase()}</strong> is queued
                  for administrator approval. You will be able to sign in as soon as it is approved and courses are assigned.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button asChild className="bg-[#00AB55] hover:bg-[#007B55] text-white font-bold rounded-xl">
                  <Link href="/login">Go to sign in <ArrowRight className="size-4 ml-2" /></Link>
                </Button>
                <Button asChild variant="outline" className="bg-[#212B36] border-[#919EAB]/20 text-white rounded-xl">
                  <Link href="/pending-approval?status=pending">What happens next?</Link>
                </Button>
              </div>
            </div>
          ) : (
            <>
              <div className="text-center space-y-2">
                <div className="size-12 rounded-2xl bg-gradient-to-br from-[#00AB55] to-[#007B55] grid place-items-center mx-auto text-white shadow-lg shadow-[#00AB55]/30 mb-4">
                  <Code2 className="size-6" />
                </div>
                <h1 className="text-2xl font-extrabold text-white tracking-tight">Request academy access</h1>
                <p className="text-xs text-[#919EAB]">
                  Create your learner profile. An admin approves every account before access is granted.
                </p>
              </div>

              <form onSubmit={submit} className="space-y-4" noValidate>
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-xs font-bold text-[#919EAB]">Full name</Label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-[#637381]" aria-hidden="true" />
                    <Input
                      id="name"
                      autoComplete="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Priya Nair"
                      className="bg-[#212B36] border-[#919EAB]/20 text-white placeholder:text-[#637381] rounded-xl pl-10 text-xs"
                      required
                    />
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="username" className="text-xs font-bold text-[#919EAB]">Username</Label>
                    <Input
                      id="username"
                      autoComplete="username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value.toLowerCase())}
                      placeholder="priya_nair"
                      aria-invalid={Boolean(usernameError)}
                      aria-describedby={usernameError ? 'username-error' : undefined}
                      className="bg-[#212B36] border-[#919EAB]/20 text-white placeholder:text-[#637381] rounded-xl text-xs font-mono"
                      required
                    />
                    {usernameError && (
                      <p id="username-error" className="text-[11px] text-[#FF4842]">{usernameError}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-xs font-bold text-[#919EAB]">Email</Label>
                    <div className="relative">
                      <AtSign className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-[#637381]" aria-hidden="true" />
                      <Input
                        id="email"
                        type="email"
                        autoComplete="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@example.com"
                        className="bg-[#212B36] border-[#919EAB]/20 text-white placeholder:text-[#637381] rounded-xl pl-10 text-xs"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-xs font-bold text-[#919EAB]">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-[#637381]" aria-hidden="true" />
                      <Input
                        id="password"
                        type="password"
                        autoComplete="new-password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder={`Min ${PASSWORD_MIN_LENGTH} characters`}
                        aria-invalid={Boolean(passwordError)}
                        aria-describedby={passwordError ? 'password-error' : undefined}
                        className="bg-[#212B36] border-[#919EAB]/20 text-white placeholder:text-[#637381] rounded-xl pl-10 text-xs"
                        required
                      />
                    </div>
                    {passwordError && (
                      <p id="password-error" className="text-[11px] text-[#FF4842]">{passwordError}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword" className="text-xs font-bold text-[#919EAB]">Confirm password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-[#637381]" aria-hidden="true" />
                      <Input
                        id="confirmPassword"
                        type="password"
                        autoComplete="new-password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Repeat password"
                        aria-invalid={Boolean(confirmError)}
                        aria-describedby={confirmError ? 'confirm-error' : undefined}
                        className="bg-[#212B36] border-[#919EAB]/20 text-white placeholder:text-[#637381] rounded-xl pl-10 text-xs"
                        required
                      />
                    </div>
                    {confirmError && (
                      <p id="confirm-error" className="text-[11px] text-[#FF4842]">{confirmError}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="goal" className="text-xs font-bold text-[#919EAB]">
                    <span className="inline-flex items-center gap-1.5"><Target className="size-3.5" /> What do you want to learn? (optional)</span>
                  </Label>
                  <Textarea
                    id="goal"
                    value={goal}
                    onChange={(e) => setGoal(e.target.value)}
                    maxLength={400}
                    rows={3}
                    placeholder="Helps the admin assign the right courses to your workspace."
                    className="bg-[#212B36] border-[#919EAB]/20 text-white placeholder:text-[#637381] rounded-xl text-xs"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={!canSubmit}
                  className="w-full bg-[#00AB55] hover:bg-[#007B55] text-white font-bold rounded-xl py-3 shadow-lg shadow-[#00AB55]/20 mt-2 disabled:opacity-50"
                >
                  {loading ? (
                    <><Loader2 className="size-4 animate-spin mr-2" /> Submitting request…</>
                  ) : (
                    <>Request access <ArrowRight className="size-4 ml-2" /></>
                  )}
                </Button>
              </form>

              <div className="pt-4 border-t border-[#919EAB]/12 text-center text-xs text-[#637381]">
                Already approved?{' '}
                <Link href="/login" className="text-[#00AB55] font-bold hover:underline">Sign in instead</Link>
              </div>
            </>
          )}
        </div>

        <aside className="minimal-card p-8 border border-[#919EAB]/16 space-y-6">
          <div className="space-y-2">
            <span className="board-label text-[#00AB55]">Approval workflow</span>
            <h2 className="text-xl font-extrabold text-white">How access is granted</h2>
          </div>
          <ol className="space-y-5">
            {steps.map((step, index) => {
              const Icon = step.icon;
              return (
                <li key={step.label} className="flex gap-4">
                  <div className="size-10 rounded-xl bg-[#212B36] border border-[#919EAB]/16 grid place-items-center text-[#00AB55] shrink-0">
                    <Icon className="size-5" aria-hidden="true" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white">
                      <span className="font-mono text-[#637381] mr-1.5">0{index + 1}</span>{step.label}
                    </p>
                    <p className="text-xs text-[#919EAB] mt-0.5 leading-relaxed">{step.detail}</p>
                  </div>
                </li>
              );
            })}
          </ol>
          <p className="text-[11px] text-[#637381] leading-relaxed border-t border-[#919EAB]/12 pt-4">
            Signing up does not grant access on its own. Until an admin approves the request, sign-in stays blocked
            and no course content is visible.
          </p>
        </aside>
      </div>

      <footer className="mx-auto w-full max-w-7xl text-center text-xs font-mono text-[#637381]">
        © 2026 AUMINDS Academy. All rights reserved.
      </footer>
    </main>
  );
}
