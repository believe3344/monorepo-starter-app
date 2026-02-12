import MainLayout from '@/layouts/MainLayout';
import About from '@/pages/About/Index';
import Home from '@/pages/Home/Index';
import Login from '@/pages/Login/Index';
import NotFound from '@/pages/NotFound/Index';
import { createBrowserRouter } from 'react-router-dom';

const router = createBrowserRouter([
  {
    path: '/',
    element: <MainLayout />,
    children: [
      {
        index: true, // 默认子路由
        element: <Home />,
      },
      {
        path: 'about',
        element: <About />,
      },
    ],
  },
  {
    path: '/login',
    element: <Login />,
  },
  {
    path: '*',
    element: <NotFound />,
  },
]);

export default router;
