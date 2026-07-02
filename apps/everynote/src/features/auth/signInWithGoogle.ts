import supabase from '@/shared/lib/supabase';

export async function signInWithGoogle() {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}/everynote/`,
    },
  });

  if (error) throw error;
  return data;
}
