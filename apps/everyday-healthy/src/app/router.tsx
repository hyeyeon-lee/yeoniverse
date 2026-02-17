import { createBrowserRouter } from 'react-router';
import LoginPage from '../pages/login';
import DashboardPage from '../pages/dashboard';
import RecordPage from '../pages/record';
import HistoryPage from '../pages/history';

const router = createBrowserRouter([
  {
    path: '/login',
    element: <LoginPage />,
  },
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
]);

export default router;