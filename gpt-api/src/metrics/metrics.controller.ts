import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('metrics')
@Controller('metrics')
export class MetricsController {
  @Get()
  @ApiOperation({ summary: 'Get Prometheus metrics' })
  @ApiResponse({
    status: 200,
    description: 'Metrics in Prometheus format',
    type: String,
  })
  getMetrics(): string {
    // Metrics are exported to OpenTelemetry Collector
    // This endpoint provides basic service info for Prometheus scraping
    return `# OpenTelemetry metrics are exported to OTel Collector
# Access metrics via Prometheus at http://localhost:9090
# or Grafana at http://localhost:3100

# Service info
service_name{name="gpt-api"} 1
service_version{version="0.0.1"} 1
`;
  }

  @Get('health')
  @ApiOperation({ summary: 'Metrics health check' })
  @ApiResponse({
    status: 200,
    description: 'Metrics export status',
  })
  getHealth() {
    return {
      status: 'ok',
      metrics: 'exported_to_otel_collector',
    };
  }
}
