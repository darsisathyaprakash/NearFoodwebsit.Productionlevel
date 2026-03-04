'use client';

import { useEffect, useState, useCallback } from 'react';
import { AdminAuthProvider, useAdminAuth } from '@/components/admin/AdminAuthProvider';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { AdminTopbar } from '@/components/admin/AdminTopbar';
import { ConfirmModal } from '@/components/admin/ConfirmModal';
import { Search, Shield, ShieldOff, Ban, Trash2, UserCheck } from 'lucide-react';
import type { UserProfile } from '@/types/types';

function UsersContent() {
    const { adminUser, loading: authLoading, adminFetch } = useAdminAuth();
    const [users, setUsers] = useState<UserProfile[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [deleteId, setDeleteId] = useState<string | null>(null);
    const [deleting, setDeleting] = useState(false);
    const [alert, setAlert] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

    const fetchUsers = useCallback(async () => {
        try {
            setLoading(true);
            const res = await adminFetch('/api/admin/users');
            if (!res.ok) {
                throw new Error('API request failed');
            }
            const json = await res.json();
            setUsers(json?.data || []);
        } catch (error) {
            console.error('Failed to fetch users:', error);
        } finally {
            setLoading(false);
        }
    }, [adminFetch]);

    useEffect(() => {
        if (!adminUser) return;
        fetchUsers();
    }, [adminUser, fetchUsers]);

    const handleRoleChange = async (user: UserProfile, newRole: 'admin' | 'user') => {
        try {
            const res = await adminFetch(`/api/admin/users/${user.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ role: newRole }),
            });

            if (res.ok) {
                setAlert({ type: 'success', message: `Role updated to ${newRole}` });
                fetchUsers();
            } else {
                const data = await res.json();
                setAlert({ type: 'error', message: data.error || 'Failed to update role' });
            }
        } catch {
            setAlert({ type: 'error', message: 'An error occurred' });
        }
        setTimeout(() => setAlert(null), 3000);
    };

    const handleBlock = async (user: UserProfile) => {
        try {
            const res = await adminFetch(`/api/admin/users/${user.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ is_blocked: !user.is_blocked }),
            });

            if (res.ok) {
                setAlert({
                    type: 'success',
                    message: user.is_blocked ? 'User unblocked' : 'User blocked',
                });
                fetchUsers();
            } else {
                setAlert({ type: 'error', message: 'Failed to update user' });
            }
        } catch {
            setAlert({ type: 'error', message: 'An error occurred' });
        }
        setTimeout(() => setAlert(null), 3000);
    };

    const handleDelete = async () => {
        if (!deleteId) return;
        setDeleting(true);
        try {
            const res = await adminFetch(`/api/admin/users/${deleteId}`, {
                method: 'DELETE',
            });
            if (res.ok) {
                setAlert({ type: 'success', message: 'User deleted' });
                fetchUsers();
            } else {
                const data = await res.json();
                setAlert({ type: 'error', message: data.error || 'Failed to delete user' });
            }
        } catch {
            setAlert({ type: 'error', message: 'An error occurred' });
        } finally {
            setDeleting(false);
            setDeleteId(null);
            setTimeout(() => setAlert(null), 3000);
        }
    };

    // Filter users by search
    const filteredUsers = (users || []).filter((user) =>
        (user.user_id || '').toLowerCase().includes(search.toLowerCase()) ||
        (user.role || '').toLowerCase().includes(search.toLowerCase())
    );

    if (authLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="flex min-h-screen bg-gray-50">
            <AdminSidebar />
            <div className="flex-1 flex flex-col min-w-0">
                <AdminTopbar />
                <main className="flex-1 p-6 overflow-auto">
                    {/* Alert */}
                    {alert && (
                        <div className={`mb-4 px-4 py-3 rounded-lg text-sm font-medium animate-slide-down ${alert.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-700 border border-red-200'
                            }`}>
                            {alert.message}
                        </div>
                    )}

                    {/* Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
                            <p className="text-gray-500 text-sm mt-1">{(users || []).length} users</p>
                        </div>
                    </div>

                    {/* Search */}
                    <div className="relative mb-4 max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search by user ID or role..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-400"
                        />
                    </div>

                    {/* Users Table */}
                    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-gray-100 bg-gray-50/50">
                                        <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">User ID</th>
                                        <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Role</th>
                                        <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                                        <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Joined</th>
                                        <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {loading ? (
                                        Array.from({ length: 5 }).map((_, i) => (
                                            <tr key={i} className="border-b border-gray-50">
                                                <td colSpan={5} className="px-4 py-4">
                                                    <div className="h-4 bg-gray-100 rounded animate-pulse" />
                                                </td>
                                            </tr>
                                        ))
                                    ) : filteredUsers.length === 0 ? (
                                        <tr>
                                            <td colSpan={5} className="text-center py-12 text-gray-400">
                                                No users found
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredUsers.map((user) => {
                                            const isSelf = user.user_id === adminUser?.id;
                                            return (
                                                <tr key={user.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                                                    <td className="px-4 py-3">
                                                        <div className="flex items-center gap-3">
                                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold ${user.role === 'admin'
                                                                ? 'bg-gradient-to-br from-orange-500 to-red-500'
                                                                : 'bg-gradient-to-br from-blue-500 to-indigo-500'
                                                                }`}>
                                                                {user.user_id.charAt(0).toUpperCase()}
                                                            </div>
                                                            <div>
                                                                <p className="font-mono text-xs text-gray-600">
                                                                    {user.user_id.slice(0, 12)}...
                                                                </p>
                                                                {isSelf && (
                                                                    <span className="text-xs text-orange-600 font-medium">(You)</span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <select
                                                            value={user.role}
                                                            onChange={(e) => handleRoleChange(user, e.target.value as 'admin' | 'user')}
                                                            disabled={isSelf}
                                                            className={`text-xs font-medium border rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-orange-500/30 ${user.role === 'admin'
                                                                ? 'border-orange-200 bg-orange-50 text-orange-700'
                                                                : 'border-gray-200 bg-white text-gray-700'
                                                                } ${isSelf ? 'opacity-50 cursor-not-allowed' : ''}`}
                                                        >
                                                            <option value="user">User</option>
                                                            <option value="admin">Admin</option>
                                                        </select>
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        {user.is_blocked ? (
                                                            <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-semibold rounded-full bg-red-50 text-red-700 border border-red-200">
                                                                <Ban className="h-3 w-3" /> Blocked
                                                            </span>
                                                        ) : (
                                                            <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-semibold rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                                                                <UserCheck className="h-3 w-3" /> Active
                                                            </span>
                                                        )}
                                                    </td>
                                                    <td className="px-4 py-3 text-xs text-gray-500">
                                                        {new Date(user.created_at).toLocaleDateString()}
                                                    </td>
                                                    <td className="px-4 py-3 text-right">
                                                        <div className="flex items-center justify-end gap-1">
                                                            <button
                                                                onClick={() => handleBlock(user)}
                                                                disabled={isSelf}
                                                                className={`p-1.5 rounded-lg transition-colors ${isSelf
                                                                    ? 'opacity-30 cursor-not-allowed text-gray-300'
                                                                    : user.is_blocked
                                                                        ? 'text-gray-400 hover:text-emerald-600 hover:bg-emerald-50'
                                                                        : 'text-gray-400 hover:text-amber-600 hover:bg-amber-50'
                                                                    }`}
                                                                title={user.is_blocked ? 'Unblock user' : 'Block user'}
                                                            >
                                                                {user.is_blocked ? <ShieldOff className="h-4 w-4" /> : <Shield className="h-4 w-4" />}
                                                            </button>
                                                            <button
                                                                onClick={() => setDeleteId(user.id)}
                                                                disabled={isSelf}
                                                                className={`p-1.5 rounded-lg transition-colors ${isSelf
                                                                    ? 'opacity-30 cursor-not-allowed text-gray-300'
                                                                    : 'text-gray-400 hover:text-red-600 hover:bg-red-50'
                                                                    }`}
                                                                title={isSelf ? 'Cannot delete yourself' : 'Delete user'}
                                                            >
                                                                <Trash2 className="h-4 w-4" />
                                                            </button>
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
                </main>
            </div>

            <ConfirmModal
                isOpen={!!deleteId}
                title="Delete User"
                message="Are you sure you want to delete this user? This action cannot be undone."
                confirmLabel="Delete"
                variant="danger"
                loading={deleting}
                onConfirm={handleDelete}
                onCancel={() => setDeleteId(null)}
            />
        </div>
    );
}

export default function AdminUsersPage() {
    return (
        <AdminAuthProvider>
            <UsersContent />
        </AdminAuthProvider>
    );
}
