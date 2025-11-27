import { ref, onMounted, onUnmounted } from 'vue'

export function useInfiniteObserver(callback) {
  const infiniteSentinel = ref(null)
  const observer = ref(null)

  onMounted(() => {
    if (!infiniteSentinel.value) return

    observer.value = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            callback()
          }
        })
      },
      { threshold: 0.1 }
    )

    observer.value.observe(infiniteSentinel.value)
  })

  onUnmounted(() => {
    if (observer.value) {
      observer.value.disconnect()
    }
  })

  return { infiniteSentinel }
}

