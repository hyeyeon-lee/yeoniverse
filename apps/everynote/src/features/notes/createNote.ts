import supabase from '@/shared/lib/supabase';

export async function createNote(notebookId: string) {
  const { data, error } = await supabase
    .from('notes')
    .insert({ notebook_id: notebookId })
    .select()
    .single();

  if (error) throw error;
  return data;
}
