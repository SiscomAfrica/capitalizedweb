# Africa Web Client

A modern, responsive web application for the SISCOM investment platform, built with React and following Josh Comeau's design principles.

## Features

- 🚀 **Modern Stack**: React 18+ with Vite for fast development
- 🎨 **Beautiful UI**: Tailwind CSS with custom design tokens
- 📱 **Responsive**: Mobile-first design that works on all devices
- 🔐 **Secure**: JWT-based authentication with automatic token refresh
- 🧪 **Well Tested**: Comprehensive testing with Vitest and Property-Based Testing
- ⚡ **Fast**: Optimized builds with code splitting
- 🎭 **Animated**: Smooth animations with Framer Motion

## Tech Stack

- **Frontend**: React 18, Vite, TypeScript
- **Styling**: Tailwind CSS, Framer Motion
- **Forms**: React Hook Form
- **HTTP Client**: Axios
- **Testing**: Vitest, React Testing Library, fast-check
- **Icons**: Lucide React
- **Date Handling**: date-fns

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Copy environment variables:
   ```bash
   cp .env.example .env.development
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm test` - Run tests once
- `npm run test:watch` - Run tests in watch mode
- `npm run test:coverage` - Run tests with coverage
- `npm run lint` - Lint code

## Project Structure

```
src/
├── api/                    # API client modules
├── components/             # Reusable UI components
│   ├── common/            # Generic components
│   ├── layout/            # Layout components
│   ├── auth/              # Authentication components
│   ├── profile/           # Profile components
│   ├── investments/       # Investment components
│   ├── portfolio/         # Portfolio components
│   └── subscriptions/     # Subscription components
├── contexts/              # React Context providers
├── hooks/                 # Custom React hooks
├── pages/                 # Page components
├── utils/                 # Utility functions
├── styles/                # Global styles
└── test/                  # Test utilities
```

## API Services

The application connects to three microservices:

- **Auth Service**: `https://siscom.africa/api/v1/auth`
- **Investment Service**: `https://siscom.africa/api/v1/investments`
- **Subscription Service**: `https://siscom.africa/api/v1/subscriptions`

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_AUTH_SERVICE_URL` | Auth service URL | `https://siscom.africa/api/v1/auth` |
| `VITE_INVESTMENT_SERVICE_URL` | Investment service URL | `https://siscom.africa/api/v1/investments` |
| `VITE_SUBSCRIPTION_SERVICE_URL` | Subscription service URL | `https://siscom.africa/api/v1/subscriptions` |
| `VITE_APP_NAME` | Application name | `Africa Web Client` |
| `VITE_DEV_MODE` | Development mode flag | `true` |

## Testing

The project uses a comprehensive testing strategy:

- **Unit Tests**: Test individual components and functions
- **Property-Based Tests**: Test universal properties with fast-check
- **Integration Tests**: Test component interactions

Run tests:
```bash
npm test                    # Run all tests
npm run test:watch         # Watch mode
npm run test:coverage      # With coverage
```

## Contributing

1. Follow the existing code style
2. Write tests for new features
3. Update documentation as needed
4. Ensure all tests pass before submitting

## License

This project is proprietary software for SISCOM Africa.