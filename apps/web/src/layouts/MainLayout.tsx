import { Layout } from 'antd';
import { Outlet } from 'react-router-dom';
import AppHeader from './components/AppHeader';

const { Content, Footer } = Layout;

const MainLayout: React.FC = () => {
  return (
    <Layout style={{ minHeight: '100vh' }}>
      <AppHeader />
      <Content>
        <div className="overflow-x-auto">
          <Outlet />
        </div>
      </Content>
      <Footer className="text-center px-2 py-3">
        Monorepo Starter App ©{new Date().getFullYear()}
      </Footer>
    </Layout>
  );
};

export default MainLayout;
