import supabase from '@/shared/lib/supabase';

export async function getNotes(notebookId?: string) {
  let query = supabase
    .from('notes')
    .select('id, title, content_text, notebook_id, created_at, updated_at')
    .order('updated_at', { ascending: false });

  if (notebookId) {
    query = query.eq('notebook_id', notebookId);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data;
}

export type NoteSummary = Awaited<ReturnType<typeof getNotes>>[number];
