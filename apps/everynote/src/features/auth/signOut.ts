import supabase from '@/shared/lib/supabase';

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}
