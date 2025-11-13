export function todayRangeISO(tz = 'Europe/Paris') {
  const now = new Date()
  
  const dateStr = now.toLocaleDateString('en-CA', { timeZone: tz })
  
  const startLocal = new Date(`${dateStr}T00:00:00`)
  
  const endLocal = new Date(startLocal)
  endLocal.setDate(endLocal.getDate() + 1)
  
  return { 
    start: startLocal.toISOString(), 
    end: endLocal.toISOString() 
  }
}

export function getDayRangeISO(days: number, tz = 'Europe/Paris'): { start: string; end: string } {
  const now = new Date()
  const dateStr = now.toLocaleDateString('en-CA', { timeZone: tz })
  
  const startLocal = new Date(`${dateStr}T00:00:00`)
  const endLocal = new Date(startLocal)
  endLocal.setDate(endLocal.getDate() + days)
  
  return {
    start: startLocal.toISOString(),
    end: endLocal.toISOString()
  }
}

export function getDayRangeISOWithOffsets(startOffset: number, endOffset: number, tz = 'Europe/Paris'): { start: string; end: string } {
  const now = new Date()
  const dateStr = now.toLocaleDateString('en-CA', { timeZone: tz })
  
  const todayLocal = new Date(`${dateStr}T00:00:00`)
  const startLocal = new Date(todayLocal)
  startLocal.setDate(startLocal.getDate() + startOffset)
  
  const endLocal = new Date(todayLocal)
  endLocal.setDate(endLocal.getDate() + endOffset)
  
  return {
    start: startLocal.toISOString(),
    end: endLocal.toISOString()
  }
}

