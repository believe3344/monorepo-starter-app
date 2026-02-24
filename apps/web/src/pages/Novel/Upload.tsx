import React, { useState } from 'react';
import { Upload, Button, message, Card, Form, Input } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import { uploadNovel } from '../../api/novel';
import { useNavigate } from 'react-router-dom';

const NovelUpload: React.FC = () => {
  const [fileList, setFileList] = useState<any[]>([]);
  const [uploading, setUploading] = useState(false);
  const [form] = Form.useForm();
  const navigate = useNavigate();

  const handleUpload = async () => {
    const file = fileList[0];
    if (!file) return;

    try {
      const values = await form.validateFields();
      setUploading(true);

      const res = await uploadNovel(file as File, values.title);
      if (res.code === 200) {
        message.success('上传成功，后台正在解析中...');
        navigate('/novels');
      } else {
        message.error(res.message || '上传失败');
      }
    } catch (error: any) {
      console.error(error);
      message.error(error.message || '上传失败');
    } finally {
      setUploading(false);
    }
  };

  const props = {
    onRemove: (file: any) => {
      setFileList((prev) => {
        const index = prev.indexOf(file);
        const newFileList = prev.slice();
        newFileList.splice(index, 1);
        return newFileList;
      });
    },
    beforeUpload: (file: any) => {
      const isTxt = file.type === 'text/plain' || file.name.endsWith('.txt');
      if (!isTxt) {
        message.error('只能上传 TXT 文件!');
        return Upload.LIST_IGNORE;
      }
      setFileList([file]);
      // Auto fill title
      if (!form.getFieldValue('title')) {
        form.setFieldsValue({ title: file.name.replace(/\.txt$/, '') });
      }
      return false;
    },
    fileList,
  };

  return (
    <Card title="上传小说" style={{ maxWidth: 600, margin: '20px auto' }}>
      <Form form={form} layout="vertical">
        <Form.Item label="选择文件">
          <Upload {...props} maxCount={1}>
            <Button icon={<UploadOutlined />}>选择 TXT 文件</Button>
          </Upload>
        </Form.Item>

        <Form.Item
          name="title"
          label="小说标题"
          rules={[{ required: true, message: '请输入标题' }]}
        >
          <Input placeholder="请输入小说标题" />
        </Form.Item>

        <Button
          type="primary"
          onClick={handleUpload}
          disabled={fileList.length === 0}
          loading={uploading}
          style={{ marginTop: 16 }}
          block
        >
          {uploading ? '上传中' : '开始上传'}
        </Button>
      </Form>
    </Card>
  );
};

export default NovelUpload;
