import { createClient } from '@insforge/sdk';
import { cookies, headers } from 'next/headers';

const INSFORGE_URL = process.env.NEXT_PUBLIC_INSFORGE_BASE_URL;
const INSFORGE_ANON_KEY = process.env.NEXT_PUBLIC_INSFORGE_ANON_KEY;

if (!INSFORGE_URL || !INSFORGE_ANON_KEY) {
    console.warn(
        '[server-client] Missing environment variables: NEXT_PUBLIC_INSFORGE_BASE_URL or NEXT_PUBLIC_INSFORGE_ANON_KEY. ' +
        'Server client will not function correctly until these are set.'
    );
}

export async function createServerClient() {
    const headersList = await headers();
    const cookieStore = await cookies();

    // Get authorization from header or cookie
    const authHeader = headersList.get('Authorization');

    // Forward all cookies for session management
    const cookieHeader = cookieStore.getAll()
        .map(cookie => `${cookie.name}=${cookie.value}`)
        .join('; ');

    return createClient({
        baseUrl: INSFORGE_URL || '',
        anonKey: INSFORGE_ANON_KEY || '',
        headers: {
            ...(authHeader ? { Authorization: authHeader } : {}),
            ...(cookieHeader ? { Cookie: cookieHeader } : {}),
        },
    });
}
