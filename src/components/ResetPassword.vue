<template>
  <div class="min-h-screen bg-neutral-400">
    <!-- 2 Columns Layout -->
    <div class="flex flex-col lg:flex-row lg:justify-start gap-4 px-4 py-[8vh] lg:h-screen">
      <!-- Left Column -->
      <div class="flex-shrink-0 w-full lg:w-[350px] overflow-y-auto flex flex-col lg:justify-start gap-4 text-neutral-950">
        <card id="logo-card" class="bg-neutral-900 p-4 rounded-lg border border-neutral-700 shadow cursor-pointer hover:opacity-90 transition-opacity" @click="goHome">
          <card-content>
            <img src="/img/DIA-LOGO-H-B.gif" alt="DIA! Radio" class="invert" />
          </card-content>
        </card>
        <card id="message-card" class="bg-neutral-900 p-4 rounded-lg border border-neutral-700 shadow">
          <card-content>
            <h1 class="text-lg text-white uppercase font-semibold mb-2">New App & website coming very soon!</h1>
            <p class="text-white text-sm">Stay tuned for a whole new experience!</p>
          </card-content>
        </card>
        <card id="baseline-card" class="bg-neutral-900 p-4 rounded-lg border border-neutral-700 shadow">
          <card-content>
            <p class="text-white text-sm">Music curated by humans, for humans.</p>
          </card-content>
        </card>
        <card id="social-card" class="bg-neutral-900 text-white p-4 rounded-lg border border-neutral-700 shadow">
          <card-content>
            <h3 class="text-lg text-white uppercase font-semibold mb-2">Follow us</h3>
            <div class="flex flex-col gap-2">
              <a 
                href="https://www.instagram.com/dia.radio/" 
                target="_blank" 
                rel="noopener noreferrer"
                class="flex items-center gap-3 text-sm hover:opacity-80 transition-opacity"
              >
                <Instagram class="w-5 h-5" />
                <span>Instagram</span>
              </a>
              <a 
                href="https://www.facebook.com/dia.webradio/" 
                target="_blank" 
                rel="noopener noreferrer"
                class="flex items-center gap-3 text-sm hover:opacity-80 transition-opacity"
              >
                <Facebook class="w-5 h-5" />
                <span>Facebook</span>
              </a>
              <a 
                href="https://soundcloud.com/diaradio" 
                target="_blank" 
                rel="noopener noreferrer"
                class="flex items-center gap-3 text-sm hover:opacity-80 transition-opacity"
              >
                <Music class="w-5 h-5" />
                <span>SoundCloud</span>
              </a>
            </div>
          </card-content>
        </card>
      </div>

      <!-- Center Column -->
      <div class="flex-shrink-0 w-full lg:w-[350px] overflow-y-auto flex flex-col gap-4 lg:justify-start">
        <!-- Reset Password Form Card -->
        <card id="reset-password-card" class="bg-neutral-900 p-4 rounded-lg border border-neutral-700 shadow">
          <card-content>
            <h2 class="text-lg text-white uppercase font-semibold mb-2">Reset Your Dia App Password</h2>
            <p class="text-white text-sm mb-4">This will reset your password for your Dia account.</p>

            <!-- Success Message -->
            <div v-if="success" class="mb-4 p-3 bg-green-900/30 border border-green-700 rounded text-white text-sm">
              Password updated, you can now log in to the Dia app.
            </div>

            <!-- Error Message -->
            <div v-if="error" class="mb-4 p-3 bg-red-900/30 border border-red-700 rounded text-white text-sm">
              {{ error }}
            </div>

            <!-- Missing Token Message -->
            <div v-if="!token && !success" class="mb-4 p-3 bg-red-900/30 border border-red-700 rounded text-white text-sm">
              Invalid or missing reset token. Please check your reset link.
            </div>

            <!-- Form -->
            <form v-if="token && !success" @submit.prevent="handleSubmit" class="space-y-4">
              <!-- Password Field -->
              <div>
                <label for="password" class="block text-white text-sm font-medium mb-2">
                  New Password
                </label>
                <input
                  id="password"
                  v-model="password"
                  type="password"
                  required
                  :disabled="loading"
                  @input="handlePasswordInput"
                  class="w-full px-3 py-2 bg-neutral-800 border border-neutral-600 rounded text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                  placeholder="Enter new password"
                />
                <p v-if="errors.password" class="mt-1 text-red-400 text-xs">{{ errors.password }}</p>
              </div>

              <!-- Confirm Password Field -->
              <div>
                <label for="confirmPassword" class="block text-white text-sm font-medium mb-2">
                  Confirm Password
                </label>
                <input
                  id="confirmPassword"
                  v-model="confirmPassword"
                  type="password"
                  required
                  :disabled="loading"
                  @input="handleConfirmPasswordInput"
                  class="w-full px-3 py-2 bg-neutral-800 border border-neutral-600 rounded text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                  placeholder="Confirm new password"
                />
                <p v-if="errors.confirmPassword" class="mt-1 text-red-400 text-xs">{{ errors.confirmPassword }}</p>
              </div>

              <!-- Submit Button -->
              <Button
                type="submit"
                :disabled="loading || !isFormValid"
                class="w-full"
              >
                <span v-if="loading">Resetting...</span>
                <span v-else>Reset Password</span>
              </Button>
            </form>
          </card-content>
        </card>

        <!-- Gimmick Card -->
        <card id="gimmick-card" class="bg-neutral-900 p-4 rounded-lg border border-neutral-700 shadow">
          <card-content>
            <p class="text-white text-sm">Who cares for algorythms anyway.</p>
          </card-content>
        </card>

        <!-- Logo Smiley Card -->
        <card id="logo-card-smiley" class="bg-neutral-900 border border-neutral-700 rounded-lg shadow cursor-pointer hover:opacity-90 transition-opacity" @click="goHome">
          <card-content>
            <img src="/img/Logo-Dia-bouge.gif" alt="DIA! Radio" />
          </card-content>
        </card>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Instagram, Facebook, Music } from 'lucide-vue-next'
