import { useEffect, useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../lib/auth';
import { Sidebar } from './Sidebar';

export function DashboardLayout() {
  const { isAuthenticated, loadUser } = useAuthStore();
  const navigate = useNavigate();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    loadUser();
    setChecked(true);
  }, [loadUser]);

  useEffect(() => {
    if (checked && !isAuthenticated) {
      navigate('/login');
    }
  }, [checked, isAuthenticated, navigate]);

  if (!checked || !isAuthenticated) {
    return null;
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-6">
        <Outlet />
      </main>
    </div>
  );
}
