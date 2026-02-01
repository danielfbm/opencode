import type { Investigation, Hypothesis, Observation } from "./types"

export const mockReports: Record<string, string> = {
  "INC-001": `# Investigation Report: High CPU Usage on Payment Service

## Summary
This investigation identified and resolved a critical memory leak in the payment validation service that was causing excessive CPU usage due to garbage collection pressure.

## Timeline
- **14:00** - Alert triggered for CPU usage > 95%
- **14:15** - Investigation initiated
- **14:32** - OOMKilled event detected on payment-service-pod-3
- **15:00** - Root cause identified: Memory leak in PaymentValidator
- **15:30** - Fix deployed, issue resolved

## Root Cause
The \`PaymentValidator.validateCard()\` method was caching card validation results in a static HashMap without any eviction policy. Over time, this cache grew unbounded, consuming heap memory and triggering frequent garbage collection cycles.

### Affected Code
\`\`\`java
// Before (problematic)
private static Map<String, ValidationResult> cache = new HashMap<>();

// After (fixed)
private static Cache<String, ValidationResult> cache = 
    Caffeine.newBuilder()
        .maximumSize(10_000)
        .expireAfterWrite(5, TimeUnit.MINUTES)
        .build();
\`\`\`

## Impact
- **Duration**: 1.5 hours
- **Affected Users**: ~2,500 payment transactions delayed
- **SLA Impact**: 99.9% SLA maintained

## Remediation Steps
1. Identified memory leak via heap dump analysis
2. Deployed hotfix with cache eviction (PR #4521)
3. Rolled back to v2.3.1 as temporary measure
4. Deployed v2.3.2 with permanent fix

## Recommendations
- Add memory usage alerts for early detection
- Implement cache size limits in coding guidelines
- Add heap dump automation for OOM events`,

  "INC-005": `# Investigation Report: Elasticsearch Cluster Yellow Status

## Summary
The Elasticsearch search cluster entered yellow status due to disk space threshold being reached on node-3, preventing shard allocation.

## Root Cause
**Disk watermark exceeded on es-node-3**

Elasticsearch has built-in disk watermarks:
- Low watermark (85%): No new shards allocated
- High watermark (90%): Shards relocated away from node

Node-3 reached 92% disk usage, triggering automatic shard reallocation failures.

## Resolution
1. Expanded disk on es-node-3 from 500GB to 1TB
2. Forced shard rebalancing: \`POST /_cluster/reroute?retry_failed=true\`
3. Cluster returned to green status within 15 minutes

## Recommendations
- Implement disk usage monitoring with 75% warning threshold
- Schedule regular index lifecycle management cleanup
- Consider adding additional data nodes for capacity`
}

export const mockHypotheses: Record<string, Hypothesis[]> = {
  "INC-001": [
    {
      id: "H1",
      description: "Memory leak in payment validation module",
      details: "The payment validation service may have a memory leak causing excessive garbage collection",
      supportingEvidence: ["High GC pause times", "Heap usage growing over time", "Memory not released after request completion"],
      priorityScore: 85,
      priorityBreakdown: { probability: 80, testability: 90, impact: 90, reversibility: 80 },
      status: "validated",
      createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
      researchSteps: [
        { step: 1, description: "Analyze heap dump from payment-service-pod-3", outcome: "Found large number of PaymentValidator instances not being garbage collected" },
        { step: 2, description: "Review recent code changes to PaymentValidator", outcome: "Identified static Map caching card validations without eviction" },
        { step: 3, description: "Test fix in staging environment", outcome: "Memory stabilized after implementing cache eviction" }
      ],
      validationResult: {
        result: "Confirmed memory leak in PaymentValidator.validateCard()",
        confidence: "high",
        isRootCause: true,
        direction: "correct",
        validatedAt: new Date(Date.now() - 3600000).toISOString()
      }
    },
    {
      id: "H2",
      description: "Database query optimization needed",
      details: "Slow database queries may be causing CPU spikes due to lock contention",
      supportingEvidence: ["Slow query logs", "Lock wait timeouts"],
      priorityScore: 70,
      priorityBreakdown: { probability: 60, testability: 85, impact: 75, reversibility: 70 },
      status: "invalidated",
      createdAt: new Date(Date.now() - 3600000 * 1.5).toISOString(),
      researchSteps: [
        { step: 1, description: "Query database slow query logs for payment-related queries", outcome: "Found 3 queries taking >1s" },
        { step: 2, description: "Correlate slow queries with CPU spikes", outcome: "No temporal correlation found between slow queries and CPU spikes" }
      ],
      validationResult: {
        result: "Query performance is within normal parameters",
        confidence: "high",
        isRootCause: false,
        direction: "incorrect",
        validatedAt: new Date(Date.now() - 3600000 * 1.2).toISOString(),
        invalidationReason: "Database metrics show no correlation with CPU spikes"
      }
    },
    {
      id: "H3",
      description: "External payment gateway timeout",
      details: "Payment gateway may be responding slowly causing thread pool exhaustion",
      supportingEvidence: ["Increased latency to payment provider"],
      priorityScore: 65,
      priorityBreakdown: { probability: 55, testability: 80, impact: 70, reversibility: 90 },
      status: "invalidated",
      createdAt: new Date(Date.now() - 3600000 * 1.3).toISOString(),
      researchSteps: [
        { step: 1, description: "Check payment gateway response times", outcome: "Response times within SLA (avg 120ms)" }
      ]
    }
  ],
  "INC-002": [
    {
      id: "H1",
      description: "Connection leak in user session handler",
      details: "Database connections may not be properly released after user session operations",
      supportingEvidence: ["Growing connection count", "No connection releases seen"],
      priorityScore: 90,
      priorityBreakdown: { probability: 85, testability: 95, impact: 90, reversibility: 85 },
      status: "pending",
      createdAt: new Date(Date.now() - 1800000).toISOString()
    },
    {
      id: "H2",
      description: "Pool size misconfiguration",
      details: "Connection pool may be undersized for current load",
      supportingEvidence: ["Pool exhaustion during peak hours"],
      priorityScore: 75,
      priorityBreakdown: { probability: 70, testability: 90, impact: 80, reversibility: 95 },
      status: "pending",
      createdAt: new Date(Date.now() - 1500000).toISOString()
    }
  ]
}

