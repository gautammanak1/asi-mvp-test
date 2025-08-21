"use client"

import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import { useEffect, useState } from "react"

export function ThemeToggle() {
  const { setTheme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <Button variant="ghost" size="sm" className="h-8 w-8 px-0">
        <Sun className="h-4 w-4" />
        <span className="sr-only">Toggle theme</span>
      </Button>
    )
  }

  const isDark = resolvedTheme === "dark"

  const toggleTheme = () => {
    const newTheme = isDark ? "light" : "dark"
    setTheme(newTheme)

    document.documentElement.classList.toggle("dark", newTheme === "dark")
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={toggleTheme}
      className="h-8 w-8 px-0 smooth-transition hover:bg-accent/20"
    >
      {isDark ? (
        <Sun className="h-4 w-4 transition-all duration-200" />
      ) : (
        <Moon className="h-4 w-4 transition-all duration-200" />
      )}
      <span className="sr-only">Toggle theme</span>
    </Button>
  )
}
