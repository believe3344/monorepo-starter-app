import { PlusOutlined } from '@ant-design/icons';
import { UserInfo, UserRole } from '@app/shared';
import { Button, Space, Table, Tag, message } from 'antd';
import type { ColumnsType } from 'antd/es/table';

// 模拟数据
const mockUsers: UserInfo[] = [
  {
    id: 1,
    username: 'admin',
    email: 'admin@example.com',
    role: UserRole.ADMIN,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01',
  },
  {
    id: 2,
    username: 'user1',
    email: 'user1@example.com',
    role: UserRole.USER,
    createdAt: '2024-01-15',
    updatedAt: '2024-01-15',
  },
];

const UserManage: React.FC = () => {
  const columns: ColumnsType<UserInfo> = [
    { title: 'ID', dataIndex: 'id', key: 'id', width: 80 },
    { title: '用户名', dataIndex: 'username', key: 'username' },
    { title: '邮箱', dataIndex: 'email', key: 'email' },
    {
      title: '角色',
      dataIndex: 'role',
      key: 'role',
      render: (role: UserRole) => (
        <Tag color={role === UserRole.ADMIN ? 'red' : 'blue'}>
          {role === UserRole.ADMIN ? '管理员' : '普通用户'}
        </Tag>
      ),
    },
    { title: '创建时间', dataIndex: 'createdAt', key: 'createdAt' },
    {
      title: '操作',
      key: 'action',
      render: () => (
        <Space>
          <Button type="link" size="small">
            编辑
          </Button>
          <Button type="link" size="small" danger>
            删除
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginBottom: 16,
        }}
      >
        <h2 style={{ margin: 0 }}>👥 用户管理</h2>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => message.info('新增用户（待实现）')}
        >
          新增用户
        </Button>
      </div>
      <Table columns={columns} dataSource={mockUsers} rowKey="id" />
    </div>
  );
};

export default UserManage;
