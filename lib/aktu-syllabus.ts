export interface AKTUSubject {
  id: string
  name: string
  code: string
  branch: string
  semester: number
  topics: string[]
  keywords: string[]
  difficulty: "beginner" | "intermediate" | "advanced"
}

export interface SyllabusDetection {
  detectedSubjects: AKTUSubject[]
  detectedTopics: string[]
  confidence: number
  suggestions: string[]
  studyResources: string[]
}

// Comprehensive AKTU syllabus database
export const AKTU_SUBJECTS: AKTUSubject[] = [
  // Computer Science & Engineering
  {
    id: "cs_dsa",
    name: "Data Structures and Algorithms",
    code: "KCS-301",
    branch: "Computer Science",
    semester: 3,
    topics: [
      "Arrays",
      "Linked Lists",
      "Stacks",
      "Queues",
      "Trees",
      "Binary Trees",
      "BST",
      "Graphs",
      "Sorting Algorithms",
      "Searching Algorithms",
      "Dynamic Programming",
      "Greedy Algorithms",
      "Hashing",
      "Heaps",
      "Recursion",
    ],
    keywords: [
      "array",
      "linked list",
      "stack",
      "queue",
      "tree",
      "graph",
      "sorting",
      "searching",
      "algorithm",
      "complexity",
      "big o",
      "recursion",
      "dynamic programming",
      "greedy",
      "hash",
      "heap",
      "binary search",
      "merge sort",
      "quick sort",
      "dfs",
      "bfs",
    ],
    difficulty: "intermediate",
  },
  {
    id: "cs_dbms",
    name: "Database Management Systems",
    code: "KCS-401",
    branch: "Computer Science",
    semester: 4,
    topics: [
      "ER Model",
      "Relational Model",
      "SQL",
      "Normalization",
      "Transactions",
      "Concurrency Control",
      "Indexing",
      "Query Optimization",
      "NoSQL",
      "ACID Properties",
    ],
    keywords: [
      "database",
      "sql",
      "mysql",
      "postgresql",
      "er diagram",
      "normalization",
      "acid",
      "transaction",
      "join",
      "index",
      "query",
      "table",
      "relation",
      "primary key",
      "foreign key",
      "nosql",
      "mongodb",
    ],
    difficulty: "intermediate",
  },
  {
    id: "cs_os",
    name: "Operating Systems",
    code: "KCS-402",
    branch: "Computer Science",
    semester: 4,
    topics: [
      "Process Management",
      "Memory Management",
      "File Systems",
      "CPU Scheduling",
      "Deadlocks",
      "Synchronization",
      "Virtual Memory",
      "I/O Management",
    ],
    keywords: [
      "operating system",
      "process",
      "thread",
      "scheduling",
      "memory",
      "virtual memory",
      "deadlock",
      "semaphore",
      "mutex",
      "file system",
      "cpu",
      "kernel",
      "linux",
      "windows",
    ],
    difficulty: "intermediate",
  },
  {
    id: "cs_cn",
    name: "Computer Networks",
    code: "KCS-501",
    branch: "Computer Science",
    semester: 5,
    topics: [
      "OSI Model",
      "TCP/IP",
      "Routing",
      "Switching",
      "Network Security",
      "Wireless Networks",
      "Network Protocols",
      "Error Detection",
      "Flow Control",
    ],
    keywords: [
      "network",
      "tcp",
      "ip",
      "osi",
      "routing",
      "switching",
      "protocol",
      "ethernet",
      "wifi",
      "security",
      "firewall",
      "dns",
      "http",
      "https",
      "socket",
      "port",
    ],
    difficulty: "intermediate",
  },
  {
    id: "cs_se",
    name: "Software Engineering",
    code: "KCS-503",
    branch: "Computer Science",
    semester: 5,
    topics: [
      "SDLC",
      "Agile",
      "Waterfall",
      "Requirements Engineering",
      "Design Patterns",
      "Testing",
      "Project Management",
      "Version Control",
      "Documentation",
    ],
    keywords: [
      "software engineering",
      "sdlc",
      "agile",
      "waterfall",
      "scrum",
      "testing",
      "design pattern",
      "uml",
      "requirements",
      "git",
      "version control",
      "documentation",
    ],
    difficulty: "beginner",
  },

  // Mathematics
  {
    id: "math_calculus",
    name: "Engineering Mathematics I",
    code: "KAS-101",
    branch: "All Branches",
    semester: 1,
    topics: [
      "Differential Calculus",
      "Integral Calculus",
      "Limits",
      "Continuity",
      "Derivatives",
      "Applications of Derivatives",
      "Integration Techniques",
    ],
    keywords: [
      "calculus",
      "derivative",
      "integration",
      "limit",
      "continuity",
      "differential",
      "integral",
      "maxima",
      "minima",
      "area",
      "volume",
      "rate of change",
    ],
    difficulty: "intermediate",
  },
  {
    id: "math_linear_algebra",
    name: "Engineering Mathematics II",
    code: "KAS-201",
    branch: "All Branches",
    semester: 2,
    topics: [
      "Matrices",
      "Determinants",
      "Eigenvalues",
      "Eigenvectors",
      "Vector Spaces",
      "Linear Transformations",
      "Systems of Linear Equations",
    ],
    keywords: [
      "matrix",
      "determinant",
      "eigenvalue",
      "eigenvector",
      "vector",
      "linear algebra",
      "system of equations",
      "rank",
      "inverse",
      "transpose",
      "linear transformation",
    ],
    difficulty: "intermediate",
  },

  // Physics
  {
    id: "phy_mechanics",
    name: "Engineering Physics I",
    code: "KAS-102",
    branch: "All Branches",
    semester: 1,
    topics: [
      "Mechanics",
      "Waves",
      "Oscillations",
      "Thermodynamics",
      "Kinetic Theory",
      "Laws of Motion",
      "Work Energy",
      "Momentum",
    ],
    keywords: [
      "physics",
      "mechanics",
      "force",
      "motion",
      "energy",
      "momentum",
      "wave",
      "oscillation",
      "thermodynamics",
      "heat",
      "temperature",
      "pressure",
    ],
    difficulty: "intermediate",
  },

  // Electronics
  {
    id: "ece_analog",
    name: "Analog Electronics",
    code: "KEC-301",
    branch: "Electronics",
    semester: 3,
    topics: [
      "Diodes",
      "Transistors",
      "Amplifiers",
      "Operational Amplifiers",
      "Filters",
      "Oscillators",
      "Power Supplies",
      "Feedback Systems",
    ],
    keywords: [
      "analog",
      "diode",
      "transistor",
      "amplifier",
      "op amp",
      "filter",
      "oscillator",
      "bjt",
      "fet",
      "mosfet",
      "circuit",
      "voltage",
      "current",
      "resistance",
    ],
    difficulty: "intermediate",
  },

  // Mechanical Engineering
  {
    id: "mech_thermo",
    name: "Thermodynamics",
    code: "KME-301",
    branch: "Mechanical",
    semester: 3,
    topics: [
      "Laws of Thermodynamics",
      "Heat Engines",
      "Refrigeration",
      "Entropy",
      "Enthalpy",
      "Carnot Cycle",
      "Otto Cycle",
      "Diesel Cycle",
    ],
    keywords: [
      "thermodynamics",
      "heat",
      "temperature",
      "entropy",
      "enthalpy",
      "cycle",
      "engine",
      "refrigeration",
      "carnot",
      "otto",
      "diesel",
      "efficiency",
    ],
    difficulty: "intermediate",
  },
]

