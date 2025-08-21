export interface StudySubject {
  id: string
  name: string
  priority: "high" | "medium" | "low"
  estimatedHours: number
  completed: boolean
}

const titleDateFormatter = new Intl.DateTimeFormat("en-US", {
  year: "numeric",
  month: "short",
  day: "numeric",
  timeZone: "UTC",
})

export interface StudyPlan {
  id: string
  title: string
  examDate: Date
  totalHoursPerDay: number
  subjects: StudySubject[]
  schedule: StudyScheduleItem[]
  createdAt: Date
  updatedAt: Date
}

export interface StudyScheduleItem {
  id: string
  date: Date
  subject: string
  topic: string
  duration: number
  completed: boolean
  notes?: string
}

export interface StudyPlanInput {
  examDate: Date
  hoursPerDay: number
  subjects: Array<{
    name: string
    priority: "high" | "medium" | "low"
    estimatedHours: number
  }>
}

class StudyPlanGenerator {
  generatePlan(input: StudyPlanInput): StudyPlan {
    const { examDate, hoursPerDay, subjects } = input
    const today = new Date()
    const daysUntilExam = Math.ceil((examDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
    const totalAvailableHours = daysUntilExam * hoursPerDay

    // Sort subjects by priority
    const priorityOrder = { high: 3, medium: 2, low: 1 }
    const sortedSubjects = subjects.sort((a, b) => priorityOrder[b.priority] - priorityOrder[a.priority])

    // Calculate total estimated hours
    const totalEstimatedHours = subjects.reduce((sum, subject) => sum + subject.estimatedHours, 0)

    // Adjust hours if needed
    const adjustmentFactor = totalAvailableHours / totalEstimatedHours
    const adjustedSubjects: StudySubject[] = sortedSubjects.map((subject, index) => ({
      id: `subject_${index}`,
      name: subject.name,
      priority: subject.priority,
      estimatedHours: Math.round(subject.estimatedHours * adjustmentFactor),
      completed: false,
    }))

    // Generate daily schedule
    const schedule = this.generateDailySchedule(adjustedSubjects, daysUntilExam, hoursPerDay, today)

    return {
      id: `plan_${Date.now()}`,
      title: `Study Plan for ${titleDateFormatter.format(examDate)}`,
      examDate,
      totalHoursPerDay: hoursPerDay,
      subjects: adjustedSubjects,
      schedule,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
  }

  private generateDailySchedule(
    subjects: StudySubject[],
    daysUntilExam: number,
    hoursPerDay: number,
    startDate: Date,
  ): StudyScheduleItem[] {
    const schedule: StudyScheduleItem[] = []
    let subjectIndex = 0
    let remainingHoursForSubject = subjects[0]?.estimatedHours || 0

    for (let day = 0; day < daysUntilExam; day++) {
      const currentDate = new Date(startDate)
      currentDate.setDate(startDate.getDate() + day)

      let remainingHoursForDay = hoursPerDay

      while (remainingHoursForDay > 0 && subjectIndex < subjects.length) {
        const currentSubject = subjects[subjectIndex]
        const hoursToAllocate = Math.min(remainingHoursForDay, remainingHoursForSubject, 3) // Max 3 hours per session

        if (hoursToAllocate > 0) {
          schedule.push({
            id: `schedule_${Date.now()}_${day}_${subjectIndex}`,
            date: new Date(currentDate),
            subject: currentSubject.name,
            topic: this.generateTopicName(currentSubject.name, day),
            duration: hoursToAllocate,
            completed: false,
          })

          remainingHoursForDay -= hoursToAllocate
          remainingHoursForSubject -= hoursToAllocate
        }

        if (remainingHoursForSubject <= 0) {
          subjectIndex++
          remainingHoursForSubject = subjects[subjectIndex]?.estimatedHours || 0
        }
      }
    }

    return schedule
  }

  private generateTopicName(subjectName: string, day: number): string {
    const topics = {
      Mathematics: ["Algebra", "Calculus", "Geometry", "Statistics", "Trigonometry"],
      Physics: ["Mechanics", "Thermodynamics", "Optics", "Electricity", "Modern Physics"],
      Chemistry: ["Organic Chemistry", "Inorganic Chemistry", "Physical Chemistry", "Analytical Chemistry"],
      "Computer Science": ["Data Structures", "Algorithms", "Database Systems", "Operating Systems", "Networks"],
      Engineering: ["Circuit Analysis", "Control Systems", "Signal Processing", "Power Systems"],
    }

    const subjectTopics = topics[subjectName as keyof typeof topics] || [
      "Theory",
      "Practice",
      "Problem Solving",
      "Review",
    ]
    return subjectTopics[day % subjectTopics.length]
  }
}

export const studyPlanGenerator = new StudyPlanGenerator()

// Storage for study plans
class StudyPlanStorage {
  private readonly STORAGE_KEY = "asi-one-study-plans"

  savePlan(plan: StudyPlan): void {
    try {
      const plans = this.getAllPlans()
      const existingIndex = plans.findIndex((p) => p.id === plan.id)

      if (existingIndex >= 0) {
        plans[existingIndex] = plan
      } else {
        plans.push(plan)
      }

      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(plans))
    } catch (error) {
      console.error("Error saving study plan:", error)
    }
  }

  getAllPlans(): StudyPlan[] {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY)
      if (!stored) return []

      const plans = JSON.parse(stored)
      return plans.map((plan: any) => ({
        ...plan,
        examDate: new Date(plan.examDate),
        createdAt: new Date(plan.createdAt),
        updatedAt: new Date(plan.updatedAt),
        schedule: plan.schedule.map((item: any) => ({
          ...item,
          date: new Date(item.date),
        })),
      }))
    } catch (error) {
      console.error("Error loading study plans:", error)
      return []
    }
  }

  getPlan(planId: string): StudyPlan | null {
    const plans = this.getAllPlans()
    return plans.find((plan) => plan.id === planId) || null
  }

  deletePlan(planId: string): void {
    try {
      const plans = this.getAllPlans().filter((plan) => plan.id !== planId)
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(plans))
    } catch (error) {
      console.error("Error deleting study plan:", error)
    }
  }

  updateScheduleItem(planId: string, scheduleItemId: string, updates: Partial<StudyScheduleItem>): void {
    try {
      const plans = this.getAllPlans()
      const planIndex = plans.findIndex((p) => p.id === planId)

      if (planIndex >= 0) {
        const scheduleIndex = plans[planIndex].schedule.findIndex((item) => item.id === scheduleItemId)
        if (scheduleIndex >= 0) {
          plans[planIndex].schedule[scheduleIndex] = {
            ...plans[planIndex].schedule[scheduleIndex],
            ...updates,
          }
          plans[planIndex].updatedAt = new Date()
          localStorage.setItem(this.STORAGE_KEY, JSON.stringify(plans))
        }
      }
    } catch (error) {
      console.error("Error updating schedule item:", error)
    }
  }
}

export const studyPlanStorage = new StudyPlanStorage()
