# Shoshizan

A distributed system for handling GPT (Generative Pre-trained Transformer) requests with a microservices architecture.

## Project Overview

Shoshizan is a microservices-based application that handles GPT requests through a distributed system. It consists of multiple services that work together to process, queue, and respond to GPT requests.

## Architecture

```
┌─────────────┐     ┌───────────────┐     ┌───────────────┐     ┌───────────────┐
│   GPT-UI    │────▶│   Gateway     │────▶│ Kafka Producer│────▶│    Kafka     │
└─────────────┘     └───────────────┘     └───────────────┘     └───────────────┘
                              │                                              │
                              ▼                                              ▼
                     ┌───────────────┐     ┌───────────────┐     ┌───────────────┐
                     │  GPT API      │◀────│Kafka Consumer│◀────│    Kafka     │
                     └───────────────┘     └───────────────┘     └───────────────┘
```

## Services

### 1. Gateway (`gpt-gateway/`)

- **NEW**: Centralized gateway service for all microservices
- Provides unified authentication and routing
- Acts as a single entry point for all client requests
- Features:
  - JWT-based authentication
  - Service routing and load balancing
  - Health monitoring for all services
  - API documentation with Swagger
  - CORS configuration

### 2. GPT-UI (`gpt-ui/`)

- Frontend application built with Vue
- Provides user interface for GPT interactions
- Handles conversation management and user input
- Communicates with Gateway for all API calls

### 3. Kafka Producer (`gpt-kafka-producer/`)

- NestJS service for producing messages to Kafka
- Implements retry mechanism for reliable message delivery
- Handles message validation and formatting
- Features:
  - Configurable retry attempts
  - Error handling
  - Comprehensive logging

### 4. Kafka Consumer (`gpt-kafka-consumer/`)

- Consumes messages from Kafka topics
- Processes GPT requests
- Manages message flow and error handling
- Features:
  - Message validation
  - Error recovery
  - Dead letter queue handling

### 5. GPT API (`gpt-api/`)

- Core service for GPT model interaction
- Handles model selection and configuration
- Manages API rate limiting and quotas
- Features:
  - Multiple model support
  - Response streaming
  - Error handling

### 6. Shared Interfaces (`shared-interfaces/`)

- Common TypeScript interfaces and types
- Shared between all services
- Ensures type consistency across the system
- Includes:
  - Message types
  - Configuration interfaces
  - Common utilities

## Prerequisites

- Node.js (v16 or higher)
- Kafka cluster
- NestJS CLI
- Vue.js development environment
- Ollama server

## Getting Started

1. Clone the repository:

```bash
git clone https://github.com/your-org/shoshizan.git
cd shoshizan
```

2. Install dependencies for each service:

```bash
# Install shared interfaces
cd shared-interfaces
npm install

# Install and build each service
cd ../gpt-gateway
npm install

cd ../gpt-ui
npm install

cd ../gpt-kafka-producer
npm install

cd ../gpt-kafka-consumer
npm install

cd ../gpt-api
npm install
```

3. Configure environment variables:

- Copy `.env` if you need to override defaults or adapt hostnames. The provided values are safe to commit and describe the local Docker topology.
- Create a `.env.secrets` file (never commit it) and add the required secrets: `POSTGRES_PASSWORD`, `DB_PASSWORD`, `JWT_SECRET`, and optionally `VITE_DEV_BEARER_TOKEN` for the UI auto-login shortcut.
- All Docker services load these files automatically via the compose file, so updating the key/value pairs is enough—no need to edit the YAML.

4. Start the services:

```bash
# Start all services together (recommended)
npm run dev

# Or start services individually:
# Start Gateway (must be started first)
cd gpt-gateway
npm run start:dev

# Start other services
cd ../gpt-ui
npm run dev

cd ../gpt-kafka-producer
npm run start:dev

cd ../gpt-kafka-consumer
npm run start:dev

cd ../gpt-api
npm run start:dev
```

## Development

### Testing

Each service has its own test suite:

```bash
# Run tests for a specific service
cd <service-directory>
npm run test

# Run e2e tests
npm run test:e2e

# Run test coverage
npm run test:cov
```

### Building

```bash
# Build all services
npm run build

# Build individual service
cd <service-directory>
npm run build
```

## Deployment

Each service can be deployed independently:

1. Build the service
2. Configure environment variables
3. Deploy using your preferred method (Docker, Kubernetes, etc.)

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