class AKTUSyllabusDetector {
  private subjects: AKTUSubject[] = AKTU_SUBJECTS

  detectSyllabus(text: string): SyllabusDetection {
    const normalizedText = text.toLowerCase()
    const words = normalizedText.split(/\s+/)

    const detectedSubjects: AKTUSubject[] = []
    const detectedTopics: string[] = []
    const matchedKeywords: string[] = []

    // Detect subjects based on keywords
    for (const subject of this.subjects) {
      let matchCount = 0
      const subjectMatches: string[] = []

      // Check for keyword matches
      for (const keyword of subject.keywords) {
        if (normalizedText.includes(keyword.toLowerCase())) {
          matchCount++
          matchedKeywords.push(keyword)
          subjectMatches.push(keyword)
        }
      }

      // Check for topic matches
      for (const topic of subject.topics) {
        if (normalizedText.includes(topic.toLowerCase())) {
          matchCount += 2 // Topics have higher weight
          detectedTopics.push(topic)
          subjectMatches.push(topic)
        }
      }

      // If we have enough matches, consider this subject detected
      if (matchCount >= 2 || subjectMatches.length >= 1) {
        detectedSubjects.push(subject)
      }
    }

    // Calculate confidence based on matches
    const totalWords = words.length
    const matchedWords = matchedKeywords.length
    const confidence = Math.min((matchedWords / Math.max(totalWords * 0.1, 1)) * 100, 100)

    // Generate suggestions
    const suggestions = this.generateSuggestions(detectedSubjects, detectedTopics)
    const studyResources = this.generateStudyResources(detectedSubjects)

    return {
      detectedSubjects: detectedSubjects.slice(0, 3), // Limit to top 3
      detectedTopics: [...new Set(detectedTopics)].slice(0, 5), // Remove duplicates, limit to 5
      confidence: Math.round(confidence),
      suggestions,
      studyResources,
    }
  }

