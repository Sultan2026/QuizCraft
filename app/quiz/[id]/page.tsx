"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import {
  Edit,
  Check,
  X,
  Download,
  Share,
  Copy,
  FileText,
  FileSpreadsheet,
  Code,
  Play,
  ChevronLeft,
  ChevronRight,
  QrCode,
  ExternalLink,
  MessageCircle,
} from "lucide-react"

// Extended quiz data structure with questions
interface Question {
  id: string
  text: string
  options: string[]
  correctAnswer: number
  explanation?: string
}

interface QuizDetail {
  id: string
  title: string
  createdAt: string
  questionsCount: number
  status: "active" | "draft"
  questions: Question[]
}

// Mock quiz detail data
const mockQuizDetail: QuizDetail = {
  id: "1",
  title: "Introduction to React",
  createdAt: "2024-01-15",
  questionsCount: 5,
  status: "active",
  questions: [
    {
      id: "q1",
      text: "What is React?",
      options: [
        "A JavaScript library for building user interfaces",
        "A database management system",
        "A CSS framework",
        "A server-side programming language",
      ],
      correctAnswer: 0,
      explanation:
        "React is a JavaScript library developed by Facebook for building user interfaces, particularly web applications.",
    },
    {
      id: "q2",
      text: "What is JSX?",
      options: [
        "A new programming language",
        "A syntax extension for JavaScript",
        "A CSS preprocessor",
        "A database query language",
      ],
      correctAnswer: 1,
      explanation:
        "JSX is a syntax extension for JavaScript that allows you to write HTML-like code in your JavaScript files.",
    },
    {
      id: "q3",
      text: "What is a React component?",
      options: ["A CSS class", "A JavaScript function or class that returns JSX", "A HTML element", "A database table"],
      correctAnswer: 1,
      explanation:
        "A React component is a JavaScript function or class that returns JSX to describe what should appear on the screen.",
    },
    {
      id: "q4",
      text: "What is the purpose of useState hook?",
      options: ["To fetch data from an API", "To manage component state", "To handle routing", "To style components"],
      correctAnswer: 1,
      explanation: "The useState hook allows you to add state to functional components in React.",
    },
    {
      id: "q5",
      text: "What is the virtual DOM?",
      options: ["A real DOM element", "A JavaScript representation of the real DOM", "A CSS framework", "A database"],
      correctAnswer: 1,
      explanation:
        "The virtual DOM is a JavaScript representation of the real DOM that React uses to optimize rendering performance.",
    },
  ],
}

