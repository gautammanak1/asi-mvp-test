"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useChat } from "@/contexts/chat-context"
import {
  MessageSquareIcon,
  ClockIcon,
  BookOpenIcon,
  TrendingUpIcon,
  CalendarIcon,
  TargetIcon,
  BrainIcon,
  ImageIcon,
  SearchIcon,
  PlayIcon,
} from "lucide-react"

export function Dashboard() {
  const { chatHistory, createNewChat, loadChat, setDashboardView } = useChat()
  const [activeTab, setActiveTab] = useState<"overview" | "chats" | "study" | "analytics">("overview")

  const handleStartChat = () => {
    createNewChat()
    setDashboardView(false)
  }

  const handleLoadChat = (chatId: string) => {
    loadChat(chatId)
    setDashboardView(false)
  }

  const quickActions = [
    {
      id: "new-chat",
      title: "Start New Chat",
      description: "Begin a conversation with ASIMOV",
      icon: MessageSquareIcon,
      color: "bg-blue-500",
      action: handleStartChat,
    },
    {
      id: "study-plan",
      title: "Create Study Plan",
      description: "Generate personalized study schedules",
      icon: CalendarIcon,
      color: "bg-green-500",
      action: () => console.log("Study plan"),
    },
    {
      id: "solve-problem",
      title: "Solve Math Problem",
      description: "Get step-by-step solutions",
      icon: TargetIcon,
      color: "bg-purple-500",
      action: () => console.log("Math problem"),
    },
    {
      id: "analyze-image",
      title: "Analyze Image",
      description: "Upload and analyze problem images",
      icon: ImageIcon,
      color: "bg-orange-500",
      action: () => console.log("Image analysis"),
    },
    {
      id: "web-search",
      title: "Web Search",
      description: "Search for educational resources",
      icon: SearchIcon,
      color: "bg-cyan-500",
      action: () => console.log("Web search"),
    },
    {
      id: "find-videos",
      title: "Find Videos",
      description: "Discover educational videos",
      icon: PlayIcon,
      color: "bg-red-500",
      action: () => console.log("Find videos"),
    },
  ]

  const stats = [
    {
      title: "Total Conversations",
      value: chatHistory.length.toString(),
      icon: MessageSquareIcon,
      trend: chatHistory.length > 0 ? "+100%" : "0%",
    },
    {
      title: "Study Sessions",
      value: "0",
      icon: BookOpenIcon,
      trend: "0%",
    },
    {
      title: "Problems Solved",
      value: "0",
      icon: BrainIcon,
      trend: "0%",
    },
    {
      title: "Hours Studied",
      value: "0",
      icon: ClockIcon,
      trend: "0%",
    },
  ]

  const dashboardDateFormatter = new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
    timeZone: "UTC",
  })

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Dashboard</h1>
            <p className="text-muted-foreground">Welcome back to ASIMOV - Your AI Learning Companion</p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="bg-green-500/10 text-green-500 border-green-500/20">
              Online
            </Badge>
            <Badge variant="outline">AKTU Student</Badge>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-2 border-b border-border">
          {[
            { id: "overview", label: "Overview" },
            { id: "chats", label: "Recent Chats" },
            { id: "study", label: "Study Plans" },
            { id: "analytics", label: "Analytics" },
          ].map((tab) => (
            <Button
              key={tab.id}
              variant={activeTab === tab.id ? "default" : "ghost"}
              size="sm"
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              onClick={() => setActiveTab(tab.id as any)}
              className="mb-2"
            >
              {tab.label}
            </Button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {stats.map((stat) => (
                <Card key={stat.title}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">{stat.title}</p>
                        <p className="text-2xl font-bold">{stat.value}</p>
                        <p
                          className={`text-xs flex items-center gap-1 ${
                            stat.trend === "0%" ? "text-muted-foreground" : "text-green-500"
                          }`}
                        >
                          <TrendingUpIcon className="h-3 w-3" />
                          {stat.trend}
                        </p>
                      </div>
                      <stat.icon className="h-8 w-8 text-muted-foreground" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Start your learning journey with these common tasks</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {quickActions.map((action) => (
                    <Button
                      key={action.id}
                      variant="outline"
                      className="h-auto p-4 flex flex-col items-start gap-3 hover:bg-muted/50 bg-transparent"
                      onClick={action.action}
                    >
                      <div className={`p-2 rounded-lg ${action.color} text-white`}>
                        <action.icon className="h-5 w-5" />
                      </div>
                      <div className="text-left">
                        <p className="font-medium">{action.title}</p>
                        <p className="text-sm text-muted-foreground">{action.description}</p>
                      </div>
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Recent Chats Tab */}
        {activeTab === "chats" && (
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Recent Conversations</CardTitle>
                <CardDescription>Continue where you left off</CardDescription>
              </CardHeader>
              <CardContent>
                {chatHistory.length === 0 ? (
                  <div className="text-center py-8">
                    <MessageSquareIcon className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground">No conversations yet</p>
                    <Button onClick={handleStartChat} className="mt-4">
                      Start Your First Chat
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {chatHistory.slice(0, 10).map((chat) => (
                      <div
                        key={chat.id}
                        className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-muted/50 cursor-pointer transition-colors"
                        onClick={() => handleLoadChat(chat.id)}
                      >
                        <div className="flex items-center gap-3">
                          <MessageSquareIcon className="h-5 w-5 text-muted-foreground" />
                          <div>
                            <p className="font-medium truncate max-w-[300px]">{chat.title}</p>
                            <p className="text-sm text-muted-foreground">{dashboardDateFormatter.format(chat.lastMessage)}</p>
                          </div>
                        </div>
                        <Button variant="ghost" size="sm">
                          Continue
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Study Plans Tab */}
        {activeTab === "study" && (
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Study Plans</CardTitle>
                <CardDescription>Manage your learning schedule</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <CalendarIcon className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground mb-4">No study plans created yet</p>
                  <Button>Create Study Plan</Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === "analytics" && (
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Learning Analytics</CardTitle>
                <CardDescription>Track your progress and performance</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <TrendingUpIcon className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground mb-4">Analytics coming soon</p>
                  <p className="text-sm text-muted-foreground">
                    We&apos;re working on detailed analytics to help you track your learning progress
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
