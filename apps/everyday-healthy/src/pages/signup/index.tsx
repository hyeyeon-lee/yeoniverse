import { useState } from 'react';
import { useNavigate } from 'react-router';
import { signUp } from '@/features/auth';
import styles from './index.module.css';

export default function SignUpPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await signUp(email, password);
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || '회원가입에 실패했어요.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.logo}>
          <h1>Everyday Healthy</h1>
          <p>계정을 만들어보세요</p>
        </div>

        {success ? (
          <p className={styles.success}>
            인증 메일을 보냈어요! 이메일을 확인해주세요.
          </p>
        ) : (
          <form className={styles.form} onSubmit={handleSubmit}>
            <div className={styles.inputGroup}>
              <label htmlFor="email">이메일</label>
              <input
                id="email"
                type="email"
                placeholder="example@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className={styles.inputGroup}>
              <label htmlFor="password">비밀번호</label>
              <input
                id="password"
                type="password"
                placeholder="6자 이상 입력"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            {error && <p className={styles.error}>{error}</p>}

            <button type="submit" className={styles.signUpButton} disabled={loading}>
              {loading ? '처리 중...' : '회원가입'}
            </button>
          </form>
        )}

        <p className={styles.login}>
          이미 계정이 있으신가요?{' '}
          <span onClick={() => navigate('/login')}>로그인</span>
        </p>
      </div>
    </div>
  );
}