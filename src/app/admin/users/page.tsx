'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { 
  Users, 
  UserPlus, 
  Key, 
  Edit, 
  Trash2, 
  ShieldCheck, 
  RefreshCw,
  Search,
  Lock,
  CheckCircle,
  XCircle
} from 'lucide-react';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import CustomSelect, { SelectOption } from '@/components/ui/CustomSelect';
import { useToast } from '@/context/ToastContext';
import { useAuth } from '@/context/AuthContext';

interface RoleData {
  id: string;
  code: string;
  name: string;
  permissions: string;
}

interface UserData {
  id: string;
  username: string;
  email?: string | null;
  name: string;
  phone?: string | null;
  isActive: boolean;
  roleId: string;
  role: RoleData;
  createdAt: string;
}

export default function AdminUsersPage() {
  const { showToast } = useToast();
  const { user: currentUser } = useAuth();

  const [users, setUsers] = useState<UserData[]>([]);
  const [roles, setRoles] = useState<RoleData[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');

  // Modal create/edit user
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserData | null>(null);

  // Form fields
  const [formUsername, setFormUsername] = useState('');
  const [formPassword, setFormPassword] = useState('');
  const [formName, setFormName] = useState('');
  const [formRoleId, setFormRoleId] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formIsActive, setFormIsActive] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Password reset modal
  const [resetModalOpen, setResetModalOpen] = useState(false);
  const [userToReset, setUserToReset] = useState<UserData | null>(null);
  const [newPasswordInput, setNewPasswordInput] = useState('');

  const fetchUsers = useCallback(async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    else setRefreshing(true);

    try {
      const res = await fetch('/api/admin/users');
      const data = await res.json();
      if (data.success) {
        setUsers(data.users);
        setRoles(data.roles);
      } else {
        showToast(data.error || 'Không có quyền truy cập quản lý nhân viên', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('Lỗi kết nối máy chủ', 'error');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleOpenAdd = () => {
    setEditingUser(null);
    setFormUsername('');
    setFormPassword('');
    setFormName('');
    setFormRoleId(roles[0]?.id || '');
    setFormPhone('');
    setFormEmail('');
    setFormIsActive(true);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (user: UserData) => {
    setEditingUser(user);
    setFormUsername(user.username);
    setFormPassword('');
    setFormName(user.name);
    setFormRoleId(user.roleId);
    setFormPhone(user.phone || '');
    setFormEmail(user.email || '');
    setFormIsActive(user.isActive);
    setIsModalOpen(true);
  };

  const handleOpenResetPassword = (user: UserData) => {
    setUserToReset(user);
    setNewPasswordInput('');
    setResetModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formName.trim() || !formRoleId) {
      showToast('Vui lòng điền họ tên và vai trò', 'error');
      return;
    }

    setSubmitting(true);
    try {
      if (editingUser) {
        // Update user
        const res = await fetch(`/api/admin/users/${editingUser.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: formName.trim(),
            roleId: formRoleId,
            phone: formPhone.trim(),
            email: formEmail.trim(),
            isActive: formIsActive,
          }),
        });
        const data = await res.json();
        if (data.success) {
          showToast('Đã cập nhật thông tin nhân viên', 'success');
          setIsModalOpen(false);
          fetchUsers(true);
        } else {
          showToast(data.error || 'Cập nhật thất bại', 'error');
        }
      } else {
        // Create user
        if (!formUsername.trim() || !formPassword.trim()) {
          showToast('Vui lòng nhập tên đăng nhập và mật khẩu khởi tạo', 'error');
          setSubmitting(false);
          return;
        }

        const res = await fetch('/api/admin/users', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            username: formUsername.trim(),
            password: formPassword.trim(),
            name: formName.trim(),
            roleId: formRoleId,
            phone: formPhone.trim(),
            email: formEmail.trim(),
            isActive: formIsActive,
          }),
        });
        const data = await res.json();
        if (data.success) {
          showToast('Đã tạo tài khoản nhân viên thành công!', 'success');
          setIsModalOpen(false);
          fetchUsers(true);
        } else {
          showToast(data.error || 'Tạo tài khoản thất bại', 'error');
        }
      }
    } catch (err) {
      console.error(err);
      showToast('Lỗi khi lưu dữ liệu', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleResetPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userToReset || newPasswordInput.trim().length < 6) {
      showToast('Mật khẩu mới tối thiểu 6 ký tự', 'error');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(`/api/admin/users/${userToReset.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newPassword: newPasswordInput.trim() }),
      });
      const data = await res.json();
      if (data.success) {
        showToast(`Đã đổi mật khẩu cho ${userToReset.name}!`, 'success');
        setResetModalOpen(false);
      } else {
        showToast(data.error || 'Đổi mật khẩu thất bại', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('Lỗi kết nối máy chủ', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleActive = async (user: UserData) => {
    try {
      const res = await fetch(`/api/admin/users/${user.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !user.isActive }),
      });
      const data = await res.json();
      if (data.success) {
        showToast(`Đã ${!user.isActive ? 'mở khóa' : 'khóa'} tài khoản ${user.username}`, 'success');
        setUsers((prev) =>
          prev.map((u) => (u.id === user.id ? { ...u, isActive: !u.isActive } : u))
        );
      } else {
        showToast(data.error || 'Thao tác thất bại', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('Lỗi kết nối', 'error');
    }
  };

  const roleOptions: SelectOption[] = roles.map((r) => ({
    value: r.id,
    label: `${r.name} (${r.code})`,
  }));

  const filteredUsers = users.filter((u) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      u.name.toLowerCase().includes(q) ||
      u.username.toLowerCase().includes(q) ||
      (u.phone && u.phone.includes(q))
    );
  });

  return (
    <div>
      {/* Page Header */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
          marginBottom: '1.5rem',
        }}
      >
        <div>
          <h1 className="serif-heading" style={{ fontSize: '1.875rem', color: 'var(--color-primary)' }}>
            Quản Lý Nhân Viên & Phân Quyền (RBAC)
          </h1>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem', marginTop: '0.25rem' }}>
            Phân quyền nghiêm ngặt cho Quản trị viên, Lễ tân và Buồng phòng với mật khẩu mã hóa PBKDF2.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchUsers(true)}
            loading={refreshing}
            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
          >
            <RefreshCw size={15} className={refreshing ? 'animate-spin' : ''} />
            <span>Làm mới</span>
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={handleOpenAdd}
            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
          >
            <UserPlus size={16} />
            <span>Thêm nhân viên</span>
          </Button>
        </div>
      </div>

      {/* Search Input Bar */}
      <div
        className="glass-panel"
        style={{
          padding: '1.25rem',
          borderRadius: 'var(--radius-lg)',
          backgroundColor: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
          marginBottom: '1.5rem',
        }}
      >
        <div style={{ position: 'relative', maxWidth: '360px' }}>
          <Search
            size={16}
            style={{
              position: 'absolute',
              left: '0.75rem',
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--color-text-muted)',
            }}
          />
          <input
            type="text"
            placeholder="Tìm theo tên, tài khoản, số điện thoại..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: '100%',
              padding: '0.55rem 0.75rem 0.55rem 2.25rem',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--color-border)',
              backgroundColor: 'var(--color-bg)',
              color: 'var(--color-text)',
              fontSize: '0.875rem',
            }}
          />
        </div>
      </div>

      {/* Users Table */}
      <div
        className="glass-panel"
        style={{
          borderRadius: 'var(--radius-lg)',
          backgroundColor: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
          overflow: 'hidden',
        }}
      >
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
            <thead>
              <tr
                style={{
                  backgroundColor: 'var(--color-bg)',
                  borderBottom: '2px solid var(--color-border)',
                  color: 'var(--color-text-muted)',
                  fontSize: '0.75rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                }}
              >
                <th style={{ padding: '0.875rem 1rem' }}>Họ và tên & Username</th>
                <th style={{ padding: '0.875rem 1rem' }}>Vai trò RBAC</th>
                <th style={{ padding: '0.875rem 1rem' }}>Liên hệ</th>
                <th style={{ padding: '0.875rem 1rem' }}>Trạng thái</th>
                <th style={{ padding: '0.875rem 1rem', textAlign: 'right' }}>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--color-text-muted)' }}>
                    <RefreshCw size={24} className="animate-spin" style={{ margin: '0 auto 0.5rem' }} />
                    <div>Đang tải danh sách nhân viên...</div>
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--color-text-muted)' }}>
                    Không có nhân viên nào phù hợp.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => {
                  const isSuperAdmin = user.role.code === 'ADMIN';

                  return (
                    <tr
                      key={user.id}
                      style={{
                        borderBottom: '1px solid var(--color-border)',
                        transition: 'background-color var(--transition-fast)',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--color-bg)')}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                    >
                      <td style={{ padding: '1rem' }}>
                        <div style={{ fontWeight: 700, color: 'var(--color-primary)' }}>{user.name}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                          @{user.username}
                        </div>
                      </td>

                      <td style={{ padding: '1rem' }}>
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.35rem',
                            padding: '0.2rem 0.6rem',
                            borderRadius: 'var(--radius-full)',
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            backgroundColor: isSuperAdmin ? 'rgba(239, 68, 68, 0.1)' : 'var(--color-primary-light)',
                            color: isSuperAdmin ? 'var(--color-error)' : 'var(--color-primary)',
                            border: `1px solid ${isSuperAdmin ? 'rgba(239, 68, 68, 0.3)' : 'rgba(13, 148, 136, 0.3)'}`,
                          }}
                        >
                          <ShieldCheck size={13} />
                          <span>{user.role.name}</span>
                        </span>
                      </td>

                      <td style={{ padding: '1rem' }}>
                        <div>{user.phone || 'Chưa cập nhật SĐT'}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                          {user.email || '—'}
                        </div>
                      </td>

                      <td style={{ padding: '1rem' }}>
                        <span
                          style={{
                            display: 'inline-block',
                            padding: '0.2rem 0.6rem',
                            borderRadius: 'var(--radius-full)',
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            backgroundColor: user.isActive ? 'rgba(16, 185, 129, 0.1)' : 'rgba(107, 114, 128, 0.1)',
                            color: user.isActive ? 'var(--color-success)' : 'var(--color-text-muted)',
                          }}
                        >
                          {user.isActive ? 'Đang hoạt động' : 'Tạm khóa'}
                        </span>
                      </td>

                      <td style={{ padding: '1rem', textAlign: 'right' }}>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.4rem' }}>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleOpenResetPassword(user)}
                            title="Đổi mật khẩu"
                          >
                            <Key size={13} />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleOpenEdit(user)}
                            title="Sửa thông tin"
                          >
                            <Edit size={13} />
                          </Button>
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => handleToggleActive(user)}
                            disabled={user.id === currentUser?.userId}
                          >
                            {user.isActive ? 'Khóa' : 'Mở'}
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Add / Edit User */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingUser ? `Sửa Tài Khoản: ${editingUser.name}` : 'Thêm Nhân Viên Mới'}
        maxWidth="500px"
      >
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {!editingUser && (
            <div>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                Tên đăng nhập (Username) <span style={{ color: 'var(--color-error)' }}>*</span>
              </label>
              <input
                type="text"
                required
                placeholder="ví dụ: le_tan_hoa"
                value={formUsername}
                onChange={(e) => setFormUsername(e.target.value.toLowerCase())}
                style={{
                  width: '100%',
                  padding: '0.625rem 0.75rem',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--color-border)',
                  backgroundColor: 'var(--color-bg)',
                }}
              />
            </div>
          )}

          <div>
            <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '0.35rem' }}>
              Họ và tên nhân viên <span style={{ color: 'var(--color-error)' }}>*</span>
            </label>
            <input
              type="text"
              required
              placeholder="Nguyễn Thị Hoa"
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
              style={{
                width: '100%',
                padding: '0.625rem 0.75rem',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--color-border)',
                backgroundColor: 'var(--color-bg)',
              }}
            />
          </div>

          {!editingUser && (
            <div>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                Mật khẩu khởi tạo <span style={{ color: 'var(--color-error)' }}>*</span>
              </label>
              <input
                type="password"
                required
                placeholder="Tối thiểu 6 ký tự..."
                value={formPassword}
                onChange={(e) => setFormPassword(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.625rem 0.75rem',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--color-border)',
                  backgroundColor: 'var(--color-bg)',
                }}
              />
            </div>
          )}

          <div>
            <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '0.35rem' }}>
              Vai trò & Phân quyền <span style={{ color: 'var(--color-error)' }}>*</span>
            </label>
            <CustomSelect
              options={roleOptions}
              value={formRoleId}
              onChange={(val) => setFormRoleId(val)}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                Số điện thoại
              </label>
              <input
                type="tel"
                placeholder="0987..."
                value={formPhone}
                onChange={(e) => setFormPhone(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.625rem 0.75rem',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--color-border)',
                  backgroundColor: 'var(--color-bg)',
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                Email
              </label>
              <input
                type="email"
                placeholder="hoa@songngochotel.vn"
                value={formEmail}
                onChange={(e) => setFormEmail(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.625rem 0.75rem',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--color-border)',
                  backgroundColor: 'var(--color-bg)',
                }}
              />
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <input
              type="checkbox"
              id="activeStatusCheck"
              checked={formIsActive}
              onChange={(e) => setFormIsActive(e.target.checked)}
              style={{ width: '16px', height: '16px', cursor: 'pointer' }}
            />
            <label htmlFor="activeStatusCheck" style={{ fontSize: '0.875rem', cursor: 'pointer' }}>
              Tài khoản đang hoạt động
            </label>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
              Hủy
            </Button>
            <Button type="submit" variant="primary" loading={submitting}>
              {editingUser ? 'Lưu thay đổi' : 'Tạo tài khoản'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal Reset Password */}
      <Modal
        isOpen={resetModalOpen}
        onClose={() => setResetModalOpen(false)}
        title={`Đổi Mật Khẩu - ${userToReset?.name}`}
        maxWidth="420px"
      >
        <form onSubmit={handleResetPasswordSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '0.35rem' }}>
              Mật khẩu mới
            </label>
            <input
              type="password"
              required
              placeholder="Nhập mật khẩu mới (tối thiểu 6 ký tự)..."
              value={newPasswordInput}
              onChange={(e) => setNewPasswordInput(e.target.value)}
              style={{
                width: '100%',
                padding: '0.625rem 0.75rem',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--color-border)',
                backgroundColor: 'var(--color-bg)',
              }}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
            <Button type="button" variant="outline" onClick={() => setResetModalOpen(false)}>
              Hủy
            </Button>
            <Button type="submit" variant="primary" loading={submitting}>
              Cập nhật mật khẩu
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
