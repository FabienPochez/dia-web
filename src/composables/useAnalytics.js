import { usePostHog } from './usePostHog'

export function useAnalytics() {
  const { posthog } = usePostHog()

  function track(event, props = {}) {
    posthog.capture(event, props)
  }

  return { track }
}

