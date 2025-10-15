import { NodeSDK } from '@opentelemetry/sdk-node';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { Resource } from '@opentelemetry/resources';
import { HttpInstrumentation } from '@opentelemetry/instrumentation-http';

export function initializeTracing(): NodeSDK | null {
  const enableTracing = process.env.ENABLE_TRACING !== 'false';

  if (!enableTracing) {
    console.log('[OpenTelemetry] Tracing is disabled');
    return null;
  }

  const serviceName = process.env.OTEL_SERVICE_NAME_API || 'gpt-api';
  const otlpEndpoint =
    process.env.OTEL_EXPORTER_OTLP_ENDPOINT || 'http://otel-collector:4318';

  console.log(`[OpenTelemetry] Initializing for service: ${serviceName}`);
  console.log(`[OpenTelemetry] OTLP Endpoint: ${otlpEndpoint}`);

  const resource = Resource.default().merge(
    new Resource({
      'service.name': serviceName,
      'service.version': process.env.npm_package_version || '0.0.1',
      'service.namespace': 'gpt-shoshizan',
      'deployment.environment': process.env.NODE_ENV || 'development',
    }),
  );

  const traceExporter = new OTLPTraceExporter({
    url: `${otlpEndpoint}/v1/traces`,
    headers: {},
  });

  const sdk = new NodeSDK({
    resource,
    traceExporter,
    instrumentations: [
      new HttpInstrumentation({
        ignoreIncomingRequestHook: (request) => {
          const url = request.url || '';
          return url.includes('/health') || url.includes('/metrics');
        },
        ignoreOutgoingRequestHook: (options) => {
          const path = (options as any).path || '';
          return path.includes('/health') || path.includes('/metrics');
        },
      }),
    ],
  });

  sdk.start();
  console.log('[OpenTelemetry] SDK initialized with HTTP auto-instrumentation');

  process.on('SIGTERM', () => {
    sdk
      .shutdown()
      .then(() => console.log('[OpenTelemetry] SDK shut down successfully'))
      .catch((error) => console.error('[OpenTelemetry] Error:', error))
      .finally(() => process.exit(0));
  });

  return sdk;
}
