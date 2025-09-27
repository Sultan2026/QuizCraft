"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Check, Crown, Zap } from "lucide-react"

export default function UpgradePage() {
  const [isLoading, setIsLoading] = useState(true)
  const [isUpgrading, setIsUpgrading] = useState(false)
  const router = useRouter()

  // Mock authentication and user status - replace with real auth logic
  const isLoggedIn = true // This would come from your auth context/state
  const userPlan = "free" // This would come from your user data: "free" | "pro"

  useEffect(() => {
    // Check authentication
    if (!isLoggedIn) {
      router.push("/login")
      return
    }

    setIsLoading(false)
  }, [isLoggedIn, router])

  const handleUpgrade = async () => {
    setIsUpgrading(true)

    try {
      // Mock Stripe Checkout integration
      // In a real app, you would:
      // 1. Create a checkout session on your backend
      // 2. Redirect to Stripe Checkout
      // 3. Handle success/cancel redirects

      console.log("Initiating Stripe Checkout...")

      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // Mock successful upgrade
      alert("Upgrade successful! Welcome to Pro!")
      router.push("/dashboard")
    } catch (error) {
      console.error("Upgrade failed:", error)
      alert("Upgrade failed. Please try again.")
    } finally {
      setIsUpgrading(false)
    }
  }

  if (!isLoggedIn) {
    return null // Will redirect to login
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    )
  }

  // If user is already Pro
  if (userPlan === "pro") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4">
        <div className="max-w-4xl mx-auto pt-16">
          <Card className="text-center max-w-2xl mx-auto">
            <CardHeader className="pb-8">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Crown className="w-8 h-8 text-primary" />
              </div>
              <CardTitle className="text-3xl">You are Pro!</CardTitle>
              <CardDescription className="text-lg mt-4">
                You're already enjoying all the benefits of QuizCraft Simple Pro
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <div className="flex items-center justify-center gap-3">
                  <Check className="w-5 h-5 text-primary" />
                  <span>Unlimited quizzes</span>
                </div>
                <div className="flex items-center justify-center gap-3">
                  <Check className="w-5 h-5 text-primary" />
                  <span>Advanced question types</span>
                </div>
                <div className="flex items-center justify-center gap-3">
                  <Check className="w-5 h-5 text-primary" />
                  <span>Export to multiple formats</span>
                </div>
                <div className="flex items-center justify-center gap-3">
                  <Check className="w-5 h-5 text-primary" />
                  <span>Priority support</span>
                </div>
              </div>
              <Button onClick={() => router.push("/dashboard")} className="mt-8">
                Go to Dashboard
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4">
      <div className="max-w-6xl mx-auto pt-8">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-balance mb-4">Upgrade to Pro</h1>
          <p className="text-lg text-muted-foreground text-pretty max-w-2xl mx-auto">
            Unlock unlimited quiz creation and advanced features to supercharge your content
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Current Plan - Free */}
          <Card className="relative opacity-75">
            <CardHeader className="text-center pb-8">
              <CardTitle className="text-2xl">Free</CardTitle>
              <div className="mt-4">
                <span className="text-4xl font-bold">$0</span>
                <span className="text-muted-foreground">/month</span>
              </div>
              <CardDescription className="text-base mt-2">Your current plan</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-muted-foreground" />
                  <span className="text-muted-foreground">5 quizzes per month</span>
                </div>
                <div className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-muted-foreground" />
                  <span className="text-muted-foreground">Basic question types</span>
                </div>
                <div className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-muted-foreground" />
                  <span className="text-muted-foreground">Share via link</span>
                </div>
                <div className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-muted-foreground" />
                  <span className="text-muted-foreground">Email support</span>
                </div>
              </div>
              <Button variant="outline" className="w-full mt-8 bg-transparent" disabled>
                Current Plan
              </Button>
            </CardContent>
          </Card>

          {/* Pro Plan */}
          <Card className="relative border-primary shadow-lg">
            <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
              <Badge className="bg-primary text-primary-foreground">
                <Zap className="w-3 h-3 mr-1" />
                Recommended
              </Badge>
            </div>
            <CardHeader className="text-center pb-8">
              <CardTitle className="text-2xl">Pro</CardTitle>
              <div className="mt-4">
                <span className="text-4xl font-bold">$5</span>
                <span className="text-muted-foreground">/month</span>
              </div>
              <CardDescription className="text-base mt-2">For unlimited quiz creation</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-primary" />
                  <span className="font-medium">Unlimited quizzes</span>
                </div>
                <div className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-primary" />
                  <span>Advanced question types</span>
                </div>
                <div className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-primary" />
                  <span>Export to multiple formats</span>
                </div>
                <div className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-primary" />
                  <span>Analytics & insights</span>
                </div>
                <div className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-primary" />
                  <span>Priority support</span>
                </div>
              </div>
              <Button className="w-full mt-8" onClick={handleUpgrade} disabled={isUpgrading}>
                {isUpgrading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                    Processing...
                  </>
                ) : (
                  "Upgrade with Stripe Checkout"
                )}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Benefits Section */}
        <div className="mt-16 text-center">
          <h2 className="text-2xl font-bold mb-8">Why upgrade to Pro?</h2>
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Zap className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">Unlimited Creation</h3>
              <p className="text-muted-foreground text-sm">Create as many quizzes as you need without monthly limits</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Crown className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">Advanced Features</h3>
              <p className="text-muted-foreground text-sm">Access premium question types and export options</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Check className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">Priority Support</h3>
              <p className="text-muted-foreground text-sm">Get faster responses and dedicated assistance</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
