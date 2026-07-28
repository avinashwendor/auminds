import { NextResponse } from 'next/server';
import { hashPassword } from '@/lib/auth';
import { createUser, getUserByEmail, getUserByUsername } from '@/lib/db/queries';
import {
  sanitizeFreeText,
  validateEmail,
  validateName,
  validatePassword,
  validateUsername,
} from '@/lib/auth/validation';

// Coarse in-process throttle so a single client cannot spam the approval queue.
const SIGNUP_WINDOW_MS = 60 * 60 * 1000;
const SIGNUP_MAX_PER_WINDOW = 5;
const signupHits = new Map<string, number[]>();

function isRateLimited(key: string) {
  const now = Date.now();
  const hits = (signupHits.get(key) || []).filter((time) => now - time < SIGNUP_WINDOW_MS);
  if (hits.length >= SIGNUP_MAX_PER_WINDOW) {
    signupHits.set(key, hits);
    return true;
  }
  hits.push(now);
  signupHits.set(key, hits);
  if (signupHits.size > 5000) signupHits.clear();
  return false;
}

export async function POST(request: Request) {
  const clientKey =
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    'unknown';

  if (isRateLimited(clientKey)) {
    return NextResponse.json(
      { error: 'Too many signup attempts from this network. Try again later.' },
      { status: 429 },
    );
  }

  try {
    const body = await request.json();

    const name = validateName(body.name);
    if (!name.ok) return NextResponse.json({ error: name.error }, { status: 400 });

    const username = validateUsername(body.username);
    if (!username.ok) return NextResponse.json({ error: username.error }, { status: 400 });

    const email = validateEmail(body.email);
    if (!email.ok) return NextResponse.json({ error: email.error }, { status: 400 });

    const password = validatePassword(body.password);
    if (!password.ok) return NextResponse.json({ error: password.error }, { status: 400 });

    const [existingUsername, existingEmail] = await Promise.all([
      getUserByUsername(username.value),
      email.value ? getUserByEmail(email.value) : Promise.resolve(null),
    ]);

    if (existingUsername) {
      return NextResponse.json({ error: 'That username is already taken.' }, { status: 409 });
    }
    if (existingEmail) {
      return NextResponse.json({ error: 'An account with that email already exists.' }, { status: 409 });
    }

    const passwordHash = await hashPassword(password.value);
    const created = await createUser({
      username: username.value,
      email: email.value,
      passwordHash,
      name: name.value,
      role: 'student',
      // Self-signups always wait for an administrator decision.
      status: 'pending',
      signupGoal: sanitizeFreeText(body.goal),
    });

    return NextResponse.json({
      success: true,
      status: 'pending',
      message: 'Your account request was submitted and is waiting for admin approval.',
      user: { id: created.id, username: created.username, name: created.name },
    });
  } catch (err) {
    console.error('Signup error:', err);
    return NextResponse.json({ error: 'We could not create your account. Try again.' }, { status: 500 });
  }
}
