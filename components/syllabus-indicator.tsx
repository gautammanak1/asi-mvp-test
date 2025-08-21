"use client"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { BookOpenIcon, GraduationCapIcon, ClockIcon, TrendingUpIcon } from "lucide-react"
import type { SyllabusDetection } from "@/lib/aktu-syllabus"
import { cn } from "@/lib/utils"

interface SyllabusIndicatorProps {
  detection: SyllabusDetection
  className?: string
}

export function SyllabusIndicator({ detection, className }: SyllabusIndicatorProps) {
  if (detection.detectedSubjects.length === 0) {
    return null
  }

  const primarySubject = detection.detectedSubjects[0]
  const difficultyColors = {
    beginner: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
    intermediate: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
    advanced: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
  }

  return (
    <Card className={cn("border-l-4 border-l-primary", className)}>
      <CardContent className="p-4">
        <div className="space-y-3">
          {/* Header */}
          <div className="flex items-center gap-2">
            <GraduationCapIcon className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium text-primary">AKTU Syllabus Detected</span>
            <Badge variant="outline" className="text-xs">
              {detection.confidence}% match
            </Badge>
          </div>

          {/* Primary Subject */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="secondary" className="font-medium">
                {primarySubject.name}
              </Badge>
              <Badge variant="outline" className="text-xs">
                {primarySubject.code}
              </Badge>
              <Badge className={cn("text-xs", difficultyColors[primarySubject.difficulty])}>
                {primarySubject.difficulty}
              </Badge>
            </div>

            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <BookOpenIcon className="h-3 w-3" />
                <span>{primarySubject.branch}</span>
              </div>
              <div className="flex items-center gap-1">
                <ClockIcon className="h-3 w-3" />
                <span>Semester {primarySubject.semester}</span>
              </div>
            </div>
          </div>

          {/* Detected Topics */}
          {detection.detectedTopics.length > 0 && (
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-2">Related Topics:</p>
              <div className="flex flex-wrap gap-1">
                {detection.detectedTopics.slice(0, 4).map((topic, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {topic}
                  </Badge>
                ))}
                {detection.detectedTopics.length > 4 && (
                  <Badge variant="outline" className="text-xs">
                    +{detection.detectedTopics.length - 4} more
                  </Badge>
                )}
              </div>
            </div>
          )}

          {/* Additional Subjects */}
          {detection.detectedSubjects.length > 1 && (
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-2">Also Related:</p>
              <div className="flex flex-wrap gap-1">
                {detection.detectedSubjects.slice(1, 3).map((subject, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {subject.name}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Study Resources */}
          {detection.studyResources.length > 0 && (
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-2">Study Tips:</p>
              <ul className="text-xs text-muted-foreground space-y-1">
                {detection.studyResources.slice(0, 2).map((resource, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <TrendingUpIcon className="h-3 w-3 mt-0.5 flex-shrink-0" />
                    <span>{resource}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
