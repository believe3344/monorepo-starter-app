import {
  BookOutlined,
  DeleteOutlined,
  InboxOutlined,
  LoadingOutlined,
  ReadOutlined,
} from '@ant-design/icons';
import { SocketContext } from '@app/contexts';
import { SocketMessage, SocketMessageType } from '@app/shared';
import {
  Button,
  Card,
  Col,
  Empty,
  List,
  message,
  Modal,
  Progress,
  Row,
  Tag,
  Typography,
  Upload,
} from 'antd';
import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ChapterDto,
  deleteNovel,
  getChapters,
  getNovels,
  NovelDto,
  NovelStatus,
  uploadNovel,
} from '../../api/novel';

const { Dragger } = Upload;
const { Title, Text } = Typography;

const NovelWorkspace: React.FC = () => {
  const navigate = useNavigate();
  const socketContext = useContext(SocketContext);
  const [novels, setNovels] = useState<NovelDto[]>([]);
  const [selectedNovel, setSelectedNovel] = useState<NovelDto | null>(null);
  const [chapters, setChapters] = useState<ChapterDto[]>([]);
  const [uploading, setUploading] = useState(false);
  const [loadingChapters, setLoadingChapters] = useState(false);

  // Fetch novels on mount
  useEffect(() => {
    fetchNovels();
  }, []);

  const fetchNovels = async () => {
    try {
      const res = await getNovels();
      if (res.code === 200) {
        setNovels(res.result);
      }
    } catch (error) {
      message.error('获取书架失败');
    }
  };

  // Handle socket messages
  useEffect(() => {
    if (!socketContext?.socket) return;

    const handleMessage = (data: SocketMessage) => {
      // 1. Novel Processing Started
      if (data.type === SocketMessageType.NOVEL_Processing) {
        const { novelId } = data.result;
        setNovels((prev) =>
          prev.map((n) => (n.id === novelId ? { ...n, status: NovelStatus.PROCESSING } : n)),
        );
        if (selectedNovel?.id === novelId) {
          setSelectedNovel((prev) => (prev ? { ...prev, status: NovelStatus.PROCESSING } : null));
        }
      }

      // 2. Chapter Update
      if (data.type === SocketMessageType.NOVEL_ChapterUpdate) {
        const updates = data.result as any[]; // Array of chapter updates
        // Only update if viewing the relevant novel
        const targetNovelId = updates[0]?.novelId;

        if (selectedNovel?.id === targetNovelId) {
          setChapters((prev) => {
            // Avoid duplicates
            const existingIds = new Set(prev.map((c) => c.order));
            const newChapters = updates
              .filter((u) => !existingIds.has(u.order))
              .map(
                (u) =>
                  ({
                    id: u.id || Date.now() + Math.random(), // fallback id if not provided in light update
                    title: u.title,
                    order: u.order,
                    wordCount: u.wordCount,
                    novelId: u.novelId,
                    content: '', // not needed for list
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                  }) as ChapterDto,
              );
            return [...prev, ...newChapters].sort((a, b) => a.order - b.order);
          });
        }
      }

      // 3. Processing Completed
      if (data.type === SocketMessageType.NOVEL_Completed) {
        const { novelId } = data.result;
        message.success('小说解析完成！');
        setNovels((prev) =>
          prev.map((n) => (n.id === novelId ? { ...n, status: NovelStatus.COMPLETED } : n)),
        );
        if (selectedNovel?.id === novelId) {
          setSelectedNovel((prev) => (prev ? { ...prev, status: NovelStatus.COMPLETED } : null));
          // Re-fetch full chapters to ensure consistency
          fetchChapters(novelId);
        }
      }

      // 4. Processing Failed
      if (data.type === SocketMessageType.NOVEL_Failed) {
        const { novelId } = data.result;
        message.error('小说解析失败');
        setNovels((prev) =>
          prev.map((n) => (n.id === novelId ? { ...n, status: NovelStatus.FAILED } : n)),
        );
      }
    };

    // Use the socket's internal callback mechanism if available, or add listener
    // Since we are using @app/utils Socket class which has addCallback
    if (socketContext.socket && 'addCallback' in socketContext.socket) {
      // Register for all types we care about
      socketContext.socket.addCallback(String(SocketMessageType.NOVEL_Processing), handleMessage);
      socketContext.socket.addCallback(
        String(SocketMessageType.NOVEL_ChapterUpdate),
        handleMessage,
      );
      socketContext.socket.addCallback(String(SocketMessageType.NOVEL_Completed), handleMessage);
      socketContext.socket.addCallback(String(SocketMessageType.NOVEL_Failed), handleMessage);
    }

    return () => {
      if (socketContext.socket && 'removeCallback' in socketContext.socket) {
        socketContext.socket.removeCallback(String(SocketMessageType.NOVEL_Processing));
        socketContext.socket.removeCallback(String(SocketMessageType.NOVEL_ChapterUpdate));
        socketContext.socket.removeCallback(String(SocketMessageType.NOVEL_Completed));
        socketContext.socket.removeCallback(String(SocketMessageType.NOVEL_Failed));
      }
    };
  }, [socketContext?.socket, selectedNovel]);

  const handleUpload = async (file: File) => {
    setUploading(true);
    try {
      const res = await uploadNovel(file);
      if (res.code === 200) {
        message.success('上传成功，开始解析...');
        // Refresh novel list to show the new one
        const novelsList = await getNovels();
        if (novelsList.code === 200) {
          setNovels(novelsList.result);
          // Automatically select the new novel
          const newNovel = novelsList.result.find((n) => n.id === res.result.id);
          if (newNovel) {
            handleNovelSelect(newNovel);
          }
        }
      } else {
        message.error(res.message || '上传失败');
      }
    } catch (error) {
      message.error('上传出错');
    } finally {
      setUploading(false);
    }
  };

  const fetchChapters = async (novelId: number) => {
    setLoadingChapters(true);
    try {
      const res = await getChapters(novelId);
      if (res.code === 200) {
        setChapters(res.result);
      }
    } catch (error) {
      message.error('获取章节失败');
    } finally {
      setLoadingChapters(false);
    }
  };

  const handleNovelSelect = (novel: NovelDto) => {
    setSelectedNovel(novel);
    setChapters([]); // Clear previous
    if (novel.status === NovelStatus.COMPLETED) {
      fetchChapters(novel.id);
    } else if (novel.status === NovelStatus.PROCESSING) {
      // If processing, we might want to fetch what's already there first
      fetchChapters(novel.id);
    }
  };

  const handleDelete = (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    Modal.confirm({
      title: '确认删除',
      content: '确定要删除这本小说吗？此操作不可恢复。',
      okText: '确认',
      cancelText: '取消',
      onOk: async () => {
        try {
          const res = await deleteNovel(id);
          if (res.code === 200) {
            message.success('删除成功');
            setNovels((prev) => prev.filter((n) => n.id !== id));
            if (selectedNovel?.id === id) {
              setSelectedNovel(null);
              setChapters([]);
            }
          } else {
            message.error(res.message || '删除失败');
          }
        } catch (error) {
          message.error('删除出错');
        }
      },
    });
  };

  const uploadProps = {
    name: 'file',
    multiple: false,
    showUploadList: false,
    beforeUpload: (file: File) => {
      const isTxt = file.type === 'text/plain' || file.name.endsWith('.txt');
      if (!isTxt) {
        message.error('只能上传 TXT 文件!');
        return Upload.LIST_IGNORE;
      }
      handleUpload(file);
      return false;
    },
  };

  return (
    <div className="h-[calc(100vh-64px)] p-6 bg-gray-50 flex flex-col gap-6">
      {/* Top: Upload Area */}
      <Card className="shadow-sm rounded-xl border-none [&>.ant-card-body]:p-8">
        <Dragger {...uploadProps} className="rounded-2xl bg-gray-50">
          <p className="ant-upload-drag-icon !mb-[20px] !mt-[15px]">
            <InboxOutlined className="text-[#1890ff] !text-[70px]" />
          </p>
          <p className="ant-upload-text text-xl font-medium">点击或拖拽文件到此处上传</p>
          <p className="ant-upload-hint text-gray-500">
            支持 .txt 格式，自动解析章节，实时推送到书架
          </p>
        </Dragger>
      </Card>

      {/* Bottom: Split View */}
      <Row gutter={24} className="flex-1 overflow-hidden">
        {/* Left: Bookshelf */}
        <Col span={8} className="h-full flex flex-col">
          <Card
            title={
              <Title level={4} className="m-0">
                <BookOutlined /> 我的书架
              </Title>
            }
            className="h-full shadow-sm rounded-xl border-none flex flex-col [&>.ant-card-body]:flex-1 [&>.ant-card-body]:overflow-hidden [&>.ant-card-body]:p-3"
          >
            <div className="h-full overflow-y-auto pr-2 custom-scrollbar">
              <div className="flex flex-col gap-3">
                {novels.map((item) => (
                  <Card
                    key={item.id}
                    hoverable
                    className={`
                      cursor-pointer transition-all duration-300 border rounded-lg
                      ${selectedNovel?.id === item.id ? 'bg-blue-50 border-blue-300 shadow-sm' : 'bg-white border-gray-100'}
                    `}
                    styles={{ body: { padding: '16px' } }}
                    onClick={() => handleNovelSelect(item)}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-bold text-lg mb-1 text-gray-800">{item.title}</h3>
                        <div className="text-xs text-gray-500 mb-2">
                          {new Date(item.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                      <Button
                        type="text"
                        danger
                        icon={<DeleteOutlined />}
                        onClick={(e) => handleDelete(e, item.id)}
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      {item.status === NovelStatus.PROCESSING && (
                        <Tag color="processing" icon={<LoadingOutlined />}>
                          解析中
                        </Tag>
                      )}
                      {item.status === NovelStatus.COMPLETED && <Tag color="success">已完成</Tag>}
                      {item.status === NovelStatus.FAILED && <Tag color="error">失败</Tag>}
                      {item.status === NovelStatus.PENDING && <Tag color="default">等待中</Tag>}
                    </div>
                    {item.status === NovelStatus.PROCESSING && (
                      <Progress
                        percent={50}
                        status="active"
                        showInfo={false}
                        size="small"
                        className="mt-2"
                      />
                    )}
                  </Card>
                ))}
              </div>
              {novels.length === 0 && (
                <Empty description="暂无小说，快去上传吧" className="mt-10" />
              )}
            </div>
          </Card>
        </Col>

        {/* Right: Chapter List */}
        <Col span={16} className="h-full flex flex-col">
          <Card
            title={
              <div className="flex justify-between items-center">
                <Title level={4} className="m-0">
                  {selectedNovel ? `《${selectedNovel.title}》章节列表` : '章节列表'}
                </Title>
                {selectedNovel && <Tag color="blue">{chapters.length} 章</Tag>}
              </div>
            }
            className="h-full shadow-sm rounded-xl border-none flex flex-col [&>.ant-card-body]:flex-1 [&>.ant-card-body]:overflow-hidden [&>.ant-card-body]:p-0"
          >
            {selectedNovel ? (
              <div className="h-full overflow-y-auto p-4 custom-scrollbar">
                <List
                  grid={{ gutter: 16, column: 3 }}
                  dataSource={chapters}
                  loading={loadingChapters}
                  renderItem={(item) => (
                    <List.Item>
                      <div
                        className="
                                        p-3 bg-gray-50 rounded-lg border border-gray-200
                                        cursor-pointer hover:bg-blue-50 hover:border-blue-300 hover:text-blue-600 transition-colors
                                        truncate text-center text-gray-700
                                    "
                        onClick={() =>
                          navigate(
                            `/novels/read/${item.novelId || selectedNovel?.id}?chapterId=${item.id}`,
                          )
                        }
                        title={item.title}
                      >
                        {item.title}
                      </div>
                    </List.Item>
                  )}
                />
                {chapters.length === 0 && !loadingChapters && (
                  <Empty description="暂无章节或正在解析中..." className="mt-20" />
                )}
              </div>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-400 flex-col">
                <ReadOutlined className="text-6xl mb-4 opacity-50" />
                <p>请选择左侧小说查看章节</p>
              </div>
            )}
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default NovelWorkspace;
