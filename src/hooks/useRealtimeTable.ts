import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

export function useRealtimeTable<T extends { id: string } = any>(table: string, filter?: { column: string; value: any }) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let query = supabase.from(table).select('*');
    if (filter) {
      query = query.eq(filter.column, filter.value);
    }
    query.then(({ data, error }) => {
      if (!error) setData(data || []);
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
  }, [table, filter?.column, filter?.value]);

  return { data, loading };
} 