import { createContext, useContext, createResource, createMemo, type JSX } from "solid-js"
import { createStore } from "solid-js/store"
import { createOpencodeClient } from "@opencode-ai/sdk/v2/client"
import type { Investigation, InvestigationFilters, Hypothesis, Observation } from "../pages/sre/types"
import { mockHypotheses, mockObservations, mockReports } from "../pages/sre/mock-data"
import { useSreWorkspace } from "./sre-workspace"
import { useGlobalSDK } from "./global-sdk"
import { usePlatform } from "./platform"
import yaml from "js-yaml"

interface CreateInvestigationInput {
  description: string
  affectedService?: string
  namespace?: string
  cluster?: string
}

interface InvestigationsContextType {
  investigations: () => Investigation[]
  loading: () => boolean
  error: () => any
  filters: InvestigationFilters
  setFilters: (filters: Partial<InvestigationFilters>) => void
  filteredInvestigations: () => Investigation[]
  refresh: () => void
  deleteInvestigation: (id: string) => Promise<void>
  createInvestigation: (input: CreateInvestigationInput) => Promise<Investigation>
  getInvestigation: (id: string) => Investigation | undefined
  getHypotheses: (id: string) => Hypothesis[]
  getObservations: (id: string) => Observation[]
  getReport: (id: string) => string | undefined
}

const InvestigationsContext = createContext<InvestigationsContextType>()

