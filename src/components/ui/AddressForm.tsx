'use client';

import { useState, useEffect, useCallback } from 'react';
import { MapPin, Plus, Edit2, Trash2, Check, X } from 'lucide-react';
import { useToast } from './Toast';
import { insforge } from '@/lib/insforge';

export interface UserAddress {
    id: string;
    user_id: string;
    address_line1: string;
    address_line2: string;
    city: string;
    state: string;
    postal_code: string;
    country: string;
    phone: string;
    is_default: boolean;
    created_at: string;
    updated_at: string;
}

interface AddressFormProps {
    isOpen: boolean;
    onClose: () => void;
    onSelectAddress: (address: UserAddress) => void;
}

export function AddressForm({ isOpen, onClose, onSelectAddress }: AddressFormProps) {
    const [addresses, setAddresses] = useState<UserAddress[]>([]);
    const [loading, setLoading] = useState(false);
    const [showAddForm, setShowAddForm] = useState(false);
    const [editingAddress, setEditingAddress] = useState<UserAddress | null>(null);
    const { showToast } = useToast();

    const [formData, setFormData] = useState({
        address_line1: '',
        address_line2: '',
        city: '',
        state: '',
        postal_code: '',
        country: 'India',
        phone: '',
        is_default: false,
    });

    const fetchAddresses = useCallback(async () => {
        try {
            setLoading(true);
            const { data: sessionData } = await insforge.auth.getCurrentSession();
            if (!sessionData?.session?.user) {
                showToast('Please log in to manage addresses', 'error');
                return;
            }

            const { data, error } = await insforge.database
                .from('user_addresses')
                .select('*')
                .eq('user_id', sessionData.session.user.id)
                .order('is_default', { ascending: false })
                .order('created_at', { ascending: false });

            if (error) throw error;
            setAddresses(data || []);
        } catch (error: any) {
            console.error('Error fetching addresses:', error);
            showToast('Failed to load addresses', 'error');
        } finally {
            setLoading(false);
        }
    }, [showToast]);

    useEffect(() => {
        if (isOpen) {
            fetchAddresses();
        }
    }, [isOpen, fetchAddresses]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const { data: sessionData } = await insforge.auth.getCurrentSession();
            if (!sessionData?.session?.user) {
                showToast('Please log in to save address', 'error');
                return;
            }

            const payload = {
                user_id: sessionData.session.user.id,
                ...formData,
            };

            let result;
            if (editingAddress) {
                result = await insforge.database
                    .from('user_addresses')
                    .update(payload)
                    .eq('id', editingAddress.id)
                    .select()
                    .single();
            } else {
                result = await insforge.database
                    .from('user_addresses')
                    .insert(payload)
                    .select()
                    .single();
            }

            if (result.error) throw result.error;

            showToast(editingAddress ? 'Address updated successfully' : 'Address added successfully', 'success');
            setShowAddForm(false);
            setEditingAddress(null);
            resetForm();
            fetchAddresses();
        } catch (error: any) {
            console.error('Error saving address:', error);
            showToast('Failed to save address', 'error');
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this address?')) return;

        try {
            const { error } = await insforge.database
                .from('user_addresses')
                .delete()
                .eq('id', id);

            if (error) throw error;
            showToast('Address deleted successfully', 'success');
            fetchAddresses();
        } catch (error: any) {
            console.error('Error deleting address:', error);
            showToast('Failed to delete address', 'error');
        }
    };

    const handleSetDefault = async (id: string) => {
        try {
            const { error } = await insforge.database
                .from('user_addresses')
                .update({ is_default: true })
                .eq('id', id);

            if (error) throw error;
            showToast('Default address updated', 'success');
            fetchAddresses();
        } catch (error: any) {
            console.error('Error setting default address:', error);
            showToast('Failed to update default address', 'error');
        }
    };

    const handleEdit = (address: UserAddress) => {
        setEditingAddress(address);
        setFormData({
            address_line1: address.address_line1,
            address_line2: address.address_line2 || '',
            city: address.city,
            state: address.state,
            postal_code: address.postal_code,
            country: address.country,
            phone: address.phone,
            is_default: address.is_default,
        });
        setShowAddForm(true);
    };

    const resetForm = () => {
        setFormData({
            address_line1: '',
            address_line2: '',
            city: '',
            state: '',
            postal_code: '',
            country: 'India',
            phone: '',
            is_default: false,
        });
    };

    const handleSelectAddress = (address: UserAddress) => {
        onSelectAddress(address);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-page-enter"
                onClick={onClose}
            />

            {/* Modal Content */}
            <div className="relative bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-scale-in">
                {/* Header */}
                <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-6 text-white">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <MapPin className="w-6 h-6" />
                            <h2 className="text-2xl font-bold">Delivery Address</h2>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-white/20 rounded-full transition-colors"
                        >
                            <X className="w-6 h-6" />
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="p-6">
                    {showAddForm ? (
                        /* Add/Edit Address Form */
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h3 className="text-xl font-bold text-gray-900">
                                    {editingAddress ? 'Edit Address' : 'Add New Address'}
                                </h3>
                                <button
                                    onClick={() => {
                                        setShowAddForm(false);
                                        setEditingAddress(null);
                                        resetForm();
                                    }}
                                    className="text-gray-500 hover:text-gray-700"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Address Line 1 *
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.address_line1}
                                        onChange={(e) => setFormData({ ...formData, address_line1: e.target.value })}
                                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                        placeholder="House/Flat No., Street, Area"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Address Line 2
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.address_line2}
                                        onChange={(e) => setFormData({ ...formData, address_line2: e.target.value })}
                                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                        placeholder="Landmark (optional)"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            City *
                                        </label>
                                        <input
                                            type="text"
                                            required
                                            value={formData.city}
                                            onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                            placeholder="City"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            State *
                                        </label>
                                        <input
                                            type="text"
                                            required
                                            value={formData.state}
                                            onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                            placeholder="State"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Postal Code *
                                        </label>
                                        <input
                                            type="text"
                                            required
                                            value={formData.postal_code}
                                            onChange={(e) => setFormData({ ...formData, postal_code: e.target.value })}
                                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                            placeholder="PIN Code"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Country *
                                        </label>
                                        <input
                                            type="text"
                                            required
                                            value={formData.country}
                                            onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                            placeholder="Country"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Phone Number *
                                    </label>
                                    <input
                                        type="tel"
                                        required
                                        value={formData.phone}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                        placeholder="10-digit mobile number"
                                    />
                                </div>

                                <div className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        id="is_default"
                                        checked={formData.is_default}
                                        onChange={(e) => setFormData({ ...formData, is_default: e.target.checked })}
                                        className="w-5 h-5 text-orange-600 rounded focus:ring-orange-500"
                                    />
                                    <label htmlFor="is_default" className="text-sm text-gray-700">
                                        Set as default address
                                    </label>
                                </div>

                                <div className="flex gap-3 pt-2">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setShowAddForm(false);
                                            setEditingAddress(null);
                                            resetForm();
                                        }}
                                        className="flex-1 px-4 py-3 border border-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="flex-1 px-4 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-semibold rounded-xl hover:from-orange-600 hover:to-orange-700 transition-all"
                                    >
                                        {editingAddress ? 'Update Address' : 'Save Address'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    ) : (
                        /* Address List */
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h3 className="text-xl font-bold text-gray-900">Your Addresses</h3>
                                <button
                                    onClick={() => setShowAddForm(true)}
                                    className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-xl hover:bg-orange-600 transition-colors"
                                >
                                    <Plus className="w-4 h-4" />
                                    Add New
                                </button>
                            </div>

                            {loading ? (
                                <div className="text-center py-8 text-gray-500">Loading addresses...</div>
                            ) : addresses.length === 0 ? (
                                <div className="text-center py-8">
                                    <MapPin className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                                    <p className="text-gray-500 mb-4">No addresses saved yet</p>
                                    <button
                                        onClick={() => setShowAddForm(true)}
                                        className="px-6 py-3 bg-orange-500 text-white rounded-xl hover:bg-orange-600 transition-colors"
                                    >
                                        Add Your First Address
                                    </button>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {addresses.map((address) => (
                                        <div
                                            key={address.id}
                                            className={`border-2 rounded-xl p-4 transition-all ${address.is_default
                                                ? 'border-orange-500 bg-orange-50'
                                                : 'border-gray-200 hover:border-orange-300'
                                                }`}
                                        >
                                            <div className="flex items-start justify-between gap-4">
                                                <div className="flex-1">
                                                    {address.is_default && (
                                                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-orange-500 text-white text-xs font-semibold rounded-full mb-2">
                                                            <Check className="w-3 h-3" />
                                                            Default
                                                        </span>
                                                    )}
                                                    <p className="font-semibold text-gray-900">
                                                        {address.address_line1}
                                                    </p>
                                                    {address.address_line2 && (
                                                        <p className="text-gray-600">{address.address_line2}</p>
                                                    )}
                                                    <p className="text-gray-600">
                                                        {address.city}, {address.state} - {address.postal_code}
                                                    </p>
                                                    <p className="text-gray-600">{address.country}</p>
                                                    <p className="text-gray-600">📞 {address.phone}</p>
                                                </div>

                                                <div className="flex flex-col gap-2">
                                                    <button
                                                        onClick={() => handleSelectAddress(address)}
                                                        className="px-3 py-2 bg-orange-500 text-white text-sm font-semibold rounded-lg hover:bg-orange-600 transition-colors"
                                                    >
                                                        Select
                                                    </button>
                                                    <div className="flex gap-2">
                                                        <button
                                                            onClick={() => handleEdit(address)}
                                                            className="p-2 text-gray-500 hover:text-orange-500 hover:bg-orange-50 rounded-lg transition-colors"
                                                            title="Edit"
                                                        >
                                                            <Edit2 className="w-4 h-4" />
                                                        </button>
                                                        {!address.is_default && (
                                                            <button
                                                                onClick={() => handleSetDefault(address.id)}
                                                                className="p-2 text-gray-500 hover:text-green-500 hover:bg-green-50 rounded-lg transition-colors"
                                                                title="Set as default"
                                                            >
                                                                <Check className="w-4 h-4" />
                                                            </button>
                                                        )}
                                                        <button
                                                            onClick={() => handleDelete(address.id)}
                                                            className="p-2 text-gray-500 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                                            title="Delete"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default AddressForm;
