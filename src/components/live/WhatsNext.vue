<template>
  <div class="  w-full">
 
    
    
    <!-- Loading -->
    <div v-if="isLoading" class="space-y-2">
      <Skeleton class="h-4 w-full" />
      <Skeleton class="h-4 w-3/4" />
      <Skeleton class="h-4 w-1/2" />
    </div>
    
    <!-- Error -->
    <div v-else-if="error" class="text-center text-sm text-gray-400 py-4">
      <p>{{ error }}</p>
      <Button @click="fetchUpcoming" variant="outline" size="sm" class="mt-2">
        Retry
      </Button>
    </div>
    
    <!-- Empty -->
    <div v-else-if="allItems.length === 0" class="text-center text-sm text-gray-400 py-4">
      No more shows today
    </div>
    
    <!-- Content -->
    <div v-else class=" space-y-1">
      <!-- Today items -->
      <div 
      v-if="displayedTodayItems.length > 0"
      class="bg-neutral-900 rounded-lg  p-4"
      >
      <div class="text-sm uppercase font-semibold mb-2">Today</div>
      <hr class="border-neutral-700 mb-4">
        <div 
          v-for="item in displayedTodayItems" 
          :key="item._id" 
          class="flex items-start gap-4 text-sm text-white mb-2 cursor-pointer hover:bg-neutral-800 rounded py-1 transition-colors"
          @click="openSchedule"
        >
          <div class="font-medium whitespace-nowrap w-24 flex-shrink-0">{{ formatTimeRange(item.scheduledAt, item.scheduledEnd) }}</div>
          <div class="flex-1 font-semibold uppercase">{{ item.title }}</div>
        </div>
      </div>
      
      <!-- Tomorrow header + items -->
      <div v-if="displayedTomorrowItems.length > 0" class="bg-neutral-900 rounded-lg p-4 mt-2">
        
        <div class="text-sm uppercase font-semibold mb-2">Tomorrow</div>
        <hr class="border-neutral-700 mb-4">
        <div 
          v-for="item in displayedTomorrowItems" 
          :key="item._id" 
          class="flex items-start gap-4 text-sm text-white mb-2 cursor-pointer hover:bg-neutral-800 rounded py-1 transition-colors"
          @click="openSchedule"
        >
          <div class="font-medium whitespace-nowrap w-24 flex-shrink-0">{{ formatTimeRange(item.scheduledAt, item.scheduledEnd) }}</div>
          <div class="flex-1 font-semibold uppercase">{{ item.title }}</div>
        </div>
      </div>
      
      <!-- Show more button -->
      <div class="mt-5 text-center">
        <Button 
          @click="openSchedule" 
          
          class="rounded-full"
          
        >
          View Full Schedule
        </Button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { getTodayUpcoming } from '@/api/payload/schedule'
import { todayRangeISO } from '@/lib/timezone'
import { authedFetch } from '@/lib/authClient'
import { useScheduleView } from '@/lib/useScheduleView'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'

const props = defineProps({
  limit: { type: Number, default: 5 }
})

const allItems = ref([])
const isLoading = ref(true)
const error = ref(null)
const isRefreshing = ref(false)
const now = ref(new Date())

const { openSchedule } = useScheduleView()

// Update time every 30 seconds and re-fetch data to stay in sync with LiveCard
let timeInterval = null

// Group items by day
const todayItems = computed(() => {
  return allItems.value.filter(item => {
    const itemTime = new Date(item.scheduledAt)
    return itemTime.toDateString() === now.value.toDateString()
  })
})

const tomorrowItems = computed(() => {
  const tomorrow = new Date(now.value)
  tomorrow.setDate(tomorrow.getDate() + 1)
  
  return allItems.value.filter(item => {
    const itemTime = new Date(item.scheduledAt)
    return itemTime.toDateString() === tomorrow.toDateString()
  })
})

// Limit displayed items to 10 (combined today + tomorrow)
const displayedItems = computed(() => {
  const combined = [...todayItems.value, ...tomorrowItems.value]
  return combined.slice(0, 10)
})

// Split displayed items back into today/tomorrow for rendering
const displayedTodayItems = computed(() => {
  return displayedItems.value.filter(item => {
    const itemTime = new Date(item.scheduledAt)
    return itemTime.toDateString() === now.value.toDateString()
  })
})

const displayedTomorrowItems = computed(() => {
  const tomorrow = new Date(now.value)
  tomorrow.setDate(tomorrow.getDate() + 1)
  
  return displayedItems.value.filter(item => {
    const itemTime = new Date(item.scheduledAt)
    return itemTime.toDateString() === tomorrow.toDateString()
  })
})

function formatTimeRange(start, end) {
  const startTime = new Date(start).toLocaleTimeString('fr-FR', { 
    hour: '2-digit', 
    minute: '2-digit',
    timeZone: 'Europe/Paris'
  })
  const endTime = new Date(end).toLocaleTimeString('fr-FR', { 
    hour: '2-digit', 
    minute: '2-digit',
    timeZone: 'Europe/Paris'
  })
  return `${startTime} – ${endTime}`
}

async function fetchUpcoming(isInitialLoad = false) {
  try {
    if (isInitialLoad) {
      isLoading.value = true
    } else {
      isRefreshing.value = true
    }
    error.value = null
    
    // Use future episodes query
    const now = new Date().toISOString()
    const params = new URLSearchParams()
    params.set('where[and][0][scheduledAt][greater_than]', now)
    params.set('where[and][1][scheduledAt][exists]', 'true')
    params.set('where[and][2][publishedStatus][equals]', 'published')
    params.set('sort', 'scheduledAt')
    params.set('limit', '50')
    params.set('depth', '1')

    const res = await authedFetch(`/episodes?${params.toString()}`)
    if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`)
    const json = await res.json()
    
    const futureItems = json.docs || []
    
    console.log(`📅 Found ${futureItems.length} future shows`)
    allItems.value = futureItems
    
  } catch (err) {
    error.value = err.message
    console.warn('⚠️ Failed to fetch upcoming shows:', err.message)
  } finally {
    if (isInitialLoad) {
      isLoading.value = false
    } else {
      isRefreshing.value = false
    }
  }
}

onMounted(() => {
  fetchUpcoming(true)
  
  // Update time every 30 seconds and re-fetch data
  timeInterval = setInterval(() => {
    now.value = new Date()
    fetchUpcoming(false)
  }, 30000)
})

onUnmounted(() => {
  if (timeInterval) {
    clearInterval(timeInterval)
  }
})
</script>

