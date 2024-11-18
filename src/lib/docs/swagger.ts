import { createSwaggerSpec } from 'next-swagger-doc';

export const getApiDocs = () => {
  const spec = createSwaggerSpec({
    apiFolder: 'src/app/api',
    definition: {
      openapi: '3.0.0',
      info: {
        title: 'File Conversion API',
        version: '1.0.0',
        description: 'API for converting various file formats',
        contact: {
          name: 'API Support',
          email: 'support@example.com',
        },
      },
      servers: [
        {
          url: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000',
          description: 'API server',
        },
      ],
      tags: [
        { name: 'documents', description: 'Document conversion operations' },
        { name: 'images', description: 'Image conversion operations' },
        { name: 'media', description: 'Media conversion operations' },
        { name: 'progress', description: 'Conversion progress tracking' },
      ],
      components: {
        schemas: {
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
        },
      },
    },
  });
  return spec;
}; 