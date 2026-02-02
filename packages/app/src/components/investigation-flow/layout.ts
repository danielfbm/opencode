import type { InvestigationMetadata, Hypothesis, HypothesisValidationStatus, PhaseStatus } from '@/types/investigation'
import { createHypothesisTree } from './hypothesis-tree'

type PhaseData = {
  phase?: PhaseStatus
  phaseKey?: keyof InvestigationMetadata['phases']
}

type CollectionData = {
  isCollection: true
  source?: string
  phase?: PhaseStatus
  phaseKey?: keyof InvestigationMetadata['phases']
}

type GroupData = {
  isGroup: true
  count: number
  collapsed: boolean
  phase?: PhaseStatus
  phaseKey?: keyof InvestigationMetadata['phases']
}

type FlowNodeData = Hypothesis | CollectionData | PhaseData | GroupData

export interface FlowNode {
  id: string
  type: 'incident' | 'gathering' | 'source' | 'hypothesis_group' | 'hypothesis' | 'root_cause' | 'report'
  label: string
  sublabel?: string
  status?: HypothesisValidationStatus | 'ongoing'
  x: number
  y: number
  width: number
  height: number
  data?: FlowNodeData
}

export interface FlowEdge {
  from: string
  to: string
  type?: 'normal' | 'validated' | 'invalidated'
}

export interface FlowLayout {
  nodes: FlowNode[]
  edges: FlowEdge[]
  width: number
  height: number
}

export const NODE_SIZES = {
  incident: { width: 400, height: 90 },
  gathering: { width: 260, height: 72 },
  source: { width: 260, height: 72 },
  hypothesis_group: { width: 260, height: 72 },
  hypothesis: { width: 240, height: 96 },
  root_cause: { width: 320, height: 74 },
  report: { width: 240, height: 72 }
}

export const H_GAP = 32
export const V_GAP = 48