  private generateSuggestions(subjects: AKTUSubject[], topics: string[]): string[] {
    const suggestions: string[] = []

    if (subjects.length > 0) {
      const primarySubject = subjects[0]
      suggestions.push(`This appears to be related to ${primarySubject.name} (${primarySubject.code})`)

      if (topics.length > 0) {
        suggestions.push(`Key topics: ${topics.slice(0, 3).join(", ")}`)
      }

      // Add difficulty-based suggestions
      if (primarySubject.difficulty === "beginner") {
        suggestions.push("This is a foundational topic. Focus on understanding basic concepts first.")
      } else if (primarySubject.difficulty === "advanced") {
        suggestions.push("This is an advanced topic. Make sure you have a strong foundation in prerequisites.")
      }

      // Add semester-based suggestions
      suggestions.push(`Typically covered in Semester ${primarySubject.semester}`)
    }

    return suggestions
  }

  private generateStudyResources(subjects: AKTUSubject[]): string[] {
    const resources: string[] = []

    for (const subject of subjects.slice(0, 2)) {
      switch (subject.branch) {
        case "Computer Science":
          resources.push("Practice coding problems on platforms like LeetCode, HackerRank")
          resources.push("Refer to standard textbooks and online courses")
          break
        case "Electronics":
          resources.push("Practice circuit analysis and simulation tools")
          resources.push("Work on practical lab experiments")
          break
        case "Mechanical":
          resources.push("Solve numerical problems and case studies")
          resources.push("Understand real-world applications")
          break
        default:
          resources.push("Practice problems from previous year papers")
          resources.push("Join study groups and discussion forums")
      }
    }

    return [...new Set(resources)].slice(0, 4)
  }

  getSubjectByCode(code: string): AKTUSubject | undefined {
    return this.subjects.find((subject) => subject.code === code)
  }

  getSubjectsByBranch(branch: string): AKTUSubject[] {
    return this.subjects.filter((subject) => subject.branch === branch || subject.branch === "All Branches")
  }

  getSubjectsBySemester(semester: number): AKTUSubject[] {
    return this.subjects.filter((subject) => subject.semester === semester)
  }

  searchSubjects(query: string): AKTUSubject[] {
    const normalizedQuery = query.toLowerCase()
    return this.subjects.filter(
      (subject) =>
        subject.name.toLowerCase().includes(normalizedQuery) ||
        subject.topics.some((topic) => topic.toLowerCase().includes(normalizedQuery)) ||
        subject.keywords.some((keyword) => keyword.toLowerCase().includes(normalizedQuery)),
    )
  }
}

export const aktuSyllabusDetector = new AKTUSyllabusDetector()

// Utility function to enhance messages with syllabus context
export function enhanceMessageWithSyllabus(message: string, detection: SyllabusDetection): string {
  if (detection.detectedSubjects.length === 0) {
    return message
  }

  const context = [
    "Context: This question appears to be related to AKTU syllabus.",
    ...detection.suggestions,
    "Please provide a detailed explanation suitable for AKTU students.",
  ].join(" ")

  return `${context}\n\nStudent Question: ${message}`
}
