// test-config.js - Test the bot configuration
const dotenv = require('dotenv');

dotenv.config();

console.log('🔍 Checking bot configuration...\n');

// Check required environment variables
const requiredVars = {
  'DISCORD_BOT_TOKEN': process.env.DISCORD_BOT_TOKEN,
  'HYPIXEL_API_KEY': process.env.HYPIXEL_API_KEY,  
  'CLIENT_ID': process.env.CLIENT_ID
};

let allConfigured = true;

for (const [name, value] of Object.entries(requiredVars)) {
  if (value) {
    console.log(`✅ ${name}: Set (${value.length} characters)`);
  } else {
    console.log(`❌ ${name}: Not set`);
    allConfigured = false;
  }
}

console.log('\n' + '='.repeat(50));

if (allConfigured) {
  console.log('✅ All configuration variables are set!');
  console.log('You can now run: npm run build && npm start');
} else {
  console.log('❌ Please set all required environment variables in your .env file');
  console.log('Check the README.md for setup instructions');
}

console.log('='.repeat(50));
