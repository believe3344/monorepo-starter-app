import { register } from '@/api/common';
import { LockOutlined, MailOutlined, UserOutlined } from '@ant-design/icons';
import { Button, Form, Input, message } from 'antd';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Register: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [form] = Form.useForm();

  const onFinish = async (values: { username: string; email: string; password: string }) => {
    setLoading(true);
    try {
      const res = await register({
        username: values.username,
        email: values.email,
        password: values.password,
      });
      if (res.code === 200) {
        message.success('注册成功，请登录');
        navigate('/login');
      } else {
        message.error(res.message || '注册失败');
      }
    } catch (error: any) {
      message.error(error.response?.data?.message || '请求失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f5f0e6] p-1rem box-border">
      <div className="w-full max-w-100 bg-white rounded-lg shadow-lg p-1.5rem md:p-2rem">
        <div className="text-center mb-1.5rem md:mb-2rem">
          <h1 className="text-11 text-[#3d3129] font-serif">本地小说阅读器</h1>
          <p className="text-0.75rem md:text-0.875rem text-[#8b7355] mt-0.25rem md:mt-0.5rem">
            创建您的账户
          </p>
        </div>

        <Form form={form} name="register" onFinish={onFinish} autoComplete="off" size="large">
          <Form.Item
            name="username"
            rules={[
              { required: true, message: '请输入用户名' },
              { min: 2, max: 50, message: '用户名长度为2-50个字符' },
            ]}
          >
            <Input prefix={<UserOutlined />} placeholder="用户名" />
          </Form.Item>

          <Form.Item
            name="email"
            rules={[
              { required: true, message: '请输入邮箱' },
              { type: 'email', message: '请输入正确的邮箱格式' },
            ]}
          >
            <Input prefix={<MailOutlined />} placeholder="邮箱" />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[
              { required: true, message: '请输入密码' },
              { min: 6, message: '密码长度至少为6位' },
            ]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="密码" />
          </Form.Item>

          <Form.Item
            name="confirmPassword"
            dependencies={['password']}
            rules={[
              { required: true, message: '请确认密码' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('password') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('两次输入的密码不一致'));
                },
              }),
            ]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="确认密码" />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              block
              loading={loading}
              className="bg-[#8b7355] border-[#8b7355]"
            >
              注册
            </Button>
          </Form.Item>
        </Form>

        <div className="text-center">
          <Link to="/login" className="text-[#8b7355] hover:text-[#c9a86c]">
            已有账户？立即登录
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
