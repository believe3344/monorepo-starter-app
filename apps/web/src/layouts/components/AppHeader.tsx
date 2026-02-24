import { logout } from '@/api/common';
import { useUserStore } from '@/store';
import { BellOutlined, LogoutOutlined, UserOutlined } from '@ant-design/icons';
import { storageUtil } from '@app/utils';
import { Avatar, Badge, Dropdown, Layout, MenuProps, Space, Typography } from 'antd';
import { useNavigate } from 'react-router-dom';

const { Header } = Layout;
const { Text } = Typography;

/**
 * 应用头部组件
 * 包含 Logo、系统名称、消息通知、用户信息及退出登录功能
 */
const AppHeader: React.FC = () => {
  const navigate = useNavigate();
  const userInfo = useUserStore((state) => state.userInfo);
  const clearUserInfo = useUserStore((state) => state.clearUserInfo);

  // 处理退出登录
  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      clearUserInfo();
      storageUtil.remove('localStorage', 'token');
      navigate('/login');
    }
  };

  const menuItems: MenuProps['items'] = [
    {
      key: 'logout',
      label: '退出登录',
      icon: <LogoutOutlined />,
      onClick: handleLogout,
    },
  ];

  return (
    <Header className="bg-white px-6 flex items-center justify-between shadow-sm sticky top-0 z-50">
      {/* 左侧 Logo 和标题 */}
      <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/')}>
        <div className="w-8 h-8 bg-[#8b7355] rounded-lg flex items-center justify-center text-white font-bold text-lg shadow-sm">
          N
        </div>
        <Text strong className="text-lg hidden md:block text-[#3d3129]">
          本地小说阅读器
        </Text>
      </div>

      {/* 右侧功能区 */}
      <div className="flex items-center gap-6">
        <Badge count={0} dot>
          <BellOutlined className="text-lg cursor-pointer text-gray-600 hover:text-[#8b7355] transition-colors" />
        </Badge>

        <Dropdown menu={{ items: menuItems }} placement="bottomRight" arrow>
          <Space className="cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-colors">
            <Avatar
              className="bg-[#f5f0e6] text-[#8b7355] border border-[#e8dfcf]"
              icon={!userInfo?.user?.username && <UserOutlined />}
            >
              {userInfo?.user?.username?.[0]?.toUpperCase()}
            </Avatar>
            <span className="hidden md:block text-gray-700 font-medium select-none">
              {userInfo?.user?.username || '用户'}
            </span>
          </Space>
        </Dropdown>
      </div>
    </Header>
  );
};

export default AppHeader;
