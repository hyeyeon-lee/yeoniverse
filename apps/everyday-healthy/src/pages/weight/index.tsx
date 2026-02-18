import { useEffect, useState } from 'react';
import { getWeightLogs, addWeightLog } from '@/features/weight-record';
import styles from './index.module.css';

type WeightLog = Awaited<ReturnType<typeof getWeightLogs>>[number];

function formatDateTime(isoStr: string) {
  const d = new Date(isoStr);
  const month = d.getMonth() + 1;
  const day = d.getDate();
  const hh = String(d.getHours()).padStart(2, '0');
  const mm = String(d.getMinutes()).padStart(2, '0');
  const ss = String(d.getSeconds()).padStart(2, '0');
  return { date: `${month}/${day}`, time: `${hh}:${mm}:${ss}` };
}

function getDiff(current: number, prev: number | undefined) {
  if (prev === undefined) return null;
  const diff = +(current - prev).toFixed(1);
  return diff === 0 ? null : diff;
}

export default function WeightPage() {
  const [weight, setWeight] = useState('');
  const [memo, setMemo] = useState('');
  const [loading, setLoading] = useState(false);
  const [logs, setLogs] = useState<WeightLog[]>([]);

  const now = new Date();
  const todayDate = now.toLocaleDateString('ko-KR', {
    year: 'numeric', month: 'long', day: 'numeric', weekday: 'long',
  });

  useEffect(() => {
    getWeightLogs().then(setLogs).catch(console.error);
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!weight) return;
    setLoading(true);
    try {
      await addWeightLog({ weight: parseFloat(weight), memo });
      const updated = await getWeightLogs();
      setLogs(updated);
      setWeight('');
      setMemo('');
    } catch (err) {
      console.error('기록 실패:', err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={styles.container}>

      {/* 입력 카드 */}
      <section className={styles.inputCard}>
        <p className={styles.todayLabel}>오늘의 몸무게 🌱</p>
        <p className={styles.todayDate}>{todayDate}</p>
        <form onSubmit={handleSubmit}>
          <div className={styles.inputArea}>
            <div className={styles.inputWrapper}>
              <input
                className={styles.weightInput}
                type="number"
                step="0.1"
                min="20"
                max="300"
                placeholder="00.0"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                inputMode="decimal"
              />
              <span className={styles.unit}>kg</span>
            </div>
          </div>
          <input
            className={styles.memoInput}
            type="text"
            placeholder="한줄 메모 (선택)"
            maxLength={50}
            value={memo}
            onChange={(e) => setMemo(e.target.value)}
          />
          <button
            type="submit"
            className={styles.submitButton}
            disabled={loading || !weight}
          >
            {loading ? '저장 중...' : '기록하기'}
          </button>
        </form>
      </section>

      {/* 히스토리 카드 */}
      <section className={styles.historyCard}>
        <p className={styles.sectionTitle}>최근 기록</p>
        {logs.length === 0 ? (
          <p className={styles.empty}>아직 기록이 없어요 🌱</p>
        ) : (
          <ul className={styles.historyList}>
            {logs.map((item, index) => {
              const { date, time } = formatDateTime(item.created_at);
              const diff = getDiff(item.weight, logs[index + 1]?.weight);
              return (
                <li key={item.id} className={styles.historyItem}>
                  <div className={styles.historyDateGroup}>
                    <span className={styles.historyDate}>{date}</span>
                    <span className={styles.historyTime}>{time}</span>
                  </div>
                  <div className={styles.historyCenter}>
                    <span className={styles.historyWeight}>{item.weight} kg</span>
                    {item.memo && (
                      <span className={styles.historyMemo}>{item.memo}</span>
                    )}
                  </div>
                  <span className={
                    diff === null ? styles.diffNone :
                    diff > 0 ? styles.diffUp : styles.diffDown
                  }>
                    {diff === null ? '−' : diff > 0 ? `+${diff}` : `${diff}`}
                  </span>
                </li>
              );
            })}
          </ul>
        )}
      </section>

    </div>
  );
}
