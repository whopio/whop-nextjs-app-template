'use client';

import { useEffect, useState } from 'react';

export function useWhopAuth() {
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserId = async () => {
      try {
        const response = await fetch('/api/auth/user');
        
        if (!response.ok) {
          throw new Error('Failed to authenticate');
        }
        
        const data = await response.json();
        
        if (data.userId) {
          setUserId(data.userId);
          // Cache in localStorage for offline access
          localStorage.setItem('whop_userId', data.userId);
        }
      } catch (err) {
        console.error('Authentication error:', err);
        setError('Failed to authenticate');
        
        // Fallback to localStorage if available
        const cachedUserId = localStorage.getItem('whop_userId');
        if (cachedUserId) {
          setUserId(cachedUserId);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchUserId();
  }, []);

  return { userId, loading, error };
}