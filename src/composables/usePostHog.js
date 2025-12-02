import posthog from 'posthog-js'

export function usePostHog() {
  if (!posthog.__initialized) {
    posthog.__initialized = true
    posthog.init('phc_dXVNt4wf5Sgz6qHfMT5Zh1YQhNQTJLUTpuI1Y8sDjdM', {
      api_host: 'https://eu.i.posthog.com',
      defaults: '2025-11-30',
      person_profiles: 'identified_only', // or 'always' to create profiles for anonymous users as well
    })
    posthog.register({ platform: 'webapp' })
  }

  return { posthog }
}

