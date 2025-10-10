'use client';

import type React from "react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Upload, FileText, Loader2, ChevronDown, Settings } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface QuizSettings {
  questionCount: number;
  difficulty: "easy" | "medium" | "hard";
  questionType: "multiple-choice" | "true-false" | "mixed";
  shuffleQuestions: boolean;
}

export default function CreatePage() {
  const [textContent, setTextContent] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);
  const [quizSettings, setQuizSettings] = useState<QuizSettings>({
    questionCount: 10,
    difficulty: "medium",
    questionType: "multiple-choice",
    shuffleQuestions: false,
  });
  
  const { user, loading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      const allowedTypes = ["text/plain", "application/pdf"];
      if (!allowedTypes.includes(file.type)) {
        setError("Please upload a PDF or TXT file only");
        return;
      }

      // Validate file size (10MB limit)
      if (file.size > 10 * 1024 * 1024) {
        setError("File size must be less than 10MB");
        return;
      }

      setSelectedFile(file);
      setError("");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Check authentication
    if (!user) {
      router.push("/login");
      return;
    }

    // Validate input
    if (!textContent.trim() && !selectedFile) {
      setError("Please provide text content or upload a file");
      return;
    }

    setIsLoading(true);

    try {
      // Prepare form data
      const formData = new FormData();
      if (textContent.trim()) {
        formData.append("text", textContent);
      }
      if (selectedFile) {
        formData.append("file", selectedFile);
      }

      // Build query parameters for the API
      const queryParams = new URLSearchParams({
        numQuestions: quizSettings.questionCount.toString(),
        difficulty: quizSettings.difficulty,
      });

      // Get the current session token for authentication
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        throw new Error("Authentication required. Please log in again.");
      }

      // API call to generate quiz
      const response = await fetch(`/api/generate-quiz?${queryParams}`, {
        method: "POST",
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: formData,
      });

      const contentType = response.headers.get("content-type");
      
      if (!contentType || !contentType.includes("application/json")) {
        // Response is not JSON, likely an error page
        const text = await response.text();
        console.error("Non-JSON response:", text.substring(0, 200));
        throw new Error("Server error. Please try again or use a smaller file.");
      }

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to generate quiz");
      }

      toast({
        title: "Quiz created successfully!",
        description: `"${result.title}" has been added to your library.`,
      });

      // Redirect to quiz detail page or dashboard
      router.push(`/dashboard`);
    } catch (err) {
      console.error("Quiz generation error:", err);
      const errorMessage = err instanceof Error ? err.message : "Something went wrong";
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const updateSetting = <K extends keyof QuizSettings>(key: K, value: QuizSettings[K]) => {
    setQuizSettings((prev) => ({ ...prev, [key]: value }));
  };

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  // Don't render if not authenticated (will redirect)
  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4">
      <div className="max-w-2xl mx-auto pt-8">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold">Create Your Quiz</CardTitle>
            <CardDescription>Paste your content or upload a file to generate an AI-powered quiz</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Text Input Section */}
              <div className="space-y-2">
                <Label htmlFor="content">Paste Your Content</Label>
                <Textarea
                  id="content"
                  placeholder="Paste your text content here... (articles, notes, study materials, etc.)"
                  value={textContent}
                  onChange={(e) => setTextContent(e.target.value)}
                  className="min-h-32 resize-y"
                />
              </div>

              {/* Divider */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">Or</span>
                </div>
              </div>

              {/* File Upload Section */}
              <div className="space-y-2">
                <Label htmlFor="file">Upload a File</Label>
                <div className="relative">
                  <Input
                    id="file"
                    type="file"
                    accept=".pdf,.txt"
                    onChange={handleFileChange}
                    className="cursor-pointer"
                  />
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    {!selectedFile && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Upload className="h-4 w-4" />
                        <span className="text-sm">Choose PDF or TXT file</span>
                      </div>
                    )}
                  </div>
                </div>
                {selectedFile && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <FileText className="h-4 w-4" />
                    <span>{selectedFile.name}</span>
                    <span className="text-xs">({(selectedFile.size / 1024).toFixed(1)} KB)</span>
                  </div>
                )}
              </div>

              <Collapsible open={isAdvancedOpen} onOpenChange={setIsAdvancedOpen}>
                <CollapsibleTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full justify-between bg-transparent"
                    onClick={() => setIsAdvancedOpen(!isAdvancedOpen)}
                  >
                    <div className="flex items-center gap-2">
                      <Settings className="h-4 w-4" />
                      Advanced Options
                    </div>
                    <ChevronDown className={`h-4 w-4 transition-transform ${isAdvancedOpen ? "rotate-180" : ""}`} />
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="space-y-4 pt-4">
                  <Card className="bg-muted/30">
                    <CardContent className="pt-6 space-y-4">
                      {/* Number of Questions */}
                      <div className="space-y-2">
                        <Label htmlFor="question-count">Number of Questions</Label>
                        <Select
                          value={quizSettings.questionCount.toString()}
                          onValueChange={(value) => updateSetting("questionCount", Number.parseInt(value))}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="5">5 questions</SelectItem>
                            <SelectItem value="10">10 questions</SelectItem>
                            <SelectItem value="15">15 questions</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Difficulty Level */}
                      <div className="space-y-2">
                        <Label htmlFor="difficulty">Difficulty Level</Label>
                        <Select
                          value={quizSettings.difficulty}
                          onValueChange={(value: "easy" | "medium" | "hard") => updateSetting("difficulty", value)}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="easy">Easy</SelectItem>
                            <SelectItem value="medium">Medium</SelectItem>
                            <SelectItem value="hard">Hard</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Shuffle Questions Toggle */}
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label htmlFor="shuffle-questions">Shuffle Questions</Label>
                          <p className="text-sm text-muted-foreground">
                            Randomize the order of questions for each quiz attempt
                          </p>
                        </div>
                        <Switch
                          id="shuffle-questions"
                          checked={quizSettings.shuffleQuestions}
                          onCheckedChange={(checked) => updateSetting("shuffleQuestions", checked)}
                        />
                      </div>
                    </CardContent>
                  </Card>
                </CollapsibleContent>
              </Collapsible>

              {/* Error Message */}
              {error && (
                <div className="text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md p-3">
                  {error}
                </div>
              )}

              {/* Submit Button */}
              <Button type="submit" className="w-full" disabled={isLoading || (!textContent.trim() && !selectedFile)}>
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Generating Quiz...
                  </>
                ) : (
                  "Generate Quiz"
                )}
              </Button>

              {/* Help Text */}
              <p className="text-xs text-muted-foreground text-center">
                Your quiz will be generated using AI and saved to your account.
                <br />
                Supported formats: PDF and TXT files up to 10MB.
              </p>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}