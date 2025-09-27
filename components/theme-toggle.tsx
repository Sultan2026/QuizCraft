"use client"
import { Button } from "@/components/ui/button"
import { useTheme } from "@/components/theme-provider"

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => setTheme(theme === "light" ? "dark" : "light")}
      className="w-9 px-0"
    >
      {theme === "light" ? (
        <span className="h-[1.2rem] w-[1.2rem]">🌙</span>
      ) : (
        <span className="h-[1.2rem] w-[1.2rem]">☀️</span>
      )}
      <span className="sr-only">Toggle theme</span>
    </Button>
  )
}
