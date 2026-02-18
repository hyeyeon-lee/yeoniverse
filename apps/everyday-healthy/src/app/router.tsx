import { createBrowserRouter } from 'react-router';
import LoginPage from '@/pages/login';
import SignUpPage from '@/pages/signup';
import DashboardPage from '@/pages/dashboard';
import RecordPage from '@/pages/record';
import HistoryPage from '@/pages/history';
import ProtectedRoute from './protected-route';

const router = createBrowserRouter([
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
        path: '/',
        element: <DashboardPage />,
      },
      {
        path: '/record',
        element: <RecordPage />,
      },
      {
        path: '/history',
        element: <HistoryPage />,
      },
    ],
  },
]);

export default router;