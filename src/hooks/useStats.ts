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
        const errorText = await response.text();
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Failed to increment stats:', error);
      return null;
    }
  };

  return { incrementConversions };
} 