import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// bounces anyone who isn't a signed-in admin back to the home page
export function useAdminGuard() {
  const { user, checking } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!checking && (!user || user.role !== 'ADMIN')) navigate('/');
  }, [user, checking, navigate]);

  return { user, ready: !checking && user?.role === 'ADMIN' };
}
