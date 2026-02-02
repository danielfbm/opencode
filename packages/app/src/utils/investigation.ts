import type { Message, Part, FileNode } from "@opencode-ai/sdk/v2/client"

type FileClient = {
  list: (input: { path: string; directory?: string }) => Promise<{ data?: FileNode[] }>
  read: (input: { path: string; directory?: string }) => Promise<{ data?: { content?: string } }>
}

type SessionClient = {
  messages: (input: { sessionID: string; limit?: number; directory?: string }) => Promise<{
    data?: Array<{ info: Message; parts: Part[] }>
  }>
}

type Client = {
  file: FileClient
  session: SessionClient
}

type Entry = {
  directory: string
  content: string
  session?: string
  incidentId?: string
  time?: number
}

export type InvestigationLookup = {
  available: boolean
  directory?: string
  content?: string
  incidentId?: string
}

const parseSession = (content: string) => {
  const match = content.match(/^\s*session:\s*"?([^"\n]+)"?/m)
  if (!match) return
  return match[1]
}

const parseIncidentId = (content: string) => {
  const direct = content.match(/INC-\d{8}-\d{6}/)
  if (direct) return direct[0]
  const fallback = content.match(/INC-[A-Z0-9-]+/)
  if (!fallback) return
  return fallback[0]
}

const parseIncidentTime = (incidentId: string | undefined, content: string) => {
  if (incidentId) {
    const match = incidentId.match(/INC-(\d{8})-(\d{6})/)
    if (match) {
      const date = match[1]
      const time = match[2]
      const year = Number(date.slice(0, 4))
      const month = Number(date.slice(4, 6)) - 1
      const day = Number(date.slice(6, 8))
      const hour = Number(time.slice(0, 2))
      const minute = Number(time.slice(2, 4))
      const second = Number(time.slice(4, 6))
      const stamp = Date.UTC(year, month, day, hour, minute, second)
      if (!Number.isNaN(stamp)) return stamp
    }
  }

  const started = content.match(/started_at:\s*"?([^"\n]+)"?/)
  if (!started) return
  const stamp = Date.parse(started[1])
  if (Number.isNaN(stamp)) return
  return stamp
}

const listInvestigations = async (client: Client, directory?: string) => {
  const params = directory ? { path: "sre-investigations", directory } : { path: "sre-investigations" }
  const result = await client.file
    .list(params)
    .then((res) => ({ ok: true, data: res.data ?? [] }))
    .catch(() => ({ ok: false, data: [] as FileNode[] }))
  const dirs = result.data.filter((node) => node.type === "directory")
  return { ok: result.ok, dirs }
}

const readMetadata = async (client: Client, path: string, directory?: string) => {
  const params = directory ? { path, directory } : { path }
  const result = await client.file
    .read(params)
    .then((res) => res.data?.content ?? "")
    .catch(() => "")
  return result.trim()
}

const parseEntry = (directory: string, content: string): Entry => {
  const session = parseSession(content)
  const incidentId = parseIncidentId(content)
  const time = parseIncidentTime(incidentId, content)
  return { directory, content, session, incidentId, time }
}

const pickLatest = (items: Entry[]) => {
  if (items.length === 0) return
  const sorted = [...items].sort((a, b) => (b.time ?? 0) - (a.time ?? 0))
  return sorted[0]
}

const toolText = (part: Part) => {
  if (part.type !== "tool") return ""
  const input = JSON.stringify(part.state.input ?? {})
  if (part.state.status === "completed") return `${input}\n${part.state.output}`
  if (part.state.status === "error") return `${input}\n${part.state.error}`
  if (part.state.status === "pending") return `${input}\n${part.state.raw}`
  return input
}

const findIncidentIdFromMessages = (messages: Message[], parts: Record<string, Part[]>) => {
  const reversed = [...messages].reverse()
  for (const message of reversed) {
    const list = parts[message.id] ?? []
    for (const part of list) {
      const text = toolText(part)
      if (!text.includes("init_investigation.py")) continue
      const match = text.match(/INCIDENT_ID=([A-Z0-9-]+)/)
      if (!match) continue
      return match[1]
    }
  }
}

const loadMessages = async (client: Client, sessionId: string, directory?: string, limit?: number) => {
  const params = directory
    ? { sessionID: sessionId, limit, directory }
    : { sessionID: sessionId, limit }
  const items = await client.session
    .messages(params)
    .then((res) => res.data ?? [])
    .catch(() => [])
  const messages = items.map((item) => item.info)
  const parts = Object.fromEntries(items.map((item) => [item.info.id, item.parts]))
  return { messages, parts }
}

const findIncidentId = async (options: {
  client: Client
  sessionId: string
  directory?: string
  messages?: Message[]
  parts?: Record<string, Part[]>
  fetchMessages?: boolean
}) => {
  const messages = options.messages ?? []
  const parts = options.parts ?? {}
  const existing = findIncidentIdFromMessages(messages, parts)
  if (existing) return existing
  if (!options.fetchMessages) return
  const loaded = await loadMessages(options.client, options.sessionId, options.directory, 200)
  return findIncidentIdFromMessages(loaded.messages, loaded.parts)
}

export const resolveInvestigationForSession = async (options: {
  client: Client
  sessionId: string
  directory?: string
  messages?: Message[]
  parts?: Record<string, Part[]>
  fetchMessages?: boolean
}): Promise<InvestigationLookup> => {
  const list = await listInvestigations(options.client, options.directory)
  if (!list.ok) return { available: false }

  const entries = await Promise.all(
    list.dirs.map(async (node) => {
      const content = await readMetadata(options.client, `${node.path}/metadata.yaml`, options.directory)
      if (!content) return
      return parseEntry(node.path, content)
    }),
  )
  const available = true
  const records = entries.filter(Boolean) as Entry[]
  const sessionMatches = records.filter((entry) => entry.session === options.sessionId)
  const latestSession = pickLatest(sessionMatches)
  if (latestSession) {
    return {
      available,
      directory: latestSession.directory,
      content: latestSession.content,
      incidentId: latestSession.incidentId,
    }
  }

  const incidentId = await findIncidentId(options)
  if (!incidentId) return { available }

  const incidentMatches = records.filter((entry) => entry.incidentId === incidentId)
  const latestIncident = pickLatest(incidentMatches)
  if (latestIncident) {
    return {
      available,
      directory: latestIncident.directory,
      content: latestIncident.content,
      incidentId: latestIncident.incidentId,
    }
  }

  const direct = await readMetadata(
    options.client,
    `sre-investigations/${incidentId}/metadata.yaml`,
    options.directory,
  )
  if (!direct) return { available }
  return {
    available,
    directory: `sre-investigations/${incidentId}`,
    content: direct,
    incidentId,
  }
}
