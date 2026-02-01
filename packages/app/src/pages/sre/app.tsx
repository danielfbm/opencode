import { lazy, Show, Suspense } from "solid-js"
import { Navigate, Route, Router } from "@solidjs/router"
import { normalizeServerUrl, ServerProvider, useServer } from "../../context/server"
import { GlobalSDKProvider } from "../../context/global-sdk"
import { GlobalSyncProvider } from "../../context/global-sync"
import { SettingsProvider } from "../../context/settings"
import { PermissionProvider } from "../../context/permission"
import { LayoutProvider } from "../../context/layout"
import { NotificationProvider } from "../../context/notification"
import { ModelsProvider } from "../../context/models"
import { CommandProvider } from "../../context/command"
import { HighlightsProvider } from "../../context/highlights"
import { InvestigationsProvider } from "../../context/investigations"
import { usePlatform } from "../../context/platform"
import { SreErrorBoundary } from "../../components/sre/error-boundary"
import SreLayout from "./layout"

const InvestigationsList = lazy(() => import("./investigations-list"))
const InvestigationDetails = lazy(() => import("./investigation-details"))
const NotFound = lazy(() => import("./not-found"))

const Loading = () => (
  <div class="flex h-full w-full items-center justify-center text-[rgb(var(--aui-color-n-4))]">
    Loading...
  </div>
)

const ServerKey = (props: { children: any }) => {
  const ctx = useServer()
  return (
    <Show when={ctx.url} keyed>
      {props.children}
    </Show>
  )
}

export const SreApp = (props: { defaultUrl?: string }) => {
  const platform = usePlatform()

  const stored = (() => {
    if (platform.platform !== "web") return
    const result = platform.getDefaultServerUrl?.()
    if (result instanceof Promise) return
    if (!result) return
    return normalizeServerUrl(result)
  })()

  const defaultServerUrl = () => {
    if (props.defaultUrl) return props.defaultUrl
    if (stored) return stored
    if (location.hostname.includes("opencode.ai")) return "http://localhost:4096"
    if (import.meta.env.DEV)
      return `http://${import.meta.env.VITE_OPENCODE_SERVER_HOST ?? "localhost"}:${import.meta.env.VITE_OPENCODE_SERVER_PORT ?? "4096"}`

    return window.location.origin
  }

  return (
    <ServerProvider defaultUrl={defaultServerUrl()}>
      <ServerKey>
        <GlobalSDKProvider>
          <GlobalSyncProvider>
            <Router
              root={(props) => (
                <SettingsProvider>
                  <PermissionProvider>
                    <LayoutProvider>
                      <NotificationProvider>
                        <ModelsProvider>
                          <CommandProvider>
                            <HighlightsProvider>
                              <InvestigationsProvider>
                                <SreErrorBoundary>
                                  <SreLayout>{props.children}</SreLayout>
                                </SreErrorBoundary>
                              </InvestigationsProvider>
                            </HighlightsProvider>
                          </CommandProvider>
                        </ModelsProvider>
                      </NotificationProvider>
                    </LayoutProvider>
                  </PermissionProvider>
                </SettingsProvider>
              )}
            >
              <Route path="/" component={() => <Navigate href="/investigations" />} />
              <Route
                path="/investigations"
                component={() => (
                  <Suspense fallback={<Loading />}>
                    <InvestigationsList />
                  </Suspense>
                )}
              />
              <Route
                path="/investigations/:id"
                component={() => (
                  <Suspense fallback={<Loading />}>
                    <InvestigationDetails />
                  </Suspense>
                )}
              />
              <Route
                path="*"
                component={() => (
                  <Suspense fallback={<Loading />}>
                    <NotFound />
                  </Suspense>
                )}
              />
            </Router>
          </GlobalSyncProvider>
        </GlobalSDKProvider>
      </ServerKey>
    </ServerProvider>
  )
}

export default SreApp
