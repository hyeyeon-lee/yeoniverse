import { useNavigate } from 'react-router';
import { signOut } from '@/features/auth';
import styles from './index.module.css';

export default function Header() {
  const navigate = useNavigate();

  async function handleLogout() {
    try {
      await signOut();
      navigate('/login');
    } catch (err) {
      console.error('로그아웃 실패:', err);
    }
  }

  return (
    <header className={styles.header}>
      <span className={styles.logo}>Everyday Healthy</span>
      <button className={styles.logoutButton} onClick={handleLogout}>
        로그아웃
      </button>
    </header>
  );
}