// Setup script to create .env.local file for frontend
const fs = require('fs');
const path = require('path');

const envContent = `NEXT_PUBLIC_API_URL=http://localhost:5000
`;

const envPath = path.join(__dirname, '.env.local');

try {
    fs.writeFileSync(envPath, envContent);
    console.log('✅ .env.local file created successfully!');
    console.log('🚀 You can now run: npm run dev');
} catch (error) {
    console.error('❌ Error creating .env.local file:', error.message);
}
