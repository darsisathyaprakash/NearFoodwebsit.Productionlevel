import { createClient } from '@insforge/sdk';
import { readFileSync } from 'fs';
import { join } from 'path';
import { config } from 'dotenv';

// Load environment variables
config({ path: join(process.cwd(), '.env') });

async function runMigration() {
    try {
        const baseUrl = process.env.NEXT_PUBLIC_INSFORGE_BASE_URL;
        const anonKey = process.env.NEXT_PUBLIC_INSFORGE_ANON_KEY;

        if (!baseUrl || !anonKey) {
            throw new Error('Missing required environment variables: NEXT_PUBLIC_INSFORGE_BASE_URL, NEXT_PUBLIC_INSFORGE_ANON_KEY');
        }

        console.log('Connecting to InsForge...');
        const client = createClient({
            baseUrl,
            anonKey,
        });

        console.log('Reading migration file...');
        const migrationPath = join(process.cwd(), 'src/db/migrations/add_addresses_and_status_tracking.sql');
        const migrationSQL = readFileSync(migrationPath, 'utf-8');

        console.log('Executing migration...');
        console.log('Note: This migration needs to be run manually in your InsForge dashboard or using the MCP tool.');
        console.log('\nMigration SQL:');
        console.log('='.repeat(80));
        console.log(migrationSQL);
        console.log('='.repeat(80));
        console.log('\nTo run this migration:');
        console.log('1. Open your InsForge dashboard');
        console.log('2. Go to the SQL editor');
        console.log('3. Copy and paste the SQL above');
        console.log('4. Execute the SQL');
        console.log('\nOr use the MCP tool if available: run-raw-sql');

    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

runMigration();
