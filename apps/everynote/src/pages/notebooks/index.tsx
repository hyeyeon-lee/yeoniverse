import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import {
  getNotebooks,
  createNotebook,
  renameNotebook,
  deleteNotebook,
  type NotebookWithCount,
} from '@/features/notebooks';
import styles from './index.module.css';

export default function NotebooksPage() {
  const navigate = useNavigate();
  const [notebooks, setNotebooks] = useState<NotebookWithCount[]>([]);
  const [loading, setLoading] = useState(true);
  const [keyword, setKeyword] = useState('');

  async function refresh() {
    try {
      setNotebooks(await getNotebooks());
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refresh();
  }, []);

  async function handleCreate() {
    const name = prompt('새 노트북 이름을 입력하세요.');
    if (!name?.trim()) return;
    await createNotebook(name.trim());
    refresh();
  }

  async function handleRename(notebook: NotebookWithCount) {
    const name = prompt('노트북 이름을 수정하세요.', notebook.name);
    if (!name?.trim() || name.trim() === notebook.name) return;
    await renameNotebook(notebook.id, name.trim());
    refresh();
  }

  async function handleDelete(notebook: NotebookWithCount) {
    const message =
      notebook.noteCount > 0
        ? `'${notebook.name}' 노트북과 노트 ${notebook.noteCount}개가 함께 삭제돼요. 계속할까요?`
        : `'${notebook.name}' 노트북을 삭제할까요?`;
    if (!confirm(message)) return;
    await deleteNotebook(notebook.id);
    refresh();
  }

  const filtered = notebooks.filter((notebook) =>
    notebook.name.toLowerCase().includes(keyword.trim().toLowerCase())
  );

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1>노트북</h1>
        <button className={styles.createButton} onClick={handleCreate}>
          + 새 노트북
        </button>
      </header>

      <div className={styles.searchBox}>
        <input
          type="search"
          placeholder="노트북 찾기"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
        />
      </div>

      <p className={styles.count}>{filtered.length}개의 노트북</p>

      {loading ? null : filtered.length === 0 ? (
        <p className={styles.empty}>
          {keyword ? '검색 결과가 없어요.' : '아직 노트북이 없어요. 새 노트북을 만들어보세요.'}
        </p>
      ) : (
        <ul className={styles.list}>
          {filtered.map((notebook) => (
            <li key={notebook.id} className={styles.item}>
              <button
                className={styles.itemMain}
                onClick={() => navigate(`/notebooks/${notebook.id}`)}
              >
                <BookIcon />
                <span className={styles.itemName}>{notebook.name}</span>
                <span className={styles.itemCount}>{notebook.noteCount}</span>
              </button>
              <div className={styles.itemActions}>
                <button onClick={() => handleRename(notebook)}>이름 변경</button>
                <button className={styles.deleteAction} onClick={() => handleDelete(notebook)}>
                  삭제
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function BookIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 4a2 2 0 0 1 2-2h12v20H7a2 2 0 0 1-2-2z" />
      <line x1="5" y1="18" x2="19" y2="18" />
    </svg>
  );
}