import Button from './ui/button/Button.vue'

const route = useRoute()
const router = useRouter()
const token = ref('')
const password = ref('')
const confirmPassword = ref('')
const loading = ref(false)
const success = ref(false)
const error = ref('')
const errors = ref({
  password: '',
  confirmPassword: ''
})

// Extract token from query string
onMounted(() => {
  token.value = route.query.token || ''
})

// Navigate to home
const goHome = () => {
  router.push('/')
}

// Validation
const isFormValid = computed(() => {
  return password.value.length >= 8 && 
         password.value === confirmPassword.value &&
         !errors.value.password &&
         !errors.value.confirmPassword
})

// Validate password on input
const validatePassword = () => {
  errors.value.password = ''
  if (password.value && password.value.length < 8) {
    errors.value.password = 'Password must be at least 8 characters long'
  }
}

// Validate confirm password on input
const validateConfirmPassword = () => {
  errors.value.confirmPassword = ''
  if (confirmPassword.value && password.value !== confirmPassword.value) {
    errors.value.confirmPassword = 'Passwords do not match'
  }
}

// Watch for changes to validate
const handlePasswordInput = () => {
  validatePassword()
  if (confirmPassword.value) {
    validateConfirmPassword()
  }
}

const handleConfirmPasswordInput = () => {
  validateConfirmPassword()
}

// API call to reset password
const resetPassword = async (token, password) => {
  const API_URL = import.meta.env.VITE_CONTENT_API_URL || 'https://content.diaradio.live/api'
  
  const response = await fetch(`${API_URL}/users/reset-password`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ token, password })
  })

  if (!response.ok) {
    let errorMessage = 'Failed to reset password. Please try again.'
    try {
      const data = await response.json()
      if (data.errors && Array.isArray(data.errors)) {
        errorMessage = data.errors.map(e => e.message || e).join(', ')
      } else if (data.message) {
        errorMessage = data.message
      } else if (typeof data === 'string') {
        errorMessage = data
      }
    } catch (e) {
      // If response is not JSON, use status-based messages
      if (response.status === 400) {
        errorMessage = 'Invalid token or password. Please check your reset link and try again.'
      } else if (response.status === 401) {
        errorMessage = 'This reset link has expired or is invalid. Please request a new one.'
      } else if (response.status === 422) {
        errorMessage = 'Password does not meet requirements. Please use a stronger password.'
      }
    }
    throw new Error(errorMessage)
  }

  return await response.json()
}

// Handle form submission
const handleSubmit = async () => {
  // Clear previous errors
  error.value = ''
  errors.value = { password: '', confirmPassword: '' }

  // Validate
  validatePassword()
  validateConfirmPassword()

  if (!isFormValid.value) {
    return
  }

  if (!token.value) {
    error.value = 'Invalid or missing reset token.'
    return
  }

  loading.value = true

  try {
    await resetPassword(token.value, password.value)
    success.value = true
    password.value = ''
    confirmPassword.value = ''
  } catch (err) {
    error.value = err.message || 'An error occurred. Please try again.'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
/* Custom scrollbar for columns */
.overflow-y-auto::-webkit-scrollbar {
  width: 6px;
}

.overflow-y-auto::-webkit-scrollbar-track {
  background: transparent;
}

.overflow-y-auto::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.2);
  border-radius: 3px;
}

.overflow-y-auto::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.3);
}
</style>

