# Shoshizan Shared Interfaces

This package contains shared TypeScript interfaces used across all Shoshizan applications.

## Installation

Add this package as a dependency in your project:

```bash
npm install @shoshizan/shared-interfaces
# or
yarn add @shoshizan/shared-interfaces
```

## Usage

Import the interfaces you need in your code:

```typescript
import { Message, Conversation, ModelOptions, LlmRequestMessage, ApiRequest, ApiResponse, KafkaConfig } from "@shoshizan/shared-interfaces";
```

## Available Interfaces

- `Message`: Interface for chat messages
- `Conversation`: Interface for chat conversations
- `ModelOptions`: Interface for LLM model configuration options
- `LlmRequestMessage`: Interface for LLM request messages
- `ApiRequest`: Interface for API requests
- `ApiResponse`: Interface for API responses
- `KafkaConfig`: Interface for Kafka configuration

## Development

1. Build the package:

```bash
npm run build
```

2. Watch for changes:

```bash
npm run watch
```

## Integration with Applications

To use these interfaces in your applications:

1. Add the package as a dependency
2. Import the interfaces you need
3. Use them in your code to ensure type safety across applications

## Contributing

When adding new interfaces:

1. Add them to `src/index.ts`
2. Update this README if necessary
3. Build the package
4. Update the version number in package.json
