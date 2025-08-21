"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import {
  CalendarIcon,
  ClockIcon,
  PlusIcon,
  TrashIcon,
  BookOpenIcon,
  CheckCircleIcon,
  TrendingUpIcon,
} from "lucide-react"
// import {
//   StudyPlanner,
//   type StudyPlan,
//   type StudyPlanInput,
//   type StudyScheduleItem,
// } from "@/components/study-planner"
import { cn } from "@/lib/utils"
import { StudyPlan, studyPlanStorage, StudyScheduleItem } from "@/lib/study-planner"
import { generateStudyPlanWithLLM } from "@/lib/asi-api"

interface StudyPlannerProps {
  onClose?: () => void
}

export function StudyPlanner({ onClose }: StudyPlannerProps) {
  const [activeTab, setActiveTab] = useState("create")
  const [studyPlans, setStudyPlans] = useState<StudyPlan[]>([])
  const [selectedPlan, setSelectedPlan] = useState<StudyPlan | null>(null)

  // Form state for creating new plan
  const [examDate, setExamDate] = useState("")
  const [hoursPerDay, setHoursPerDay] = useState(4)
  const [subjects, setSubjects] = useState<{ name: string; priority: "high" | "medium" | "low"; estimatedHours: number }[]>([
    { name: "", priority: "high", estimatedHours: 10 },
  ])
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadStudyPlans()
  }, [])

  const loadStudyPlans = () => {
    const plans = studyPlanStorage.getAllPlans()
    setStudyPlans(plans)
  }

  const addSubject = () => {
    setSubjects([...subjects, { name: "", priority: "medium", estimatedHours: 10 }])
  }

  const removeSubject = (index: number) => {
    setSubjects(subjects.filter((_, i) => i !== index))
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const updateSubject = (index: number, field: string, value: any) => {
    const updated = subjects.map((subject, i) => (i === index ? { ...subject, [field]: value } : subject))
    setSubjects(updated)
  }

  const createStudyPlan = async () => {
    setError(null)
    if (!examDate || subjects.filter((s) => s.name.trim()).length === 0) {
      setError("Please enter at least one subject and select an exam date.")
      return
    }
    try {
      setIsGenerating(true)
      const input = {
        examDate: new Date(examDate).toISOString(),
      hoursPerDay,
        subjects: subjects.filter((s) => s.name.trim()) as Array<{
          name: string
          priority: "high" | "medium" | "low"
          estimatedHours: number
        }>,
    }

      const planJson = await generateStudyPlanWithLLM(input)

      const plan: StudyPlan = {
        id: planJson.id,
        title: planJson.title,
        examDate: new Date(planJson.examDate),
        totalHoursPerDay: planJson.totalHoursPerDay,
        subjects: planJson.subjects.map((s) => ({
          id: s.id,
          name: s.name,
          priority: s.priority,
          estimatedHours: s.estimatedHours,
          completed: s.completed,
        })),
        schedule: planJson.schedule.map((i) => ({
          id: i.id,
          date: new Date(i.date),
          subject: i.subject,
          topic: i.topic,
          duration: i.duration,
          completed: i.completed,
        })),
        createdAt: new Date(planJson.createdAt),
        updatedAt: new Date(planJson.updatedAt),
      }

    studyPlanStorage.savePlan(plan)
    loadStudyPlans()
    setActiveTab("plans")
    } catch (e: unknown) {
      setError((e as Error).message || "Failed to generate study plan")
    } finally {
      setIsGenerating(false)
    }
  }

  const toggleScheduleItem = (planId: string, itemId: string, completed: boolean) => {
    studyPlanStorage.updateScheduleItem(planId, itemId, { completed })
    loadStudyPlans()
    if (selectedPlan?.id === planId) {
      const updatedPlan = studyPlanStorage.getPlan(planId)
      setSelectedPlan(updatedPlan)
    }
  }

  const getPlanProgress = (plan: StudyPlan) => {
    const completedItems = plan.schedule.filter((item) => item.completed).length
    return Math.round((completedItems / plan.schedule.length) * 100)
  }

  const handleDeletePlan = (planId: string) => {
    if (confirm("Delete this plan? This cannot be undone.")) {
      studyPlanStorage.deletePlan(planId)
      loadStudyPlans()
      if (selectedPlan?.id === planId) setSelectedPlan(null)
    }
  }

  const getTodaySchedule = (plan: StudyPlan) => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    return plan.schedule.filter((item) => {
      const itemDate = new Date(item.date)
      itemDate.setHours(0, 0, 0, 0)
      return itemDate >= today && itemDate < tomorrow
    })
  }

  const plannerDateFormatter = new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  })

  return (
    <div className="w-full max-w-6xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Study Planner</h1>
          <p className="text-muted-foreground">Create and manage your study schedules</p>
        </div>
        {onClose && (
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        )}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="create">Create Plan</TabsTrigger>
          <TabsTrigger value="plans">My Plans</TabsTrigger>
          <TabsTrigger value="schedule">Today&apos;s Schedule</TabsTrigger>
        </TabsList>

        <TabsContent value="create" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Create New Study Plan</CardTitle>
              <CardDescription>
                Set your exam date and study preferences to generate a personalized study schedule
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="exam-date">Exam Date</Label>
                  <Input
                    id="exam-date"
                    type="date"
                    value={examDate}
                    onChange={(e) => setExamDate(e.target.value)}
                    min={new Date().toISOString().split("T")[0]}
                  />
                </div>
                <div>
                  <Label htmlFor="hours-per-day">Hours per Day</Label>
                  <Input
                    id="hours-per-day"
                    type="number"
                    min="1"
                    max="12"
                    value={hoursPerDay}
                    onChange={(e) => setHoursPerDay(Number.parseInt(e.target.value) || 4)}
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-3">
                  <Label>Subjects</Label>
                  <Button type="button" variant="outline" size="sm" onClick={addSubject}>
                    <PlusIcon className="h-4 w-4 mr-2" />
                    Add Subject
                  </Button>
                </div>

                <div className="space-y-3">
                  {subjects.map((subject, index) => (
                    <div key={index} className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-end">
                      <div className="flex-1 min-w-0">
                        <Input
                          placeholder="Subject name"
                          value={subject.name}
                          onChange={(e) => updateSubject(index, "name", e.target.value)}
                        />
                      </div>
                      <div className="sm:w-32">
                        <Select
                          value={subject.priority}
                          onValueChange={(value) => updateSubject(index, "priority", value)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="high">High</SelectItem>
                            <SelectItem value="medium">Medium</SelectItem>
                            <SelectItem value="low">Low</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="sm:w-24">
                        <Input
                          type="number"
                          placeholder="Hours"
                          value={subject.estimatedHours}
                          onChange={(e) => updateSubject(index, "estimatedHours", Number.parseInt(e.target.value) || 0)}
                        />
                      </div>
                      <Button type="button" variant="outline" size="sm" onClick={() => removeSubject(index)} className="self-end">
                        <TrashIcon className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>

              {error && <p className="text-destructive text-sm">{error}</p>}

              <Button onClick={createStudyPlan} className="w-full" disabled={isGenerating}>
                Generate Study Plan
              </Button>
              {isGenerating && <p className="text-xs text-muted-foreground mt-2">Generating plan…</p>}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="plans" className="space-y-4">
          {studyPlans.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <BookOpenIcon className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">No Study Plans Yet</h3>
                <p className="text-muted-foreground mb-4">Create your first study plan to get started</p>
                <Button onClick={() => setActiveTab("create")}>Create Study Plan</Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {studyPlans.map((plan) => {
                const progress = getPlanProgress(plan)
                const daysLeft = Math.ceil((plan.examDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))

                return (
                  <Card key={plan.id} className="transition-shadow">
                    <CardHeader>
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <CardTitle className="text-lg">{plan.title}</CardTitle>
                          <CardDescription>
                            {plan.subjects.length} subjects • {plan.totalHoursPerDay}h/day
                          </CardDescription>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center gap-2 mb-1 justify-end">
                            <CalendarIcon className="h-4 w-4" />
                            <span className="text-sm">{daysLeft} days left</span>
                          </div>
                          <Badge variant={daysLeft > 7 ? "default" : daysLeft > 3 ? "secondary" : "destructive"}>
                            {plannerDateFormatter.format(plan.examDate)}
                          </Badge>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-2 flex-shrink-0">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedPlan(plan)
                              setActiveTab("schedule")
                            }}
                          >
                            View
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDeletePlan(plan.id)}
                          >
                            Delete
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium">Progress</span>
                            <span className="text-sm text-muted-foreground">{progress}%</span>
                          </div>
                          <Progress value={progress} />
                        </div>

                        <div className="flex flex-wrap gap-2">
                          {plan.subjects.map((subject) => (
                            <Badge key={subject.id} variant="outline">
                              {subject.name}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </TabsContent>

        <TabsContent value="schedule" className="space-y-4">
          {selectedPlan ? (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between gap-3">
                    <div>
                  <CardTitle>{selectedPlan.title}</CardTitle>
                  <CardDescription>Today&apos;s schedule • {getTodaySchedule(selectedPlan).length} sessions</CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="destructive" size="sm" onClick={() => handleDeletePlan(selectedPlan.id)}>
                        Delete Plan
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {getTodaySchedule(selectedPlan).map((item, idx) => (
                      <div key={`${item.id}-${idx}`} className="flex items-center gap-3 p-3 border rounded-lg">
                        <Checkbox
                          checked={item.completed}
                          onCheckedChange={(checked) => toggleScheduleItem(selectedPlan.id, item.id, !!checked)}
                        />
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className={cn("font-medium", item.completed && "line-through text-muted-foreground")}>
                              {item.subject} - {item.topic}
                            </span>
                            <Badge variant="secondary">{item.duration}h</Badge>
                          </div>
                        </div>
                        {item.completed && <CheckCircleIcon className="h-5 w-5 text-green-500" />}
                      </div>
                    ))}

                    {getTodaySchedule(selectedPlan).length === 0 && (
                      <div className="text-center py-8 text-muted-foreground">
                        <ClockIcon className="h-8 w-8 mx-auto mb-2" />
                        <p>No sessions scheduled for today</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Full Schedule</CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-96">
                    <div className="space-y-4">
                      {Object.entries(
                        selectedPlan.schedule.reduce(
                          (acc, item) => {
                            const dateKey = item.date.toDateString()
                            if (!acc[dateKey]) {
                              acc[dateKey] = []
                            }
                            acc[dateKey].push(item)
                            return acc
                          },
                          {} as Record<string, StudyScheduleItem[]>,
                        ),
                      ).map(([date, items]) => (
                        <div key={date} className="border-l-2 border-primary/20 pl-4">
                          <h4 className="font-semibold mb-2">{date}</h4>
                          <div className="space-y-2">
                            {items.map((item, idx) => (
                              <div key={`${item.id}-${idx}`} className="flex items-center gap-2 text-sm">
                                <Checkbox
                                  checked={item.completed}
                                  onCheckedChange={(checked) => toggleScheduleItem(selectedPlan.id, item.id, !!checked)}
                                />
                                <span className={cn(item.completed && "line-through text-muted-foreground")}>
                                  {item.subject} - {item.topic} ({item.duration}h)
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <TrendingUpIcon className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">Select a Study Plan</h3>
                <p className="text-muted-foreground mb-4">Choose a study plan to view your schedule</p>
                <Button onClick={() => setActiveTab("plans")}>View My Plans</Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}

export type { StudyScheduleItem }