export const mockObservations: Record<string, Observation[]> = {
  "INC-001": [
    {
      id: "O1",
      source: "metrics",
      finding: "CPU usage at 95%+ on all payment-service pods",
      timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
      confidence: "high"
    },
    {
      id: "O2",
      source: "metrics",
      finding: "GC pause times increased from 50ms to 800ms",
      timestamp: new Date(Date.now() - 3600000 * 1.8).toISOString(),
      confidence: "high"
    },
    {
      id: "O3",
      source: "logs",
      finding: "OutOfMemoryError in payment-service-pod-3 at 14:32:15",
      timestamp: new Date(Date.now() - 3600000 * 1.5).toISOString(),
      confidence: "high",
      sourceDetails: "pod: payment-service-pod-3, namespace: production"
    },
    {
      id: "O4",
      source: "traces",
      finding: "Payment validation requests taking 5s+ vs normal 200ms",
      timestamp: new Date(Date.now() - 3600000 * 1.3).toISOString(),
      confidence: "medium"
    }
  ],
  "INC-002": [
    {
      id: "O1",
      source: "metrics",
      finding: "Database connection pool at 100% capacity",
      timestamp: new Date(Date.now() - 1800000).toISOString(),
      confidence: "high"
    },
    {
      id: "O2",
      source: "logs",
      finding: "Connection timeout errors in user-service",
      timestamp: new Date(Date.now() - 1600000).toISOString(),
      confidence: "high",
      sourceDetails: "pod: user-service-pod-1, namespace: production"
    }
  ]
}

export const mockInvestigations: Investigation[] = [
  {
    id: "INC-001",
    name: "High CPU Usage on Payment Service",
    description: "Payment service pods experiencing 95%+ CPU usage causing slow response times",
    status: "concluded",
    severity: "P1",
    affectedService: "payment-service",
    namespace: "production",
    cluster: "prod-east-1",
    startedAt: Date.now() - 3600000 * 2,
    completedAt: Date.now() - 3600000,
    directory: "/sre-investigations/INC-001",
    currentPhase: "CONCLUDED",
    rootCause: "Memory leak in payment validation causing excessive garbage collection and CPU spikes. Rollback to v2.3.1 resolved the issue.",
    hypothesesCount: 5,
    observationsCount: 12
  },
  {
    id: "INC-002",
    name: "Database Connection Pool Exhaustion",
    description: "PostgreSQL connection pool depleted causing service failures",
    status: "in_progress",
    severity: "P2",
    affectedService: "user-service",
    namespace: "production",
    cluster: "prod-east-1",
    startedAt: Date.now() - 1800000,
    directory: "/sre-investigations/INC-002",
    currentPhase: "VALIDATING",
    hypothesesCount: 3,
    observationsCount: 8
  },
  {
    id: "INC-003",
    name: "Kubernetes Pod CrashLoopBackOff",
    description: "Analytics service pods repeatedly crashing with OOMKilled status",
    status: "inconclusive",
    severity: "P3",
    affectedService: "analytics-service",
    namespace: "staging",
    cluster: "stage-west-1",
    startedAt: Date.now() - 86400000,
    completedAt: Date.now() - 82800000,
    directory: "/sre-investigations/INC-003",
    currentPhase: "CONCLUDED",
    rootCause: "Investigation inconclusive - memory consumption patterns inconsistent",
    hypothesesCount: 4,
    observationsCount: 15
  },
  {
    id: "INC-004",
    name: "API Gateway 503 Errors",
    description: "Intermittent 503 errors from API gateway affecting mobile clients",
    status: "canceled",
    severity: "P2",
    affectedService: "api-gateway",
    namespace: "production",
    cluster: "prod-east-1",
    startedAt: Date.now() - 172800000,
    completedAt: Date.now() - 169200000,
    directory: "/sre-investigations/INC-004",
    currentPhase: "CANCELED",
    hypothesesCount: 2,
    observationsCount: 5
  },
  {
    id: "INC-005",
    name: "Elasticsearch Cluster Yellow Status",
    description: "Search cluster in yellow state with unassigned shards",
    status: "concluded",
    severity: "P3",
    affectedService: "search-service",
    namespace: "production",
    cluster: "prod-east-1",
    startedAt: Date.now() - 259200000,
    completedAt: Date.now() - 255600000,
    directory: "/sre-investigations/INC-005",
    currentPhase: "CONCLUDED",
    rootCause: "Disk space threshold reached on node-3 causing shard allocation failures. Expanded disk and rebalanced shards.",
    hypothesesCount: 3,
    observationsCount: 9
  }
]