export function InvestigationsProvider(props: { children: JSX.Element }) {
  const workspace = useSreWorkspace()
  const globalSDK = useGlobalSDK()
  const platform = usePlatform()

  const [filters, setFiltersStore] = createStore<InvestigationFilters>({
    search: "",
    status: "all",
    sortBy: "date_desc",
  })

  const fetchInvestigations = async (directory: string | undefined): Promise<Investigation[]> => {
    if (!directory) return []

    const client = createOpencodeClient({
      baseUrl: globalSDK.url,
      fetch: platform.fetch,
      directory,
      throwOnError: true,
    })

    try {
      const response = await client.session.list({
        roots: true,
        directory: directory,
      })
      const sessions =
        response.data
          ?.filter((session) => session.directory == directory)
          .filter((session) => !session.parentID && !session.time?.archived) || []

      const parseStatus = (value: unknown): Investigation["status"] | undefined => {
        switch (value) {
          case "in_progress":
          case "ongoing":
            return "in_progress"
          case "concluded":
          case "completed":
          case "resolved":
            return "concluded"
          case "invalidated":
          case "inconclusive":
            return "inconclusive"
          case "cancelled":
          case "canceled":
            return "canceled"
        }
      }

      const parseMetadata = (content: string) => {
        const raw = yaml.load(content) as unknown
        if (!raw || typeof raw !== "object") return
        const record = raw as Record<string, unknown>
        const sessionValue = record.session
        const session = typeof sessionValue === "string" ? sessionValue : undefined
        const statusValue = record.status
        const status = parseStatus(statusValue)
        if (status) return { session, status }

        const incidentValue = record.incident
        if (!incidentValue || typeof incidentValue !== "object") return { session }
        const incidentStatus = (incidentValue as Record<string, unknown>).status
        const incident = parseStatus(incidentStatus)
        if (!incident) return { session }
        return { session, status: incident }
      }

      const entries = await client.file
        .list({ path: "sre-investigations", directory })
        .then((res) => res.data ?? [])
        .catch(() => [])

      const lookups = await Promise.all(
        entries
          .filter((node) => node.type === "directory")
          .map(async (node) => {
            const content = await client.file
              .read({ path: `${node.path}/metadata.yaml`, directory })
              .then((res) => res.data?.content ?? "")
              .catch(() => "")
            if (!content) return
            return parseMetadata(content)
          }),
      )

      const statusBySession = new Map<string, Investigation["status"] | undefined>()
      for (const entry of lookups) {
        const session = entry?.session
        if (!session) continue
        if (statusBySession.has(session)) continue
        statusBySession.set(session, entry?.status)
      }

      return sessions.map((session: any) => ({
        id: session.id,
        sessionId: session.id,
        parentId: session.parentID,
        name: session.title || "Untitled Investigation",
        description: session.title || "No description provided",
        status: statusBySession.get(session.id) ?? "in_progress",
        hasInvestigation: statusBySession.has(session.id),
        startedAt: session.time?.created ? session.time.created : Date.now(),
        updatedAt: session.time?.updated ? session.time.updated : undefined,
        directory,
        currentPhase: "data_collection",
        hypothesesCount: 0,
        observationsCount: 0,
      }))
    } catch (err) {
      console.error("Failed to fetch investigations:", err)
      return []
    }
  }

  const [data, { refetch, mutate }] = createResource(workspace.directory, fetchInvestigations)

  const setFilters = (newFilters: Partial<InvestigationFilters>) => {
    setFiltersStore(newFilters)
  }

  const deleteInvestigation = async (id: string) => {
    const directory = workspace.directory()
    if (!directory) return

    const client = createOpencodeClient({
      baseUrl: globalSDK.url,
      fetch: platform.fetch,
      directory,
      throwOnError: true,
    })

    try {
      await client.session.delete({ sessionID: id })

      const current = data()
      if (current) {
        mutate(current.filter((inv) => inv.id !== id))
      }
    } catch (err) {
      console.error("Failed to delete investigation:", err)
      throw err
    }
  }

  const createInvestigation = async (input: CreateInvestigationInput): Promise<Investigation> => {
    const directory = workspace.directory()
    if (!directory) throw new Error("No workspace selected")

    const client = createOpencodeClient({
      baseUrl: globalSDK.url,
      fetch: platform.fetch,
      directory,
      throwOnError: true,
    })

    const session = await client.session.create({ title: input.description })
    if (!session.data) throw new Error("Failed to create session")

    const newInvestigation: Investigation = {
      id: session.data.id,
      sessionId: session.data.id,
      name: input.description.slice(0, 50) + (input.description.length > 50 ? "..." : ""),
      description: input.description,
      status: "in_progress",
      affectedService: input.affectedService,
      namespace: input.namespace,
      cluster: input.cluster,
      startedAt: session.data.time?.created ? session.data.time.created : Date.now(),
      updatedAt: session.data.time?.updated,
      directory,
      currentPhase: "data_collection",
      hypothesesCount: 0,
      observationsCount: 0,
    }

    const current = data() || []
    mutate([newInvestigation, ...current])

    return newInvestigation
  }

  const getInvestigation = (id: string): Investigation | undefined => {
    const all = data() || []
    return all.find((inv) => inv.id === id)
  }

  const getHypotheses = (id: string): Hypothesis[] => {
    return mockHypotheses[id] || []
  }

  const getObservations = (id: string): Observation[] => {
    return mockObservations[id] || []
  }

  const getReport = (id: string): string | undefined => {
    return mockReports[id]
  }

  const filteredInvestigations = createMemo(() => {
    const raw = data() || []
    let result = raw.filter((inv) => !inv.parentId)

    if (filters.status !== "all") {
      result = result.filter((inv) => inv.status === filters.status)
    }

    if (filters.search) {
      const term = filters.search.toLowerCase()
      result = result.filter(
        (inv) => inv.name.toLowerCase().includes(term) || inv.description.toLowerCase().includes(term),
      )
    }

    const now = Date.now()
    const oneMinuteAgo = now - 60 * 1000

    result.sort((a, b) => {
      if (filters.sortBy === "name_asc") return a.name.localeCompare(b.name)
      if (filters.sortBy === "date_asc") return a.startedAt - b.startedAt

      const aUpdated = a.updatedAt ?? a.startedAt
      const bUpdated = b.updatedAt ?? b.startedAt
      const aRecent = aUpdated > oneMinuteAgo
      const bRecent = bUpdated > oneMinuteAgo
      if (aRecent && bRecent) return a.id.localeCompare(b.id)
      if (aRecent && !bRecent) return -1
      if (!aRecent && bRecent) return 1
      return bUpdated - aUpdated
    })

    return result
  })

  return (
    <InvestigationsContext.Provider
      value={{
        investigations: () => data() || [],
        loading: () => data.loading,
        error: () => data.error,
        filters,
        setFilters,
        filteredInvestigations,
        refresh: refetch,
        deleteInvestigation,
        createInvestigation,
        getInvestigation,
        getHypotheses,
        getObservations,
        getReport,
      }}
    >
      {props.children}
    </InvestigationsContext.Provider>
  )
}

export function useInvestigations() {
  const context = useContext(InvestigationsContext)
  if (!context) {
    throw new Error("useInvestigations must be used within an InvestigationsProvider")
  }
  return context
}
