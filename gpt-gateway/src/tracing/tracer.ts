import { NodeSDK } from "@opentelemetry/sdk-node";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-http";
import { Resource } from "@opentelemetry/resources";
import { HttpInstrumentation } from "@opentelemetry/instrumentation-http";

/**
 * Initialize OpenTelemetry SDK with HTTP auto-instrumentation
 *
 * This configuration:
 * - Automatically creates spans for ALL HTTP requests (incoming and outgoing)
 * - Propagates W3C Trace Context headers automatically
 * - Exports traces to OTel Collector via OTLP/HTTP
 *
 * Environment variables:
 * - OTEL_EXPORTER_OTLP_ENDPOINT: OTel Collector endpoint (default: http://otel-collector:4318)
 * - OTEL_SERVICE_NAME_GATEWAY: Service name (default: gpt-gateway)
 * - ENABLE_TRACING: Enable/disable tracing (default: true)
 */
export function initializeTracing(): NodeSDK | null {
  const enableTracing = process.env.ENABLE_TRACING !== "false";

  if (!enableTracing) {
    console.log("[OpenTelemetry] Tracing is disabled");
    return null;
  }

  const serviceName = process.env.OTEL_SERVICE_NAME_GATEWAY || "gpt-gateway";
  const otlpEndpoint =
    process.env.OTEL_EXPORTER_OTLP_ENDPOINT || "http://otel-collector:4318";

  console.log(`[OpenTelemetry] Initializing for service: ${serviceName}`);
  console.log(`[OpenTelemetry] OTLP Endpoint: ${otlpEndpoint}`);

  // Define service resource attributes - merge with default to ensure proper propagation
  const resource = Resource.default().merge(
    new Resource({
      "service.name": serviceName,
      "service.version": process.env.npm_package_version || "0.0.1",
      "service.namespace": "gpt-shoshizan",
      "deployment.environment": process.env.NODE_ENV || "development",
    }),
  );

  // Configure OTLP trace exporter
  const traceExporter = new OTLPTraceExporter({
    url: `${otlpEndpoint}/v1/traces`,
    headers: {},
  });

  // Initialize SDK with HTTP auto-instrumentation ONLY
  const sdk = new NodeSDK({
    resource,
    traceExporter,
    instrumentations: [
      new HttpInstrumentation({
        // Ignore health check and metrics endpoints to reduce noise
        ignoreIncomingRequestHook: (request) => {
          const url = request.url || "";
          return (
            url.includes("/health") ||
            url.includes("/metrics") ||
            url.includes("/favicon.ico")
          );
        },
        // Ignore outgoing requests to metrics/health endpoints
        ignoreOutgoingRequestHook: (options) => {
          const path = options.path || "";
          return path.includes("/health") || path.includes("/metrics");
        },
        // Add custom attributes to HTTP spans
        requestHook: (span, request) => {
          // Add HTTP version if available (only on IncomingMessage)
          if ("httpVersion" in request && request.httpVersion) {
            span.setAttribute("http.flavor", request.httpVersion);
          }
        },
        // Add response attributes
        responseHook: (span, response) => {
          if (response.statusCode) {
            span.setAttribute("http.status_code", response.statusCode);
          }
        },
      }),
    ],
  });

  // Start the SDK
  sdk.start();
  console.log(
    "[OpenTelemetry] SDK initialized successfully with HTTP auto-instrumentation",
  );
  console.log("[OpenTelemetry] W3C Trace Context propagation enabled");

  // Graceful shutdown
  process.on("SIGTERM", () => {
    sdk
      .shutdown()
      .then(() => console.log("[OpenTelemetry] SDK shut down successfully"))
      .catch((error) =>
        console.error("[OpenTelemetry] Error shutting down SDK", error),
      )
      .finally(() => process.exit(0));
  });

  return sdk;
}
