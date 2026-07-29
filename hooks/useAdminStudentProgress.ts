'use client';

import { useCallback, useEffect, useState } from 'react';
import type { AdminStudentProgressResponse } from '@/lib/types/admin-progress';

export function useAdminStudentProgress(userId?: string) {
  const [data, setData] = useState<AdminStudentProgressResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProgress = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const url = userId ? `/api/admin/progress?userId=${encodeURIComponent(userId)}` : '/api/admin/progress';
      const response = await fetch(url);
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || 'Failed to load student progress');
      setData(payload);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load student progress');
      setData(null);
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchProgress();
  }, [fetchProgress]);

  return { data, isLoading, error, refetch: fetchProgress };
}
