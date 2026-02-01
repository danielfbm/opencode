/** Status of an investigation */
export type InvestigationStatus =
  | "in_progress"
  | "concluded"
  | "inconclusive"
  | "canceled"

/** Priority/Severity levels */
export type Severity = "P1" | "P2" | "P3" | "P4"

/** Data collection source types */
export type ObservationSource =
  | "metrics"
  | "logs"
  | "traces"
  | "audits"
  | "resources"
  | "changes"
  | "topology"

/** Hypothesis validation status */
export type HypothesisStatus =
  | "pending"
  | "validated"
  | "invalidated"
  | "inconclusive"

/** Core investigation interface */
export interface Investigation {
  id: string
  name: string
  description: string
  status: InvestigationStatus
  severity?: Severity
  affectedService?: string
  namespace?: string
  cluster?: string
  startedAt: number
  completedAt?: number
  directory: string
  sessionId?: string
  currentPhase?: string
  rootCause?: string
  hypothesesCount?: number
  observationsCount?: number
}

/** Observation/Evidence collected during investigation */
export interface Observation {
  id: string
  source: ObservationSource
  finding: string
  timestamp: string
  confidence: "high" | "medium" | "low"
  sourceDetails?: string
}

/** Hypothesis generated during investigation */
export interface Hypothesis {
  id: string
  description: string
  details: string
  parentId?: string
  supportingEvidence: string[]
  priorityScore: number
  priorityBreakdown: {
    probability: number
    testability: number
    impact: number
    reversibility: number
  }
  status: HypothesisStatus
  researchSteps?: ResearchStep[]
  validationResult?: ValidationResult
  createdAt: string
}

/** Research step in hypothesis validation */
export interface ResearchStep {
  step: number
  description: string
  outcome?: string
}

/** Validation result for a hypothesis */
export interface ValidationResult {
  result: string
  confidence: string
  isRootCause: boolean
  direction: "correct" | "incorrect" | "partially_correct"
  validatedAt: string
  invalidationReason?: string
}

/** Filter options for investigation list */
export interface InvestigationFilters {
  search: string
  status: InvestigationStatus | "all"
  sortBy: "date_desc" | "date_asc" | "name_asc"
}

/** View mode for investigation list */
export type ViewMode = "grid" | "list"
