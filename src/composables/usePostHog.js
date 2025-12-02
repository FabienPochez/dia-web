import posthog from 'posthog-js'

export function usePostHog() {
  if (!posthog.__initialized) {
    posthog.__initialized = true
    posthog.init('phc_MYLWM5FCKlXA33FACSWpVJNiyjSIhqXkXUg80JO3He', {
      api_host: 'https://us.i.posthog.com',
      person_profiles: 'identified_only'
    })
    posthog.register({ platform: 'webapp' })
  }

  return { posthog }
}

