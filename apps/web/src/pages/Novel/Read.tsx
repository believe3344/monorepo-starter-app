import {
  BookOutlined,
  LeftOutlined,
  MenuOutlined,
  RightOutlined,
  SettingOutlined,
} from '@ant-design/icons';
import {
  Button,
  ConfigProvider,
  Drawer,
  Layout,
  Menu,
  Radio,
  Slider,
  Spin,
  Typography,
  theme as antdTheme,
  message,
} from 'antd';
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { ChapterDto, getChapterContent, getChapters } from '../../api/novel';

const { Header, Content } = Layout;
const { Title, Paragraph } = Typography;

interface ReaderSettings {
  fontSize: number;
  theme: 'light' | 'dark' | 'sepia';
  width: number;
}

const THEMES = {
  light: {
    name: '明亮',
    layoutBg: '#f5f7fa',
    paperBg: '#ffffff',
    text: '#333333',
    headerBg: 'rgba(255, 255, 255, 0.85)',
    border: '#e8e8e8',
    algorithm: antdTheme.defaultAlgorithm,
  },
  sepia: {
    name: '护眼',
    layoutBg: '#ebddc6ff',
    paperBg: '#f6f1e7',
    text: '#5c4b38',
    headerBg: 'rgba(246, 241, 231, 0.85)',
    border: '#e6e0d0',
    algorithm: antdTheme.defaultAlgorithm,
  },
  dark: {
    name: '暗黑',
    layoutBg: '#121212',
    paperBg: '#1f1f1f',
    text: '#b3b3b3',
    headerBg: 'rgba(31, 31, 31, 0.85)',
    border: '#333333',
    algorithm: antdTheme.darkAlgorithm,
  },
};

const DEFAULT_SETTINGS: ReaderSettings = {
  fontSize: 18,
  theme: 'light',
  width: 900,
};

