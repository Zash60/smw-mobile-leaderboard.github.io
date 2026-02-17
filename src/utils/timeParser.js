export function parseTimeToMilliseconds(timeStr) {
  if (!timeStr || typeof timeStr !== 'string') return 0
  
  // Replace colons with dots for parsing
  const normalized = timeStr.replace(/:/g, '.')
  const parts = normalized.split('.')
  let totalMs = 0
  
  if (parts.length === 4) {
    // h:m:s.ms format (e.g. 1:9:42.440 = 1h 9m 42s 440ms)
    totalMs += parseInt(parts[0]) * 3600000 // hours
    totalMs += parseInt(parts[1]) * 60000   // minutes
    totalMs += parseInt(parts[2]) * 1000    // seconds
    totalMs += parseInt(parts[3])           // milliseconds
  } else if (parts.length === 3) {
    // m:s.ms format (e.g. 9:42.440 = 9m 42s 440ms)
    totalMs += parseInt(parts[0]) * 60000   // minutes
    totalMs += parseInt(parts[1]) * 1000    // seconds
    totalMs += parseInt(parts[2])           // milliseconds
  } else if (parts.length === 2) {
    // m:s format (e.g. 9:42 = 9m 42s)
    totalMs += parseInt(parts[0]) * 60000   // minutes
    totalMs += parseInt(parts[1]) * 1000    // seconds
  } else if (parts.length === 1) {
    // just seconds (e.g. 42 = 42s)
    totalMs += parseInt(parts[0]) * 1000    // seconds
  }
  
  return totalMs
}

export function formatTime(ms) {
  if (!ms) return '0'
  const hours = Math.floor(ms / 3600000)
  const minutes = Math.floor((ms % 3600000) / 60000)
  const seconds = Math.floor((ms % 60000) / 1000)
  const milliseconds = ms % 1000
  
  if (hours > 0) {
    return `${hours}:${minutes}:${seconds}.${milliseconds}`
  } else if (minutes > 0) {
    return `${minutes}:${seconds}.${milliseconds}`
  } else {
    return `${seconds}.${milliseconds}`
  }
}
