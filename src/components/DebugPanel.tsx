import { useTheme } from "next-themes"
import { ThemeToggle } from "./theme-toggle"

export function DebugPanel() {
  const { theme, resolvedTheme } = useTheme()
  
  return (
    <div className="fixed top-4 right-4 z-50 p-4 bg-card border rounded-lg shadow-lg">
      <div className="space-y-2 text-sm">
        <div>Current theme: {theme}</div>
        <div>Resolved theme: {resolvedTheme}</div>
        <div>Background: <span className="px-2 py-1 bg-background border rounded">background</span></div>
        <div>Foreground: <span className="px-2 py-1 bg-foreground text-background border rounded">foreground</span></div>
        <div>Primary: <span className="px-2 py-1 bg-primary text-primary-foreground border rounded">primary</span></div>
        <ThemeToggle />
      </div>
    </div>
  )
}