"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

// Quiz data structure (same as private quiz page)
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

// Mock quiz detail data (same as private quiz page)
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

export default function PublicQuizPage() {
  const [quiz, setQuiz] = useState<QuizDetail | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const params = useParams()
  const quizId = params.id as string

  // Mock authentication check
  const isLoggedIn = false // Set to false for public page, but in real app would check actual auth status

  useEffect(() => {
    // Mock API call to fetch quiz detail
    const fetchQuizDetail = async () => {
      setIsLoading(true)
      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // In a real app, you'd fetch based on quizId
      if (quizId === "1") {
        setQuiz(mockQuizDetail)
      } else {
        // Handle quiz not found
        setQuiz(null)
      }
      setIsLoading(false)
    }

    fetchQuizDetail()
  }, [quizId])

  const handleCreateQuizCTA = () => {
    if (isLoggedIn) {
      router.push("/create")
    } else {
      router.push("/signup")
    }
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
              <Button onClick={() => router.push("/")}>Back to Home</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4">
      <div className="max-w-4xl mx-auto pt-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">{quiz.title}</h1>
          <div className="flex items-center gap-4">
            <p className="text-muted-foreground">Created {new Date(quiz.createdAt).toLocaleDateString()}</p>
            <Badge variant={quiz.status === "active" ? "default" : "secondary"}>{quiz.status}</Badge>
            <span className="text-sm text-muted-foreground">{quiz.questionsCount} questions</span>
          </div>
        </div>

        {/* Questions list - same display as private page */}
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

        <div className="mt-12 text-center">
          <Card className="bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
            <CardContent className="py-8">
              <h3 className="text-xl font-semibold mb-2">Create Your Own Quiz</h3>
              <p className="text-muted-foreground mb-4">
                Turn any document into a quiz in seconds with QuizCraft Simple
              </p>
              <Button onClick={handleCreateQuizCTA} size="lg" className="bg-purple-600 hover:bg-purple-700">
                Create your own quiz
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
