
import { createClient } from '@insforge/sdk';
import { config } from 'dotenv';
import { join } from 'path';

config({ path: join(process.cwd(), '.env') });

const client = createClient({
    baseUrl: process.env.NEXT_PUBLIC_INSFORGE_BASE_URL!,
    anonKey: process.env.INSFORGE_API_KEY || process.env.NEXT_PUBLIC_INSFORGE_ANON_KEY!,
});

console.log('Client keys:', Object.keys(client));
if (client.database) {
    console.log('Client.database keys:', Object.keys(client.database));
}
if (client.auth) {
    console.log('Client.auth keys:', Object.keys(client.auth));
}
// Check for hidden or internal methods
console.log('Full client structure (depth 1):');
for (const key in client) {
    const val = (client as any)[key];
    console.log(`${key}: ${typeof val}`);
    if (typeof val === 'object' && val !== null) {
        console.log(`  Keys in ${key}:`, Object.keys(val));
    }
}
