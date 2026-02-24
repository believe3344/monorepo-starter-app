import { ReadOutlined, SyncOutlined } from '@ant-design/icons';
import { Button, Card, List, message, Tag, Typography } from 'antd';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getNovels, NovelDto } from '../../api/novel';

const { Title } = Typography;

const NovelList: React.FC = () => {
  const [novels, setNovels] = useState<NovelDto[]>([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const fetchNovels = async () => {
    setLoading(true);
    try {
      const res = await getNovels();
      if (res.code === 200) {
        setNovels(res.result);
      } else {
        message.error(res.message || '加载书架失败');
      }
    } catch (error) {
      console.error(error);
      message.error('加载书架失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNovels();
  }, []);

  const getStatusTag = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return <Tag color="success">已完成</Tag>;
      case 'PROCESSING':
        return (
          <Tag color="processing" icon={<SyncOutlined spin />}>
            解析中
          </Tag>
        );
      case 'PENDING':
        return <Tag color="default">等待中</Tag>;
      case 'FAILED':
        return <Tag color="error">失败</Tag>;
      default:
        return <Tag>{status}</Tag>;
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between mb-6">
        <Title level={2}>我的书架</Title>
        <Button type="primary" onClick={() => navigate('/novels/upload')}>
          上传小说
        </Button>
      </div>

      <List
        grid={{ gutter: 16, xs: 1, sm: 2, md: 3, lg: 4, xl: 4, xxl: 6 }}
        dataSource={novels}
        loading={loading}
        renderItem={(item) => (
          <List.Item>
            <Card
              title={item.title}
              extra={getStatusTag(item.status)}
              actions={[
                <Button
                  type="link"
                  icon={<ReadOutlined />}
                  disabled={item.status !== 'COMPLETED'}
                  onClick={() => navigate(`/novels/${item.id}`)}
                >
                  阅读
                </Button>,
              ]}
            >
              <p>上传时间: {new Date(item.createdAt).toLocaleDateString()}</p>
            </Card>
          </List.Item>
        )}
      />
    </div>
  );
};

export default NovelList;
