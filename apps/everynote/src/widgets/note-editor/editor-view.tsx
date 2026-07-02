import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router';
import { EditorContent, useEditor, useEditorState, type Editor, type JSONContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import TextAlign from '@tiptap/extension-text-align';
import { Placeholder } from '@tiptap/extensions';
import type { Json, NoteEntity } from '@yeoniverse/supabase';
import { updateNote, deleteNote } from '@/features/notes';
import type { NotebookWithCount } from '@/features/notebooks';
import styles from './index.module.css';

const AUTOSAVE_DELAY_MS = 800;

type EditorViewProps = {
  note: NoteEntity;
  notebooks: NotebookWithCount[];
  onSaved?: () => void;
  onDeleted?: () => void;
};

export default function EditorView({ note, notebooks, onSaved, onDeleted }: EditorViewProps) {
  const navigate = useNavigate();
  const [title, setTitle] = useState(note.title);
  const [notebookId, setNotebookId] = useState(note.notebook_id);
  const [status, setStatus] = useState<'idle' | 'saving' | 'saved'>('idle');

  const editorRef = useRef<Editor | null>(null);
  const titleRef = useRef(note.title);
  const dirtyRef = useRef(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const onSavedRef = useRef(onSaved);

  useEffect(() => {
    onSavedRef.current = onSaved;
  }, [onSaved]);

  const saveNow = useCallback(async () => {
    if (!dirtyRef.current) return;
    const editor = editorRef.current;
    if (!editor) return;
    dirtyRef.current = false;
    setStatus('saving');
    try {
      await updateNote(note.id, {
        title: titleRef.current,
        content: editor.getJSON() as Json,
        content_text: editor.getText(),
      });
      setStatus('saved');
      onSavedRef.current?.();
    } catch {
      dirtyRef.current = true;
      setStatus('idle');
    }
  }, [note.id]);

  const scheduleSave = useCallback(() => {
    dirtyRef.current = true;
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(saveNow, AUTOSAVE_DELAY_MS);
  }, [saveNow]);

  // 언마운트 시 저장하지 않은 변경을 flush
  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      saveNow();
    };
  }, [saveNow]);

  const editor = useEditor({
    extensions: [
      StarterKit,
      TaskList,
      TaskItem.configure({ nested: true }),
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Placeholder.configure({ placeholder: '필기 시작' }),
    ],
    content: (note.content as JSONContent | null) ?? '',
    onUpdate: scheduleSave,
  });

  useEffect(() => {
    editorRef.current = editor;
  }, [editor]);

  function handleTitleChange(value: string) {
    setTitle(value);
    titleRef.current = value;
    scheduleSave();
  }

  async function handleNotebookChange(id: string) {
    setNotebookId(id);
    try {
      await updateNote(note.id, { notebook_id: id });
      onSavedRef.current?.();
    } catch {
      setNotebookId(note.notebook_id);
    }
  }

  async function handleDelete() {
    if (!confirm('이 노트를 삭제할까요?')) return;
    dirtyRef.current = false;
    await deleteNote(note.id);
    onDeleted?.();
  }

  return (
    <div className={styles.editor}>
      <header className={styles.header}>
        <button className={styles.backButton} onClick={() => navigate('/notes')} aria-label="뒤로">
          <BackIcon />
        </button>

        <select
          className={styles.notebookSelect}
          value={notebookId}
          onChange={(e) => handleNotebookChange(e.target.value)}
        >
          {notebooks.map((notebook) => (
            <option key={notebook.id} value={notebook.id}>
              {notebook.name}
            </option>
          ))}
        </select>

        <span className={styles.status}>
          {status === 'saving' ? '저장 중…' : status === 'saved' ? '저장됨' : ''}
        </span>

        <button className={styles.deleteButton} onClick={handleDelete} aria-label="노트 삭제">
          <TrashIcon />
        </button>
      </header>

      <Toolbar editor={editor} />

      <input
        className={styles.titleInput}
        placeholder="제목"
        value={title}
        onChange={(e) => handleTitleChange(e.target.value)}
      />

      <div className={styles.content} onClick={() => editor?.commands.focus()}>
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}

