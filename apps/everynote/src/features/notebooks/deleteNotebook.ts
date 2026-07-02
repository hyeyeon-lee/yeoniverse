import supabase from '@/shared/lib/supabase';

export async function deleteNotebook(id: string) {
  const { error } = await supabase.from('notebooks').delete().eq('id', id);
  if (error) throw error;
}
