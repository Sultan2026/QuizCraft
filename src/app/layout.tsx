import type React from "react"
import type { Metadata } from "next"
import { Inter, Fira_Code } from "next/font/google"
import { Suspense } from "react"
import { ThemeProvider } from "@/components/theme-provider"
import { AuthProvider } from "@/contexts/AuthContext"
import "./globals.css"

// Main sans-serif font (replaces Geist)
const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "700"],
})

// Monospace font (replaces Geist Mono)
const firaCode = Fira_Code({
  subsets: ["latin"],
  weight: ["400", "700"],
})

export const metadata: Metadata = {
  title: "QuizCraft Simple - Turn Documents into Quizzes in Seconds",
  description:
    "Transform any document into engaging quizzes instantly with AI. Perfect for educators, trainers, and content creators.",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${inter.className} ${firaCode.className}`}>
      <body className="antialiased">
        <AuthProvider>
          <ThemeProvider defaultTheme="system" storageKey="quizcraft-ui-theme">
            <Suspense fallback={null}>{children}</Suspense>
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
