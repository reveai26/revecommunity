import type { Metadata } from 'next'
import './globals.css'
import { ThemeProvider } from '@/components/theme-provider'
import { Sidebar } from '@/components/sidebar'
import { MobileNav } from '@/components/mobile-nav'
import { VersionBadge } from '@/components/version-badge'

export const metadata: Metadata = {
  title: '레브 커뮤니티',
  description: 'IT&AI 크리에이터 큐레이션 커뮤니티',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <body className="antialiased">
        <ThemeProvider>
          <div className="flex min-h-screen">
            {/* Desktop Sidebar */}
            <Sidebar />

            {/* Main Content */}
            <main className="flex-1 md:ml-16 pb-16 md:pb-0">
              {children}
            </main>

            {/* Mobile Bottom Navigation */}
            <MobileNav />

            {/* Version Badge */}
            <VersionBadge />
          </div>
        </ThemeProvider>
      </body>
    </html>
  )
}
