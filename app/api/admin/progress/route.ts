import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { getAdminStudentProgress } from '@/lib/db/admin-progress';

export async function GET(request: Request) {
  const session = await getCurrentUser();
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId') || undefined;

  const data = await getAdminStudentProgress(userId || undefined);
  return NextResponse.json(data);
}
