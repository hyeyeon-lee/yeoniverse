import { type Database } from "./database.types";
export type WeightEntity = Database['public']['Tables']['weight_log']['Row']
export type NotebookEntity = Database['public']['Tables']['notebooks']['Row']
export type NoteEntity = Database['public']['Tables']['notes']['Row']