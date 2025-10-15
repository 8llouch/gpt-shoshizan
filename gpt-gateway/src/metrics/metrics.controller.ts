import { Controller, Get, Header } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiResponse } from "@nestjs/swagger";
import { metrics } from "@opentelemetry/api";

/**
 * Controller to expose Prometheus metrics endpoint
 *
 * This endpoint is scraped by Prometheus to collect metrics from the service.
 * Metrics include:
 * - HTTP request count
 * - HTTP request duration
 * - Error count
 * - Custom business metrics
 */
@ApiTags("Metrics")
@Controller("metrics")
export class MetricsController {
  @Get()
  @Header("Content-Type", "text/plain")
  @ApiOperation({ summary: "Expose Prometheus metrics" })
  @ApiResponse({
    status: 200,
    description: "Prometheus metrics in text format",
  })
  async getMetrics(): Promise<string> {
    // Note: Metrics are automatically exported to OTel Collector via OTLP
    // This endpoint is kept for compatibility with Prometheus scraping
    return `# OpenTelemetry metrics are exported to OTel Collector
# Access metrics via Prometheus at http://localhost:9090
# or Grafana at http://localhost:3100

# Service info
service_name{name="gpt-gateway"} 1
service_version{version="${process.env.npm_package_version || "0.0.1"}"} 1
`;
  }

  @Get("health")
  @ApiOperation({ summary: "Health check for metrics endpoint" })
  @ApiResponse({
    status: 200,
    description: "Metrics endpoint is healthy",
  })
  async health(): Promise<{ status: string; metrics: string }> {
    return {
      status: "ok",
      metrics: "exported_to_otel_collector",
    };
  }
}
