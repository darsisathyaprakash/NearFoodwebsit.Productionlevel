import { config } from 'dotenv';
import { join } from 'path';

config({ path: join(process.cwd(), '.env') });

console.log('Available Env Vars:');
Object.keys(process.env).forEach(key => {
    if (key.includes('DB') || key.includes('URL') || key.includes('KEY') || key.includes('POSTGRES')) {
        console.log(key);
    }
});
