import { redirect } from 'next/navigation';
import { getCurrentUser, getApprovedUser } from '@/lib/auth';

/**
 * Server-side approval gate. The proxy checks the signed session claim; this
 * revalidates against the database so suspensions apply to live sessions too.
 */
export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getCurrentUser();
  if (!session) redirect('/login');

  const approved = await getApprovedUser();
  if (!approved) redirect('/pending-approval');

  return <>{children}</>;
}
