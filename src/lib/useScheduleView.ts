import { reactive, toRefs } from 'vue'

interface ScheduleViewState {
  isOpen: boolean
}

const state = reactive<ScheduleViewState>({
  isOpen: false
})

export function useScheduleView() {
  function openSchedule() {
    state.isOpen = true
  }

  function closeSchedule() {
    state.isOpen = false
  }

  return {
    ...toRefs(state),
    openSchedule,
    closeSchedule
  }
}

