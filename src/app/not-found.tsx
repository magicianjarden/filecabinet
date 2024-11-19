import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h2 className="text-2xl font-bold">404 - Page Not Found</h2>
      <p className="mt-4">The page you&apos;re looking for doesn&apos;t exist.</p>
      <Link href="/" className="mt-4 text-blue-500 hover:text-blue-600">
        Return Home
      </Link>
    </div>
  );
} 