import type { Metadata } from 'next';
import { getCurrentUser } from '@/lib/auth';
import LandingPage from '@/components/LandingPage';

export const metadata: Metadata = {
  title: 'AUMINDS — Learn to Ship Software That Holds Up',
  description: 'A rigorous coding academy with focused lessons, a browser-based Monaco IDE, reviewed assignments, verified certificates, community, and career opportunities.',
};

export default async function HomePage() {
  const user = await getCurrentUser();
  const destination = user ? (user.role === 'admin' ? '/admin' : '/dashboard') : '/login';
  const primaryAction = user ? 'Open your workspace' : 'Start learning';

  return (
    <LandingPage
      user={user ? { id: user.id, username: user.username, name: user.name, role: user.role } : null}
      destination={destination}
      primaryAction={primaryAction}
    />
  );
}
