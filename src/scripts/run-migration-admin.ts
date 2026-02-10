
import { createClient } from '@insforge/sdk';
import { readFileSync, readdirSync } from 'fs';
import { join } from 'path';
import { config } from 'dotenv';

// Load environment variables
config({ path: join(process.cwd(), '.env') });
config({ path: join(process.cwd(), '.env.local') });

async function runAdminMigration() {
    try {
        const baseUrl = process.env.NEXT_PUBLIC_INSFORGE_BASE_URL;
        // Use the admin/service key instead of anon key
        const adminKey = process.env.INSFORGE_API_KEY;

        if (!baseUrl || !adminKey) {
            console.error('Missing required environment variables: NEXT_PUBLIC_INSFORGE_BASE_URL or INSFORGE_API_KEY');
            return;
        }

        console.log('Connecting to InsForge with ADMIN key...');
        const client = createClient({
            baseUrl,
            anonKey: adminKey, // Passing admin key as the key
        });

        // Test connection
        console.log('Testing connection...');
        // Try a simple query
        // Note: The SDK might not expose a direct 'query' method, but let's assume standard PostgREST or RPC access

        // We'll try to run the migrations directly via RPC exec_sql if available, 
        // OR standard REST calls if the SDK supports it.
        // The most reliable way for migrations usually is exec_sql RPC if installed.
        // If exec_sql is NOT installed, we might be stuck unless we have direct SQL access (which MCP usually provides).
        // Since MCP failed, we hope this key enables exec_sql or we can use the REST API to create tables?
        // Standard PostgREST doesn't let you create tables via REST API easily unless you use a stored procedure.

        // Let's TRY exec_sql again with the NEW key.
        const { error: testError } = await client.database.rpc('exec_sql', { sql: 'SELECT 1' });

        if (testError) {
            console.error('exec_sql RPC failed even with Admin Key:', testError.message);
            console.log('Attemping to read migrations locally and log them.');
        } else {
            console.log('exec_sql RPC is available with Admin Key! Proceeding...');

            const migrationsDir = join(process.cwd(), 'src/db/migrations');
            const files = readdirSync(migrationsDir).filter(f => f.endsWith('.sql')).sort();

            for (const file of files) {
                console.log(`Processing ${file}...`);
                const content = readFileSync(join(migrationsDir, file), 'utf-8');

                // Remove comments and split by semicolon
                // This logic is simple and might break on complex SQL (e.g. within functions),
                // but for simple CREATE TABLE statements it works.
                // For functions ($$ ... $$) splitting by semicolon is dangerous if not careful.
                // Let's try executing the WHOLE file first.

                const { error } = await client.database.rpc('exec_sql', { sql: content });
                if (error) {
                    console.error(`Error executing ${file} as a whole block:`, error.message);
                    console.log('Trying to split statements...');

                    const statements = content
                        .split(';')
                        .map(s => s.trim())
                        .filter(s => s.length > 0 && !s.startsWith('--'));

                    for (const statement of statements) {
                        const cleanStatement = statement.split('\n').filter(l => !l.trim().startsWith('--')).join('\n').trim();
                        if (cleanStatement) {
                            const { error: stmtError } = await client.database.rpc('exec_sql', { sql: cleanStatement });
                            if (stmtError) {
                                console.error(`Failed to execute statement: ${cleanStatement.substring(0, 50)}...`, stmtError);
                            }
                        }
                    }
                } else {
                    console.log(`Successfully executed ${file}`);
                }
            }
            console.log('All migrations processed.');
        }

    } catch (error) {
        console.error('Migration script failed:', error);
    }
}

runAdminMigration();
