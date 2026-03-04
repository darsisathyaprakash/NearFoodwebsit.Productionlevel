// Admin image upload API
// POST: Upload image to InsForge storage
import { NextRequest, NextResponse } from 'next/server';
import { verifyAdmin } from '@/lib/admin-auth';
import { adminClient } from '@/lib/admin-client';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
    try {
        const auth = await verifyAdmin();
        if (!auth.isAdmin) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const formData = await request.formData();
        const file = formData.get('file') as File;

        if (!file) {
            return NextResponse.json({ error: 'No file provided' }, { status: 400 });
        }

        // Validate file type
        const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
        if (!allowedTypes.includes(file.type)) {
            return NextResponse.json(
                { error: 'Invalid file type. Only JPEG, PNG, WebP, and GIF are allowed.' },
                { status: 400 }
            );
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            return NextResponse.json(
                { error: 'File too large. Maximum size is 5MB.' },
                { status: 400 }
            );
        }

        // Upload to InsForge storage
        const { data, error } = await adminClient.storage
            .from('admin-images')
            .uploadAuto(file);

        if (error || !data) {
            console.error('Image upload error:', error);
            return NextResponse.json({ error: 'Failed to upload image' }, { status: 500 });
        }

        return NextResponse.json({
            url: data.url,
            key: data.key,
        });
    } catch (error) {
        console.error('Upload error:', error);
        return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
    }
}
