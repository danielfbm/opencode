import { Show } from "solid-js"
import { Portal } from "solid-js/web"

interface Props {
  isOpen: boolean
  investigationName: string
  onClose: () => void
  onConfirm: () => void
}

export function DialogConfirmDelete(props: Props) {
  return (
    <Show when={props.isOpen}>
      <Portal>
        <div class="sre-theme fixed inset-0 z-50 flex items-center justify-center">
          <div
            class="sre-dialog-backdrop absolute inset-0 transition-opacity"
            onClick={props.onClose}
          />
          
          <div class="sre-dialog-panel relative bg-[var(--aui-color-surface)] rounded-lg shadow-xl max-w-md w-full mx-4 overflow-hidden border border-[var(--aui-color-border)] animate-in fade-in zoom-in-95 duration-200">
            <div class="px-6 py-4 border-b border-[var(--aui-color-border)]">
              <h3 class="text-lg font-semibold text-[var(--aui-color-n-1)]">
                Delete Investigation
              </h3>
            </div>
            
            <div class="px-6 py-6">
              <p class="text-[var(--aui-color-n-3)]">
                Are you sure you want to delete <span class="font-medium text-[var(--aui-color-n-1)]">"{props.investigationName}"</span>?
                This action cannot be undone.
              </p>
            </div>
            
            <div class="px-6 py-4 bg-[var(--aui-color-n-9)] flex justify-end gap-3 border-t border-[var(--aui-color-border)]">
              <button
                class="sre-btn sre-btn-secondary"
                onClick={props.onClose}
              >
                Cancel
              </button>
              <button
                class="sre-btn bg-[var(--aui-color-red)] text-white hover:brightness-110 border-transparent"
                onClick={() => {
                  props.onConfirm()
                  props.onClose()
                }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      </Portal>
    </Show>
  )
}
