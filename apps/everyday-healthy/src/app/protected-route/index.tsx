import { useEffect, useState } from 'react';
import { Navigate, Outlet } from 'react-router';
import { getUser } from '@/features/auth';
import Header from '@/widgets/header';

export default function ProtectedRoute() {
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    getUser()
      .then((user) => setAuthenticated(!!user))
      .catch(() => setAuthenticated(false))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return null;
  if (!authenticated) return <Navigate to="/login" replace />;
  return (
    <>
      <Header />
      <Outlet />
    </>
  );
}