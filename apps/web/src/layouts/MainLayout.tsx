import { HomeOutlined, InfoCircleOutlined } from '@ant-design/icons';
import { Layout, Menu, theme } from 'antd';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';

const { Header, Content, Footer } = Layout;

const MainLayout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  const menuItems = [
    {
      key: '/',
      icon: <HomeOutlined />,
      label: '首页',
    },
    {
      key: '/about',
      icon: <InfoCircleOutlined />,
      label: '关于',
    },
  ];

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header className="flex items-center px-4 md:px-6">
        <div className="text-white text-base md:text-lg font-bold mr-4 md:mr-10 whitespace-nowrap">
          Monorepo Web
        </div>
        <Menu
          theme="dark"
          mode="horizontal"
          selectedKeys={[location.pathname]}
          items={menuItems}
          onClick={({ key }) => navigate(key)}
          className="flex-1 min-w-0"
        />
      </Header>
      <Content className="px-4 md:px-6 lg:px-12">
        <div
          style={{
            background: colorBgContainer,
            minHeight: 480,
            padding: 24,
            borderRadius: borderRadiusLG,
          }}
          className="overflow-x-auto"
        >
          <Outlet />
        </div>
      </Content>
      <Footer className="text-center px-4">Monorepo Starter App ©{new Date().getFullYear()}</Footer>
    </Layout>
  );
};

export default MainLayout;
