import { createServerClient } from '@/lib/server-client';
import { readFileSync } from 'fs';
import { join } from 'path';
import { config } from 'dotenv';

// Load environment variables
config({ path: join(process.cwd(), '.env') });

async function runMigration() {
    try {
        console.log('Connecting to InsForge...');
        const insforge = await createServerClient();

        console.log('Reading migration file...');
        const migrationPath = join(process.cwd(), 'src/db/migrations/add_addresses_and_status_tracking.sql');
        const migrationSQL = readFileSync(migrationPath, 'utf-8');

        console.log('Executing migration...');
        // Split the SQL into individual statements
        const statements = migrationSQL
            .split(';')
            .map(s => s.trim())
            .filter(s => s.length > 0 && !s.startsWith('--'));

        for (const statement of statements) {
            if (statement.trim()) {
                console.log(`Executing: ${statement.substring(0, 50)}...`);
                const { error } = await insforge.database.rpc('exec_sql', { sql: statement });
                if (error) {
                    console.error('Error executing statement:', error);
                    throw error;
                }
            }
        }

        console.log('Migration completed successfully!');
    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    }
}

runMigration();
