import { UserRole } from '@app/shared';
import { Button, Space, Typography } from 'antd';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

const { Title, Paragraph } = Typography;

const Home: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <div>
      <Title level={2}>🏠 欢迎来到用户端</Title>
      <Paragraph>这是基于 Monorepo + Turborepo 架构的用户端应用。</Paragraph>
      <Paragraph>
        共享包中的用户角色枚举：{UserRole.ADMIN} / {UserRole.USER}
      </Paragraph>
      <Space>
        <Button type="primary" onClick={() => navigate('/about')}>
          了解更多{t('common.add')}
        </Button>
      </Space>
    </div>
  );
};

export default Home;
