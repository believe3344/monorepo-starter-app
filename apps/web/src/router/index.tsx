import MainLayout from '@/layouts/MainLayout';
import About from '@/pages/About/Index';
import Home from '@/pages/Home/Index';
import Login from '@/pages/Login/Index';
import NotFound from '@/pages/NotFound/Index';
import Register from '@/pages/Register/Index';
import NovelList from '@/pages/Novel/List';
import NovelUpload from '@/pages/Novel/Upload';
import NovelRead from '@/pages/Novel/Read';
import { createBrowserRouter } from 'react-router-dom';

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
        element: <Home />,
      },
      {
        path: 'about',
        element: <About />,
      },
      {
        path: 'novels',
        element: <NovelList />,
      },
      {
        path: 'novels/upload',
        element: <NovelUpload />,
      },
    ],
  },
  {
    path: '/novels/:id',
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
