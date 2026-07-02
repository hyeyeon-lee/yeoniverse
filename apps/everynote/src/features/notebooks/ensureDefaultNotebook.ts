import { getNotebooks } from './getNotebooks';
import { createNotebook } from './createNotebook';

/** 노트북이 하나도 없으면 기본 노트북(일상)을 만들어 반환한다. */
export async function ensureDefaultNotebook() {
  const notebooks = await getNotebooks();
  if (notebooks.length > 0) return notebooks[0];
  return createNotebook('일상');
}
