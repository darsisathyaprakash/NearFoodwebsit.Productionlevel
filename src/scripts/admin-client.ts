import { createClient } from '@insforge/sdk';
import { config } from 'dotenv';
import { join } from 'path';

// Load environment variables from .env
config({ path: join(process.cwd(), '.env') });

const INSFORGE_URL = process.env.NEXT_PUBLIC_INSFORGE_BASE_URL;
const INSFORGE_SERVICE_KEY = process.env.INSFORGE_API_KEY;

if (!INSFORGE_URL || !INSFORGE_SERVICE_KEY) {
    throw new Error(
        'Missing required environment variables: NEXT_PUBLIC_INSFORGE_BASE_URL, INSFORGE_API_KEY'
    );
}

export const adminClient = createClient({
    baseUrl: INSFORGE_URL,
    // apiKey: INSFORGE_SERVICE_KEY, // Removed invalid property
    // In Supabase/InsForge SDK, usually 'apiKey' or just passing it works.
    // If it expects 'anonKey', we can pass service key there too as it's just a JWT.
    anonKey: INSFORGE_SERVICE_KEY
});
