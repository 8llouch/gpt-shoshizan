import { API_CONFIG } from '../constants'

export class AuthenticationService {
  private static readonly API_BASE_URL = API_CONFIG.AUTH_BASE_URL

  static async login(email: string, password: string): Promise<string> {
    try {
      const response = await fetch(`${AuthenticationService.API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      })

      if (!response.ok) {
        throw new Error(`Login failed: ${response.statusText}`)
      }

      const data = await response.json()
      console.log(data)
      return data.token
    } catch (error) {
      console.error('Error during login:', error)
      throw error
    }
  }

  static async register(email: string, password: string, name: string): Promise<void> {
    try {
      const response = await fetch(`${AuthenticationService.API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password, name }),
      })

      if (!response.ok) {
        throw new Error(`Registration failed: ${response.statusText}`)
      }
    } catch (error) {
      console.error('Error during registration:', error)
      throw error
    }
  }
}
