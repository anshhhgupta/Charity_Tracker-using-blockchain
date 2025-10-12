# Chain of Hope Frontend

A modern, responsive frontend for the Chain of Hope charity donation DApp built with Vite, React, and Tailwind CSS.

## 🚀 Tech Stack

- **Vite** - Fast build tool and development server
- **React 18** - Modern React with hooks and functional components
- **Tailwind CSS** - Utility-first CSS framework for rapid UI development
- **Ethers.js** - Ethereum library for blockchain interactions
- **React Router DOM** - Client-side routing
- **Lucide React** - Beautiful, customizable icons
- **React Hot Toast** - Elegant notifications

## 📦 Dependencies

### Core Dependencies
```json
{
  "ethers": "^6.15.0",
  "react": "^18.2.0",
  "react-dom": "^18.2.0",
  "react-router-dom": "^6.8.0",
  "react-hot-toast": "^2.4.0",
  "lucide-react": "^0.263.1"
}
```

### Development Dependencies
```json
{
  "tailwindcss": "^3.3.0",
  "postcss": "^8.4.0",
  "autoprefixer": "^10.4.0",
  "@vitejs/plugin-react": "^4.0.0",
  "vite": "^4.5.0"
}
```

## 🎨 UI Features

### Design System
- **Color Palette**: Custom primary, success, and warning color schemes
- **Typography**: Inter font family for clean, modern text
- **Components**: Reusable button, card, and input components
- **Animations**: Smooth transitions and hover effects
- **Responsive**: Mobile-first design with breakpoints

### Custom CSS Classes
```css
.btn-primary     /* Primary action buttons */
.btn-secondary   /* Secondary action buttons */
.btn-success     /* Success state buttons */
.card           /* Card containers */
.input-field    /* Form inputs */
.gradient-bg    /* Gradient backgrounds */
.hero-gradient  /* Hero section gradient */
.text-gradient  /* Gradient text effects */
```

## 🏗️ Project Structure

```
frontend/
├── public/
│   └── heart-icon.svg
├── src/
│   ├── components/
│   │   └── Navbar.jsx
│   ├── context/
│   │   ├── Web3Context.jsx
│   │   └── ContractContext.jsx
│   ├── pages/
│   │   ├── Home.jsx
│   │   ├── Campaigns.jsx
│   │   ├── CreateCampaign.jsx
│   │   ├── Donate.jsx
│   │   ├── Dashboard.jsx
│   │   └── About.jsx
│   ├── abi/
│   │   ├── Charity.json
│   │   └── CharityInfo.json
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── tailwind.config.js
├── postcss.config.js
├── vite.config.js
└── package.json
```

## 🚀 Getting Started

### Prerequisites
- Node.js 16+ 
- npm or yarn
- MetaMask wallet extension

### Installation
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## 📱 Pages & Features

### 1. Home Page (`/`)
- Hero section with call-to-action buttons
- Statistics display (total donations, campaigns, etc.)
- Feature highlights
- Recent donations feed
- Responsive design

### 2. Campaigns Page (`/campaigns`)
- Grid layout of all campaigns
- Campaign cards with progress bars
- Donation functionality
- Quick donation buttons (0.1, 0.5, 1.0 ETH)
- Campaign status indicators

### 3. Create Campaign Page (`/create-campaign`)
- Campaign creation form
- Input validation
- Wallet connection requirement
- Real-time character counting
- Campaign guidelines

### 4. Donate Page (`/donate`)
- Direct donation interface
- Campaign selection
- Amount input with validation
- Transaction status tracking

### 5. Dashboard Page (`/dashboard`)
- User's donation history
- Campaign management (for creators)
- Statistics and analytics
- Transaction details

### 6. About Page (`/about`)
- Project information
- Team details
- Technology stack
- Contact information

## 🔗 Blockchain Integration

### Web3 Context
- Wallet connection management
- Account state tracking
- Provider and signer management
- Connection persistence

### Contract Context
- Smart contract interactions
- ABI management
- Contract instance creation
- Transaction handling

### Contract Integration
- **Charity Contract**: Campaign creation, donations, expenditure requests
- **CharityDonation Contract**: Direct donations, withdrawals
- Real-time balance updates
- Event listening and handling

## 🎯 Key Features

### Wallet Integration
- MetaMask connection
- Account switching support
- Network validation
- Transaction confirmation

### Campaign Management
- Create new campaigns
- View all campaigns
- Track campaign progress
- Donation tracking

### Donation System
- Multiple donation methods
- Quick donation amounts
- Transaction status updates
- Donation history

### UI/UX Features
- Responsive design
- Loading states
- Error handling
- Success notifications
- Smooth animations

## 🛠️ Development

### Available Scripts
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
```

### Environment Variables
Create a `.env` file in the frontend directory:
```env
VITE_CONTRACT_ADDRESS=0x...
VITE_NETWORK_ID=31337
VITE_RPC_URL=http://localhost:8545
```

### Code Splitting
The app uses dynamic imports for better performance:
- Route-based code splitting
- Lazy loading of components
- Optimized bundle sizes

## 🎨 Styling

### Tailwind Configuration
- Custom color palette
- Extended font families
- Custom animations
- Responsive breakpoints
- Component utilities

### CSS Architecture
- Base styles for HTML elements
- Component classes for reusable UI
- Utility classes for one-off styles
- Custom scrollbar styling

## 📱 Responsive Design

### Breakpoints
- `sm`: 640px and up
- `md`: 768px and up
- `lg`: 1024px and up
- `xl`: 1280px and up

### Mobile Features
- Touch-friendly buttons
- Optimized navigation
- Responsive grid layouts
- Mobile-specific interactions

## 🔧 Configuration

### Vite Configuration
- React plugin
- Path aliases
- Build optimizations
- Development server settings

### Tailwind Configuration
- Content paths
- Custom theme
- Plugin configuration
- Purge settings

## 🚀 Deployment

### Build Process
1. Run `npm run build`
2. Deploy `dist/` folder to hosting service
3. Configure environment variables
4. Set up domain and SSL

### Recommended Hosting
- Vercel
- Netlify
- GitHub Pages
- AWS S3 + CloudFront

## 🐛 Troubleshooting

### Common Issues
1. **Wallet Connection**: Ensure MetaMask is installed and unlocked
2. **Network Issues**: Check if you're on the correct network
3. **Contract Errors**: Verify contract address and ABI
4. **Build Errors**: Check for missing dependencies

### Debug Mode
Enable debug logging by setting:
```javascript
localStorage.setItem('debug', 'true')
```

## 📈 Performance

### Optimizations
- Code splitting
- Lazy loading
- Image optimization
- Bundle analysis
- Tree shaking

### Bundle Analysis
```bash
npm run build -- --analyze
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

**Built with ❤️ for transparent charity donations**
