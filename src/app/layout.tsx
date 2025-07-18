import { Inter } from 'next/font/google'
import { TooltipProvider } from "@/components/ui/tooltip"
import { AuthProvider } from "@/contexts/AuthContext"
import "./globals.css"

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter',
})

export const metadata = {
  title: 'filecabinet - Quick & Easy File Conversion',
  description: 'Convert your files quickly and securely with filecabinet',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
        <TooltipProvider>
          {children}
        </TooltipProvider>
        </AuthProvider>
      </body>
    </html>
  )
}

// Add error boundary
export function generateStaticParams() {
  return []
}
