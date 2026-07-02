import { useEffect, useState } from 'react';
import type { NoteEntity } from '@yeoniverse/supabase';
import { getNote } from '@/features/notes';
import { getNotebooks, type NotebookWithCount } from '@/features/notebooks';
import EditorView from './editor-view';

type NoteEditorProps = {
  noteId: string;
  onSaved?: () => void;
  onDeleted?: () => void;
};

export default function NoteEditor({ noteId, onSaved, onDeleted }: NoteEditorProps) {
  const [note, setNote] = useState<NoteEntity | null>(null);
  const [notebooks, setNotebooks] = useState<NotebookWithCount[]>([]);
  const [error, setError] = useState(false);

  useEffect(() => {
    getNote(noteId)
      .then(setNote)
      .catch(() => setError(true));
    getNotebooks()
      .then(setNotebooks)
      .catch(() => setNotebooks([]));
  }, [noteId]);

  if (error) return <p style={{ padding: 24 }}>노트를 불러오지 못했어요.</p>;
  if (!note) return null;

  return (
    <EditorView note={note} notebooks={notebooks} onSaved={onSaved} onDeleted={onDeleted} />
  );
}
