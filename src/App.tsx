import { AppShell } from '@/ui/AppShell'
import { AppErrorBoundary } from '@/ui/components/AppErrorBoundary'

export function App() {
  return (
    <AppErrorBoundary>
      <AppShell />
    </AppErrorBoundary>
  )
}
