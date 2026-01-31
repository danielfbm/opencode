import { Button } from "@opencode-ai/ui/button"
import { useDialog } from "@opencode-ai/ui/context/dialog"
import { Dialog } from "@opencode-ai/ui/dialog"
import { TextField } from "@opencode-ai/ui/text-field"
import { createStore } from "solid-js/store"
import { useGlobalSDK } from "@/context/global-sdk"
import { useLanguage } from "@/context/language"
import { useNavigate, useParams } from "@solidjs/router"
import { base64Encode } from "@opencode-ai/util/encode"
import { decode64 } from "@/utils/base64"
import { showToast } from "@opencode-ai/ui/toast"

export function DialogNewInvestigation() {
  const dialog = useDialog()
  const globalSDK = useGlobalSDK()
  const language = useLanguage()
  const navigate = useNavigate()
  const params = useParams()

  const [store, setStore] = createStore({
    incidentDetails: "",
    application: "",
    cluster: "",
    namespace: "",
    isSubmitting: false,
  })

  async function handleSubmit(e: SubmitEvent) {
    e.preventDefault()
    setStore("isSubmitting", true)

    try {
      const directory = params.dir ? decode64(params.dir) : undefined
      if (!directory) {
        showToast({ title: "Error", description: "No workspace selected" })
        setStore("isSubmitting", false)
        return
      }

      // 1. Create Session
      const sessionResponse = await globalSDK.client.session.create({ directory })
      const session = sessionResponse.data

      if (!session) {
        throw new Error("Failed to create session")
      }

      // 2. Navigate to the new session
      navigate(`/${base64Encode(directory)}/session/${session.id}`)
      dialog.close()

      // 3. Send the /sre-investigate command
      const agent = "default"
      const model = undefined

      const args = JSON.stringify({
        incidentDetails: store.incidentDetails,
        application: store.application,
        cluster: store.cluster,
        namespace: store.namespace,
      })

      // We send the command after navigation, optimistically assuming the session is ready or will be.
      // In a real app we might want to wait for the session to be fully ready in the UI,
      // but sending it to the backend should be fine.
      await globalSDK.client.session.command({
        sessionID: session.id,
        command: "sre-investigate",
        arguments: args,
        agent,
        model,
      })

    } catch (err) {
      console.error(err)
      showToast({
        title: "Failed to start investigation",
        description: err instanceof Error ? err.message : "Unknown error",
      })
    } finally {
      setStore("isSubmitting", false)
    }
  }

  return (
    <Dialog title="New Investigation" class="w-full max-w-[480px] mx-auto">
      <form onSubmit={handleSubmit} class="flex flex-col gap-6 p-6 pt-0">
        <div class="flex flex-col gap-4">
          <TextField
            autofocus
            multiline
            label="Incident Details"
            placeholder="Describe the incident..."
            value={store.incidentDetails}
            onChange={(v) => setStore("incidentDetails", v)}
            class="min-h-[100px]"
          />
          <TextField
            type="text"
            label="Application"
            placeholder="e.g. payment-service"
            value={store.application}
            onChange={(v) => setStore("application", v)}
          />
          <TextField
            type="text"
            label="Cluster"
            placeholder="e.g. prod-us-east-1"
            value={store.cluster}
            onChange={(v) => setStore("cluster", v)}
          />
          <TextField
            type="text"
            label="Namespace"
            placeholder="e.g. payments"
            value={store.namespace}
            onChange={(v) => setStore("namespace", v)}
          />
        </div>

        <div class="flex justify-end gap-2">
          <Button type="button" variant="ghost" size="large" onClick={() => dialog.close()}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" size="large" disabled={store.isSubmitting}>
            {store.isSubmitting ? "Starting..." : "Start Investigation"}
          </Button>
        </div>
      </form>
    </Dialog>
  )
}
