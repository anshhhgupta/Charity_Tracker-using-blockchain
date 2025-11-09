# Chain of Hope - Sepolia Deployment Script
# Run this script to deploy your contract to Sepolia testnet

Write-Host "🚀 Chain of Hope - Sepolia Deployment" -ForegroundColor Cyan
Write-Host "======================================" -ForegroundColor Cyan
Write-Host ""

# Step 1: Check if .env exists
Write-Host "Step 1: Checking environment configuration..." -ForegroundColor Yellow
if (Test-Path "backend/.env") {
    Write-Host "✅ backend/.env exists" -ForegroundColor Green
} else {
    Write-Host "❌ backend/.env not found!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please create backend/.env with:" -ForegroundColor Yellow
    Write-Host "SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_PROJECT_ID"
    Write-Host "PRIVATE_KEY=0xyour_private_key_here"
    Write-Host "ETHERSCAN_API_KEY=your_etherscan_api_key"
    Write-Host ""
    Write-Host "See backend/.env.example for template" -ForegroundColor Cyan
    exit 1
}

# Step 2: Install backend dependencies
Write-Host ""
Write-Host "Step 2: Installing backend dependencies..." -ForegroundColor Yellow
Set-Location backend
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to install backend dependencies" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Backend dependencies installed" -ForegroundColor Green

# Step 3: Compile contract
Write-Host ""
Write-Host "Step 3: Compiling smart contract..." -ForegroundColor Yellow
npx hardhat compile
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Compilation failed" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Contract compiled successfully" -ForegroundColor Green

# Step 4: Run tests
Write-Host ""
Write-Host "Step 4: Running tests..." -ForegroundColor Yellow
npx hardhat test
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Tests failed" -ForegroundColor Red
    exit 1
}
Write-Host "✅ All tests passed" -ForegroundColor Green

# Step 5: Deploy to Sepolia
Write-Host ""
Write-Host "Step 5: Deploying to Sepolia testnet..." -ForegroundColor Yellow
Write-Host "⏳ This may take 1-2 minutes..." -ForegroundColor Cyan
npx hardhat run scripts/deploy-charity-final.js --network sepolia
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Deployment failed" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Contract deployed successfully!" -ForegroundColor Green

# Step 6: Copy ABI to frontend
Write-Host ""
Write-Host "Step 6: Copying contract ABI to frontend..." -ForegroundColor Yellow
Copy-Item "artifacts/contracts/Charity.sol/Charity.json" "../frontend/src/abi/Charity.json" -Force
if ($LASTEXITCODE -eq 0 -or (Test-Path "../frontend/src/abi/Charity.json")) {
    Write-Host "✅ ABI copied to frontend" -ForegroundColor Green
} else {
    Write-Host "❌ Failed to copy ABI" -ForegroundColor Red
}

# Step 7: Install frontend dependencies
Write-Host ""
Write-Host "Step 7: Installing frontend dependencies..." -ForegroundColor Yellow
Set-Location ../frontend
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to install frontend dependencies" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Frontend dependencies installed" -ForegroundColor Green

# Done
Write-Host ""
Write-Host "======================================" -ForegroundColor Cyan
Write-Host "🎉 Deployment Complete!" -ForegroundColor Green
Write-Host "======================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next Steps:" -ForegroundColor Yellow
Write-Host "1. Update frontend/.env with your contract address"
Write-Host "2. Run: npm run dev (in frontend folder)"
Write-Host "3. Open: http://localhost:5173"
Write-Host ""
Write-Host "Check deployment info in: backend/deployments/charity-final-sepolia.json" -ForegroundColor Cyan
Write-Host ""
