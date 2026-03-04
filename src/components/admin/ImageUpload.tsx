'use client';

import { useRef, useState } from 'react';
import { Upload, X, Image as ImageIcon } from 'lucide-react';

interface ImageUploadProps {
    currentUrl?: string | null;
    onUpload: (url: string) => void;
    label?: string;
    /** Optional authenticated fetch function (e.g. adminFetch) */
    fetchFn?: (url: string, init?: RequestInit) => Promise<Response>;
}

export function ImageUpload({ currentUrl, onUpload, label = 'Upload Image', fetchFn }: ImageUploadProps) {
    const [uploading, setUploading] = useState(false);
    const [preview, setPreview] = useState<string | null>(currentUrl || null);
    const [error, setError] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setError('');
        setUploading(true);

        // Preview
        const reader = new FileReader();
        reader.onload = () => setPreview(reader.result as string);
        reader.readAsDataURL(file);

        try {
            const formData = new FormData();
            formData.append('file', file);

            const doFetch = fetchFn || ((url: string, init?: RequestInit) => fetch(url, init));
            const res = await doFetch('/api/admin/upload', {
                method: 'POST',
                body: formData,
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.error || 'Upload failed');
                setPreview(currentUrl || null);
            } else {
                onUpload(data.url);
            }
        } catch {
            setError('Upload failed');
            setPreview(currentUrl || null);
        } finally {
            setUploading(false);
        }
    };

    const handleRemove = () => {
        setPreview(null);
        onUpload('');
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    return (
        <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>

            {preview ? (
                <div className="relative group">
                    <img
                        src={preview}
                        alt="Preview"
                        className="w-full h-40 object-cover rounded-lg border border-gray-200"
                    />
                    <button
                        type="button"
                        onClick={handleRemove}
                        className="absolute top-2 right-2 p-1 bg-black/50 rounded-full text-white hover:bg-black/70 transition-colors opacity-0 group-hover:opacity-100"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>
            ) : (
                <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    className="w-full h-40 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center gap-2 text-gray-400 hover:border-orange-400 hover:text-orange-500 transition-colors disabled:opacity-50"
                >
                    {uploading ? (
                        <>
                            <svg className="animate-spin h-8 w-8" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                            </svg>
                            <span className="text-sm">Uploading...</span>
                        </>
                    ) : (
                        <>
                            <Upload className="h-8 w-8" />
                            <span className="text-sm">Click to upload</span>
                            <span className="text-xs">JPEG, PNG, WebP, GIF (max 5MB)</span>
                        </>
                    )}
                </button>
            )}

            <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                onChange={handleUpload}
                className="hidden"
            />

            {error && (
                <p className="mt-2 text-sm text-red-500">{error}</p>
            )}
        </div>
    );
}
