import { createContext, useContext, createMemo, type JSX } from "solid-js"
import { createStore } from "solid-js/store"
import { Persist, persisted } from "@/utils/persist"

interface SreWorkspaceContextType {
  directory: () => string | undefined
  setDirectory: (directory: string | undefined) => void
  ready: () => boolean
}

const SreWorkspaceContext = createContext<SreWorkspaceContextType>()

export function SreWorkspaceProvider(props: { children: JSX.Element }) {
  const [store, setStore, , ready] = persisted(
    Persist.global("sre.workspace", ["sre.workspace.v1"]),
    createStore({
      directory: undefined as string | undefined,
    }),
  )

  const directory = createMemo(() => store.directory)

  const setDirectory = (directory: string | undefined) => {
    setStore("directory", directory)
  }

  return (
    <SreWorkspaceContext.Provider
      value={{
        directory,
        setDirectory,
        ready: () => ready(),
      }}
    >
      {props.children}
    </SreWorkspaceContext.Provider>
  )
}

export function useSreWorkspace() {
  const context = useContext(SreWorkspaceContext)
  if (!context) {
    throw new Error("useSreWorkspace must be used within a SreWorkspaceProvider")
  }
  return context
}
