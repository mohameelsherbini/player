const fs = require('fs');
let c = fs.readFileSync('supabase_schema_complete_final.sql', 'utf8');

// Handle policies that already exist
c = c.replace(/CREATE POLICY "([^"]+)" ON (\S+)/g, 'DROP POLICY IF EXISTS "$1" ON $2;\nCREATE POLICY "$1" ON $2');

// Handle inserts on buckets (using INSERT ... ON CONFLICT DO NOTHING)
c = c.replace(/INSERT INTO storage.buckets \(([^)]+)\) VALUES \(([^)]+)\);/g, 'INSERT INTO storage.buckets ($1) VALUES ($2) ON CONFLICT (id) DO NOTHING;');

fs.writeFileSync('supabase_schema_complete_final.sql', c);
console.log('Fixed policies and buckets!');
