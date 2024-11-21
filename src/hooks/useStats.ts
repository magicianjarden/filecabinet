export function useStats() {
  const incrementConversions = async () => {
    try {
      await fetch('/api/stats/increment', {
        method: 'POST',
      });
    } catch (error) {
      console.error('Failed to increment stats:', error);
    }
  };

  return { incrementConversions };
} 