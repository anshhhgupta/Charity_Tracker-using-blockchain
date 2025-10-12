# Context API Documentation

This directory contains React Context providers for managing application state and blockchain interactions.

## WalletContext

A comprehensive context for managing MetaMask wallet connections and Ethereum interactions using Ethers.js.

### Features

- **Wallet Connection**: Connect/disconnect MetaMask wallet
- **Account Management**: Track current account and account changes
- **Network Management**: Handle network switching and validation
- **Transaction Handling**: Send transactions and get balances
- **Event Listening**: Listen for account/network changes
- **Error Handling**: Comprehensive error management
- **State Persistence**: Maintains connection state across page reloads

### Usage

```jsx
import { useWallet } from '../context/WalletContext';

function MyComponent() {
  const {
    account,
    provider,
    signer,
    isConnected,
    isConnecting,
    error,
    connectWallet,
    disconnectWallet,
    switchNetwork,
    getBalance,
    sendTransaction
  } = useWallet();

  // Use wallet functionality
}
```

### State Properties

| Property | Type | Description |
|----------|------|-------------|
| `account` | `string \| null` | Current connected account address |
| `provider` | `BrowserProvider \| null` | Ethers.js provider instance |
| `signer` | `JsonRpcSigner \| null` | Ethers.js signer instance |
| `chainId` | `number \| null` | Current network chain ID |
| `isConnected` | `boolean` | Whether wallet is connected |
| `isConnecting` | `boolean` | Whether connection is in progress |
| `error` | `string \| null` | Current error message |

### Methods

#### `connectWallet()`
Connects to MetaMask wallet.

**Returns:** `Promise<boolean>` - Success status

**Example:**
```jsx
const handleConnect = async () => {
  const success = await connectWallet();
  if (success) {
    console.log('Wallet connected!');
  }
};
```

#### `disconnectWallet()`
Disconnects the wallet and clears all state.

**Example:**
```jsx
const handleDisconnect = () => {
  disconnectWallet();
};
```

#### `switchNetwork(chainId)`
Switches to the specified network.

**Parameters:**
- `chainId` (number): Target chain ID

**Returns:** `Promise<boolean>` - Success status

**Example:**
```jsx
const handleSwitchNetwork = async () => {
  const success = await switchNetwork(31337); // Switch to Hardhat
  if (success) {
    console.log('Network switched!');
  }
};
```

#### `getBalance(address?)`
Gets the balance of an address.

**Parameters:**
- `address` (string, optional): Address to check balance for (defaults to current account)

**Returns:** `Promise<string \| null>` - Balance in ETH

**Example:**
```jsx
const checkBalance = async () => {
  const balance = await getBalance();
  console.log(`Balance: ${balance} ETH`);
};
```

#### `sendTransaction(transaction)`
Sends a transaction using the connected signer.

**Parameters:**
- `transaction` (object): Transaction object with `to`, `value`, `data`, etc.

**Returns:** `Promise<TransactionResponse \| null>` - Transaction response

**Example:**
```jsx
const sendEth = async () => {
  const tx = await sendTransaction({
    to: '0x...',
    value: ethers.parseEther('0.1')
  });
  if (tx) {
    console.log('Transaction sent:', tx.hash);
  }
};
```

#### `getNetworkInfo()`
Gets current network information.

**Returns:** `Promise<object \| null>` - Network info with chainId and name

**Example:**
```jsx
const getNetwork = async () => {
  const network = await getNetworkInfo();
  console.log('Network:', network);
};
```

### Utility Functions

#### `formatAddress(address)`
Formats an address for display (e.g., "0x1234...5678").

**Parameters:**
- `address` (string): Address to format

**Returns:** `string` - Formatted address

#### `isMetaMaskInstalled()`
Checks if MetaMask is installed.

**Returns:** `boolean` - Whether MetaMask is available

#### `clearError()`
Clears the current error message.

### Event Handling

The context automatically listens for the following MetaMask events:

- **`accountsChanged`**: Triggered when user switches accounts
- **`chainChanged`**: Triggered when user switches networks
- **`disconnect`**: Triggered when wallet is disconnected

### Error Handling

The context provides comprehensive error handling for common scenarios:

- **User Rejection**: When user rejects connection request
- **Pending Request**: When a connection request is already pending
- **Network Errors**: When network operations fail
- **Transaction Errors**: When transactions fail

### Network Support

Pre-configured networks:

- **Hardhat Local** (Chain ID: 31337)
- **Sepolia Testnet** (Chain ID: 11155111)

Custom networks can be added via the `addNetwork()` method.

### Example Implementation

```jsx
import { useWallet } from '../context/WalletContext';

function WalletButton() {
  const {
    account,
    isConnected,
    isConnecting,
    error,
    connectWallet,
    disconnectWallet,
    formatAddress,
    clearError
  } = useWallet();

  const handleConnect = async () => {
    clearError();
    const success = await connectWallet();
    if (!success) {
      // Error is automatically set in context
    }
  };

  if (isConnected && account) {
    return (
      <div className="flex items-center space-x-2">
        <span className="text-green-600">
          {formatAddress(account)}
        </span>
        <button onClick={disconnectWallet}>
          Disconnect
        </button>
      </div>
    );
  }

  return (
    <div>
      {error && (
        <div className="text-red-600 mb-2">
          {error}
          <button onClick={clearError}>×</button>
        </div>
      )}
      <button 
        onClick={handleConnect}
        disabled={isConnecting}
      >
        {isConnecting ? 'Connecting...' : 'Connect Wallet'}
      </button>
    </div>
  );
}
```

### Best Practices

1. **Always check connection state** before performing blockchain operations
2. **Handle errors gracefully** and provide user feedback
3. **Clear errors** when starting new operations
4. **Use loading states** to improve user experience
5. **Listen for account changes** to update UI accordingly

### Troubleshooting

#### Common Issues

1. **"MetaMask is not installed"**
   - Ensure MetaMask extension is installed
   - Check if `window.ethereum` is available

2. **"Connection rejected by user"**
   - User cancelled the connection request
   - Handle gracefully and allow retry

3. **"Network not supported"**
   - Use `switchNetwork()` to change networks
   - Add custom networks if needed

4. **"Transaction failed"**
   - Check if user has sufficient balance
   - Verify transaction parameters
   - Handle gas estimation errors

#### Debug Mode

Enable debug logging:
```javascript
localStorage.setItem('debug', 'wallet');
```

This will log detailed information about wallet operations to the console.

---

## ContractContext

Manages smart contract interactions and ABI loading.

### Features

- **Contract Loading**: Load contract instances with ABI
- **Contract Management**: Manage multiple contract instances
- **ABI Handling**: Load and cache contract ABIs
- **Contract State**: Track contract-related state

### Usage

```jsx
import { useContract } from '../context/ContractContext';

function MyComponent() {
  const { charityContract, charityDonationContract } = useContract();
  
  // Use contract instances
}
```

---

**Note**: Both contexts work together to provide a complete blockchain integration solution. The WalletContext handles wallet operations while ContractContext manages smart contract interactions.
