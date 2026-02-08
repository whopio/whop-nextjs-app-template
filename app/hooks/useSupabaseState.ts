import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/app/lib/supabase';

export function useSupabaseState<T>(
  userId: string,
  key: keyof Pick<any, 'trades' | 'blocked_tickers' | 'daily_checkins' | 'achievements' | 'display_name'>,
  initialValue: T
): [T, (value: T | ((prev: T) => T)) => void, { loading: boolean; error: string | null; syncing: boolean }] {
  const [state, setStateInternal] = useState<T>(initialValue);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // ✅ Don't try to load if userId is empty or invalid
    if (!userId || userId === '' || userId.length < 5) {
      setLoading(false);
      return;
    }

    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch first, don't upsert on load
        const { data: existingData, error: fetchError } = await supabase
          .from('user_data')
          .select('*')
          .eq('whop_user_id', userId)
          .maybeSingle();

        if (fetchError) {
          console.error('Fetch error:', fetchError);
          throw fetchError;
        }

        if (existingData) {
          // User exists - load their data
          if (existingData[key] !== null && existingData[key] !== undefined) {
            setStateInternal(existingData[key] as T);
          } else {
            // Column doesn't have data yet, use initial value
            setStateInternal(initialValue);
          }
        } else {
          // User doesn't exist - use initial value
          setStateInternal(initialValue);
        }
      } catch (err: any) {
        console.error('Error loading from Supabase:', {
          message: err?.message,
          code: err?.code,
          details: err?.details,
          hint: err?.hint,
        });
        setError(err?.message || 'Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [userId, key]); // Don't include initialValue

  const setState = useCallback(
    (value: T | ((prev: T) => T)) => {
      setStateInternal((prev) => {
        const newValue = typeof value === 'function' ? (value as (prev: T) => T)(prev) : value;

        // ✅ Don't try to save if userId is empty
        if (userId && userId !== '' && userId.length >= 5) {
          setSyncing(true);
          supabase
            .from('user_data')
            .upsert(
              {
                whop_user_id: userId,
                [key]: newValue,
              },
              {
                onConflict: 'whop_user_id',
              }
            )
            .then(({ error: saveError }) => {
              if (saveError) {
                console.error('Error saving to Supabase:', saveError);
                setError(saveError.message);
              } else {
                setError(null);
              }
            })
            .then(() => {
              setSyncing(false);
            });
        }

        return newValue;
      });
    },
    [userId, key]
  );

  return [state, setState, { loading, error, syncing }];
}