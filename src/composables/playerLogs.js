// src/composables/playerLogs.js
import { ref } from 'vue'

const logs = ref([])

export function logPlayerEvent(message, data = {}) {
  logs.value.push({
    timestamp: new Date().toISOString(),
    message,
    data
  })
}

export function usePlayerLogs() {
  return {
    logs
  }
}

