import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { getNotes, type NoteSummary } from '@/features/notes';
import { getNotebooks } from '@/features/notebooks';
import { formatDate } from '@/shared/lib/formatDate';
import NoteEditor from '@/widgets/note-editor';
import styles from './index.module.css';

export default function NotesPage() {
  const navigate = useNavigate();
  const { noteId, notebookId } = useParams();
  const [notes, setNotes] = useState<NoteSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [keyword, setKeyword] = useState('');
  const [notebookName, setNotebookName] = useState('');

  const refresh = useCallback(async () => {
    try {
      setNotes(await getNotes(notebookId));
    } finally {
      setLoading(false);
    }
  }, [notebookId]);

  useEffect(() => {
    setLoading(true);
    refresh();
  }, [refresh]);

  useEffect(() => {
    if (!notebookId) {
      setNotebookName('');
      return;
    }
    getNotebooks()
      .then((notebooks) => {
        setNotebookName(notebooks.find((n) => n.id === notebookId)?.name ?? '');
      })
      .catch(() => setNotebookName(''));
  }, [notebookId]);

  const trimmed = keyword.trim().toLowerCase();
  const filtered = trimmed
    ? notes.filter(
        (note) =>
          note.title.toLowerCase().includes(trimmed) ||
          note.content_text.toLowerCase().includes(trimmed)
      )
    : notes;

  return (
    <div className={noteId ? styles.pageWithEditor : styles.page}>
      <section className={styles.listPane}>
        <header className={styles.header}>
          <h1>{notebookName || '노트'}</h1>
        </header>

        <div className={styles.searchBox}>
          <input
            type="search"
            placeholder="노트, 작업 또는 문서를 찾아보세요"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
          />
        </div>

        <p className={styles.count}>{filtered.length}개의 노트</p>

        {loading ? null : filtered.length === 0 ? (
          <p className={styles.empty}>
            {trimmed ? '검색 결과가 없어요.' : '아직 노트가 없어요. 새 노트를 만들어보세요.'}
          </p>
        ) : (
          <ul className={styles.list}>
            {filtered.map((note) => (
              <li key={note.id}>
                <button
                  className={note.id === noteId ? styles.cardActive : styles.card}
                  onClick={() => navigate(`/notes/${note.id}`)}
                >
                  <h2 className={styles.cardTitle}>{note.title || '제목 없음'}</h2>
                  {note.content_text && (
                    <p className={styles.cardSnippet}>{note.content_text}</p>
                  )}
                  <span className={styles.cardDate}>{formatDate(note.updated_at)}</span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className={styles.editorPane}>
        {noteId ? (
          <NoteEditor
            key={noteId}
            noteId={noteId}
            onSaved={refresh}
            onDeleted={() => {
              refresh();
              navigate('/notes', { replace: true });
            }}
          />
        ) : (
          <div className={styles.editorPlaceholder}>노트를 선택하거나 새 노트를 만들어보세요.</div>
        )}
      </section>
    </div>
  );
}
