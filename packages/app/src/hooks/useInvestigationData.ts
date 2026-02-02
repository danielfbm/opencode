import { createSignal, createEffect, onCleanup, on, type Accessor } from 'solid-js'
import { useSDK } from '@/context/sdk'
import yaml from 'js-yaml'
import type { InvestigationDetail } from '@/types/investigation'

export type { InvestigationDetail as InvestigationMetadata }

interface UseInvestigationDataOptions {
  directory: Accessor<string | undefined>
  workspaceDirectory?: Accessor<string | undefined>
  pollInterval?: number
}

export function useInvestigationData(options: UseInvestigationDataOptions) {
  const sdk = useSDK()
  const [data, setData] = createSignal<InvestigationDetail | null>(null)
  const [loading, setLoading] = createSignal(true)
  const [error, setError] = createSignal<Error | null>(null)

  const read = async (path: string, directory?: string) => {
    const params = directory ? { path, directory } : { path }
    return sdk.client.file.read(params).then((res) => res.data?.content).catch(() => undefined)
  }

  const refresh = async () => {
    const dir = options.directory()
    if (!dir) {
      setData(null)
      setError(null)
      setLoading(false)
      return
    }

    const current = data()

    if (!current) {
      setLoading(true)
    }

    try {
      const workspace = options.workspaceDirectory?.()
      const meta = `${dir}/metadata.yaml`
      const content = await read(meta, workspace)
      if (!content) {
        throw new Error('No data received')
      }
      const metadata = yaml.load(content) as InvestigationDetail
      const state = metadata.phases?.reporting?.status
      const file = (() => {
        const record = metadata as unknown as Record<string, unknown>
        const value = record.report
        if (typeof value === "string" && value.trim()) return value.trim()
        return "report.md"
      })()
      const report = state === "completed" ? await read(`${dir}/${file}`, workspace) : undefined
      const next = state === "completed"
        ? report ?? current?.reportContent
        : undefined
      setData({ ...metadata, reportContent: next })
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)))
      if (!current) {
        setData(null)
      }
    } finally {
      setLoading(false)
    }
  }

  createEffect(
    on(
      () => [options.directory(), options.workspaceDirectory?.()] as const,
      ([dir]) => {
        if (!dir) {
          setData(null)
          setError(null)
          setLoading(false)
          return
        }

        refresh()

        const interval = setInterval(refresh, options.pollInterval ?? 3000)
        onCleanup(() => clearInterval(interval))
      },
    ),
  )

  return {
    data,
    loading,
    error,
    refresh,
  }
}
