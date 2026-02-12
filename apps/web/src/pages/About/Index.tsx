import { Card, Space, Typography } from 'antd';

const { Title, Paragraph } = Typography;

const About: React.FC = () => {
  return (
    <div>
      <Title level={2}>📖 关于项目</Title>
      <Space direction="vertical" size="middle" style={{ width: '100%' }}>
        <Card title="技术栈">
          <Paragraph>React 19 + TypeScript + Vite + Ant Design</Paragraph>
        </Card>
        <Card title="架构">
          <Paragraph>Monorepo + Turborepo + pnpm workspace</Paragraph>
        </Card>
      </Space>
    </div>
  );
};

export default About;
