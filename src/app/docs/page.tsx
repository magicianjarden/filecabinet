import { getApiDocs } from '@/lib/docs/swagger';
import { ApiDocs } from '@/components/ApiDocs/ApiDocs';

export default function DocsPage() {
  const spec = getApiDocs();
  return <ApiDocs spec={spec} />;
} 