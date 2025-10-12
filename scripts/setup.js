const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Setting up Chain of Hope DApp...\n');

// Function to run commands
function runCommand(command, cwd) {
  try {
    console.log(`Running: ${command} in ${cwd}`);
    execSync(command, { 
      cwd: cwd,
      stdio: 'inherit'
    });
  } catch (error) {
    console.error(`Error running command: ${command}`);
    console.error(error.message);
    process.exit(1);
  }
}

// Setup backend
console.log('📦 Setting up backend dependencies...');
runCommand('npm install', './backend');

// Setup frontend
console.log('📦 Setting up frontend dependencies...');
runCommand('npm install', './frontend');

// Compile contracts
console.log('🔨 Compiling smart contracts...');
runCommand('npm run compile', './backend');

// Create .env files if they don't exist
console.log('📝 Setting up environment files...');

const backendEnvPath = './backend/.env';
const frontendEnvPath = './frontend/.env';

if (!fs.existsSync(backendEnvPath)) {
  fs.copyFileSync('./backend/env.example', backendEnvPath);
  console.log('✅ Created backend/.env from example');
} else {
  console.log('ℹ️  backend/.env already exists');
}

if (!fs.existsSync(frontendEnvPath)) {
  fs.copyFileSync('./frontend/env.example', frontendEnvPath);
  console.log('✅ Created frontend/.env from example');
} else {
  console.log('ℹ️  frontend/.env already exists');
}

console.log('\n🎉 Setup complete!');
console.log('\n📋 Next steps:');
console.log('1. Update the .env files with your configuration');
console.log('2. Start a local blockchain: cd backend && npm run node');
console.log('3. Deploy contracts: cd backend && npm run deploy:localhost');
console.log('4. Update frontend/.env with the deployed contract address');
console.log('5. Start the frontend: cd frontend && npm run dev');
console.log('\n🌐 The DApp will be available at http://localhost:3000');
