"use client"

import { Button } from "@/components/ui/button"
import { CalendarIcon, BookOpenIcon, ImageIcon, SearchIcon, PlayIcon } from "lucide-react"

interface QuickActionsProps {
  onActionClick: (action: string, prompt: string) => void
}

export function QuickActions({ onActionClick }: QuickActionsProps) {
  const actions = [
    {
      id: "study-plan",
      icon: CalendarIcon,
      title: "Create Study Plan",
      prompt: "Help me create a study plan. I need to prepare for my exams.",
    },
    {
      id: "solve-math",
      icon: BookOpenIcon,
      title: "Solve Math Problem",
      prompt: "I have a math problem I need help solving step by step.",
    },
    {
      id: "analyze-image",
      icon: ImageIcon,
      title: "Analyze Image",
      prompt: "I want to upload an image for analysis and problem solving.",
    },
    {
      id: "search-videos",
      icon: PlayIcon,
      title: "Find Videos",
      prompt: "Find educational videos and tutorials for my topic.",
    },
    {
      id: "web-search",
      icon: SearchIcon,
      title: "Web Search",
      prompt: "Search the web for current information and resources.",
    },
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 max-w-6xl mx-auto px-4">
      {actions.map((action) => (
        <Button
          key={action.id}
          variant="outline"
          className="h-32 flex flex-col items-center justify-center gap-3 hover:bg-accent/10 hover:border-accent/30 transition-all duration-200 bg-card/50 border-border/50 backdrop-blur-sm rounded-xl"
          onClick={() => onActionClick(action.id, action.prompt)}
        >
          <action.icon className="h-8 w-8 text-foreground/80" />
          <span className="text-sm font-medium text-center text-foreground/90">{action.title}</span>
        </Button>
      ))}
    </div>
  )
}
