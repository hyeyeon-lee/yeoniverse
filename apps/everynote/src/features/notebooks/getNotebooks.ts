import supabase from '@/shared/lib/supabase';
import type { NotebookEntity } from '@yeoniverse/supabase';

export type NotebookWithCount = NotebookEntity & { noteCount: number };

export async function getNotebooks(): Promise<NotebookWithCount[]> {
  const { data, error } = await supabase
    .from('notebooks')
    .select('*, notes(count)')
    .order('created_at', { ascending: true });

  if (error) throw error;
  return data.map(({ notes, ...notebook }) => ({
    ...notebook,
    noteCount: notes[0]?.count ?? 0,
  }));
}
