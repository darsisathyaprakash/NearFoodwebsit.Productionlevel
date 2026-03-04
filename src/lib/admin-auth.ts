// Server-side admin authentication helper
// Verifies the current user has admin role
import { headers } from 'next/headers';
import { adminClient } from './admin-client';

const INSFORGE_URL = process.env.NEXT_PUBLIC_INSFORGE_BASE_URL || '';

export interface AdminAuthResult {
    isAdmin: boolean;
    userId: string | null;
    user?: { id: string; email: string; name?: string };
    error?: string;
}

/**
 * Verify that the current request is from an authenticated admin user.
 * Reads the Bearer token from the Authorization header, validates it
 * with the InsForge backend, then checks user_profiles for admin role.
 */
export async function verifyAdmin(): Promise<AdminAuthResult> {
    try {
        // 1. Get the access token from the Authorization header
        const headersList = await headers();
        const authHeader = headersList.get('Authorization');

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return { isAdmin: false, userId: null, error: 'Not authenticated' };
        }

        const accessToken = authHeader.replace('Bearer ', '');

        // 2. Validate the token with the InsForge backend
        const response = await fetch(`${INSFORGE_URL}/api/auth/sessions/current`, {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
            },
        });

        if (!response.ok) {
            return { isAdmin: false, userId: null, error: 'Not authenticated' };
        }

        const userData = await response.json();
        // Response shape: { user: { id, email, role } }
        const user = userData?.user || userData;
        const userId = user?.id;
        const userEmail = user?.email;
        const userName = user?.profile?.name || userEmail?.split('@')[0];

        if (!userId) {
            return { isAdmin: false, userId: null, error: 'Not authenticated' };
        }

        // 3. Check if user has admin role in user_profiles table
        const { data: profile, error: profileError } = await adminClient.database
            .from('user_profiles')
            .select('role, is_blocked')
            .eq('user_id', userId)
            .maybeSingle();

        if (profileError) {
            console.error('Error checking admin role:', profileError);
            return { isAdmin: false, userId, error: 'Failed to verify role' };
        }

        // If no profile exists, user is not an admin
        if (!profile) {
            return { isAdmin: false, userId, error: 'No admin profile' };
        }

        // Check if blocked
        if (profile.is_blocked) {
            return { isAdmin: false, userId, error: 'Account is blocked' };
        }

        // Check admin role
        if (profile.role !== 'admin') {
            return { isAdmin: false, userId, error: 'Insufficient permissions' };
        }

        return {
            isAdmin: true,
            userId,
            user: { id: userId, email: userEmail, name: userName },
        };
    } catch (error) {
        console.error('Admin auth verification error:', error);
        return { isAdmin: false, userId: null, error: 'Authentication failed' };
    }
}

/**
 * Log an admin action to the audit_logs table
 */
export async function logAdminAction(
    adminUserId: string,
    action: string,
    entityType: string,
    entityId?: string,
    details?: Record<string, unknown>
): Promise<void> {
    try {
        await adminClient.database
            .from('audit_logs')
            .insert({
                admin_user_id: adminUserId,
                action,
                entity_type: entityType,
                entity_id: entityId || null,
                details: details || {},
            });
    } catch (error) {
        // Log the error but don't fail the main operation
        console.error('Failed to log admin action:', error);
    }
}
