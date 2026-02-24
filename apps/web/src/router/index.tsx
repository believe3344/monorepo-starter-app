import MainLayout from '@/layouts/MainLayout';
import Login from '@/pages/Login/Index';
import NotFound from '@/pages/NotFound/Index';
import NovelRead from '@/pages/Novel/Read';
import NovelWorkspace from '@/pages/Novel/Workspace';
import Register from '@/pages/Register/Index';
import { createBrowserRouter, Navigate } from 'react-router-dom';

import { AuthGuard, GuestGuard } from './Guard';

const router = createBrowserRouter([
  {
    path: '/',
    element: (
      <AuthGuard>
        <MainLayout />
      </AuthGuard>
    ),
    children: [
      {
        index: true,
        element: <Navigate to="/novels" replace />,
      },
      {
        path: 'novels',
        element: <NovelWorkspace />,
      },
    ],
  },
  {
    path: '/novels/read/:id',
    element: (
      <AuthGuard>
        <NovelRead />
      </AuthGuard>
    ),
  },
  {
    path: '/login',
    element: (
      <GuestGuard>
        <Login />
      </GuestGuard>
    ),
  },
  {
    path: '/register',
    element: (
      <GuestGuard>
        <Register />
      </GuestGuard>
    ),
  },
  {
    path: '*',
    element: <NotFound />,
  },
]);

export default router;
