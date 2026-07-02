import supabase from '@/shared/lib/supabase';

export async function renameNotebook(id: string, name: string) {
  const { data, error } = await supabase
    .from('notebooks')
    .update({ name, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}
