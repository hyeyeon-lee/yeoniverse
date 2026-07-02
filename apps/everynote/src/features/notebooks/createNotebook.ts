import supabase from '@/shared/lib/supabase';

export async function createNotebook(name: string) {
  const { data, error } = await supabase
    .from('notebooks')
    .insert({ name })
    .select()
    .single();

  if (error) throw error;
  return data;
}
