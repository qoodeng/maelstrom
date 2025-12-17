import { createClient } from '@supabase/supabase-js';

const url = process.env.VITE_SUPABASE_URL;
const key = process.env.VITE_SUPABASE_ANON_KEY;

if (!url || !key) {
    console.error('Error: Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY environment variables.');
    process.exit(1);
}

const supabase = createClient(url, key);

async function diagnoseTables() {
    console.log('Diagnosing Supabase tables...');

    // Check profiles
    console.log('Checking "profiles" table...');
    const { error: profilesError } = await supabase.from('profiles').select('count', { count: 'exact', head: true });
    if (profilesError) {
        console.error('Error accessing "profiles":', profilesError.message);
    } else {
        console.log('Success: "profiles" table is accessible.');
    }

    // Check notes
    console.log('Checking "notes" table...');
    const { error: notesError } = await supabase.from('notes').select('count', { count: 'exact', head: true });
    if (notesError) {
        console.error('Error accessing "notes":', notesError.message);
    } else {
        console.log('Success: "notes" table is accessible.');
    }

    // Check undercurrents
    console.log('Checking "undercurrents" table...');
    const { error: undercurrentsError } = await supabase.from('undercurrents').select('count', { count: 'exact', head: true });
    if (undercurrentsError) {
        console.error('Error accessing "undercurrents":', undercurrentsError.message);
    } else {
        console.log('Success: "undercurrents" table is accessible.');
    }
}

diagnoseTables();
