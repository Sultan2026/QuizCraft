"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { ThemeToggle } from "@/components/theme-toggle"
import { useAuth } from "@/contexts/AuthContext"
import Link from "next/link"

export default function LandingPage() {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [customText, setCustomText] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [inputMode, setInputMode] = useState<"text" | "file">("text")
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && user) {
      router.push('/dashboard')
    }
  }, [user, loading, router])

  const handleGenerateQuiz = async () => {
    if (!uploadedFile && !customText.trim()) return

    // Redirect to login if not authenticated
    if (!user) {
      router.push('/login')
      return
    }

    // Redirect to create page for authenticated users
    router.push('/create')
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const maxSize = 10 * 1024 * 1024 // 10MB
      if (file.size > maxSize) {
        alert("File size must be less than 10MB")
        return
      }

      setUploadedFile(file)
      setCustomText("") // Clear text when file is uploaded
      console.log("File uploaded:", file.name, file.type, file.size)
    }
  }

  const handleTextChange = (value: string) => {
    setCustomText(value)
    if (value.trim() && uploadedFile) {
      setUploadedFile(null) // Clear file when text is entered
    }
  }

  const hasContent = uploadedFile || customText.trim()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <nav className="border-b bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-primary to-primary/80 rounded-lg flex items-center justify-center">
                <span className="text-white text-sm">✨</span>
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
                QuizCraft
              </span>
            </div>
            <div className="flex items-center gap-3">
              <ThemeToggle />
              <Button variant="ghost" size="sm" asChild className="hidden sm:inline-flex">
                <Link href="/login">Sign In</Link>
              </Button>
              <Button size="sm" asChild>
                <Link href="/signup">Get Started</Link>
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-primary/5 dark:from-primary/10 dark:via-transparent dark:to-primary/10" />
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
          <div className="text-center max-w-4xl mx-auto mb-12">
            <Badge variant="secondary" className="mb-6 px-4 py-2 text-sm font-medium">
              <span className="mr-2">✨</span>
              AI-Powered Quiz Generation
            </Badge>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-balance mb-6">
              Turn Any Content Into
              <span className="bg-gradient-to-r from-primary via-primary/90 to-primary/80 bg-clip-text text-transparent block sm:inline">
                {" "}
                Smart Quizzes
              </span>
            </h1>

            <p className="text-lg sm:text-xl text-muted-foreground text-balance mb-8 max-w-2xl mx-auto leading-relaxed">
              Upload documents or paste text. Our AI instantly creates engaging quizzes with detailed explanations.
            </p>
          </div>

          <div className="max-w-3xl mx-auto">
            <Card className="border-2 shadow-2xl bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm">
              <CardHeader className="text-center pb-6">
                <CardTitle className="text-2xl font-bold">Create Your Quiz</CardTitle>
                <CardDescription className="text-lg">Choose your input method and let AI do the rest</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex justify-center">
                  <div className="bg-muted p-1 rounded-lg flex">
                    <Button
                      variant={inputMode === "text" ? "default" : "ghost"}
                      size="sm"
                      onClick={() => {
                        setInputMode("text")
                        setUploadedFile(null)
                      }}
                      className="px-6"
                    >
                      📝 Paste Text
                    </Button>
                    <Button
                      variant={inputMode === "file" ? "default" : "ghost"}
                      size="sm"
                      onClick={() => {
                        setInputMode("file")
                        setCustomText("")
                      }}
                      className="px-6"
                    >
                      📁 Upload File
                    </Button>
                  </div>
                </div>

                <div className="space-y-4">
                  {inputMode === "text" ? (
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Enter your content:</label>
                      <Textarea
                        placeholder="Paste your text content here... (articles, notes, study materials, etc.)"
                        value={customText}
                        onChange={(e) => handleTextChange(e.target.value)}
                        rows={8}
                        className="resize-none text-base"
                      />
                      <p className="text-xs text-muted-foreground">
                        {customText.length} characters • Minimum 100 characters recommended
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Upload your document:</label>
                      <div className="border-2 border-dashed border-muted-foreground/25 hover:border-primary/50 transition-colors rounded-lg p-8 text-center">
                        <div className="text-4xl mb-4">📁</div>
                        <Input
                          type="file"
                          accept=".pdf,.doc,.docx,.txt,.md"
                          onChange={handleFileUpload}
                          className="cursor-pointer max-w-xs mx-auto"
                        />
                        <p className="text-sm text-muted-foreground mt-2">PDF, Word, Text files • Max 10MB</p>
                        {uploadedFile && (
                          <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                            <p className="text-sm font-medium text-green-700 dark:text-green-300">
                              ✅ {uploadedFile.name} ({Math.round(uploadedFile.size / 1024)}KB)
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <div className="text-center space-y-4">
                  <Button
                    onClick={handleGenerateQuiz}
                    disabled={!hasContent || isGenerating}
                    size="lg"
                    className="w-full sm:w-auto px-12 py-4 text-lg font-semibold shadow-lg hover:shadow-xl transition-all"
                  >
                    {isGenerating ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3" />
                        Generating Quiz...
                      </>
                    ) : (
                      <>
                        <span className="mr-2">🎯</span>
                        Generate Quiz with AI
                      </>
                    )}
                  </Button>

                  <div className="space-y-2">
                    {!hasContent ? (
                      <p className="text-sm text-muted-foreground">
                        {inputMode === "text" ? "Enter some text to get started" : "Upload a file to continue"}
                      </p>
                    ) : (
                      <p className="text-sm text-green-600 dark:text-green-400">
                        ✅ Ready to generate • AI will create {customText.length > 1000 ? "10-15" : "5-10"} questions
                      </p>
                    )}

                    <div className="flex items-center justify-center gap-4 text-sm">
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((i) => (
                          <span key={i} className="text-yellow-400">
                            ⭐
                          </span>
                        ))}
                        <span className="ml-1 text-muted-foreground">4.9/5 rating</span>
                      </div>
                      <span className="text-muted-foreground">•</span>
                      <Button variant="link" size="sm" asChild className="p-0 h-auto">
                        <Link href="/demo">Try Demo</Link>
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section className="py-16 bg-white dark:bg-slate-900">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Why Choose QuizCraft?</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {[
              {
                icon: "⚡",
                title: "Instant Creation",
                description: "Generate comprehensive quizzes in seconds, not hours.",
              },
              {
                icon: "✨",
                title: "AI-Powered",
                description: "Advanced AI creates relevant, challenging questions automatically.",
              },
              {
                icon: "🔗",
                title: "Easy Sharing",
                description: "Share via link, QR code, or embed anywhere.",
              },
            ].map((feature, index) => (
              <Card key={index} className="text-center border-0 shadow-lg hover:shadow-xl transition-shadow">
                <CardHeader>
                  <div className="text-4xl mb-4">{feature.icon}</div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">{feature.description}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 bg-gradient-to-br from-slate-50 to-white dark:from-slate-800 dark:to-slate-900">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">How It Works</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {[
              { step: "1", title: "Input", description: "Upload document or paste your content", icon: "📝" },
              { step: "2", title: "Generate", description: "AI creates engaging questions instantly", icon: "✨" },
              { step: "3", title: "Share", description: "Share your quiz and track results", icon: "🔗" },
            ].map((step, index) => (
              <div key={index} className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-primary to-primary/80 rounded-2xl flex items-center justify-center shadow-lg relative">
                  <span className="text-2xl">{step.icon}</span>
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-white rounded-full border-2 border-primary flex items-center justify-center text-sm font-bold text-primary">
                    {step.step}
                  </div>
                </div>
                <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
                <p className="text-muted-foreground">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 bg-gradient-to-r from-primary to-primary/90">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Ready to Create Your First Quiz?</h2>
          <p className="text-xl text-primary-foreground/90 mb-8 max-w-2xl mx-auto">
            Join thousands who are already creating engaging quizzes with AI.
          </p>
          <Button
            size="lg"
            variant="secondary"
            asChild
            className="px-8 py-3 text-lg font-semibold shadow-lg hover:shadow-xl transition-all"
          >
            <Link href="/signup">
              Start Creating Now
              <span className="ml-2">→</span>
            </Link>
          </Button>
        </div>
      </section>

      <footer className="bg-slate-900 text-white py-8 dark:bg-slate-800">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center gap-2 mb-4 md:mb-0">
              <div className="w-8 h-8 bg-gradient-to-br from-primary to-primary/80 rounded-lg flex items-center justify-center">
                <span className="text-white text-sm">✨</span>
              </div>
              <span className="text-xl font-bold">QuizCraft</span>
            </div>
            <div className="flex items-center gap-6 text-sm text-slate-400">
              <Link href="#" className="hover:text-white transition-colors">
                Privacy
              </Link>
              <Link href="#" className="hover:text-white transition-colors">
                Terms
              </Link>
              <Link href="#" className="hover:text-white transition-colors">
                Contact
              </Link>
            </div>
          </div>
          <div className="border-t border-slate-800 mt-6 pt-6 text-center text-slate-400 text-sm dark:border-slate-700">
            <p>&copy; 2025 QuizCraft. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}