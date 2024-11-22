export function useStats() {
  const incrementConversions = async () => {
    try {
      const response = await fetch('/api/stats/increment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    } catch (error) {
      console.error('Failed to increment stats:', error);
      // Optionally show user feedback
    }
  };

  return { incrementConversions };
} 