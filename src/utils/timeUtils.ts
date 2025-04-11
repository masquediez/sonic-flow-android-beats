
/**
 * Format seconds to mm:ss or hh:mm:ss format
 * @param seconds Number of seconds to format
 * @returns Formatted time string
 */
export const formatTime = (seconds: number): string => {
  if (isNaN(seconds)) return '0:00';
  
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  
  return `${minutes}:${secs.toString().padStart(2, '0')}`;
};

/**
 * Calculate progress percentage
 * @param current Current time in seconds
 * @param total Total time in seconds
 * @returns Progress percentage (0-100)
 */
export const calculateProgress = (current: number, total: number): number => {
  if (isNaN(current) || isNaN(total) || total === 0) return 0;
  return (current / total) * 100;
};
