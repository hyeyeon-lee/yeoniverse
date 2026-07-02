# everynote

에버노트 클론 노트 앱. `/everynote` 서브패스로 서비스됩니다.

- React 19 + TypeScript + Vite 7 + react-router 7
- 에디터: TipTap 3 (체크박스/목록/들여쓰기/정렬/서식, 800ms 디바운스 자동저장)
- 데이터: Supabase (`@yeoniverse/supabase`) — 노트북/노트, 소유자 RLS

## 시작하기

1. Supabase 대시보드 SQL Editor에서 `supabase/schema.sql` 실행
2. `.env.local` 생성:

   ```
   VITE_SUPABASE_URL=...
   VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY=...
   ```

3. 실행:

   ```sh
   pnpm install
   pnpm --filter everynote dev   # http://localhost:5173/everynote/
   ```

## 구조 (FSD)

```
src/
  app/        라우터(basename: /everynote), ProtectedRoute
  pages/      login, signup, notes(목록+에디터 2패널), notebooks
  widgets/    app-layout(모바일 탭바/데스크톱 사이드바), note-editor(TipTap)
  features/   auth, notebooks, notes (Supabase CRUD)
  shared/     supabase 클라이언트, 유틸
```

## 배포 (Vercel)

`vite.config.ts`의 `base: '/everynote/'`와 라우터 `basename`이 설정되어 있어
도메인에서 `/everynote/*`를 이 앱으로 리라이트하면 됩니다.
`vercel.json`에 `/everynote/assets/*` → `/assets/*` 리라이트와 SPA 폴백이 포함되어 있습니다.
