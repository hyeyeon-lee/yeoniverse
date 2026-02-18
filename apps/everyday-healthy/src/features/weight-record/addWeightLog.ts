import supabase from '@/shared/lib/supabase';

interface AddWeightLogParams {
  weight: number;
  memo?: string;
}

export async function addWeightLog({ weight, memo }: AddWeightLogParams) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('로그인이 필요해요.');

  const { error } = await supabase
    .from('weight_log')
    .insert({ weight, memo: memo || null, user: user.id });

  if (error) throw error;
}