function Toolbar({ editor }: { editor: Editor | null }) {
  const state = useEditorState({
    editor,
    selector: ({ editor }) =>
      editor
        ? {
            bold: editor.isActive('bold'),
            italic: editor.isActive('italic'),
            underline: editor.isActive('underline'),
            taskList: editor.isActive('taskList'),
            bulletList: editor.isActive('bulletList'),
            orderedList: editor.isActive('orderedList'),
            alignLeft: editor.isActive({ textAlign: 'left' }),
            alignCenter: editor.isActive({ textAlign: 'center' }),
            alignRight: editor.isActive({ textAlign: 'right' }),
          }
        : null,
  });

  if (!editor || !state) return null;

  const listType = editor.isActive('taskItem') ? 'taskItem' : 'listItem';

  const buttons: { label: string; active?: boolean; onClick: () => void; content: React.ReactNode }[] = [
    {
      label: '체크박스 목록',
      active: state.taskList,
      onClick: () => editor.chain().focus().toggleTaskList().run(),
      content: <CheckIcon />,
    },
    {
      label: '글머리 기호 목록',
      active: state.bulletList,
      onClick: () => editor.chain().focus().toggleBulletList().run(),
      content: <BulletIcon />,
    },
    {
      label: '번호 매기기 목록',
      active: state.orderedList,
      onClick: () => editor.chain().focus().toggleOrderedList().run(),
      content: <OrderedIcon />,
    },
    {
      label: '내어쓰기',
      onClick: () => editor.chain().focus().liftListItem(listType).run(),
      content: <OutdentIcon />,
    },
    {
      label: '들여쓰기',
      onClick: () => editor.chain().focus().sinkListItem(listType).run(),
      content: <IndentIcon />,
    },
    {
      label: '왼쪽 정렬',
      active: state.alignLeft,
      onClick: () => editor.chain().focus().setTextAlign('left').run(),
      content: <AlignIcon variant="left" />,
    },
    {
      label: '가운데 정렬',
      active: state.alignCenter,
      onClick: () => editor.chain().focus().setTextAlign('center').run(),
      content: <AlignIcon variant="center" />,
    },
    {
      label: '오른쪽 정렬',
      active: state.alignRight,
      onClick: () => editor.chain().focus().setTextAlign('right').run(),
      content: <AlignIcon variant="right" />,
    },
    {
      label: '굵게',
      active: state.bold,
      onClick: () => editor.chain().focus().toggleBold().run(),
      content: <b>B</b>,
    },
    {
      label: '기울임',
      active: state.italic,
      onClick: () => editor.chain().focus().toggleItalic().run(),
      content: <i>I</i>,
    },
    {
      label: '밑줄',
      active: state.underline,
      onClick: () => editor.chain().focus().toggleUnderline().run(),
      content: <u>U</u>,
    },
  ];

  return (
    <div className={styles.toolbar}>
      {buttons.map((button) => (
        <button
          key={button.label}
          type="button"
          title={button.label}
          aria-label={button.label}
          className={button.active ? styles.toolButtonActive : styles.toolButton}
          onClick={button.onClick}
        >
          {button.content}
        </button>
      ))}
    </div>
  );
}

function BackIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="15 18 9 12 15 6" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="4" />
      <polyline points="8 12 11 15 16 9" />
    </svg>
  );
}

function BulletIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
      <circle cx="5" cy="6" r="1.2" fill="currentColor" stroke="none" />
      <circle cx="5" cy="12" r="1.2" fill="currentColor" stroke="none" />
      <circle cx="5" cy="18" r="1.2" fill="currentColor" stroke="none" />
      <line x1="10" y1="6" x2="20" y2="6" />
      <line x1="10" y1="12" x2="20" y2="12" />
      <line x1="10" y1="18" x2="20" y2="18" />
    </svg>
  );
}

function OrderedIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
      <text x="3" y="8" fontSize="7" fill="currentColor" stroke="none">1</text>
      <text x="3" y="15" fontSize="7" fill="currentColor" stroke="none">2</text>
      <text x="3" y="22" fontSize="7" fill="currentColor" stroke="none">3</text>
      <line x1="10" y1="6" x2="20" y2="6" />
      <line x1="10" y1="12" x2="20" y2="12" />
      <line x1="10" y1="18" x2="20" y2="18" />
    </svg>
  );
}

function IndentIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <line x1="3" y1="5" x2="21" y2="5" />
      <line x1="11" y1="12" x2="21" y2="12" />
      <line x1="3" y1="19" x2="21" y2="19" />
      <polyline points="3 9 7 12 3 15" />
    </svg>
  );
}

function OutdentIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <line x1="3" y1="5" x2="21" y2="5" />
      <line x1="11" y1="12" x2="21" y2="12" />
      <line x1="3" y1="19" x2="21" y2="19" />
      <polyline points="7 9 3 12 7 15" />
    </svg>
  );
}

function AlignIcon({ variant }: { variant: 'left' | 'center' | 'right' }) {
  const x1 = variant === 'left' ? 3 : variant === 'center' ? 6 : 9;
  const x2 = variant === 'left' ? 15 : variant === 'center' ? 18 : 21;
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
      <line x1="3" y1="6" x2="21" y2="6" />
      <line x1={x1} y1="12" x2={x2} y2="12" />
      <line x1="3" y1="18" x2="21" y2="18" />
    </svg>
  );
}
