# GPT-SHOSHIZAN Gateway

Gateway service for the GPT-SHOSHIZAN microservices architecture. This service provides centralized routing and authentication for all microservices.

## Features

- **Centralized Authentication**: JWT-based authentication for all services
- **Service Routing**: Routes requests to appropriate microservices
- **Health Monitoring**: Health checks for all connected services
- **API Documentation**: Swagger/OpenAPI documentation

## Architecture

The gateway acts as a single entry point for all client requests and routes them to the appropriate microservices:

- **API Service**: Handles conversations and user management
- **Kafka Producer**: Handles message production for AI processing

## Environment Variables

```env
# Gateway Configuration
GATEWAY_PORT=3000
FRONT_END_URL=http://localhost:5173

# Service URLs
API_SERVICE_URL=http://localhost:3001
KAFKA_PRODUCER_URL=http://localhost:3002

# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=password
DB_DATABASE=gpt_shoshizan
DB_SYNCHRONIZE=true

# JWT Configuration
JWT_SECRET=your-secret-key
```

## API Endpoints

### Authentication

- `POST /auth/register` - Register a new user
- `POST /auth/login` - Login user
- `GET /auth/profile` - Get user profile (requires authentication)

### Gateway Routing

- `GET /gateway/health` - Health check for all services
- `ALL /gateway/api/*` - Route to API service (requires authentication)
- `ALL /gateway/producer/*` - Route to Kafka Producer service (requires authentication)

## Development

```bash
# Install dependencies
npm install

# Start development server
npm run start:dev

# Run tests
npm run test

# Run e2e tests
npm run test:e2e

# Build for production
npm run build
```

## Security

- All gateway routes (except health check) require JWT authentication
- CORS is configured to allow requests from the frontend
- JWT tokens are validated on each request
- Service-to-service communication is secured

## Microservices Integration

The gateway integrates with the following microservices:

1. **gpt-api**: User management and conversations
2. **gpt-kafka-producer**: Message production for AI processing

Each service maintains its own database and business logic while the gateway provides unified access and authentication.
