<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/authStore'

const router = useRouter()
const authStore = useAuthStore()

const isLoginMode = ref(true)
const isLoading = ref(false)
const errorMessage = ref('')

const loginForm = reactive({
  email: '',
  password: '',
})

const registerForm = reactive({
  email: '',
  password: '',
  name: '',
})

const handleLogin = async () => {
  if (!loginForm.email || !loginForm.password) {
    errorMessage.value = 'Please fill in all fields'
    return
  }

  isLoading.value = true
  errorMessage.value = ''

  try {
    await authStore.login(loginForm.email, loginForm.password)
    router.push('/chat')
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : 'Login failed'
  } finally {
    isLoading.value = false
  }
}

const handleRegister = async () => {
  if (!registerForm.email || !registerForm.password || !registerForm.name) {
    errorMessage.value = 'Please fill in all fields'
    return
  }

  if (registerForm.password.length < 8) {
    errorMessage.value = 'Password must be at least 8 characters long'
    return
  }

  isLoading.value = true
  errorMessage.value = ''

  try {
    await authStore.register(registerForm.email, registerForm.password, registerForm.name)
    // Switch to login mode after successful registration
    isLoginMode.value = true
    errorMessage.value = 'Registration successful! Please log in.'
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : 'Registration failed'
  } finally {
    isLoading.value = false
  }
}

const toggleMode = () => {
  isLoginMode.value = !isLoginMode.value
  errorMessage.value = ''
}
</script>

<template>
  <div class="authentication-container">
    <div class="auth-card">
      <h2>{{ isLoginMode ? 'Login' : 'Register' }}</h2>

      <div v-if="errorMessage" class="error-message">
        {{ errorMessage }}
      </div>

      <!-- Login Form -->
      <form v-if="isLoginMode" @submit.prevent="handleLogin" class="auth-form">
        <div class="form-group">
          <label for="login-email">Email</label>
          <input
            id="login-email"
            v-model="loginForm.email"
            type="email"
            required
            placeholder="Enter your email"
            autocomplete="username"
          />
        </div>

        <div class="form-group">
          <label for="login-password">Password</label>
          <input
            id="login-password"
            v-model="loginForm.password"
            type="password"
            required
            placeholder="Enter your password"
            autocomplete="current-password"
          />
        </div>

        <button type="submit" :disabled="authStore.isLoading" class="auth-button">
          {{ authStore.isLoading ? 'Logging in...' : 'Login' }}
        </button>
      </form>

      <!-- Register Form -->
      <form v-else @submit.prevent="handleRegister" class="auth-form">
        <div class="form-group">
          <label for="register-name">Name</label>
          <input
            id="register-name"
            v-model="registerForm.name"
            type="text"
            required
            placeholder="Enter your name"
          />
        </div>

        <div class="form-group">
          <label for="register-email">Email</label>
          <input
            id="register-email"
            v-model="registerForm.email"
            type="email"
            required
            placeholder="Enter your email"
          />
        </div>

        <div class="form-group">
          <label for="register-password">Password</label>
          <input
            id="register-password"
            v-model="registerForm.password"
            type="password"
            required
            placeholder="Enter your password (min 8 characters)"
          />
        </div>

        <button type="submit" :disabled="authStore.isLoading" class="auth-button">
          {{ authStore.isLoading ? 'Registering...' : 'Register' }}
        </button>
      </form>

      <div class="toggle-mode">
        <p>
          {{ isLoginMode ? "Don't have an account?" : 'Already have an account?' }}
          <button type="button" @click="toggleMode" class="toggle-button">
            {{ isLoginMode ? 'Register' : 'Login' }}
          </button>
        </p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.authentication-container {
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.auth-card {
  background: white;
  border-radius: 12px;
  padding: 40px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 400px;
}

.auth-card h2 {
  text-align: center;
  margin-bottom: 30px;
  color: #333;
  font-size: 28px;
  font-weight: 600;
}

.auth-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-group label {
  font-weight: 500;
  color: #555;
  font-size: 14px;
}

.form-group input {
  padding: 12px 16px;
  border: 2px solid #e1e5e9;
  border-radius: 8px;
  font-size: 16px;
  transition: border-color 0.2s;
}

.form-group input:focus {
  outline: none;
  border-color: #667eea;
}

.auth-button {
  background: #667eea;
  color: white;
  border: none;
  padding: 14px;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.2s;
}

.auth-button:hover:not(:disabled) {
  opacity: 0.9;
}

.auth-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.error-message {
  background: #fee;
  color: #c53030;
  padding: 12px;
  border-radius: 8px;
  margin-bottom: 20px;
  font-size: 14px;
  border: 1px solid #feb2b2;
}

.toggle-mode {
  margin-top: 30px;
  text-align: center;
}

.toggle-mode p {
  color: #666;
  font-size: 14px;
}

.toggle-button {
  background: none;
  border: none;
  color: #667eea;
  font-weight: 600;
  cursor: pointer;
  text-decoration: underline;
  margin-left: 8px;
}

.toggle-button:hover {
  color: #764ba2;
}
</style>
