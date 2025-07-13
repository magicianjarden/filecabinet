import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Link as LinkIcon } from 'lucide-react';
import QRCode from 'react-qr-code';

const EXPIRATION_OPTIONS = [
  { label: '1 hour', value: 1 },
  { label: '2 hours', value: 2 },
  { label: '4 hours', value: 4 },
  { label: '8 hours', value: 8 },
  { label: '12 hours', value: 12 },
  { label: '24 hours (max)', value: 24 },
  { label: 'Custom...', value: 'custom' },
];

export default function RequestFileFlow() {
  const [requestLink, setRequestLink] = useState<string | null>(null);
  const [requesting, setRequesting] = useState(false);
  const [requestUploadLink, setRequestUploadLink] = useState<string | null>(null);
  const [requestStatusLink, setRequestStatusLink] = useState<string | null>(null);
  const [expiration, setExpiration] = useState<number | 'custom'>(24);
  const [customExpiration, setCustomExpiration] = useState('');
  const [copyUploadSuccess, setCopyUploadSuccess] = useState(false);
  const [copyStatusSuccess, setCopyStatusSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRequestFile = async () => {
    setRequesting(true);
    setRequestLink(null);
    setRequestUploadLink(null);
    setRequestStatusLink(null);
    setError(null);
    try {
      // For now, expiration is not sent to backend
      const res = await fetch('/api/request/create', { method: 'POST' });
      if (!res.ok) throw new Error('Failed to create request');
      const data = await res.json();
      const uploadUrl = `${window.location.origin}/request/${data.id}`;
      const statusUrl = `${window.location.origin}/request/${data.id}/status`;
      setRequestUploadLink(uploadUrl);
      setRequestStatusLink(statusUrl);
      setRequestLink(uploadUrl); // for backward compatibility
    } catch (err) {
      setRequestLink(null);
      setRequestUploadLink(null);
      setRequestStatusLink(null);
      setError('Failed to create request link. Please try again.');
    } finally {
      setRequesting(false);
    }
  };

  return (
    <Card className="p-8 shadow-xl border-blue-200 flex flex-col bg-gradient-to-br from-blue-50 to-white hover:shadow-2xl transition-shadow duration-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-2xl font-bold">
          <LinkIcon className="h-6 w-6 text-blue-600" />
          Request a File
        </CardTitle>
        <div className="text-slate-600 mt-2 text-base font-normal">
          Generate a secure link to request a file from someone else. They upload, you download—fully end-to-end encrypted.
        </div>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col justify-between">
        {/* Step 1: Generate Request Link */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-2">
            <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-blue-600 text-white font-bold">1</span>
            <span className="font-semibold text-blue-700">Expiration</span>
          </div>
          <div className="flex flex-col gap-1 mt-2">
            <label className="block text-sm font-medium text-slate-700 mb-1">Expiration</label>
            <div className="flex flex-wrap gap-2 mb-2">
              {EXPIRATION_OPTIONS.filter(opt => opt.value !== 'custom').map(opt => (
                <Button
                  key={opt.value}
                  type="button"
                  variant={expiration === opt.value ? 'default' : 'outline'}
                  className={expiration === opt.value ? 'bg-blue-600 text-white' : ''}
                  onClick={() => setExpiration(opt.value as number)}
                >
                  {opt.label}
                </Button>
              ))}
              <Button
                type="button"
                variant={expiration === 'custom' ? 'default' : 'outline'}
                className={expiration === 'custom' ? 'bg-blue-600 text-white' : ''}
                onClick={() => setExpiration('custom')}
              >
                Custom...
              </Button>
            </div>
            {expiration === 'custom' && (
              <div className="mt-2">
                <input
                  type="number"
                  min={1}
                  max={24}
                  className="w-full border rounded px-3 py-2"
                  placeholder="Enter hours (1-24)"
                  value={customExpiration}
                  onChange={e => {
                    const val = Math.max(1, Math.min(24, Number(e.target.value)));
                    setCustomExpiration(val.toString());
                  }}
                />
                <p className="text-xs text-slate-500 mt-1">Max expiration is 24 hours.</p>
              </div>
            )}
          </div>
          <Button
            className="mb-4 w-full max-w-xs"
            onClick={handleRequestFile}
            disabled={requesting}
            variant="outline"
            aria-label="Generate request link"
          >
            {requesting ? 'Generating...' : 'Generate Request Link'}
          </Button>
          <div className="text-xs text-slate-500 mb-2">Send this link to the person you want to receive a file from.</div>
          {error && <div className="mb-2 text-red-600 text-sm" role="alert">{error}</div>}
        </div>
        {/* Step 2: Share Links */}
        {requestUploadLink && requestStatusLink && (
          <div className="flex flex-col items-center gap-4 bg-blue-50 border border-blue-200 rounded p-4 mb-6 w-full">
            <div className="flex items-center gap-2 mb-2">
              <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-blue-600 text-white font-bold">2</span>
              <span className="font-semibold text-blue-700">Share and track your request</span>
            </div>
            {/* Upload link section */}
            <div className="w-full flex flex-col items-center gap-2 mb-4">
              <div className="font-semibold text-blue-700 text-sm mb-1">Upload your file</div>
              <div className="flex items-center gap-2">
                <LinkIcon className="h-4 w-4 text-blue-600" />
                <input
                  className="text-blue-700 underline break-all font-semibold bg-transparent border-none w-64 md:w-96 focus:outline-none"
                  value={requestUploadLink}
                  readOnly
                  aria-label="Upload link"
                  onFocus={e => e.target.select()}
                />
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    navigator.clipboard.writeText(requestUploadLink);
                    setCopyUploadSuccess(true);
                    setTimeout(() => setCopyUploadSuccess(false), 1500);
                  }}
                  aria-label="Copy upload link"
                >
                  Copy
                </Button>
                {copyUploadSuccess && <span className="ml-2 text-blue-600 text-xs">Copied!</span>}
              </div>
              <div className="bg-white p-2 rounded shadow border border-blue-100">
                <QRCode value={requestUploadLink} size={120} />
                <div className="text-xs text-slate-500 mt-1 text-center">Recipient uploads file here</div>
              </div>
            </div>
            {/* Download link section */}
            <div className="w-full flex flex-col items-center gap-2 mt-2">
              <div className="font-semibold text-green-700 text-sm mb-1">Download the file here</div>
              <div className="flex items-center gap-2">
                <LinkIcon className="h-4 w-4 text-green-600" />
                <input
                  className="text-green-700 break-all font-semibold bg-transparent border-none w-64 md:w-96 focus:outline-none"
                  value={requestStatusLink}
                  readOnly
                  aria-label="Status link"
                  onFocus={e => e.target.select()}
                />
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    navigator.clipboard.writeText(requestStatusLink);
                    setCopyStatusSuccess(true);
                    setTimeout(() => setCopyStatusSuccess(false), 1500);
                  }}
                  aria-label="Copy status link"
                >
                  Copy
                </Button>
                {copyStatusSuccess && <span className="ml-2 text-green-700 text-xs">Copied!</span>}
              </div>
              <div className="bg-white p-2 rounded shadow border border-green-100">
                <QRCode value={requestStatusLink} size={120} />
                <div className="text-xs text-slate-500 mt-1 text-center">Track & download the file here</div>
              </div>
            </div>
            <div className="text-xs text-yellow-700 bg-yellow-50 border border-yellow-200 rounded p-2 mt-2 text-center">
              <b>Important:</b> The decryption key and IV will be generated by the recipient during upload. You must obtain them from the recipient to decrypt and download the file.
            </div>
            <div className="text-blue-700 text-center mt-4">
              <b>Success!</b> Your request link is ready to share.
            </div>
          </div>
        )}
        <div className="text-xs text-slate-500 mt-2">
          <b>How it works:</b> 1. Generate a request link. 2. Send it to someone. 3. They upload a file. 4. You download it securely.
        </div>
      </CardContent>
    </Card>
  );
} 