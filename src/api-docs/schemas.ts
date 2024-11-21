export const commonSchemas = {
  Error: {
    type: 'object',
    properties: {
      error: {
        type: 'object',
        properties: {
          message: { type: 'string' },
          code: { type: 'string' },
        },
      },
    },
  },
  Progress: {
    type: 'object',
    properties: {
      progress: { type: 'number' },
      status: { 
        type: 'string',
        enum: ['pending', 'processing', 'completed', 'failed']
      },
      message: { type: 'string' },
    },
  },
  ConversionResponse: {
    type: 'object',
    properties: {
      url: { type: 'string' },
      expiresAt: { type: 'string', format: 'date-time' },
    },
  },
}; 