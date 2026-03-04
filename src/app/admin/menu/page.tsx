'use client';

import { useEffect, useState, useCallback } from 'react';
import { AdminAuthProvider, useAdminAuth } from '@/components/admin/AdminAuthProvider';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { AdminTopbar } from '@/components/admin/AdminTopbar';
import { ConfirmModal } from '@/components/admin/ConfirmModal';
import { ImageUpload } from '@/components/admin/ImageUpload';
import { Plus, Pencil, Trash2, X, Check, XCircle } from 'lucide-react';
import type { MenuItem } from '@/types/types';

interface MenuFormData {
    restaurant_id: string;
    category_id: string;
    name: string;
    description: string;
    price: number;
    image_url: string;
    is_veg: boolean;
    is_available: boolean;
}

const defaultForm: MenuFormData = {
    restaurant_id: '',
    category_id: '',
    name: '',
    description: '',
    price: 0,
    image_url: '',
    is_veg: false,
    is_available: true,
};

function MenuContent() {
    const { adminUser, loading: authLoading, adminFetch } = useAdminAuth();
    const [items, setItems] = useState<MenuItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editItem, setEditItem] = useState<MenuItem | null>(null);
    const [form, setForm] = useState<MenuFormData>(defaultForm);
    const [saving, setSaving] = useState(false);
    const [deleteId, setDeleteId] = useState<string | null>(null);
    const [deleting, setDeleting] = useState(false);
    const [restaurants, setRestaurants] = useState<{ id: string; name: string }[]>([]);
    const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
    const [alert, setAlert] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

    const fetchItems = useCallback(async () => {
        try {
            setLoading(true);
            const res = await adminFetch('/api/admin/menu');
            if (!res.ok) {
                throw new Error("API request failed");
            }
            const json = await res.json();
            setItems(json?.data || []);
        } catch (error) {
            console.error('Failed to fetch menu:', error);
        } finally {
            setLoading(false);
        }
    }, [adminFetch]);

    const fetchRestaurants = useCallback(async () => {
        try {
            const res = await adminFetch('/api/restaurants');
            if (res.ok) {
                const data = await res.json();
                setRestaurants(Array.isArray(data) ? data : data.restaurants || []);
            }
        } catch (error) {
            console.error('Failed to fetch restaurants:', error);
        }
    }, [adminFetch]);

    useEffect(() => {
        if (!adminUser) return;
        fetchItems();
        fetchRestaurants();
    }, [adminUser, fetchItems, fetchRestaurants]);

    const openAddForm = () => {
        setEditItem(null);
        setForm(defaultForm);
        setShowForm(true);
    };

    const openEditForm = (item: MenuItem) => {
        setEditItem(item);
        setForm({
            restaurant_id: item.restaurant_id || '',
            category_id: item.category_id || '',
            name: item.name,
            description: item.description || '',
            price: item.price,
            image_url: item.image_url || '',
            is_veg: item.is_veg || false,
            is_available: item.is_available,
        });
        setShowForm(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);

        try {
            const url = editItem ? `/api/admin/menu/${editItem.id}` : '/api/admin/menu';
            const method = editItem ? 'PATCH' : 'POST';

            const body: Record<string, unknown> = {
                name: form.name,
                description: form.description || null,
                price: form.price,
                image_url: form.image_url || null,
                is_veg: form.is_veg,
                is_available: form.is_available,
            };

            if (form.restaurant_id) body.restaurant_id = form.restaurant_id;
            if (form.category_id) body.category_id = form.category_id;

            const res = await adminFetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            });

            if (res.ok) {
                setAlert({ type: 'success', message: editItem ? 'Menu item updated' : 'Menu item added' });
                setShowForm(false);
                fetchItems();
            } else {
                const data = await res.json();
                setAlert({ type: 'error', message: data.error || 'Failed to save' });
            }
        } catch {
            setAlert({ type: 'error', message: 'An error occurred' });
        } finally {
            setSaving(false);
            setTimeout(() => setAlert(null), 3000);
        }
    };

    const handleDelete = async () => {
        if (!deleteId) return;
        setDeleting(true);
        try {
            const res = await adminFetch(`/api/admin/menu/${deleteId}`, {
                method: 'DELETE',
            });
            if (res.ok) {
                setAlert({ type: 'success', message: 'Menu item deleted' });
                fetchItems();
            } else {
                setAlert({ type: 'error', message: 'Failed to delete' });
            }
        } catch {
            setAlert({ type: 'error', message: 'An error occurred' });
        } finally {
            setDeleting(false);
            setDeleteId(null);
            setTimeout(() => setAlert(null), 3000);
        }
    };

    const toggleAvailability = async (item: MenuItem) => {
        try {
            const res = await adminFetch(`/api/admin/menu/${item.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ is_available: !item.is_available }),
            });
            if (res.ok) {
                fetchItems();
            }
        } catch (error) {
            console.error('Toggle availability error:', error);
        }
    };

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
                            <h1 className="text-2xl font-bold text-gray-900">Menu Management</h1>
                            <p className="text-gray-500 text-sm mt-1">{(items || []).length} items</p>
                        </div>
                        <button
                            onClick={openAddForm}
                            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg text-sm font-medium shadow-lg shadow-orange-500/20 hover:shadow-orange-500/30 transition-all hover:scale-[1.02]"
                        >
                            <Plus className="h-4 w-4" />
                            Add Item
                        </button>
                    </div>

                    {/* Grid of items */}
                    {loading ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {[1, 2, 3, 4, 5, 6].map((i) => (
                                <div key={i} className="bg-white rounded-xl border border-gray-100 p-4 animate-pulse">
                                    <div className="h-32 bg-gray-100 rounded-lg mb-3" />
                                    <div className="h-4 bg-gray-100 rounded w-3/4 mb-2" />
                                    <div className="h-4 bg-gray-100 rounded w-1/2" />
                                </div>
                            ))}
                        </div>
                    ) : (items || []).length === 0 ? (
                        <div className="text-center py-16">
                            <p className="text-gray-400">No menu items yet. Click &quot;Add Item&quot; to get started.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {(items || []).map((item) => (
                                <div key={item.id} className="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-md transition-shadow group">
                                    {/* Image */}
                                    <div className="h-36 bg-gray-100 relative overflow-hidden">
                                        {item.image_url ? (
                                            <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-gray-300">
                                                <span className="text-4xl">🍽️</span>
                                            </div>
                                        )}
                                        {/* Availability badge */}
                                        <span className={`absolute top-2 right-2 px-2 py-0.5 text-xs font-semibold rounded-full ${item.is_available
                                            ? 'bg-emerald-100 text-emerald-700'
                                            : 'bg-red-100 text-red-700'
                                            }`}>
                                            {item.is_available ? 'Available' : 'Unavailable'}
                                        </span>
                                        {item.is_veg && (
                                            <span className="absolute top-2 left-2 px-2 py-0.5 text-xs font-semibold rounded-full bg-green-100 text-green-700">
                                                Veg
                                            </span>
                                        )}
                                    </div>

                                    {/* Content */}
                                    <div className="p-4">
                                        <div className="flex items-start justify-between gap-2">
                                            <div className="flex-1 min-w-0">
                                                <h3 className="font-semibold text-gray-900 truncate">{item.name}</h3>
                                                {item.description && (
                                                    <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{item.description}</p>
                                                )}
                                            </div>
                                            <span className="text-lg font-bold text-orange-600">₹{Number(item.price).toFixed(2)}</span>
                                        </div>

                                        {/* Category */}
                                        {item.menu_categories && (
                                            <p className="text-xs text-gray-400 mt-2">
                                                Category: {Array.isArray(item.menu_categories) ? item.menu_categories[0]?.name : item.menu_categories?.name}
                                            </p>
                                        )}

                                        {/* Actions */}
                                        <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-50">
                                            <button
                                                onClick={() => toggleAvailability(item)}
                                                className={`flex-1 flex items-center justify-center gap-1 px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${item.is_available
                                                    ? 'border-red-200 text-red-600 hover:bg-red-50'
                                                    : 'border-emerald-200 text-emerald-600 hover:bg-emerald-50'
                                                    }`}
                                            >
                                                {item.is_available ? (
                                                    <><XCircle className="h-3 w-3" /> Disable</>
                                                ) : (
                                                    <><Check className="h-3 w-3" /> Enable</>
                                                )}
                                            </button>
                                            <button
                                                onClick={() => openEditForm(item)}
                                                className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                            >
                                                <Pencil className="h-4 w-4" />
                                            </button>
                                            <button
                                                onClick={() => setDeleteId(item.id)}
                                                className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </main>
            </div>

            {/* Add/Edit Modal */}
            {showForm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowForm(false)} />
                    <div className="relative bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6 animate-scale-in">
                        <button
                            onClick={() => setShowForm(false)}
                            className="absolute top-4 right-4 p-1 text-gray-400 hover:text-gray-600"
                        >
                            <X className="h-5 w-5" />
                        </button>

                        <h2 className="text-lg font-bold text-gray-900 mb-4">
                            {editItem ? 'Edit Menu Item' : 'Add Menu Item'}
                        </h2>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                                <input
                                    type="text"
                                    value={form.name}
                                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                                    required
                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-400 text-sm"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                <textarea
                                    value={form.description}
                                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                                    rows={2}
                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-400 text-sm resize-none"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Price (₹) *</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        value={form.price}
                                        onChange={(e) => setForm({ ...form, price: parseFloat(e.target.value) || 0 })}
                                        required
                                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-400 text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Restaurant *</label>
                                    <select
                                        value={form.restaurant_id}
                                        onChange={(e) => setForm({ ...form, restaurant_id: e.target.value })}
                                        required
                                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-400 text-sm"
                                    >
                                        <option value="">Select...</option>
                                        {restaurants.map((r) => (
                                            <option key={r.id} value={r.id}>{r.name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="flex items-center gap-6">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={form.is_veg}
                                        onChange={(e) => setForm({ ...form, is_veg: e.target.checked })}
                                        className="w-4 h-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                                    />
                                    <span className="text-sm text-gray-700">Vegetarian</span>
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={form.is_available}
                                        onChange={(e) => setForm({ ...form, is_available: e.target.checked })}
                                        className="w-4 h-4 rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                                    />
                                    <span className="text-sm text-gray-700">Available</span>
                                </label>
                            </div>

                            <ImageUpload
                                currentUrl={form.image_url}
                                onUpload={(url) => setForm({ ...form, image_url: url })}
                                label="Item Image"
                                fetchFn={adminFetch}
                            />

                            <div className="flex gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setShowForm(false)}
                                    className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="flex-1 px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-orange-500 to-red-500 rounded-lg shadow-lg shadow-orange-500/20 disabled:opacity-50 transition-all hover:scale-[1.02]"
                                >
                                    {saving ? 'Saving...' : editItem ? 'Update' : 'Add Item'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <ConfirmModal
                isOpen={!!deleteId}
                title="Delete Menu Item"
                message="Are you sure you want to delete this menu item? This action cannot be undone."
                confirmLabel="Delete"
                variant="danger"
                loading={deleting}
                onConfirm={handleDelete}
                onCancel={() => setDeleteId(null)}
            />
        </div>
    );
}

export default function AdminMenuPage() {
    return (
        <AdminAuthProvider>
            <MenuContent />
        </AdminAuthProvider>
    );
}
