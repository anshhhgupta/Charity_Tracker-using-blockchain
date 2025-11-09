/**
 * Frontend Configuration Test Script
 * Tests frontend setup without requiring browser interaction
 */

import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('🧪 Testing Frontend Configuration\n');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

let testsPassed = 0;
let testsFailed = 0;

function test(name, fn) {
  try {
    fn();
    console.log(`✅ ${name}`);
    testsPassed++;
  } catch (error) {
    console.log(`❌ ${name}`);
    console.log(`   Error: ${error.message}\n`);
    testsFailed++;
  }
}

// Test 1: Check .env file exists
test('Environment file exists', () => {
  const envPath = join(__dirname, '.env');
  const envContent = readFileSync(envPath, 'utf8');
  if (!envContent) throw new Error('.env file is empty');
});

// Test 2: Check contract address is set
test('Contract address is configured', () => {
  const envPath = join(__dirname, '.env');
  const envContent = readFileSync(envPath, 'utf8');
  if (!envContent.includes('VITE_CONTRACT_ADDRESS=0x379A63482A2401a0d1b30f57921A58dEAB022aC6')) {
    throw new Error('Contract address not set correctly');
  }
});

// Test 3: Check network is set to Sepolia
test('Network is set to Sepolia', () => {
  const envPath = join(__dirname, '.env');
  const envContent = readFileSync(envPath, 'utf8');
  if (!envContent.includes('VITE_NETWORK=sepolia')) {
    throw new Error('Network not set to sepolia');
  }
});

// Test 4: Check RPC URL is configured
test('RPC URL is configured', () => {
  const envPath = join(__dirname, '.env');
  const envContent = readFileSync(envPath, 'utf8');
  if (!envContent.includes('VITE_SEPOLIA_RPC_URL=')) {
    throw new Error('RPC URL not configured');
  }
});

// Test 5: Check ABI file exists
test('Contract ABI file exists', () => {
  const abiPath = join(__dirname, 'src', 'abi', 'Charity.json');
  const abiContent = readFileSync(abiPath, 'utf8');
  if (!abiContent) throw new Error('ABI file is empty');
});

// Test 6: Check ABI has correct structure
test('ABI has correct structure', () => {
  const abiPath = join(__dirname, 'src', 'abi', 'Charity.json');
  const abiContent = JSON.parse(readFileSync(abiPath, 'utf8'));
  if (!abiContent.abi) throw new Error('ABI structure is incorrect');
  if (!Array.isArray(abiContent.abi)) throw new Error('ABI is not an array');
  if (abiContent.abi.length === 0) throw new Error('ABI is empty');
});

// Test 7: Check ABI has required functions
test('ABI has required functions', () => {
  const abiPath = join(__dirname, 'src', 'abi', 'Charity.json');
  const abiContent = JSON.parse(readFileSync(abiPath, 'utf8'));
  const functions = abiContent.abi.filter(item => item.type === 'function');
  const functionNames = functions.map(f => f.name);
  
  const requiredFunctions = [
    'createCampaign',
    'donate',
    'getCampaign',
    'campaignCount',
    'getContractBalance'
  ];
  
  for (const fn of requiredFunctions) {
    if (!functionNames.includes(fn)) {
      throw new Error(`Required function '${fn}' not found in ABI`);
    }
  }
});

// Test 8: Check config file exists
test('Config file exists', () => {
  const configPath = join(__dirname, 'src', 'config', 'config.js');
  const configContent = readFileSync(configPath, 'utf8');
  if (!configContent) throw new Error('Config file is empty');
});

// Test 9: Check main App file exists
test('Main App component exists', () => {
  const appPath = join(__dirname, 'src', 'App.jsx');
  const appContent = readFileSync(appPath, 'utf8');
  if (!appContent) throw new Error('App.jsx is empty');
});

// Test 10: Check required contexts exist
test('Required context providers exist', () => {
  const contexts = [
    'context/WalletContext.jsx',
    'context/ContractContext.jsx',
    'context/EventContext.jsx'
  ];
  
  for (const context of contexts) {
    const contextPath = join(__dirname, 'src', context);
    try {
      readFileSync(contextPath, 'utf8');
    } catch (error) {
      throw new Error(`Context file '${context}' not found`);
    }
  }
});

// Test 11: Check required pages exist
test('Required pages exist', () => {
  const pages = [
    'pages/Home.jsx',
    'pages/Campaigns.jsx',
    'pages/CampaignDetails.jsx',
    'pages/AdminPanel.jsx'
  ];
  
  for (const page of pages) {
    const pagePath = join(__dirname, 'src', page);
    try {
      readFileSync(pagePath, 'utf8');
    } catch (error) {
      throw new Error(`Page file '${page}' not found`);
    }
  }
});

// Test 12: Check package.json has required dependencies
test('Required dependencies are installed', () => {
  const packagePath = join(__dirname, 'package.json');
  const packageContent = JSON.parse(readFileSync(packagePath, 'utf8'));
  
  const requiredDeps = [
    'react',
    'react-dom',
    'react-router-dom',
    'ethers',
    'react-hot-toast'
  ];
  
  for (const dep of requiredDeps) {
    if (!packageContent.dependencies[dep]) {
      throw new Error(`Required dependency '${dep}' not found`);
    }
  }
});

// Test 13: Check node_modules exists
test('Dependencies are installed', () => {
  const nodeModulesPath = join(__dirname, 'node_modules');
  try {
    const stats = readFileSync(join(nodeModulesPath, '.package-lock.json'), 'utf8');
    if (!stats) throw new Error('node_modules appears incomplete');
  } catch (error) {
    throw new Error('node_modules not found - run npm install');
  }
});

// Test 14: Check build output exists
test('Build output exists', () => {
  const distPath = join(__dirname, 'dist', 'index.html');
  try {
    const distContent = readFileSync(distPath, 'utf8');
    if (!distContent) throw new Error('Build output is empty');
  } catch (error) {
    throw new Error('Build output not found - run npm run build');
  }
});

// Summary
console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('📊 Test Summary');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
console.log(`✅ Passed: ${testsPassed}`);
console.log(`❌ Failed: ${testsFailed}`);
console.log(`📈 Total:  ${testsPassed + testsFailed}\n`);

if (testsFailed === 0) {
  console.log('🎉 All frontend tests passed!\n');
  console.log('Frontend is ready for use at: http://localhost:3000/\n');
  process.exit(0);
} else {
  console.log('⚠️  Some tests failed. Please fix the issues above.\n');
  process.exit(1);
}
