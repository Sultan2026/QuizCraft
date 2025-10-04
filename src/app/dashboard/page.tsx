"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/AuthContext"
import { supabaseHelpers } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import { MoreHorizontal, Copy, Edit, Trash2, Plus, Check, X, TrendingUp, Users, BarChart3 } from "lucide-react"
import Link from "next/link"

// Enhanced quiz data type with analytics
interface Quiz {
  id: string
  title: string
  createdAt: string
  questionsCount: number
  status: "active" | "draft"
  analytics: {
    totalAttempts: number
    averageScore: number
    lastTaken?: string
  }
}

export default function DashboardPage() {
  const [quizzes, setQuizzes] = useState<Quiz[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [editingQuizId, setEditingQuizId] = useState<string | null>(null)
  const [editingTitle, setEditingTitle] = useState("")
  const [sortBy, setSortBy] = useState<"date" | "attempts" | "score">("date")
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    // Check authentication
    if (!authLoading && !user) {
      router.push("/login")
      return
    }

    // Fetch quizzes when user is authenticated
    if (user) {
      fetchQuizzes()
    }
  }, [user, authLoading, router])

  const fetchQuizzes = async () => {
    if (!user) return

    setIsLoading(true)
    try {
      // Fetch quizzes from Supabase
      const quizzesData = await supabaseHelpers.getQuizzes(user.id)
      
      // Transform data to match the Quiz interface
      const transformedQuizzes: Quiz[] = await Promise.all(
        quizzesData.map(async (quiz) => {
          // Fetch questions count for each quiz
          const questions = await supabaseHelpers.getQuestions(quiz.id)
          
          return {
            id: quiz.id,
            title: quiz.title,
            createdAt: quiz.created_at,
            questionsCount: questions.length,
            status: quiz.is_public ? "active" : "draft",
            analytics: {
              totalAttempts: 0, // TODO: Implement attempts tracking
              averageScore: 0, // TODO: Implement score tracking
            }
          }
        })
      )
      
      setQuizzes(transformedQuizzes)
    } catch (error) {
      console.error("Error fetching quizzes:", error)
      toast({
        title: "Error",
        description: "Failed to load quizzes. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleCopyShareLink = (quizId: string) => {
    const shareUrl = `${window.location.origin}/take/${quizId}`
    navigator.clipboard.writeText(shareUrl)
    toast({
      title: "Link copied!",
      description: "Share link has been copied to your clipboard.",
    })
  }

  const handleStartInlineEdit = (quiz: Quiz) => {
    setEditingQuizId(quiz.id)
    setEditingTitle(quiz.title)
  }

  const handleSaveInlineEdit = async () => {
    if (!editingQuizId || !editingTitle.trim()) return

    try {
      // Update quiz title in Supabase
      await supabaseHelpers.updateQuiz(editingQuizId, { 
        title: editingTitle.trim() 
      })

      // Update local state
      setQuizzes((prev) =>
        prev.map((quiz) => (quiz.id === editingQuizId ? { ...quiz, title: editingTitle.trim() } : quiz)),
      )

      setEditingQuizId(null)
      setEditingTitle("")

      toast({
        title: "Saved!",
        description: "Quiz title has been updated successfully.",
      })
    } catch (error) {
      console.error("Error updating quiz:", error)
      toast({
        title: "Error",
        description: "Failed to update quiz title. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleCancelInlineEdit = () => {
    setEditingQuizId(null)
    setEditingTitle("")
  }

  const handleDeleteQuiz = async (quizId: string) => {
    if (confirm("Are you sure you want to delete this quiz? This action cannot be undone.")) {
      try {
        // Delete quiz from Supabase
        await supabaseHelpers.deleteQuiz(quizId)
        
        // Update local state
        setQuizzes((prev) => prev.filter((quiz) => quiz.id !== quizId))
        
        toast({
          title: "Quiz deleted",
          description: "The quiz has been permanently deleted.",
        })
      } catch (error) {
        console.error("Error deleting quiz:", error)
        toast({
          title: "Error",
          description: "Failed to delete quiz. Please try again.",
          variant: "destructive",
        })
      }
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const getSortedQuizzes = () => {
    const sorted = [...quizzes].sort((a, b) => {
      switch (sortBy) {
        case "attempts":
          return b.analytics.totalAttempts - a.analytics.totalAttempts
        case "score":
          return b.analytics.averageScore - a.analytics.averageScore
        case "date":
        default:
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      }
    })
    return sorted
  }

  const getTotalStats = () => {
    const totalQuizzes = quizzes.length
    const totalAttempts = quizzes.reduce((sum, quiz) => sum + quiz.analytics.totalAttempts, 0)
    const averageScore = quizzes.length
      ? Math.round(quizzes.reduce((sum, quiz) => sum + quiz.analytics.averageScore, 0) / quizzes.length)
      : 0

    return { totalQuizzes, totalAttempts, averageScore }
  }

  // Show loading state while checking authentication
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    )
  }

  // Don't render if not authenticated (will redirect)
  if (!user) {
    return null
  }

  const stats = getTotalStats()

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4">
      <div className="max-w-6xl mx-auto pt-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">My Quizzes</h1>
            <p className="text-muted-foreground mt-2">Manage and share your AI-generated quizzes</p>
          </div>
          <Button asChild>
            <Link href="/create">
              <Plus className="h-4 w-4 mr-2" />
              Create Quiz
            </Link>
          </Button>
        </div>

        {/* Analytics Overview */}
        {quizzes.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Quizzes</CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalQuizzes}</div>
                <p className="text-xs text-muted-foreground">
                  {quizzes.filter((q) => q.status === "active").length} active
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Attempts</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalAttempts}</div>
                <p className="text-xs text-muted-foreground">Across all quizzes</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Average Score</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.averageScore}%</div>
                <p className="text-xs text-muted-foreground">Overall performance</p>
              </CardContent>
            </Card>
          </div>
        )}

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Quiz Library</CardTitle>
                <CardDescription>
                  {quizzes.length} quiz{quizzes.length !== 1 ? "es" : ""} in your collection
                </CardDescription>
              </div>
              {quizzes.length > 0 && (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Sort by:</span>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm">
                        {sortBy === "date" && "Date"}
                        {sortBy === "attempts" && "Most Popular"}
                        {sortBy === "score" && "Highest Score"}
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => setSortBy("date")}>Date Created</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setSortBy("attempts")}>Most Popular</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setSortBy("score")}>Highest Score</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-muted-foreground">Loading your quizzes...</div>
              </div>
            ) : quizzes.length === 0 ? (
              // Empty state
              <div className="text-center py-12">
                <div className="text-muted-foreground mb-4">
                  <svg
                    className="mx-auto h-12 w-12 text-muted-foreground/50"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-foreground mb-2">No quizzes yet</h3>
                <p className="text-muted-foreground mb-6">You have no quizzes. Start by creating one!</p>
                <Button asChild>
                  <Link href="/create">
                    <Plus className="h-4 w-4 mr-2" />
                    Create Your First Quiz
                  </Link>
                </Button>
              </div>
            ) : (
              // Quiz table
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Quiz Title</TableHead>
                    <TableHead>Created Date</TableHead>
                    <TableHead>Questions</TableHead>
                    <TableHead>Results</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-[50px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {getSortedQuizzes().map((quiz) => (
                    <TableRow key={quiz.id}>
                      <TableCell className="font-medium">
                        {editingQuizId === quiz.id ? (
                          <div className="flex items-center gap-2">
                            <Input
                              value={editingTitle}
                              onChange={(e) => setEditingTitle(e.target.value)}
                              className="h-8"
                              onKeyDown={(e) => {
                                if (e.key === "Enter") handleSaveInlineEdit()
                                if (e.key === "Escape") handleCancelInlineEdit()
                              }}
                              autoFocus
                            />
                            <Button size="sm" variant="ghost" onClick={handleSaveInlineEdit}>
                              <Check className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="ghost" onClick={handleCancelInlineEdit}>
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ) : (
                          <Link href={`/quiz/${quiz.id}`} className="hover:text-primary hover:underline">
                            {quiz.title}
                          </Link>
                        )}
                      </TableCell>
                      <TableCell className="text-muted-foreground">{formatDate(quiz.createdAt)}</TableCell>
                      <TableCell>
                        <span className="text-sm text-muted-foreground">{quiz.questionsCount} questions</span>
                      </TableCell>
                      <TableCell>
                        {quiz.analytics.totalAttempts > 0 ? (
                          <div className="space-y-1">
                            <div className="text-sm font-medium">
                              {quiz.analytics.totalAttempts} attempt{quiz.analytics.totalAttempts !== 1 ? "s" : ""}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {quiz.analytics.averageScore}% avg score
                            </div>
                          </div>
                        ) : (
                          <span className="text-sm text-muted-foreground">No attempts yet</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant={quiz.status === "active" ? "default" : "secondary"}>{quiz.status}</Badge>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                              <span className="sr-only">Open menu</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleCopyShareLink(quiz.id)}>
                              <Copy className="h-4 w-4 mr-2" />
                              Copy share link
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleStartInlineEdit(quiz)}>
                              <Edit className="h-4 w-4 mr-2" />
                              Edit title
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDeleteQuiz(quiz.id)}>
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}









