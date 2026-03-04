'use client';

import { useEffect, useState, useCallback } from 'react';
import { AdminAuthProvider, useAdminAuth } from '@/components/admin/AdminAuthProvider';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { AdminTopbar } from '@/components/admin/AdminTopbar';
import { ImageUpload } from '@/components/admin/ImageUpload';
import { Save, Store } from 'lucide-react';
import type { SiteSettings } from '@/types/types';

function SettingsContent() {
    const { adminUser, loading: authLoading, adminFetch } = useAdminAuth();
    const [settings, setSettings] = useState<SiteSettings | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [form, setForm] = useState({
        restaurant_name: '',
        logo_url: '',
        contact_email: '',
        phone: '',
        delivery_charge: 2.99,
    });
    const [alert, setAlert] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

    const fetchSettings = useCallback(async () => {
        try {
            setLoading(true);
            const res = await adminFetch('/api/admin/settings');
            if (!res.ok) {
                throw new Error("API request failed");
            }
            const json = await res.json();
            setSettings(json?.data || null);
            setForm({
                restaurant_name: json?.data?.restaurant_name || '',
                logo_url: json?.data?.logo_url || '',
                contact_email: json?.data?.contact_email || '',
                phone: json?.data?.phone || '',
                delivery_charge: json?.data?.delivery_charge ?? 2.99,
            });
        } catch (error) {
            console.error('Failed to fetch settings:', error);
        } finally {
            setLoading(false);
        }
    }, [adminFetch]);

    useEffect(() => {
        if (!adminUser) return;
        fetchSettings();
    }, [adminUser, fetchSettings]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);

        try {
            const res = await adminFetch('/api/admin/settings', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form),
            });

            if (res.ok) {
                const json = await res.json();
                setSettings(json?.data || null);
                setAlert({ type: 'success', message: 'Settings saved successfully!' });
            } else {
                const data = await res.json();
                setAlert({ type: 'error', message: data.error || 'Failed to save settings' });
            }
        } catch {
            setAlert({ type: 'error', message: 'An error occurred' });
        } finally {
            setSaving(false);
            setTimeout(() => setAlert(null), 3000);
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
                    <div className="mb-6">
                        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
                        <p className="text-gray-500 text-sm mt-1">Manage your restaurant and app settings</p>
                    </div>

                    {loading ? (
                        <div className="max-w-2xl space-y-4">
                            {[1, 2, 3, 4].map((i) => (
                                <div key={i} className="h-16 bg-white rounded-lg border border-gray-100 animate-pulse" />
                            ))}
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
                            {/* Restaurant Info Card */}
                            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="p-2 bg-orange-50 rounded-lg">
                                        <Store className="h-5 w-5 text-orange-600" />
                                    </div>
                                    <h2 className="text-lg font-semibold text-gray-900">Restaurant Information</h2>
                                </div>

                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Restaurant Name
                                        </label>
                                        <input
                                            type="text"
                                            value={form.restaurant_name}
                                            onChange={(e) => setForm({ ...form, restaurant_name: e.target.value })}
                                            required
                                            className="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-400 text-sm"
                                        />
                                    </div>

                                    <ImageUpload
                                        currentUrl={form.logo_url}
                                        onUpload={(url) => setForm({ ...form, logo_url: url })}
                                        label="Restaurant Logo"
                                        fetchFn={adminFetch}
                                    />

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Contact Email
                                            </label>
                                            <input
                                                type="email"
                                                value={form.contact_email}
                                                onChange={(e) => setForm({ ...form, contact_email: e.target.value })}
                                                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-400 text-sm"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Phone Number
                                            </label>
                                            <input
                                                type="tel"
                                                value={form.phone}
                                                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                                                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-400 text-sm"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Delivery Charge ($)
                                        </label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            min="0"
                                            value={form.delivery_charge}
                                            onChange={(e) => setForm({ ...form, delivery_charge: parseFloat(e.target.value) || 0 })}
                                            className="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-400 text-sm max-w-[200px]"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Save Button */}
                            <div className="flex justify-end">
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-orange-500 to-red-500 text-white font-semibold rounded-lg shadow-lg shadow-orange-500/20 disabled:opacity-50 transition-all hover:scale-[1.02] hover:shadow-orange-500/30"
                                >
                                    {saving ? (
                                        <>
                                            <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                            </svg>
                                            Saving...
                                        </>
                                    ) : (
                                        <>
                                            <Save className="h-4 w-4" />
                                            Save Settings
                                        </>
                                    )}
                                </button>
                            </div>

                            {/* Last updated */}
                            {settings?.updated_at && (
                                <p className="text-xs text-gray-400 text-right">
                                    Last updated: {new Date(settings.updated_at).toLocaleString()}
                                </p>
                            )}
                        </form>
                    )}
                </main>
            </div>
        </div>
    );
}

export default function AdminSettingsPage() {
    return (
        <AdminAuthProvider>
            <SettingsContent />
        </AdminAuthProvider>
    );
}
