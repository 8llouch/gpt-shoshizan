import { API_CONFIG } from '../constants'

export interface ServiceHealth {
  gateway: boolean
  api: boolean
  kafkaProducer: boolean
  ollama: boolean
  timestamp: string
}

export class ServiceHealthChecker {
  private static readonly MAX_RETRIES = 30 // 30 seconds max wait
  private static readonly RETRY_INTERVAL = 1000 // 1 second between retries
  private static servicesReady = false

  static async waitForServices(): Promise<boolean> {
    if (this.servicesReady) {
      return true
    }

    console.log('🔍 Checking service availability...')

    for (let attempt = 1; attempt <= this.MAX_RETRIES; attempt++) {
      try {
        const health = await this.checkGatewayHealth()

        if (health.gateway) {
          console.log('✅ Services are ready!')
          this.servicesReady = true
          return true
        }

        console.log(`⏳ Waiting for services... (attempt ${attempt}/${this.MAX_RETRIES})`)
        await this.delay(this.RETRY_INTERVAL)
      } catch {
        console.log(`⏳ Services not ready yet... (attempt ${attempt}/${this.MAX_RETRIES})`)
        await this.delay(this.RETRY_INTERVAL)
      }
    }

    console.warn('⚠️ Services may not be fully ready. Proceeding anyway.')
    return false
  }

  static async checkGatewayHealth(): Promise<ServiceHealth> {
    const response = await fetch(`${API_CONFIG.BASE_URL}/gateway/health`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error(`Health check failed: ${response.status}`)
    }

    return await response.json()
  }

  static async checkServiceReady(serviceName: string, url: string): Promise<boolean> {
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        signal: AbortSignal.timeout(5000), // 5 second timeout
      })

      return response.ok
    } catch {
      return false
    }
  }

  private static delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }

  static reset(): void {
    this.servicesReady = false
  }
}
