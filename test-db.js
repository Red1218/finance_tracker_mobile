const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');

const envFile = fs.readFileSync('.env', 'utf8');
const env = {};
envFile.split('\n').forEach(line => {
  const [k, ...v] = line.split('=');
  if (k) {
    env[k.trim()] = v.join('=').replace(/"/g, '').trim();
  }
});

const supabase = createClient(env.EXPO_PUBLIC_SUPABASE_URL, env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY);

supabase.from('categories').select('*').then(({ data, error }) => {
  console.log('DATA:', data);
  console.log('ERROR:', error);
});
