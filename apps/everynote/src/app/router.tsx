import { createBrowserRouter, Navigate } from 'react-router';
import LoginPage from '@/pages/login';
import SignUpPage from '@/pages/signup';
import NotesPage from '@/pages/notes';
import NotebooksPage from '@/pages/notebooks';
import AppLayout from '@/widgets/app-layout';
import ProtectedRoute from './protected-route';

const router = createBrowserRouter(
  [
    {
      path: '/login',
      element: <LoginPage />,
    },
    {
      path: '/signup',
      element: <SignUpPage />,
    },
    {
      element: <ProtectedRoute />,
      children: [
        {
          element: <AppLayout />,
          children: [
            {
              path: '/',
              element: <Navigate to="/notes" replace />,
            },
            {
              path: '/notes',
              element: <NotesPage />,
            },
            {
              path: '/notes/:noteId',
              element: <NotesPage />,
            },
            {
              path: '/notebooks',
              element: <NotebooksPage />,
            },
            {
              path: '/notebooks/:notebookId',
              element: <NotesPage />,
            },
          ],
        },
      ],
    },
  ],
  { basename: '/everynote' }
);

export default router;
