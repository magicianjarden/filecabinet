import { Inter } from 'next/font/google'
import { TooltipProvider } from "@/components/ui/tooltip"
import "./globals.css"

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter',
})

export const metadata = {
  title: 'FileCabinet - Quick & Easy File Conversion',
  description: 'Convert your files quickly and securely with FileCabinet',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <TooltipProvider>
          {children}
        </TooltipProvider>
      </body>
    </html>
  )
}

// Add error boundary
export function generateStaticParams() {
  return []
}
