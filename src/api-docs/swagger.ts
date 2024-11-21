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
        schemas: {}, // TODO: Add schema definitions here
      },
    },
  });
  return spec;
}; 