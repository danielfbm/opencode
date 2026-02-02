/**
 * Investigation Data Types
 *
 * Comprehensive TypeScript interfaces for the SRE investigation workflow,
 * based on the metadata.yaml structure used in investigation files.
 */

// Re-export relevant types from sre/types for compatibility
export type {
  InvestigationStatus,
  Severity,
  ObservationSource,
  HypothesisStatus,
  ViewMode,
} from "@/pages/sre/types"

/**
 * Session identifier from OpenCode
 */
export interface SessionInfo {
  session: string
}

/**
 * Incident information - the top-level issue being investigated
 */
export interface Incident {
  id: string
  started_at: string
  status: "in_progress" | "completed"
  completed_at?: string
  description: string
}

/**
 * Symptom information - the observable problem manifestation
 */
export interface Symptom {
  affected_service: string
  type: "error" | "performance" | "availability" | "reliability"
  description: string
  severity: "P1" | "P2" | "P3" | "P4"
  start_time: string
  scope?: string
  verified: boolean
}

/**
 * Phase status tracking - monitors investigation progress through phases
 */
export interface PhaseStatus {
  status: "pending" | "in_progress" | "completed" | "skipped"
  completed_at?: string
}

/**
 * Investigation phases - structured problem-solving workflow
 */
export interface Phases {
  symptom_confirmation: PhaseStatus
  information_gathering: PhaseStatus
  hypothesis_generation: PhaseStatus
  hypothesis_validation: PhaseStatus
  reporting: PhaseStatus
}

/**
 * Observation confidence level
 */
export type ObservationConfidence = "high" | "medium" | "low"

/**
 * Observation/Evidence collected during investigation
 * Extends the sre/types Observation with additional metadata fields
 */
export interface Observation {
  id: string
  source:
    | "k8s-resources"
    | "metrics"
    | "logs"
    | "traces"
    | "audits"
    | "resources"
    | "changes"
    | "topology"
    | "validation-H1" // Can reference hypothesis validations
  finding: string
  timestamp: string
  confidence: ObservationConfidence
  sourceDetails?: string
}

/**
 * Hypothesis scoring breakdown - quantifies hypothesis quality
 */
export interface ScoringBreakdown {
  probability: number // 0-1, likelihood of causing the symptom
  testability: number // 0-1, ease of validation
  impact: number // 0-1, potential severity if true
  reversibility: number // 0-1, ability to safely test/undo
}

/**
 * Hypothesis status with detailed validation
 */
export type HypothesisValidationStatus =
  | "pending"
  | "validated"
  | "invalidated"
  | "inconclusive"

/**
 * Hypothesis generated during investigation
 * Represents a potential root cause explanation
 */
export interface Hypothesis {
  id: string
  description: string
  causal_chain?: string // Detailed explanation of cause-effect chain
  priority_score: number // 0-1 or 0-100 aggregate score
  scoring: ScoringBreakdown
  status: HypothesisValidationStatus
  validation_result?: string // Summary of validation findings
  layer?: string // Infrastructure layer (app, platform, network, storage, etc.)
  parent_id?: string // ID of the parent hypothesis if this is a sub-hypothesis
  supporting_observations: string[] // Array of observation IDs that support this hypothesis
}

/**
 * Root cause analysis summary
 */
export interface RootCause {
  confirmed: boolean
  hypothesis_id: string // Reference to the confirmed hypothesis
  summary: string
  evidence: string[]
  remediation: {
    immediate: string[] // Quick fixes/mitigations
    prevention: string[] // Long-term preventive measures
  }
}

/**
 * Decision state during investigation
 */
export type DecisionState =
  | "INIT" // Initialization phase
  | "COLLECTING" // Gathering data
  | "ANALYZING" // Analyzing findings
  | "HYPOTHESIZING" // Generating hypotheses
  | "VALIDATING" // Testing hypotheses
  | "CONCLUDING" // Drawing conclusions
  | "REPORTING" // Creating report
  | "REMEDIATION" // Implementing fixes

/**
 * Decision log entry - audit trail of investigation decisions
 */
export interface DecisionLogEntry {
  timestamp: string
  state: DecisionState
  action: string
  rationale: string
}

/**
 * Complete investigation metadata document
 * Mirrors the structure of metadata.yaml in investigation directories
 */
export interface InvestigationMetadata {
  session: string
  incident: Incident
  symptom: Symptom
  phases: Phases
  observations: Observation[]
  hypotheses: Hypothesis[]
  root_cause?: RootCause
  decision_log: DecisionLogEntry[]
}

/**
 * Investigation with additional UI/runtime context
 * Extends the sre/types Investigation for richer detail
 */
export interface InvestigationDetail extends InvestigationMetadata {
  // Additional UI context not in metadata.yaml
  directory?: string
  displayName?: string
  lastModified?: string
  reportContent?: string
}

/**
 * Partial investigation metadata for incremental updates
 */
export type InvestigationMetadataUpdate = Partial<InvestigationMetadata>

/**
 * Investigation metadata validation result
 */
export interface ValidationResult {
  valid: boolean
  errors: string[]
  warnings: string[]
}

/**
 * Investigation search/filter criteria
 */
export interface InvestigationQuery {
  status?: "in_progress" | "completed"
  severity?: "P1" | "P2" | "P3" | "P4"
  service?: string
  dateRange?: {
    from: string
    to: string
  }
  searchText?: string
}

/**
 * Statistics about an investigation
 */
export interface InvestigationStats {
  totalObservations: number
  totalHypotheses: number
  validatedHypotheses: number
  invalidatedHypotheses: number
  pendingHypotheses: number
  averagePriorityScore: number
  rootCauseConfirmed: boolean
  durationMinutes?: number
}