const NovelRead: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const [chapters, setChapters] = useState<ChapterDto[]>([]);
  const [currentChapter, setCurrentChapter] = useState<ChapterDto | null>(null);
  const [loading, setLoading] = useState(false);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [settingsVisible, setSettingsVisible] = useState(false);
  const navigate = useNavigate();

  // Settings state with local storage persistence
  const [settings, setSettings] = useState<ReaderSettings>(() => {
    const saved = localStorage.getItem('reader-settings');
    return saved ? JSON.parse(saved) : DEFAULT_SETTINGS;
  });

  useEffect(() => {
    localStorage.setItem('reader-settings', JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    if (id) {
      loadChapters(Number(id));
    }
  }, [id]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (loading) return;
      if (e.key === 'ArrowLeft' && currentChapter?.previousId) {
        loadChapterContent(currentChapter.previousId);
      } else if (e.key === 'ArrowRight' && currentChapter?.nextId) {
        loadChapterContent(currentChapter.nextId);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentChapter, loading]);

  const loadChapters = async (novelId: number) => {
    try {
      const res = await getChapters(novelId);
      if (res.code === 200) {
        setChapters(res.result);
        const chapterId = searchParams.get('chapterId');
        if (chapterId) {
          loadChapterContent(Number(chapterId));
        } else if (res.result.length > 0) {
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
        setSearchParams({ chapterId: chapterId.toString() });
        window.scrollTo({ top: 0, behavior: 'smooth' });
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

  const currentTheme = THEMES[settings.theme];

  return (
    <ConfigProvider
      theme={{
        algorithm: currentTheme.algorithm,
        token: {
          colorPrimary: '#1890ff',
        },
      }}
    >
      <Layout
        className="min-h-100vh transition-colors duration-300"
        style={{ backgroundColor: currentTheme.layoutBg }}
      >
        <Header
          className="flex items-center px-4 sticky top-0 z-10 w-full backdrop-blur-md shadow-sm transition-colors duration-300 border-b"
          style={{
            backgroundColor: currentTheme.headerBg,
            borderColor: currentTheme.border,
            height: '64px',
            paddingInline: '24px',
          }}
        >
          <div className="flex items-center gap-4 flex-1 overflow-hidden">
            <Button
              icon={<MenuOutlined />}
              onClick={() => setDrawerVisible(true)}
              type="text"
              style={{ color: currentTheme.text }}
            />
            <div className="flex-1 overflow-hidden">
              <Title
                level={5}
                className="m-0 whitespace-nowrap text-ellipsis overflow-hidden"
                style={{ color: currentTheme.text, margin: 0 }}
              >
                {currentChapter?.title || '加载中...'}
              </Title>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              icon={<SettingOutlined />}
              onClick={() => setSettingsVisible(true)}
              type="text"
              style={{ color: currentTheme.text }}
            >
              设置
            </Button>
            <Button onClick={() => navigate('/novels')} type="default">
              返回书架
            </Button>
          </div>
        </Header>

        <Drawer
          title="目录"
          placement="left"
          onClose={() => setDrawerVisible(false)}
          open={drawerVisible}
          size={320}
          styles={{
            body: { padding: 0 },
          }}
        >
          <Menu
            mode="inline"
            selectedKeys={[currentChapter?.id.toString() || '']}
            style={{ borderRight: 0 }}
            items={chapters.map((c) => ({
              key: c.id,
              label: c.title,
              icon: <BookOutlined />,
              onClick: () => loadChapterContent(c.id),
            }))}
          />
        </Drawer>

        <Drawer
          title="阅读设置"
          placement="bottom"
          onClose={() => setSettingsVisible(false)}
          open={settingsVisible}
          height="auto"
          styles={{
            body: { padding: '24px' },
          }}
        >
          <div className="max-w-2xl mx-auto space-y-6">
            <div>
              <div className="mb-2 text-gray-500">字号大小 ({settings.fontSize}px)</div>
              <Slider
                min={14}
                max={32}
                step={1}
                value={settings.fontSize}
                onChange={(val) => setSettings((s) => ({ ...s, fontSize: val }))}
                marks={{ 14: '小', 18: '中', 24: '大', 32: '特大' }}
              />
            </div>

            <div>
              <div className="mb-2 text-gray-500">背景主题</div>
              <Radio.Group
                value={settings.theme}
                onChange={(e) => setSettings((s) => ({ ...s, theme: e.target.value }))}
                className="w-full grid grid-cols-3 gap-4"
              >
                {Object.entries(THEMES).map(([key, theme]) => (
                  <Radio.Button
                    key={key}
                    value={key}
                    className="flex items-center justify-center text-center h-12"
                    style={{
                      backgroundColor: theme.paperBg,
                      color: theme.text,
                      borderColor: theme.border,
                    }}
                  >
                    {theme.name}
                  </Radio.Button>
                ))}
              </Radio.Group>
            </div>
          </div>
        </Drawer>

        <Content
          className="mx-auto transition-colors duration-300"
          style={{
            maxWidth: `${settings.width}px`,
            width: '100%',
            padding: '24px',
          }}
        >
          {loading ? (
            <div className="flex justify-center items-center min-h-[50vh]">
              <Spin size="large" tip="正在加载章节内容..." />
            </div>
          ) : (
            currentChapter && (
              <div
                className="animate-fade-in shadow-lg rounded-lg p-6  min-h-[80vh] transition-colors duration-300"
                style={{ backgroundColor: currentTheme.paperBg }}
              >
                <Title
                  level={2}
                  className="text-center mb-12 mt-4"
                  style={{ color: currentTheme.text }}
                >
                  {currentChapter.title}
                </Title>
                <Typography>
                  {currentChapter.content?.split('\n').map((para, index) => (
                    <Paragraph
                      key={index}
                      className="leading-loose text-justify mb-6 transition-all duration-300"
                      style={{
                        fontSize: `${settings.fontSize}px`,
                        color: currentTheme.text,
                        textIndent: '2em',
                        lineHeight: 1.8,
                      }}
                    >
                      {para}
                    </Paragraph>
                  ))}
                </Typography>

                <div
                  className="flex justify-between items-center mt-16 pt-8 border-t"
                  style={{ borderColor: currentTheme.border }}
                >
                  <Button
                    size="large"
                    disabled={!currentChapter.previousId}
                    onClick={() =>
                      currentChapter.previousId && loadChapterContent(currentChapter.previousId)
                    }
                    icon={<LeftOutlined />}
                    className="w-32"
                  >
                    上一章
                  </Button>
                  <span className="text-gray-400 text-sm hidden sm:block">
                    按左右方向键快速翻页
                  </span>
                  <Button
                    size="large"
                    type="primary"
                    disabled={!currentChapter.nextId}
                    onClick={() =>
                      currentChapter.nextId && loadChapterContent(currentChapter.nextId)
                    }
                    className="w-32"
                  >
                    下一章 <RightOutlined />
                  </Button>
                </div>
              </div>
            )
          )}
        </Content>
      </Layout>
    </ConfigProvider>
  );
};

export default NovelRead;
