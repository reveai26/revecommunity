'use client'

import pkg from '@/package.json'

export function VersionBadge() {
  return (
    <div className="fixed bottom-4 right-4 z-50 px-3 py-1 bg-surface/80 backdrop-blur-sm border border-border rounded-full text-xs text-text-muted">
      v{pkg.version}
    </div>
  )
}
