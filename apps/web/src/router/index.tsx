import MainLayout from '@/layouts/MainLayout';
import About from '@/pages/About/Index';
import Home from '@/pages/Home/Index';
import Login from '@/pages/Login/Index';
import NotFound from '@/pages/NotFound/Index';
import Register from '@/pages/Register/Index';
import { createBrowserRouter } from 'react-router-dom';

const router = createBrowserRouter([
  {
    path: '/',
    element: <MainLayout />,
    children: [
      {
        index: true,
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
    path: '/register',
    element: <Register />,
  },
  {
    path: '*',
    element: <NotFound />,
  },
]);

export default router;