export default function QuizDetailPage() {
  const [quiz, setQuiz] = useState<QuizDetail | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isEditingTitle, setIsEditingTitle] = useState(false)
  const [editedTitle, setEditedTitle] = useState("")
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [selectedAnswers, setSelectedAnswers] = useState<{ [key: number]: number }>({})
  const [showResults, setShowResults] = useState(false)
  const router = useRouter()
  const params = useParams()
  const quizId = params.id as string
  const { toast } = useToast()

  // Mock authentication check
  const isLoggedIn = true

  useEffect(() => {
    if (!isLoggedIn) {
      router.push("/login")
      return
    }

    // Mock API call to fetch quiz detail
    const fetchQuizDetail = async () => {
      setIsLoading(true)
      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // In a real app, you'd fetch based on quizId
      if (quizId === "1") {
        setQuiz(mockQuizDetail)
        setEditedTitle(mockQuizDetail.title)
      } else {
        // Handle quiz not found
        setQuiz(null)
      }
      setIsLoading(false)
    }

    fetchQuizDetail()
  }, [isLoggedIn, router, quizId])

  const handleTitleEdit = () => {
    setIsEditingTitle(true)
  }

  const handleTitleSave = async () => {
    if (quiz && editedTitle.trim()) {
      // Mock API call to update title
      setQuiz({ ...quiz, title: editedTitle.trim() })
      setIsEditingTitle(false)
      console.log("Title updated:", editedTitle)
    }
  }

  const handleTitleCancel = () => {
    setEditedTitle(quiz?.title || "")
    setIsEditingTitle(false)
  }

  const getPublicQuizUrl = () => {
    return `${window.location.origin}/take/${quizId}`
  }

  const getEmbedCode = () => {
    const embedUrl = getPublicQuizUrl()
    return `<iframe src="${embedUrl}" width="100%" height="600" frameborder="0" style="border-radius: 8px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);"></iframe>`
  }

  const getQRCodeUrl = () => {
    const url = encodeURIComponent(getPublicQuizUrl())
    return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${url}`
  }

  const handleCopyPublicLink = async () => {
    try {
      await navigator.clipboard.writeText(getPublicQuizUrl())
      toast({
        title: "Link copied!",
        description: "Public quiz link has been copied to your clipboard.",
      })
    } catch (err) {
      console.error("Failed to copy link:", err)
      toast({
        title: "Copy failed",
        description: "Please try copying the link manually.",
        variant: "destructive",
      })
    }
  }

  const handleCopyEmbedCode = async () => {
    try {
      await navigator.clipboard.writeText(getEmbedCode())
      toast({
        title: "Embed code copied!",
        description: "Embed code has been copied to your clipboard.",
      })
    } catch (err) {
      console.error("Failed to copy embed code:", err)
      toast({
        title: "Copy failed",
        description: "Please try copying the embed code manually.",
        variant: "destructive",
      })
    }
  }

  const handleShareTwitter = () => {
    const text = encodeURIComponent(`Check out this quiz: ${quiz?.title}`)
    const url = encodeURIComponent(getPublicQuizUrl())
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, "_blank")
  }

  const handleShareLinkedIn = () => {
    const url = encodeURIComponent(getPublicQuizUrl())
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${url}`, "_blank")
  }

  const handleShareWhatsApp = () => {
    const text = encodeURIComponent(`Check out this quiz: ${quiz?.title} ${getPublicQuizUrl()}`)
    window.open(`https://wa.me/?text=${text}`, "_blank")
  }

  const handleShareLink = () => {
    setIsShareDialogOpen(true)
  }

  const handleExportPDF = () => {
    console.log("Exporting to PDF...")
    // In a real app, you'd generate and download a PDF
  }

  const handleExportCSV = () => {
    if (!quiz) return

    // Create CSV content
    const csvContent = [
      ["Question", "Option A", "Option B", "Option C", "Option D", "Correct Answer", "Explanation"],
      ...quiz.questions.map((q) => [
        q.text,
        q.options[0] || "",
        q.options[1] || "",
        q.options[2] || "",
        q.options[3] || "",
        q.options[q.correctAnswer] || "",
        q.explanation || "",
      ]),
    ]
      .map((row) => row.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(","))
      .join("\n")

    // Download CSV
    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${quiz?.title.replace(/[^a-z0-9]/gi, "_").toLowerCase()}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleExportJSON = () => {
    if (!quiz) return

    const jsonContent = JSON.stringify(quiz, null, 2)
    const blob = new Blob([jsonContent], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${quiz?.title.replace(/[^a-z0-9]/gi, "_").toLowerCase()}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleCopyText = () => {
    if (!quiz) return

    const textContent = [
      `Quiz: ${quiz.title}`,
      `Created: ${new Date(quiz.createdAt).toLocaleDateString()}`,
      "",
      ...quiz.questions.map((q, index) =>
        [
          `${index + 1}. ${q.text}`,
          ...q.options.map(
            (option, optIndex) =>
              `   ${String.fromCharCode(65 + optIndex)}. ${option}${optIndex === q.correctAnswer ? " ✓" : ""}`,
          ),
          q.explanation ? `   Explanation: ${q.explanation}` : "",
          "",
        ].join("\n"),
      ),
    ].join("\n")

    navigator.clipboard.writeText(textContent)
    console.log("Quiz text copied to clipboard")
  }

  const startPreview = () => {
    setCurrentQuestionIndex(0)
    setSelectedAnswers({})
    setShowResults(false)
    setIsPreviewOpen(true)
  }

  const handleAnswerSelect = (answerIndex: number) => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [currentQuestionIndex]: answerIndex,
    }))
  }

  const goToNextQuestion = () => {
    if (quiz && currentQuestionIndex < quiz.questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1)
    }
  }

  const goToPreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1)
    }
  }

  const finishPreview = () => {
    setShowResults(true)
  }

  const resetPreview = () => {
    setCurrentQuestionIndex(0)
    setSelectedAnswers({})
    setShowResults(false)
  }

  const calculateScore = () => {
    if (!quiz) return { correct: 0, total: 0, percentage: 0 }

    const correct = quiz.questions.reduce((count, question, index) => {
      return selectedAnswers[index] === question.correctAnswer ? count + 1 : count
    }, 0)

    const total = quiz.questions.length
    const percentage = Math.round((correct / total) * 100)

    return { correct, total, percentage }
  }

  if (!isLoggedIn) {
    return null
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4">
        <div className="max-w-4xl mx-auto pt-8">
          <div className="flex items-center justify-center py-12">
            <div className="text-muted-foreground">Loading quiz...</div>
          </div>
        </div>
      </div>
    )
  }

  if (!quiz) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4">
        <div className="max-w-4xl mx-auto pt-8">
          <Card>
            <CardContent className="text-center py-12">
              <h2 className="text-xl font-semibold mb-2">Quiz Not Found</h2>
              <p className="text-muted-foreground mb-4">
                The quiz you're looking for doesn't exist or has been deleted.
              </p>
              <Button onClick={() => router.push("/dashboard")}>Back to Dashboard</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4">
      <div className="max-w-4xl mx-auto pt-8">
        {/* Header with title and actions */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex-1">
            {isEditingTitle ? (
              <div className="flex items-center gap-2">
                <Input
                  value={editedTitle}
                  onChange={(e) => setEditedTitle(e.target.value)}
                  className="text-2xl font-bold h-auto py-2"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleTitleSave()
                    if (e.key === "Escape") handleTitleCancel()
                  }}
                  autoFocus
                />
                <Button size="sm" onClick={handleTitleSave}>
                  <Check className="h-4 w-4" />
                </Button>
                <Button size="sm" variant="outline" onClick={handleTitleCancel}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <h1 className="text-3xl font-bold text-foreground">{quiz?.title}</h1>
                <Button size="sm" variant="ghost" onClick={handleTitleEdit}>
                  <Edit className="h-4 w-4" />
                </Button>
              </div>
            )}
            <div className="flex items-center gap-4 mt-2">
              <p className="text-muted-foreground">Created {new Date(quiz?.createdAt || "").toLocaleDateString()}</p>
              <Badge variant={quiz?.status === "active" ? "default" : "secondary"}>{quiz?.status}</Badge>
              <span className="text-sm text-muted-foreground">{quiz?.questionsCount} questions</span>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={startPreview}>
              <Play className="h-4 w-4 mr-2" />
              Preview Quiz
            </Button>
            <Button variant="outline" onClick={handleShareLink}>
              <Share className="h-4 w-4 mr-2" />
              Share
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleExportPDF}>
                  <FileText className="h-4 w-4 mr-2" />
                  Export as PDF
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleExportCSV}>
                  <FileSpreadsheet className="h-4 w-4 mr-2" />
                  Export as CSV
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleExportJSON}>
                  <Code className="h-4 w-4 mr-2" />
                  Export as JSON
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleCopyText}>
                  <Copy className="h-4 w-4 mr-2" />
                  Copy as Text
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Questions list */}
        <div className="space-y-6">
          {quiz.questions.map((question, index) => (
            <Card key={question.id}>
              <CardHeader>
                <CardTitle className="text-lg">Question {index + 1}</CardTitle>
                <CardDescription className="text-base font-medium text-foreground">{question.text}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {question.options.map((option, optionIndex) => (
                    <div
                      key={optionIndex}
                      className={`p-3 rounded-lg border transition-colors ${
                        optionIndex === question.correctAnswer
                          ? "bg-green-50 border-green-200 text-green-800"
                          : "bg-slate-50 border-slate-200"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="font-medium text-sm">{String.fromCharCode(65 + optionIndex)}.</span>
                        <span className="flex-1">{option}</span>
                        {optionIndex === question.correctAnswer && (
                          <Badge variant="secondary" className="bg-green-100 text-green-800">
                            Correct
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                  {question.explanation && (
                    <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <p className="text-sm text-blue-800">
                        <strong>Explanation:</strong> {question.explanation}
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Back to dashboard */}
        <div className="mt-8 text-center">
          <Button variant="outline" onClick={() => router.push("/dashboard")}>
            Back to Dashboard
          </Button>
        </div>

        {/* Quiz Preview Modal */}
        <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold">
                {showResults ? "Quiz Results" : `Preview: ${quiz?.title}`}
              </DialogTitle>
            </DialogHeader>

            {quiz && !showResults && (
              <div className="space-y-6">
                {/* Progress indicator */}
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span>
                    Question {currentQuestionIndex + 1} of {quiz.questions.length}
                  </span>
                  <div className="flex gap-1">
                    {quiz.questions.map((_, index) => (
                      <div
                        key={index}
                        className={`w-2 h-2 rounded-full ${
                          index === currentQuestionIndex
                            ? "bg-primary"
                            : selectedAnswers[index] !== undefined
                              ? "bg-green-500"
                              : "bg-muted"
                        }`}
                      />
                    ))}
                  </div>
                </div>

                {/* Current question */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">{quiz.questions[currentQuestionIndex].text}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {quiz.questions[currentQuestionIndex].options.map((option, optionIndex) => (
                        <button
                          key={optionIndex}
                          onClick={() => handleAnswerSelect(optionIndex)}
                          className={`w-full p-4 text-left rounded-lg border transition-all ${
                            selectedAnswers[currentQuestionIndex] === optionIndex
                              ? "bg-primary/10 border-primary text-primary"
                              : "bg-background border-border hover:bg-muted/50"
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                                selectedAnswers[currentQuestionIndex] === optionIndex
                                  ? "border-primary bg-primary"
                                  : "border-muted-foreground"
                              }`}
                            >
                              {selectedAnswers[currentQuestionIndex] === optionIndex && (
                                <div className="w-2 h-2 rounded-full bg-white" />
                              )}
                            </div>
                            <span className="font-medium text-sm">{String.fromCharCode(65 + optionIndex)}.</span>
                            <span className="flex-1">{option}</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Navigation buttons */}
                <div className="flex items-center justify-between">
                  <Button variant="outline" onClick={goToPreviousQuestion} disabled={currentQuestionIndex === 0}>
                    <ChevronLeft className="h-4 w-4 mr-2" />
                    Previous
                  </Button>

                  {currentQuestionIndex === quiz.questions.length - 1 ? (
                    <Button
                      onClick={finishPreview}
                      disabled={Object.keys(selectedAnswers).length !== quiz.questions.length}
                    >
                      Finish Quiz
                    </Button>
                  ) : (
                    <Button onClick={goToNextQuestion} disabled={selectedAnswers[currentQuestionIndex] === undefined}>
                      Next
                      <ChevronRight className="h-4 w-4 ml-2" />
                    </Button>
                  )}
                </div>
              </div>
            )}

            {quiz && showResults && (
              <div className="space-y-6">
                {/* Score summary */}
                <Card>
                  <CardHeader className="text-center">
                    <CardTitle className="text-3xl font-bold text-primary">{calculateScore().percentage}%</CardTitle>
                    <CardDescription className="text-lg">
                      You got {calculateScore().correct} out of {calculateScore().total} questions correct
                    </CardDescription>
                  </CardHeader>
                </Card>

                {/* Detailed results */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Review Your Answers</h3>
                  {quiz.questions.map((question, index) => {
                    const userAnswer = selectedAnswers[index]
                    const isCorrect = userAnswer === question.correctAnswer

                    return (
                      <Card
                        key={question.id}
                        className={`border-l-4 ${isCorrect ? "border-l-green-500" : "border-l-red-500"}`}
                      >
                        <CardHeader>
                          <div className="flex items-start justify-between">
                            <CardTitle className="text-base">
                              Question {index + 1}: {question.text}
                            </CardTitle>
                            <Badge variant={isCorrect ? "default" : "destructive"}>
                              {isCorrect ? "Correct" : "Incorrect"}
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2">
                            <div className="text-sm">
                              <span className="font-medium">Your answer: </span>
                              <span className={isCorrect ? "text-green-600" : "text-red-600"}>
                                {String.fromCharCode(65 + userAnswer)} - {question.options[userAnswer]}
                              </span>
                            </div>
                            {!isCorrect && (
                              <div className="text-sm">
                                <span className="font-medium">Correct answer: </span>
                                <span className="text-green-600">
                                  {String.fromCharCode(65 + question.correctAnswer)} -{" "}
                                  {question.options[question.correctAnswer]}
                                </span>
                              </div>
                            )}
                            {question.explanation && (
                              <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                                <p className="text-sm text-blue-800">
                                  <strong>Explanation:</strong> {question.explanation}
                                </p>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>

                {/* Results actions */}
                <div className="flex items-center justify-center gap-4">
                  <Button variant="outline" onClick={resetPreview}>
                    Try Again
                  </Button>
                  <Button onClick={() => setIsPreviewOpen(false)}>Close Preview</Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Share & Embed Dialog */}
        <Dialog open={isShareDialogOpen} onOpenChange={setIsShareDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold">Share Your Quiz</DialogTitle>
            </DialogHeader>

            <div className="space-y-6">
              {/* Public Link */}
              <div className="space-y-3">
                <Label className="text-base font-medium">Public Quiz Link</Label>
                <div className="flex gap-2">
                  <Input value={getPublicQuizUrl()} readOnly className="flex-1" />
                  <Button onClick={handleCopyPublicLink} size="sm">
                    <Copy className="h-4 w-4 mr-2" />
                    Copy
                  </Button>
                  <Button variant="outline" size="sm" asChild>
                    <a href={getPublicQuizUrl()} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground">
                  Anyone with this link can take your quiz. No account required.
                </p>
              </div>

              {/* Embed Code */}
              <div className="space-y-3">
                <Label className="text-base font-medium">Embed Code</Label>
                <div className="space-y-2">
                  <Textarea value={getEmbedCode()} readOnly className="font-mono text-sm resize-none" rows={3} />
                  <Button onClick={handleCopyEmbedCode} size="sm" className="w-full">
                    <Code className="h-4 w-4 mr-2" />
                    Copy Embed Code
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground">
                  Paste this code into your website or blog to embed the quiz directly.
                </p>
              </div>

              {/* QR Code */}
              <div className="space-y-3">
                <Label className="text-base font-medium">QR Code</Label>
                <div className="flex items-center gap-4">
                  <div className="flex-shrink-0">
                    <img
                      src={getQRCodeUrl() || "/placeholder.svg"}
                      alt="QR Code for quiz"
                      className="w-32 h-32 border rounded-lg"
                    />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-muted-foreground mb-3">
                      Scan this QR code with a mobile device to access the quiz instantly.
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const link = document.createElement("a")
                        link.href = getQRCodeUrl()
                        link.download = `${quiz?.title || "quiz"}-qr-code.png`
                        link.click()
                      }}
                    >
                      <QrCode className="h-4 w-4 mr-2" />
                      Download QR Code
                    </Button>
                  </div>
                </div>
              </div>

              {/* Social Share Buttons */}
              <div className="space-y-3">
                <Label className="text-base font-medium">Share on Social Media</Label>
                <div className="flex gap-2">
                  <Button onClick={handleShareTwitter} variant="outline" size="sm">
                    <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                    </svg>
                    Twitter
                  </Button>
                  <Button onClick={handleShareLinkedIn} variant="outline" size="sm">
                    <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                    </svg>
                    LinkedIn
                  </Button>
                  <Button onClick={handleShareWhatsApp} variant="outline" size="sm">
                    <MessageCircle className="h-4 w-4 mr-2" />
                    WhatsApp
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground">
                  Share your quiz on social media to reach a wider audience.
                </p>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
