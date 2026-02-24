import React, { useEffect, useState } from 'react';
import { Layout, Menu, Typography, Button, Drawer, Spin, message } from 'antd';
import { getChapters, getChapterContent, ChapterDto } from '../../api/novel';
import { useParams, useNavigate } from 'react-router-dom';
import { MenuOutlined, LeftOutlined, RightOutlined } from '@ant-design/icons';

const { Header, Content } = Layout;
const { Title, Paragraph } = Typography;

const NovelRead: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [chapters, setChapters] = useState<ChapterDto[]>([]);
  const [currentChapter, setCurrentChapter] = useState<ChapterDto | null>(null);
  const [loading, setLoading] = useState(false);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (id) {
      loadChapters(Number(id));
    }
  }, [id]);

  const loadChapters = async (novelId: number) => {
    try {
      const res = await getChapters(novelId);
      if (res.code === 200) {
        setChapters(res.result);
        if (res.result.length > 0) {
          // Load first chapter by default or restore from local storage
          loadChapterContent(res.result[0].id);
        }
      } else {
        message.error(res.message || '加载目录失败');
      }
    } catch (error) {
      message.error('加载目录失败');
    }
  };

  const loadChapterContent = async (chapterId: number) => {
    setLoading(true);
    try {
      const res = await getChapterContent(chapterId);
      if (res.code === 200) {
        setCurrentChapter(res.result);
        window.scrollTo(0, 0);
      } else {
        message.error(res.message || '加载章节失败');
      }
    } catch (error) {
      message.error('加载章节失败');
    } finally {
      setLoading(false);
      setDrawerVisible(false);
    }
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header
        style={{
          display: 'flex',
          alignItems: 'center',
          padding: '0 20px',
          background: '#fff',
          borderBottom: '1px solid #f0f0f0',
          position: 'sticky',
          top: 0,
          zIndex: 1,
          width: '100%',
        }}
      >
        <Button
          icon={<MenuOutlined />}
          onClick={() => setDrawerVisible(true)}
          style={{ marginRight: 16 }}
        />
        <Title
          level={4}
          style={{
            margin: 0,
            flex: 1,
            overflow: 'hidden',
            whiteSpace: 'nowrap',
            textOverflow: 'ellipsis',
          }}
        >
          {currentChapter?.title || '加载中...'}
        </Title>
        <Button onClick={() => navigate('/novels')}>返回书架</Button>
      </Header>

      <Drawer
        title="目录"
        placement="left"
        onClose={() => setDrawerVisible(false)}
        open={drawerVisible}
        width={300}
      >
        <Menu
          mode="inline"
          selectedKeys={[currentChapter?.id.toString() || '']}
          items={chapters.map((c) => ({
            key: c.id,
            label: c.title,
            onClick: () => loadChapterContent(c.id),
          }))}
        />
      </Drawer>

      <Content style={{ padding: '24px', maxWidth: '800px', margin: '0 auto', background: '#fff' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '50px' }}>
            <Spin size="large" />
          </div>
        ) : (
          currentChapter && (
            <div>
              <Title level={3} style={{ textAlign: 'center', marginBottom: 40 }}>
                {currentChapter.title}
              </Title>
              <Typography>
                {currentChapter.content?.split('\n').map((para, index) => (
                  <Paragraph
                    key={index}
                    style={{ fontSize: '18px', lineHeight: '1.8', textIndent: '2em' }}
                  >
                    {para}
                  </Paragraph>
                ))}
              </Typography>

              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 60 }}>
                <Button
                  disabled={!currentChapter.previousId}
                  onClick={() =>
                    currentChapter.previousId && loadChapterContent(currentChapter.previousId)
                  }
                  icon={<LeftOutlined />}
                >
                  上一章
                </Button>
                <Button
                  disabled={!currentChapter.nextId}
                  onClick={() => currentChapter.nextId && loadChapterContent(currentChapter.nextId)}
                >
                  下一章 <RightOutlined />
                </Button>
              </div>
            </div>
          )
        )}
      </Content>
    </Layout>
  );
};

export default NovelRead;
