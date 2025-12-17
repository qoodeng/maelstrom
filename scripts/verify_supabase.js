import { createClient } from '@supabase/supabase-js';

const url = process.env.VITE_SUPABASE_URL;
const key = process.env.VITE_SUPABASE_ANON_KEY;

if (!url || !key) {
    console.error('Error: Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY environment variables.');
    process.exit(1);
}

console.log(`Connecting to Supabase at ${url}...`);

const supabase = createClient(url, key);

async function verifyConnection() {
    try {
        // Attempt to fetch public profiles (even if empty, a successful response 200/201 confirms connection)
        // Using 'head: true' to just get the count/status without fetching data
        const { count, error, status, statusText } = await supabase
            .from('profiles')
            .select('*', { count: 'exact', head: true });

        if (error) {
            console.error('Supabase connection failed:', error.message);
            console.error('Details:', error);
            process.exit(1);
        }

        console.log(`Success! Connected to Supabase. Status: ${status} ${statusText}`);

    } catch (err) {
        console.error('Unexpected error during verification:', err);
        process.exit(1);
    }
}

verifyConnection();
