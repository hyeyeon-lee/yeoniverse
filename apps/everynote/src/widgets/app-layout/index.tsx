import { useCallback, useEffect, useState } from 'react';
import { NavLink, Outlet, useLocation, useMatch, useNavigate } from 'react-router';
import { getNotebooks, ensureDefaultNotebook, type NotebookWithCount } from '@/features/notebooks';
import { createNote } from '@/features/notes';
import { signOut } from '@/features/auth';
import styles from './index.module.css';

export default function AppLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const editorMatch = useMatch('/notes/:noteId');
  const [notebooks, setNotebooks] = useState<NotebookWithCount[]>([]);
  const [creating, setCreating] = useState(false);

  const refreshNotebooks = useCallback(() => {
    getNotebooks()
      .then(setNotebooks)
      .catch(() => setNotebooks([]));
  }, []);

  useEffect(() => {
    refreshNotebooks();
  }, [refreshNotebooks, location.key]);

  async function handleNewNote() {
    if (creating) return;
    setCreating(true);
    try {
      const notebook = await ensureDefaultNotebook();
      const note = await createNote(notebook.id);
      navigate(`/notes/${note.id}`);
    } catch {
      alert('노트를 만들지 못했어요. 잠시 후 다시 시도해주세요.');
    } finally {
      setCreating(false);
    }
  }

  async function handleSignOut() {
    try {
      await signOut();
    } finally {
      navigate('/login');
    }
  }

  return (
    <div className={styles.layout}>
      <aside className={styles.sidebar}>
        <div className={styles.brand}>에버노트</div>

        <button className={styles.newNoteButton} onClick={handleNewNote} disabled={creating}>
          <PlusIcon />새 노트
        </button>

        <nav className={styles.nav}>
          <NavLink
            to="/notes"
            end
            className={({ isActive }) => (isActive ? styles.navItemActive : styles.navItem)}
          >
            <NoteIcon />
            노트
          </NavLink>
          <NavLink
            to="/notebooks"
            end
            className={({ isActive }) => (isActive ? styles.navItemActive : styles.navItem)}
          >
            <BookIcon />
            노트북
          </NavLink>

          <div className={styles.notebookList}>
            {notebooks.map((notebook) => (
              <NavLink
                key={notebook.id}
                to={`/notebooks/${notebook.id}`}
                className={({ isActive }) =>
                  isActive ? styles.notebookItemActive : styles.notebookItem
                }
              >
                <span className={styles.notebookName}>{notebook.name}</span>
                <span className={styles.notebookCount}>{notebook.noteCount}</span>
              </NavLink>
            ))}
          </div>
        </nav>

        <button className={styles.signOutButton} onClick={handleSignOut}>
          로그아웃
        </button>
      </aside>

      <main className={editorMatch ? styles.contentFull : styles.content}>
        <Outlet />
      </main>

      {!editorMatch && (
        <>
          <button
            className={styles.fab}
            onClick={handleNewNote}
            disabled={creating}
            aria-label="새 노트"
          >
            <PlusIcon />
          </button>

          <nav className={styles.tabBar}>
            <NavLink
              to="/notes"
              end
              className={({ isActive }) => (isActive ? styles.tabActive : styles.tab)}
            >
              <NoteIcon />
              노트
            </NavLink>
            <NavLink
              to="/notebooks"
              className={({ isActive }) => (isActive ? styles.tabActive : styles.tab)}
            >
              <BookIcon />
              노트북
            </NavLink>
          </nav>
        </>
      )}
    </div>
  );
}

function PlusIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}

function NoteIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="4" y="3" width="16" height="18" rx="2" />
      <line x1="8" y1="8" x2="16" y2="8" />
      <line x1="8" y1="12" x2="16" y2="12" />
      <line x1="8" y1="16" x2="13" y2="16" />
    </svg>
  );
}

function BookIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 4a2 2 0 0 1 2-2h12v20H7a2 2 0 0 1-2-2z" />
      <line x1="5" y1="18" x2="19" y2="18" />
    </svg>
  );
}
