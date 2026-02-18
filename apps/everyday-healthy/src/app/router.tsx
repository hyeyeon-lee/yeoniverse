import { createBrowserRouter } from 'react-router';
import LoginPage from '@/pages/login';
import SignUpPage from '@/pages/signup';
import DashboardPage from '@/pages/dashboard';
import WeightPage from '@/pages/weight';
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
        path: '/weight',
        element: <WeightPage />,
      },
    ],
  },
]);

export default router;