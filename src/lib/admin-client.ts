// Admin-specific InsForge client using the admin API key
// This client bypasses RLS and has full access to all tables
import { createClient } from '@insforge/sdk';

const INSFORGE_URL = process.env.NEXT_PUBLIC_INSFORGE_BASE_URL;
const INSFORGE_API_KEY = process.env.INSFORGE_API_KEY;

if (!INSFORGE_URL) {
    console.warn('[admin-client] Missing NEXT_PUBLIC_INSFORGE_BASE_URL environment variable.');
}

if (!INSFORGE_API_KEY) {
    console.warn('[admin-client] Missing INSFORGE_API_KEY environment variable.');
}

// Admin client with API key for full database access (server-side only)
export const adminClient = createClient({
    baseUrl: INSFORGE_URL || '',
    anonKey: INSFORGE_API_KEY || '',
});
