import type { FlowNode, FlowEdge } from "./layout"
import { NODE_SIZES, H_GAP, V_GAP } from "./layout"
import type { Hypothesis } from "@/types/investigation"

interface HypothesisTreeResult {
  hypothesisNodes: FlowNode[]
  hypothesisEdges: FlowEdge[]
  maxY: number
}

interface TreeNode {
  hypothesis: Hypothesis
  children: TreeNode[]
  width: number
  height: number
  x?: number
  y?: number
}

export function createHypothesisTree(
  hypotheses: Hypothesis[],
  _rootCauseId: string | undefined,
  centerX: number,
  startY: number,
): HypothesisTreeResult {
  const hypothesisNodes: FlowNode[] = []
  const hypothesisEdges: FlowEdge[] = []

  if (!hypotheses || hypotheses.length === 0) {
    return { hypothesisNodes, hypothesisEdges, maxY: startY }
  }

  const hypothesisMap = new Map<string, TreeNode>()
  hypotheses.forEach((h) => {
    hypothesisMap.set(h.id, {
      hypothesis: h,
      children: [],
      width: NODE_SIZES.hypothesis.width,
      height: NODE_SIZES.hypothesis.height,
    })
  })

  const roots: TreeNode[] = []

  hypotheses.forEach((h) => {
    const node = hypothesisMap.get(h.id)!
    if (h.parent_id && hypothesisMap.has(h.parent_id)) {
      const parent = hypothesisMap.get(h.parent_id)!
      parent.children.push(node)
    } else {
      roots.push(node)
    }
  })

  roots.sort((a, b) => b.hypothesis.priority_score - a.hypothesis.priority_score)

  function calculateDimensions(node: TreeNode): number {
    if (node.children.length === 0) {
      node.width = NODE_SIZES.hypothesis.width
      return node.width
    }

    let childrenWidth = 0
    node.children.sort((a, b) => b.hypothesis.priority_score - a.hypothesis.priority_score)

    node.children.forEach((child, index) => {
      const childW = calculateDimensions(child)
      childrenWidth += childW
      if (index < node.children.length - 1) {
        childrenWidth += H_GAP
      }
    })

    node.width = Math.max(NODE_SIZES.hypothesis.width, childrenWidth)
    return node.width
  }

  roots.forEach((root) => {
    calculateDimensions(root)
  })

  let maxY = startY

  const columns = 3
  const colWidth = Math.max(...roots.map((r) => r.width), NODE_SIZES.hypothesis.width)
  const totalWidth = columns * colWidth + (columns - 1) * H_GAP
  const startX = centerX - totalWidth / 2

  const columnsNodes: TreeNode[][] = Array.from({ length: columns }, () => [])
  roots.forEach((root, index) => {
    columnsNodes[index % columns].push(root)
  })

  let maxColY = startY
  columnsNodes.forEach((col, colIndex) => {
    const colCenter = startX + colIndex * (colWidth + H_GAP) + colWidth / 2
    let colY = startY
    col.forEach((root) => {
      layoutNode(root, colCenter, colY)
      colY += getTreeHeight(root) + V_GAP
    })
    if (colY > maxColY) maxColY = colY
  })

  maxY = maxColY

  function layoutNode(node: TreeNode, x: number, y: number) {
    const nodeX = x - NODE_SIZES.hypothesis.width / 2
    const nodeY = y

    const flowNode: FlowNode = {
      id: node.hypothesis.id,
      type: "hypothesis",
      label: `${node.hypothesis.id}: ${node.hypothesis?.description}`,
      status: node.hypothesis.status,
      x: nodeX,
      y: nodeY,
      width: NODE_SIZES.hypothesis.width,
      height: NODE_SIZES.hypothesis.height,
      data: node.hypothesis,
    }

    hypothesisNodes.push(flowNode)

    if (node.children.length > 0) {
      const childY = y + NODE_SIZES.hypothesis.height + V_GAP

      let childrenTotalWidth = 0
      node.children.forEach((child, i) => {
        childrenTotalWidth += child.width
        if (i < node.children.length - 1) childrenTotalWidth += H_GAP
      })

      let startChildX = x - childrenTotalWidth / 2

      node.children.forEach((child) => {
        const childCenterX = startChildX + child.width / 2
        layoutNode(child, childCenterX, childY)

        hypothesisEdges.push({
          from: node.hypothesis.id,
          to: child.hypothesis.id,
        })

        startChildX += child.width + H_GAP
      })
    }
  }

  function getTreeHeight(node: TreeNode): number {
    if (node.children.length === 0) return NODE_SIZES.hypothesis.height

    let maxChildHeight = 0
    node.children.forEach((child) => {
      const h = getTreeHeight(child)
      if (h > maxChildHeight) maxChildHeight = h
    })

    return NODE_SIZES.hypothesis.height + V_GAP + maxChildHeight
  }

  return { hypothesisNodes, hypothesisEdges, maxY }
}
