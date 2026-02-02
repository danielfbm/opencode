import { createSignal, createMemo, Show, For } from "solid-js"
import { Portal } from "solid-js/web"
import { createStore } from "solid-js/store"

interface FormData {
  description: string
  affectedService: string
  namespace: string
  cluster: string
}

interface FormErrors {
  description?: string
}

interface Props {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: FormData) => Promise<void>
}

const CLUSTERS = [
  { value: "", label: "Select cluster..." },
  { value: "prod-us-east", label: "prod-us-east" },
  { value: "prod-us-west", label: "prod-us-west" },
  { value: "prod-eu", label: "prod-eu" },
  { value: "staging", label: "staging" },
  { value: "dev", label: "dev" },
]

export function DialogStartInvestigation(props: Props) {
  const [form, setForm] = createStore<FormData>({
    description: "",
    affectedService: "",
    namespace: "",
    cluster: "",
  })

  const [errors, setErrors] = createStore<FormErrors>({})
  const [submitting, setSubmitting] = createSignal(false)
  const [submitError, setSubmitError] = createSignal<string | null>(null)

  const validate = (): boolean => {
    const newErrors: FormErrors = {}

    if (!form.description.trim()) {
      newErrors.description = "Incident description is required"
    } else if (form.description.trim().length < 10) {
      newErrors.description = "Description must be at least 10 characters"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const isValid = createMemo(() => form.description.trim().length >= 10)

  const handleSubmit = async (e: Event) => {
    e.preventDefault()
    setSubmitError(null)

    if (!validate()) return

    setSubmitting(true)
    try {
      await props.onSubmit(form)
      resetForm()
      props.onClose()
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Failed to start investigation")
    } finally {
      setSubmitting(false)
    }
  }

  const resetForm = () => {
    setForm({
      description: "",
      affectedService: "",
      namespace: "",
      cluster: "",
    })
    setErrors({})
    setSubmitError(null)
  }

  const handleClose = () => {
    if (!submitting()) {
      resetForm()
      props.onClose()
    }
  }

  return (
    <Show when={props.isOpen}>
      <Portal>
        <div class="sre-theme fixed inset-0 z-50 flex items-center justify-center">
          <div
            class="sre-dialog-backdrop absolute inset-0 transition-opacity"
            onClick={handleClose}
          />

          <div class="sre-dialog-panel relative bg-[var(--aui-color-surface)] rounded-lg shadow-xl max-w-lg w-full mx-4 overflow-hidden border border-[var(--aui-color-border)] animate-in fade-in zoom-in-95 duration-200">
            <div class="px-6 py-4 border-b border-[var(--aui-color-border)] flex items-center justify-between">
              <h3 class="text-lg font-semibold text-[var(--aui-color-n-1)]">
                Start Investigation
              </h3>
              <button
                type="button"
                onClick={handleClose}
                disabled={submitting()}
                class="p-1 rounded hover:bg-[var(--aui-color-n-8)] transition-colors text-[var(--aui-color-n-4)] hover:text-[var(--aui-color-n-1)] disabled:opacity-50"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div class="px-6 py-5 space-y-4 max-h-[60vh] overflow-y-auto">
                <Show when={submitError()}>
                  <div class="p-3 rounded bg-[var(--aui-color-red)]/10 border border-[var(--aui-color-red)]/20 text-[var(--aui-color-red)] text-sm">
                    {submitError()}
                  </div>
                </Show>

                <div>
                  <label class="block text-sm font-medium text-[var(--aui-color-n-2)] mb-1.5">
                    Incident Description <span class="text-[var(--aui-color-red)]">*</span>
                  </label>
                  <textarea
                    value={form.description}
                    onInput={(e) => {
                      setForm("description", e.currentTarget.value)
                      if (errors.description) setErrors("description", undefined)
                    }}
                    placeholder="Describe the incident or alert you want to investigate..."
                    rows={4}
                    disabled={submitting()}
                    class={`w-full px-3 py-2 rounded border bg-[var(--aui-color-surface)] text-[var(--aui-color-n-1)] text-sm placeholder:text-[var(--aui-color-n-5)] resize-none transition-colors focus:outline-none focus:border-[var(--aui-color-primary)] disabled:opacity-50 disabled:cursor-not-allowed ${
                      errors.description
                        ? "border-[var(--aui-color-red)]"
                        : "border-[var(--aui-color-border)]"
                    }`}
                  />
                  <Show when={errors.description}>
                    <p class="mt-1 text-xs text-[var(--aui-color-red)]">
                      {errors.description}
                    </p>
                  </Show>
                </div>

                <div>
                  <label class="block text-sm font-medium text-[var(--aui-color-n-2)] mb-1.5">
                    Affected Service
                  </label>
                  <input
                    type="text"
                    value={form.affectedService}
                    onInput={(e) => setForm("affectedService", e.currentTarget.value)}
                    placeholder="e.g., payment-service, api-gateway"
                    disabled={submitting()}
                    class="w-full px-3 py-2 h-9 rounded border border-[var(--aui-color-border)] bg-[var(--aui-color-surface)] text-[var(--aui-color-n-1)] text-sm placeholder:text-[var(--aui-color-n-5)] transition-colors focus:outline-none focus:border-[var(--aui-color-primary)] disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                </div>

                <div>
                  <label class="block text-sm font-medium text-[var(--aui-color-n-2)] mb-1.5">
                    Namespace
                  </label>
                  <input
                    type="text"
                    value={form.namespace}
                    onInput={(e) => setForm("namespace", e.currentTarget.value)}
                    placeholder="e.g., production, staging"
                    disabled={submitting()}
                    class="w-full px-3 py-2 h-9 rounded border border-[var(--aui-color-border)] bg-[var(--aui-color-surface)] text-[var(--aui-color-n-1)] text-sm placeholder:text-[var(--aui-color-n-5)] transition-colors focus:outline-none focus:border-[var(--aui-color-primary)] disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                </div>

                <div>
                  <label class="block text-sm font-medium text-[var(--aui-color-n-2)] mb-1.5">
                    Cluster
                  </label>
                  <div class="relative">
                    <select
                      value={form.cluster}
                      onChange={(e) => setForm("cluster", e.currentTarget.value)}
                      disabled={submitting()}
                      class="w-full px-3 py-2 h-9 rounded border border-[var(--aui-color-border)] bg-[var(--aui-color-surface)] text-[var(--aui-color-n-1)] text-sm appearance-none cursor-pointer transition-colors focus:outline-none focus:border-[var(--aui-color-primary)] disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <For each={CLUSTERS}>
                        {(option) => (
                          <option value={option.value}>{option.label}</option>
                        )}
                      </For>
                    </select>
                    <div class="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-[var(--aui-color-n-4)]">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="6 9 12 15 18 9" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>

              <div class="px-6 py-4 bg-[var(--aui-color-n-9)] flex justify-end gap-3 border-t border-[var(--aui-color-border)]">
                <button
                  type="button"
                  onClick={handleClose}
                  disabled={submitting()}
                  class="sre-btn sre-btn-secondary disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting() || !isValid()}
                  class="sre-btn sre-btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  <Show when={submitting()}>
                    <svg class="animate-spin h-4 w-4" viewBox="0 0 24 24">
                      <circle 
                        class="opacity-25" 
                        cx="12" 
                        cy="12" 
                        r="10" 
                        stroke="currentColor" 
                        stroke-width="4"
                        fill="none"
                      />
                      <path 
                        class="opacity-75" 
                        fill="currentColor" 
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                  </Show>
                  <Show when={submitting()} fallback="Start Investigation">
                    Starting...
                  </Show>
                </button>
              </div>
            </form>
          </div>
        </div>
      </Portal>
    </Show>
  )
}
