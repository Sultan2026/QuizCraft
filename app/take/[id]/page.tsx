"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useToast } from "@/hooks/use-toast"
import { ChevronLeft, ChevronRight, Clock, RotateCcw, Download, Copy, FileSpreadsheet, Code } from "lucide-react"
import Link from "next/link"

// Reuse the same interfaces from quiz detail page
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

// Mock quiz data (same as quiz detail page)
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

export default function TakeQuizPage() {
  const [quiz, setQuiz] = useState<QuizDetail | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [selectedAnswers, setSelectedAnswers] = useState<{ [key: number]: number }>({})
  const [showResults, setShowResults] = useState(false)
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null) // Optional timer
  const router = useRouter()
  const params = useParams()
  const quizId = params.id as string
  const { toast } = useToast()

  // Mock authentication check (optional for logged-in users)
  const isLoggedIn = false // This would come from your auth system

  useEffect(() => {
    // Mock API call to fetch quiz detail
    const fetchQuizDetail = async () => {
      setIsLoading(true)
      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // In a real app, you'd fetch based on quizId
      if (quizId === "1") {
        setQuiz(mockQuizDetail)
        // Optional: Set timer (e.g., 10 minutes for the entire quiz)
        // setTimeRemaining(10 * 60) // 10 minutes in seconds
      } else {
        setQuiz(null)
      }
      setIsLoading(false)
    }

    fetchQuizDetail()
  }, [quizId])

  // Optional timer countdown
  useEffect(() => {
    if (timeRemaining === null || timeRemaining <= 0 || showResults) return

    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev === null || prev <= 1) {
          // Time's up - auto-submit
          setShowResults(true)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [timeRemaining, showResults])

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

  const submitQuiz = () => {
    setShowResults(true)
    // In a real app, you'd save the results if user is logged in
    if (isLoggedIn) {
      console.log("Saving quiz results for logged-in user...")
    }
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

  const resetQuiz = () => {
    setCurrentQuestionIndex(0)
    setSelectedAnswers({})
    setShowResults(false)
    // Reset timer if it was set
    if (timeRemaining !== null) {
      setTimeRemaining(10 * 60) // Reset to 10 minutes
    }
  }

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`
  }

  const handleExportCSV = () => {
    if (!quiz || !showResults) return

    const csvContent = [
      ["Question", "Your Answer", "Correct Answer", "Result", "Explanation"],
      ...quiz.questions.map((q, index) => {
        const userAnswer = selectedAnswers[index]
        const isCorrect = userAnswer === q.correctAnswer
        return [
          q.text,
          q.options[userAnswer] || "Not answered",
          q.options[q.correctAnswer],
          isCorrect ? "Correct" : "Incorrect",
          q.explanation || "No explanation available",
        ]
      }),
    ]
      .map((row) => row.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(","))
      .join("\n")

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${quiz.title.replace(/[^a-z0-9]/gi, "_").toLowerCase()}_results.csv`
    a.click()
    URL.revokeObjectURL(url)

    toast({
      title: "Results exported!",
      description: "Your quiz results have been downloaded as CSV.",
    })
  }

  const handleExportJSON = () => {
    if (!quiz || !showResults) return

    const results = {
      quiz: {
        id: quiz.id,
        title: quiz.title,
        completedAt: new Date().toISOString(),
      },
      score: calculateScore(),
      answers: quiz.questions.map((q, index) => ({
        questionId: q.id,
        question: q.text,
        userAnswer: selectedAnswers[index],
        userAnswerText: q.options[selectedAnswers[index]] || "Not answered",
        correctAnswer: q.correctAnswer,
        correctAnswerText: q.options[q.correctAnswer],
        isCorrect: selectedAnswers[index] === q.correctAnswer,
        explanation: q.explanation,
      })),
    }

    const jsonContent = JSON.stringify(results, null, 2)
    const blob = new Blob([jsonContent], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${quiz.title.replace(/[^a-z0-9]/gi, "_").toLowerCase()}_results.json`
    a.click()
    URL.revokeObjectURL(url)

    toast({
      title: "Results exported!",
      description: "Your quiz results have been downloaded as JSON.",
    })
  }

  const handleCopyResults = async () => {
    if (!quiz || !showResults) return

    const score = calculateScore()
    const textContent = [
      `Quiz Results: ${quiz.title}`,
      `Completed: ${new Date().toLocaleDateString()}`,
      `Score: ${score.correct}/${score.total} (${score.percentage}%)`,
      "",
      "Detailed Results:",
      ...quiz.questions.map((q, index) => {
        const userAnswer = selectedAnswers[index]
        const isCorrect = userAnswer === q.correctAnswer
        return [
          `${index + 1}. ${q.text}`,
          `   Your answer: ${q.options[userAnswer] || "Not answered"} ${isCorrect ? "✓" : "✗"}`,
          !isCorrect ? `   Correct answer: ${q.options[q.correctAnswer]}` : "",
          q.explanation ? `   Explanation: ${q.explanation}` : "",
          "",
        ]
          .filter(Boolean)
          .join("\n")
      }),
    ].join("\n")

    try {
      await navigator.clipboard.writeText(textContent)
      toast({
        title: "Results copied!",
        description: "Your quiz results have been copied to clipboard.",
      })
    } catch (err) {
      toast({
        title: "Copy failed",
        description: "Please try copying manually.",
        variant: "destructive",
      })
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="text-muted-foreground">Loading quiz...</div>
        </div>
      </div>
    )
  }

  if (!quiz) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="text-center py-12">
            <h2 className="text-xl font-semibold mb-2">Quiz Not Found</h2>
            <p className="text-muted-foreground mb-4">
              The quiz you're looking for doesn't exist or is no longer available.
            </p>
            <Button asChild>
              <Link href="/">Go Home</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-semibold">{quiz.title}</h1>
              <p className="text-sm text-muted-foreground">
                {showResults ? "Quiz Complete" : `Question ${currentQuestionIndex + 1} of ${quiz.questions.length}`}
              </p>
            </div>
            <div className="flex items-center gap-2">
              {timeRemaining !== null && !showResults && (
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="h-4 w-4" />
                  <span className={timeRemaining < 60 ? "text-red-600 font-medium" : ""}>
                    {formatTime(timeRemaining)}
                  </span>
                </div>
              )}
              {showResults && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm">
                      <Download className="h-4 w-4 mr-2" />
                      Export Results
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={handleCopyResults}>
                      <Copy className="h-4 w-4 mr-2" />
                      Copy as Text
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleExportCSV}>
                      <FileSpreadsheet className="h-4 w-4 mr-2" />
                      Export as CSV
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleExportJSON}>
                      <Code className="h-4 w-4 mr-2" />
                      Export as JSON
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        {!showResults ? (
          <div className="space-y-8">
            {/* Progress bar */}
            <div className="w-full bg-muted rounded-full h-2">
              <div
                className="bg-primary h-2 rounded-full transition-all duration-300"
                style={{ width: `${((currentQuestionIndex + 1) / quiz.questions.length) * 100}%` }}
              />
            </div>

            {/* Current question */}
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">{quiz.questions[currentQuestionIndex].text}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {quiz.questions[currentQuestionIndex].options.map((option, optionIndex) => (
                    <button
                      key={optionIndex}
                      onClick={() => handleAnswerSelect(optionIndex)}
                      className={`w-full p-4 text-left rounded-lg border-2 transition-all ${
                        selectedAnswers[currentQuestionIndex] === optionIndex
                          ? "border-primary bg-primary/5 text-primary"
                          : "border-border hover:border-muted-foreground hover:bg-muted/50"
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <div
                          className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                            selectedAnswers[currentQuestionIndex] === optionIndex
                              ? "border-primary bg-primary"
                              : "border-muted-foreground"
                          }`}
                        >
                          {selectedAnswers[currentQuestionIndex] === optionIndex && (
                            <div className="w-2.5 h-2.5 rounded-full bg-white" />
                          )}
                        </div>
                        <span className="font-medium">{String.fromCharCode(65 + optionIndex)}.</span>
                        <span className="flex-1">{option}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Navigation */}
            <div className="flex items-center justify-between">
              <Button variant="outline" onClick={goToPreviousQuestion} disabled={currentQuestionIndex === 0}>
                <ChevronLeft className="h-4 w-4 mr-2" />
                Previous
              </Button>

              {currentQuestionIndex === quiz.questions.length - 1 ? (
                <Button
                  onClick={submitQuiz}
                  disabled={Object.keys(selectedAnswers).length !== quiz.questions.length}
                  size="lg"
                >
                  Submit Quiz
                </Button>
              ) : (
                <Button onClick={goToNextQuestion} disabled={selectedAnswers[currentQuestionIndex] === undefined}>
                  Next
                  <ChevronRight className="h-4 w-4 ml-2" />
                </Button>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Score summary */}
            <Card className="text-center">
              <CardHeader>
                <div className="mx-auto w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <span className="text-2xl font-bold text-primary">{calculateScore().percentage}%</span>
                </div>
                <CardTitle className="text-2xl">Quiz Complete!</CardTitle>
                <CardDescription className="text-lg">
                  You scored {calculateScore().correct} out of {calculateScore().total} questions correctly
                </CardDescription>
              </CardHeader>
            </Card>

            {/* Detailed results with explanations */}
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">Review Your Answers</h2>
                <Button onClick={handleCopyResults} variant="outline" size="sm">
                  <Copy className="h-4 w-4 mr-2" />
                  Copy Results
                </Button>
              </div>
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
                        <CardTitle className="text-lg">
                          Question {index + 1}: {question.text}
                        </CardTitle>
                        <Badge variant={isCorrect ? "default" : "destructive"}>
                          {isCorrect ? "Correct" : "Incorrect"}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div>
                          <span className="font-medium">Your answer: </span>
                          <span className={isCorrect ? "text-green-600" : "text-red-600"}>
                            {String.fromCharCode(65 + userAnswer)} - {question.options[userAnswer]}
                          </span>
                        </div>
                        {!isCorrect && (
                          <div>
                            <span className="font-medium">Correct answer: </span>
                            <span className="text-green-600">
                              {String.fromCharCode(65 + question.correctAnswer)} -{" "}
                              {question.options[question.correctAnswer]}
                            </span>
                          </div>
                        )}
                        {question.explanation && (
                          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
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

            {/* Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button variant="outline" onClick={resetQuiz}>
                <RotateCcw className="h-4 w-4 mr-2" />
                Take Quiz Again
              </Button>
              <Button asChild>
                <Link href="/">Back to Home</Link>
              </Button>
            </div>

            {/* CTA for creating own quiz */}
            <Card className="bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
              <CardContent className="text-center py-8">
                <h3 className="text-xl font-semibold mb-2">Create Your Own Quiz</h3>
                <p className="text-muted-foreground mb-4">
                  Turn your documents into engaging quizzes in seconds with AI
                </p>
                <Button asChild size="lg">
                  <Link href={isLoggedIn ? "/create" : "/signup"}>
                    {isLoggedIn ? "Create Quiz" : "Get Started Free"}
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  )
}
