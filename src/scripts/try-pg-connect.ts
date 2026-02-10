
import { Client } from 'pg';
import { config } from 'dotenv';
import { join } from 'path';

config({ path: join(process.cwd(), '.env') });

async function testConnection() {
    const apiKey = process.env.INSFORGE_API_KEY;
    const baseUrl = process.env.NEXT_PUBLIC_INSFORGE_BASE_URL;

    if (!apiKey || !baseUrl) {
        console.error('Missing API Key or Base URL');
        return;
    }

    // Extract hostname
    // URL: https://y5y9s7ra.us-west.insforge.app
    // Host: y5y9s7ra.us-west.insforge.app
    const host = new URL(baseUrl).hostname;

    // Potential hosts
    const hostsToTry = [
        host, // y5y9s7ra.us-west.insforge.app
        `db.${host}`, // db.y5y9s7ra... (unlikely for this style of domain, but possible)
        // Some services use project-ref.db...
        // y5y9s7ra is likely the project ref.
        `db.y5y9s7ra.insforge.app`,
        `db.${host.replace('us-west.', '')}` // db.y5y9s7ra.insforge.app?
    ];

    // Remove duplicates
    const uniqueHosts = [...new Set(hostsToTry)];

    console.log('Testing Postgres connections...');
    console.log('API Key starts with:', apiKey.substring(0, 5));

    for (const h of uniqueHosts) {
        console.log(`\nTrying host: ${h}`);
        const connectionString = `postgres://postgres:${apiKey}@${h}:5432/postgres?sslmode=require`;

        const client = new Client({
            connectionString: connectionString,
            ssl: { rejectUnauthorized: false } // Verify CA often fails without explicit cert, safe for testing
        });

        try {
            await client.connect();
            console.log(`SUCCESS! Connected to ${h}`);
            const res = await client.query('SELECT NOW()');
            console.log('Time:', res.rows[0]);

            // Check if user_addresses exists explicitly
            const tableCheck = await client.query("SELECT to_regclass('public.user_addresses')");
            console.log('Table check:', tableCheck.rows[0]);

            await client.end();
            return; // Exit on first success
        } catch (err: any) {
            console.log(`Failed to connect to ${h}: ${err.message}`);
            // Sometimes users are different. 'postgres' is standard.
            // 'admin'? 'insforge_admin'?
        } finally {
            try { await client.end(); } catch { }
        }
    }

    console.log('\nAll connection attempts failed.');
}

testConnection();
