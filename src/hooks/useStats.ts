export function useStats() {
  const incrementConversions = async () => {
    try {
      const response = await fetch('/api/stats/increment', {
        method: 'POST',
      });
      
      if (!response.ok) {
        console.error('Failed to increment stats:', await response.text());
      }
    } catch (error) {
      console.error('Failed to increment stats:', error);
    }
  };

  return { incrementConversions };
} 