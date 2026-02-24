import { loginWithPass } from '@/api/common';
import { useUserStore } from '@/store';
import { LockOutlined, UserOutlined } from '@ant-design/icons';
import { storageUtil } from '@app/utils';
import { Button, Form, Input, message } from 'antd';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Login: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const setUserInfo = useUserStore((state: any) => state.setUserInfo);

  const onFinish = async (values: { username: string; password: string }) => {
    setLoading(true);
    try {
      const res = await loginWithPass({
        username: values.username,
        password: values.password,
      });
      if (res.code === 200) {
        message.success('登录成功');
        setUserInfo(res.result);
        storageUtil.set('localStorage', 'token', res.result.access_token);
        navigate('/novels');
      } else {
        message.error(res.message || '用户名或密码错误');
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
          <h1 className="text-4xl text-[#3d3129] font-serif">本地小说阅读器</h1>
          <p className="text-xs md:text-base text-[#8b7355] mt-0.25rem md:mt-0.5rem">欢迎回来</p>
        </div>

        <Form name="login" onFinish={onFinish} autoComplete="off" size="large">
          <Form.Item name="username" rules={[{ required: true, message: '请输入用户名' }]}>
            <Input prefix={<UserOutlined />} placeholder="用户名" />
          </Form.Item>

          <Form.Item name="password" rules={[{ required: true, message: '请输入密码' }]}>
            <Input.Password prefix={<LockOutlined />} placeholder="密码" />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              block
              loading={loading}
              className="bg-[#8b7355] border-[#8b7355]"
            >
              登录
            </Button>
          </Form.Item>
        </Form>

        <div className="text-center">
          <Link to="/register" className="text-sm text-[#8b7355] hover:text-[#c9a86c]">
            还没有账户？立即注册
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
