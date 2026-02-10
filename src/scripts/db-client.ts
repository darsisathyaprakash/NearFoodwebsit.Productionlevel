import { createClient } from '@insforge/sdk';
import { config } from 'dotenv';
import { join } from 'path';

// Load environment variables from .env
config({ path: join(process.cwd(), '.env') });

const INSFORGE_URL = process.env.NEXT_PUBLIC_INSFORGE_BASE_URL;
const INSFORGE_ANON_KEY = process.env.NEXT_PUBLIC_INSFORGE_ANON_KEY;

if (!INSFORGE_URL || !INSFORGE_ANON_KEY) {
    throw new Error(
        'Missing required environment variables: NEXT_PUBLIC_INSFORGE_BASE_URL, NEXT_PUBLIC_INSFORGE_ANON_KEY'
    );
}

export const dbClient = createClient({
    baseUrl: INSFORGE_URL,
    anonKey: INSFORGE_ANON_KEY,
});
