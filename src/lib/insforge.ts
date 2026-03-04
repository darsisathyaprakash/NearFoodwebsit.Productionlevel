import { createClient } from '@insforge/sdk';

const INSFORGE_URL = process.env.NEXT_PUBLIC_INSFORGE_BASE_URL;
const INSFORGE_ANON_KEY = process.env.NEXT_PUBLIC_INSFORGE_ANON_KEY;

if (!INSFORGE_URL || !INSFORGE_ANON_KEY) {
    console.warn(
        '[insforge] Missing environment variables: NEXT_PUBLIC_INSFORGE_BASE_URL or NEXT_PUBLIC_INSFORGE_ANON_KEY. ' +
        'The client will not function correctly until these are set.'
    );
}

// Single singleton instance for client-side usage
export const insforge = createClient({
    baseUrl: INSFORGE_URL || '',
    anonKey: INSFORGE_ANON_KEY || '',
});
