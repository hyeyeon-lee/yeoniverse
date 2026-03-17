import supabase from '@/shared/lib/supabase';

export async function getWeightLogs() {
  const { data, error } = await supabase
    .from('weight_log')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}
