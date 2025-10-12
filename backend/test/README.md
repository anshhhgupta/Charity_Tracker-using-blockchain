# Test Suite Documentation

This directory contains comprehensive unit tests for the Chain of Hope DApp smart contracts.

## Test Files

### 1. Charity.test.js
JavaScript test suite for the Charity contract using Hardhat and Chai.

### 2. Charity.test.ts
TypeScript test suite for the Charity contract with enhanced type safety.

### 3. CharityDonation.test.ts
TypeScript test suite for the CharityDonation contract.

## Test Coverage

### Charity Contract Tests

#### ✅ Deployment Tests
- **Owner Setup**: Verifies contract owner is set correctly
- **Initialization**: Checks zero counters for campaigns and expenditures
- **Contract Address**: Logs deployed contract address for verification

#### ✅ Campaign Creation Tests
- **Basic Creation**: Tests campaign creation with name, description, and goal
- **Event Emission**: Verifies `CampaignCreated` event with correct parameters
- **Data Validation**: Ensures campaign data is stored correctly
- **Input Validation**: Tests rejection of invalid inputs:
  - Zero goal amount
  - Empty campaign name
  - Empty description
- **Multiple Campaigns**: Verifies unique campaign IDs and proper tracking

#### ✅ Donation Flow Tests
- **Single Donations**: Tests donation acceptance and balance updates
- **Multiple Donations**: Tracks donations from same donor
- **Multiple Donors**: Verifies donor count and individual contributions
- **Balance Updates**: Ensures campaign raised amount is updated correctly
- **Progress Calculation**: Tests campaign progress percentage
- **Event Emission**: Verifies `DonationReceived` events
- **Input Validation**: Tests rejection of:
  - Zero amount donations
  - Donations to non-existent campaigns
  - Donations to inactive campaigns
- **Donation Tracking**: Returns campaign donations correctly

#### ✅ Expenditure Request Tests
- **Creator Requests**: Allows campaign creators to request expenditures
- **Event Emission**: Verifies `ExpenditureRequested` events
- **Data Storage**: Ensures expenditure data is stored correctly
- **Authorization**: Tests rejection of requests from non-creators
- **Fund Validation**: Rejects requests exceeding available funds
- **Input Validation**: Tests rejection of:
  - Empty purpose
  - Zero amount requests
  - Requests for inactive campaigns
- **Multiple Requests**: Allows multiple expenditure requests from creator

#### ✅ Campaign Management Tests
- **Deactivation**: Owner can deactivate campaigns
- **Activation**: Owner can reactivate campaigns
- **Authorization**: Non-owners cannot manage campaigns
- **State Effects**: Verifies inactive campaigns reject donations and requests

#### ✅ Integration Tests
- **Complete Lifecycle**: Tests end-to-end campaign flow:
  1. Campaign creation
  2. Multiple donations
  3. Expenditure requests
  4. Final state verification

### CharityDonation Contract Tests

#### ✅ Deployment Tests
- Charity wallet setup
- Charity information configuration
- Owner verification
- Initial state validation

#### ✅ Donation Tests
- Anonymous and named donations
- Message handling
- Balance tracking
- Event emission

#### ✅ Withdrawal Tests
- Authorized withdrawals
- Purpose tracking
- Balance validation
- Emergency withdrawals

#### ✅ Admin Functions
- Charity info updates
- Emergency fund threshold
- Access control

## Running Tests

### All Tests
```bash
# Run all tests
npx hardhat test

# Run with gas reporting
npm run test:gas

# Run with coverage
npm run coverage
```

### Specific Test Files
```bash
# JavaScript Charity tests
npx hardhat test test/Charity.test.js

# TypeScript Charity tests
npx hardhat test test/Charity.test.ts

# CharityDonation tests
npx hardhat test test/CharityDonation.test.ts
```

### Test Patterns
```bash
# Run tests matching pattern
npx hardhat test --grep "Campaign Creation"

# Run specific test
npx hardhat test --grep "Should create a campaign with correct name and goal"
```

## Test Results Summary

### ✅ All Tests Passing

**Charity Contract (JavaScript)**: 26 tests passing
- Deployment: 3 tests
- Campaign Creation: 5 tests
- Donation Flow: 8 tests
- Expenditure Requests: 7 tests
- Campaign Management: 3 tests
- Integration: 1 test

**Charity Contract (TypeScript)**: 29 tests passing
- Enhanced with approval/execution workflow
- Additional view function tests
- Complete expenditure lifecycle

**CharityDonation Contract**: 20 tests passing
- Full donation and withdrawal workflow
- Admin function coverage
- Emergency procedures

## Test Features

### 🔧 Gas Configuration
- All deployments use 5M gas limit to prevent out-of-gas errors
- Gas reporting available with `REPORT_GAS=true`

### 📊 Event Testing
- Comprehensive event emission verification
- Parameter validation for all events
- Timestamp handling for blockchain events

### 🔐 Access Control Testing
- Owner-only function verification
- Campaign creator authorization
- Unauthorized access rejection

### 💰 Balance Testing
- Accurate balance tracking
- Multi-donor contribution handling
- Campaign progress calculation

### 🧪 Integration Testing
- End-to-end workflow validation
- State consistency verification
- Cross-function interaction testing

## Test Data

### Sample Campaigns
```javascript
const campaignName = "Emergency Relief Fund";
const campaignDescription = "Help for disaster victims";
const goal = ethers.parseEther("100.0");
```

### Sample Donations
```javascript
const donationAmount = ethers.parseEther("25.0");
```

### Sample Expenditures
```javascript
const expenditureAmount = ethers.parseEther("20.0");
const purpose = "Emergency relief supplies";
```

## Best Practices

### ✅ Test Structure
- Clear describe blocks for test organization
- Comprehensive beforeEach setup
- Descriptive test names
- Proper cleanup between tests

### ✅ Assertions
- Use Chai expect syntax
- Test both positive and negative cases
- Verify events and state changes
- Check error messages

### ✅ Coverage
- Test all public functions
- Cover edge cases and error conditions
- Verify access control
- Test integration scenarios

### ✅ Maintainability
- Helper functions for common operations
- Consistent test data
- Clear test documentation
- Modular test structure

## Debugging Tests

### Common Issues
1. **Gas Errors**: Increase gas limit in test setup
2. **Event Timing**: Use proper timestamp handling
3. **State Issues**: Ensure proper test isolation
4. **Import Errors**: Check Hardhat configuration

### Debug Commands
```bash
# Run single test with detailed output
npx hardhat test --grep "specific test" --verbose

# Run with stack traces
npx hardhat test --show-stack-traces

# Run with gas details
REPORT_GAS=true npx hardhat test
```

---

**Total Test Coverage**: 75 tests across all contracts
**Status**: ✅ All tests passing
**Last Updated**: October 2024
