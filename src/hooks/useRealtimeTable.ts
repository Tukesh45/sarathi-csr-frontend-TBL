import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

// Accepts: table, options: { select?: string, column?: string, value?: any }
export function useRealtimeTable<T extends { id: string } = any>(
  table: string,
  options?: { select?: string; column?: string; value?: any }
) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    let query = supabase.from(table).select(options?.select || '*');
    if (options?.column && typeof options.value !== 'undefined') {
      // Support array values for .in() queries
      if (Array.isArray(options.value)) {
        query = query.in(options.column, options.value);
      } else {
        query = query.eq(options.column, options.value);
      }
    }
    query.then(({ data, error }) => {
      if (error) {
        setData([] as T[]);
      } else {
        setData(((data || []) as unknown) as T[]);
      }
      setLoading(false);
    });

    const channel = supabase
      .channel(`public:${table}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table },
        (payload) => {
          setData((prev) => {
            if (payload.eventType === 'INSERT') {
              return [...prev, payload.new as T];
            }
            if (payload.eventType === 'UPDATE') {
              return prev.map((item) => (item.id === (payload.new as T).id ? (payload.new as T) : item));
            }
            if (payload.eventType === 'DELETE') {
              return prev.filter((item) => item.id !== (payload.old as T).id);
            }
            return prev;
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [table, options?.select, options?.column, JSON.stringify(options?.value)]);

  return { data, loading };
} 