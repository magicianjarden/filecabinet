export interface ConversionStats {
  totalConversions: number
  byFormat: Record<string, number>
  bySize: Record<string, number>
  lastUpdated: string
} 