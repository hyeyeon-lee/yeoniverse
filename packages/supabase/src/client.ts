import { createClient } from '@supabase/supabase-js';
import { type Database } from './types/database.types'
export function createSupabaseClient(url: string, key: string) {
    return createClient<Database>(url, key)
}
