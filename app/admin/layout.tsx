import { redirect } from 'next/navigation';
import { getCurrentUser, getApprovedUser } from '@/lib/auth';

/** Admin portal gate: valid session, approved account, admin role. */
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getCurrentUser();
  if (!session) redirect('/login');

  const approved = await getApprovedUser();
  if (!approved) redirect('/pending-approval');
  if (approved.role !== 'admin') redirect('/dashboard');

  return <>{children}</>;
}