export function calculateLayout(data: InvestigationMetadata, collapsed: boolean): FlowLayout {
  const nodes: FlowNode[] = []
  const edges: FlowEdge[] = []

  // Start with a default center, we will shift later
  const centerX = 0
  let currentY = 40
  const groupPaddingX = 24
  const groupPaddingTop = 40
  const groupPaddingBottom = 24

  // 1. Incident Node
  const incidentNode: FlowNode = {
    id: 'incident',
    type: 'incident',
    label: data.incident?.description || 'Incident',
    sublabel: data.symptom?.description,
    x: centerX - NODE_SIZES.incident.width / 2,
    y: currentY,
    ...NODE_SIZES.incident
  }
  nodes.push(incidentNode)
  currentY += NODE_SIZES.incident.height + V_GAP

  // 2. Initial Investigation (Gathering)
  const symptomPhase = data.phases?.symptom_confirmation
  const symptomScope =  data.symptom?.scope
  const gatheringNode: FlowNode = {
    id: 'gathering',
    type: 'gathering',
    label: 'Initial Investigation',
    sublabel: symptomScope? 'Scope: '+symptomScope:'',
    x: centerX - NODE_SIZES.gathering.width / 2,
    y: currentY,
    ...NODE_SIZES.gathering,
    status: symptomPhase?.status === 'completed'
      ? 'validated'
      : symptomPhase?.status === 'in_progress'
        ? 'ongoing'
        : 'pending',
    data: { phase: symptomPhase, phaseKey: 'symptom_confirmation' }
  }
  nodes.push(gatheringNode)
  edges.push({ from: incidentNode.id, to: gatheringNode.id })
  currentY += NODE_SIZES.gathering.height + V_GAP

  // 3. Data Collection Node (Consolidated)
  const gatheringPhase = data.phases?.information_gathering
  const observationCount = (data.observations || []).filter(o => !o.source.startsWith('validation-')).length
  const dataCollectionNode: FlowNode = {
    id: 'data-collection',
    type: 'source',
    label: 'Data Collection',
    sublabel: `${observationCount} observations`,
    x: centerX - NODE_SIZES.source.width / 2,
    y: currentY,
    ...NODE_SIZES.source,
    status: gatheringPhase?.status === 'completed'
      ? 'validated'
      : gatheringPhase?.status === 'in_progress'
        ? 'ongoing'
        : 'pending',
    data: { isCollection: true, phase: gatheringPhase, phaseKey: 'information_gathering' }
  }
  nodes.push(dataCollectionNode)
  edges.push({ from: gatheringNode.id, to: dataCollectionNode.id })
  currentY += NODE_SIZES.source.height + V_GAP

  // 4. Hypothesis Investigation (Parent Node)
  const hypotheses = data.hypotheses || []
  const hypothesisCount = hypotheses.length
  const compact = collapsed || hypothesisCount === 0
  const rootCauseId = data.root_cause?.hypothesis_id
  const hypothesisPhase = data.phases?.hypothesis_validation || data.phases?.hypothesis_generation
  const hypothesisStatus = hypothesisPhase?.status === 'completed'
    ? 'validated'
    : hypothesisPhase?.status === 'in_progress'
      ? 'ongoing'
      : 'pending'

  const groupNode: FlowNode = {
    id: 'hypothesis_group',
    type: 'hypothesis_group',
    label: 'Hypothesis Investigation',
    sublabel: collapsed || hypothesisCount === 0 ? `${hypothesisCount} hypotheses` : undefined,
    x: centerX - NODE_SIZES.hypothesis_group.width / 2,
    y: currentY,
    ...NODE_SIZES.hypothesis_group,
    status: hypothesisStatus,
    data: {
      isGroup: true,
      count: hypothesisCount,
      collapsed,
      phase: hypothesisPhase,
      phaseKey: hypothesisPhase ? (data.phases?.hypothesis_validation ? 'hypothesis_validation' : 'hypothesis_generation') : undefined
    }
  }
  nodes.push(groupNode)
  edges.push({ from: dataCollectionNode.id, to: groupNode.id })

  // 5. Hypothesis Tree (if expanded)
  if (!collapsed && hypotheses.length > 0) {
    const treeStartY = currentY + groupPaddingTop
    const treeResult = createHypothesisTree(
      hypotheses,
      rootCauseId,
      centerX,
      treeStartY
    )

    nodes.push(...treeResult.hypothesisNodes)
    edges.push(...treeResult.hypothesisEdges)

    const treeMinX = Math.min(...treeResult.hypothesisNodes.map(n => n.x))
    const treeMaxX = Math.max(...treeResult.hypothesisNodes.map(n => n.x + n.width))
    const treeMinY = Math.min(...treeResult.hypothesisNodes.map(n => n.y))
    const treeMaxY = Math.max(...treeResult.hypothesisNodes.map(n => n.y + n.height))

    groupNode.x = treeMinX - groupPaddingX
    groupNode.y = currentY
    groupNode.width = (treeMaxX - treeMinX) + (groupPaddingX * 2)
    groupNode.height = (treeMaxY - treeMinY) + groupPaddingTop + groupPaddingBottom
    groupNode.sublabel = undefined

    currentY = groupNode.y + groupNode.height + V_GAP
  } else {
    currentY += groupNode.height + V_GAP
  }

  // 6. Root Cause (if confirmed)
  const rootNode = data.root_cause && data.root_cause.confirmed
    ? ({
        id: 'root_cause',
        type: 'root_cause',
        label: 'Root Cause Identified',
        sublabel: data.root_cause.summary || 'Conclusion reached',
        x: centerX - NODE_SIZES.root_cause.width / 2,
        y: currentY,
        ...NODE_SIZES.root_cause
      } satisfies FlowNode)
    : undefined

  if (rootNode) {
    nodes.push(rootNode)

    edges.push({
      from: groupNode.id,
      to: rootNode.id,
      type: 'validated'
    })

    currentY += NODE_SIZES.root_cause.height + V_GAP
  }

  // 7. Reporting (if completed)
  const reportPhase = data.phases?.reporting
  const reportNode = reportPhase?.status === 'completed'
    ? ({
        id: 'report',
        type: 'report',
        label: 'Incident Report',
        sublabel: 'Reporting complete',
        x: centerX - NODE_SIZES.report.width / 2,
        y: currentY,
        ...NODE_SIZES.report,
        status: 'validated',
        data: { phase: reportPhase, phaseKey: 'reporting' }
      } satisfies FlowNode)
    : undefined

  if (reportNode) {
    nodes.push(reportNode)
    edges.push({
      from: rootNode ? rootNode.id : groupNode.id,
      to: reportNode.id,
      type: 'validated'
    })
    currentY += NODE_SIZES.report.height + V_GAP
  }

  // Calculate bounding box to center
  const minX = Math.min(...nodes.map(n => n.x))
  const maxX = Math.max(...nodes.map(n => n.x + n.width))
  const minY = Math.min(...nodes.map(n => n.y))
  const maxY = Math.max(...nodes.map(n => n.y + n.height))
  const width = maxX - minX
  const height = maxY - minY

  const paddingX = 32
  const paddingY = 28
  const totalWidth = width + (paddingX * 2)
  const totalHeight = height + (paddingY * 2)

  const scale = compact ? 1.5 : 1
  const extraX = (totalWidth * scale - totalWidth) / 2
  const extraY = (totalHeight * scale - totalHeight) / 2
  const shiftX = paddingX - minX + extraX
  const shiftY = paddingY - minY + extraY
  nodes.forEach(n => { n.x += shiftX; n.y += shiftY })

  return {
    nodes,
    edges,
    width: totalWidth * scale,
    height: totalHeight * scale
  }
}
