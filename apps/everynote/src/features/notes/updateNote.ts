import supabase from '@/shared/lib/supabase';
import type { Json } from '@yeoniverse/supabase';

export type NotePatch = {
  title?: string;
  content?: Json;
  content_text?: string;
  notebook_id?: string;
};

export async function updateNote(id: string, patch: NotePatch) {
  const { data, error } = await supabase
    .from('notes')
    .update({ ...patch, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}
