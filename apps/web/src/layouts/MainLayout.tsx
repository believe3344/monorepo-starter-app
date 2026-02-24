import { Layout, theme } from 'antd';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import AppHeader from './components/AppHeader';

const { Content, Footer } = Layout;

const MainLayout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <AppHeader />
      <Content>
        <div className="overflow-x-auto">
          <Outlet />
        </div>
      </Content>
      <Footer className="text-center px-4">Monorepo Starter App ©{new Date().getFullYear()}</Footer>
    </Layout>
  );
};

export default MainLayout;
