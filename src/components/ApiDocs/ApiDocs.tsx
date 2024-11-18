'use client';

import { useState } from 'react';
import { RequestTester } from './RequestTester';

interface Endpoint {
  path: string;
  method: string;
  summary: string;
  description?: string;
  tags?: string[];
  parameters?: any[];
  requestBody?: any;
  responses: Record<string, any>;
}

interface ApiDocsProps {
  spec: any;
}

export function ApiDocs({ spec }: ApiDocsProps) {
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  const endpoints: Endpoint[] = Object.entries(spec.paths).flatMap(([path, methods]: [string, any]) =>
    Object.entries(methods).map(([method, details]: [string, any]) => ({
      path,
      method: method.toUpperCase(),
      tags: details.tags,
      ...details,
    }))
  );

  const tags = spec.tags.map((tag: any) => tag.name);

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">{spec.info.title}</h1>
      <p className="mb-8">{spec.info.description}</p>

      {/* Tags filter */}
      <div className="mb-6 flex gap-2">
        <button
          onClick={() => setSelectedTag(null)}
          className={`px-4 py-2 rounded ${
            !selectedTag ? 'bg-blue-500 text-white' : 'bg-gray-200'
          }`}
        >
          All
        </button>
        {tags.map((tag: string) => (
          <button
            key={tag}
            onClick={() => setSelectedTag(tag)}
            className={`px-4 py-2 rounded ${
              selectedTag === tag ? 'bg-blue-500 text-white' : 'bg-gray-200'
            }`}
          >
            {tag}
          </button>
        ))}
      </div>

      {/* Endpoints */}
      <div className="space-y-6">
        {endpoints
          .filter((endpoint) => !selectedTag || endpoint.tags?.includes(selectedTag))
          .map((endpoint, index) => (
            <div key={index} className="border rounded-lg p-6">
              <div className="flex items-center gap-4 mb-4">
                <span
                  className={`px-3 py-1 rounded ${
                    endpoint.method === 'GET'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-blue-100 text-blue-800'
                  }`}
                >
                  {endpoint.method}
                </span>
                <span className="font-mono">{endpoint.path}</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">{endpoint.summary}</h3>
              {endpoint.description && (
                <p className="text-gray-600 mb-4">{endpoint.description}</p>
              )}

              {/* Parameters */}
              {endpoint.parameters && endpoint.parameters.length > 0 && (
                <div className="mb-4">
                  <h4 className="font-semibold mb-2">Parameters:</h4>
                  <ul className="list-disc pl-6">
                    {endpoint.parameters.map((param: any, i: number) => (
                      <li key={i}>
                        <span className="font-mono">{param.name}</span>
                        {param.required && <span className="text-red-500">*</span>} -{' '}
                        {param.description}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Responses */}
              <div>
                <h4 className="font-semibold mb-2">Responses:</h4>
                <div className="space-y-2">
                  {Object.entries(endpoint.responses).map(([code, details]: [string, any]) => (
                    <div key={code} className="flex gap-2">
                      <span className="font-mono">{code}</span>-
                      <span>{details.description}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Add RequestTester */}
              <RequestTester
                method={endpoint.method}
                path={endpoint.path}
                requestBody={endpoint.requestBody}
                parameters={endpoint.parameters}
              />
            </div>
          ))}
      </div>
    </div>
  );
} 