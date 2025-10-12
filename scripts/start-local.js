const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 Starting Chain of Hope DApp locally...\n');

// Start Hardhat node
console.log('🔗 Starting Hardhat local blockchain...');
const hardhatNode = spawn('npm', ['run', 'node'], {
  cwd: path.join(__dirname, '..', 'backend'),
  stdio: 'inherit',
  shell: true
});

// Wait a bit for the node to start
setTimeout(() => {
  console.log('\n📄 Deploying contracts...');
  
  // Deploy contracts
  const deployProcess = spawn('npm', ['run', 'deploy:localhost'], {
    cwd: path.join(__dirname, '..', 'backend'),
    stdio: 'inherit',
    shell: true
  });

  deployProcess.on('close', (code) => {
    if (code === 0) {
      console.log('\n✅ Contracts deployed successfully!');
      console.log('\n🌐 Starting frontend...');
      
      // Start frontend
      const frontendProcess = spawn('npm', ['run', 'dev'], {
        cwd: path.join(__dirname, '..', 'frontend'),
        stdio: 'inherit',
        shell: true
      });

      frontendProcess.on('close', (code) => {
        console.log('\n👋 Frontend stopped');
        hardhatNode.kill();
        process.exit(code);
      });

      // Handle cleanup
      process.on('SIGINT', () => {
        console.log('\n🛑 Shutting down...');
        frontendProcess.kill();
        hardhatNode.kill();
        process.exit(0);
      });

    } else {
      console.error('❌ Contract deployment failed');
      hardhatNode.kill();
      process.exit(code);
    }
  });

}, 5000);

// Handle cleanup
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down...');
  hardhatNode.kill();
  process.exit(0);
});
