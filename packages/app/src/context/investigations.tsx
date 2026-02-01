import {
  createContext,
  useContext,
  createResource,
  createMemo,
  type JSX,
} from "solid-js"
import { createStore } from "solid-js/store"
import type { Investigation, InvestigationFilters, Hypothesis, Observation } from "../pages/sre/types"
import { mockInvestigations, mockHypotheses, mockObservations, mockReports } from "../pages/sre/mock-data"

interface CreateInvestigationInput {
  description: string
  affectedService?: string
  namespace?: string
  cluster?: string
  severity?: "P1" | "P2" | "P3" | "P4"
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
  const [filters, setFiltersStore] = createStore<InvestigationFilters>({
    search: "",
    status: "all",
    sortBy: "date_desc",
  })

  const fetchInvestigations = async (): Promise<Investigation[]> => {
    await new Promise((resolve) => setTimeout(resolve, 600))
    return [...mockInvestigations]
  }

  const [data, { refetch, mutate }] = createResource(fetchInvestigations)

  const setFilters = (newFilters: Partial<InvestigationFilters>) => {
    setFiltersStore(newFilters)
  }

  const deleteInvestigation = async (id: string) => {
    const current = data()
    if (current) {
      mutate(current.filter((inv) => inv.id !== id))
    }
  }

  const createInvestigation = async (input: CreateInvestigationInput): Promise<Investigation> => {
    await new Promise((resolve) => setTimeout(resolve, 800))
    
    const id = `inv-${Date.now()}`
    const newInvestigation: Investigation = {
      id,
      name: input.description.slice(0, 50) + (input.description.length > 50 ? "..." : ""),
      description: input.description,
      status: "in_progress",
      severity: input.severity,
      affectedService: input.affectedService,
      namespace: input.namespace,
      cluster: input.cluster,
      startedAt: Date.now(),
      directory: `/sre-investigations/${id}`,
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
    let result = [...raw]

    if (filters.status !== "all") {
      result = result.filter((inv) => inv.status === filters.status)
    }

    if (filters.search) {
      const term = filters.search.toLowerCase()
      result = result.filter(
        (inv) =>
          inv.name.toLowerCase().includes(term) ||
          inv.description.toLowerCase().includes(term)
      )
    }

    result.sort((a, b) => {
      switch (filters.sortBy) {
        case "date_asc":
          return a.startedAt - b.startedAt
        case "name_asc":
          return a.name.localeCompare(b.name)
        case "date_desc":
        default:
          return b.startedAt - a.startedAt
      }
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
    throw new Error(
      "useInvestigations must be used within an InvestigationsProvider"
    )
  }
  return context
}
