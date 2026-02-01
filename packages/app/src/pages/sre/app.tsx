import { lazy, Show, Suspense } from "solid-js"
import { Navigate, Route, Router } from "@solidjs/router"
import { ServerProvider, useServer } from "../../context/server"
import { GlobalSDKProvider } from "../../context/global-sdk"
import { GlobalSyncProvider } from "../../context/global-sync"
import { SettingsProvider } from "../../context/settings"
import { PermissionProvider } from "../../context/permission"
import { LayoutProvider } from "../../context/layout"
import { NotificationProvider } from "../../context/notification"
import { ModelsProvider } from "../../context/models"
import { CommandProvider } from "../../context/command"
import { HighlightsProvider } from "../../context/highlights"
import SreLayout from "./layout"

const InvestigationsList = lazy(() => import("./investigations-list"))
const InvestigationDetails = lazy(() => import("./investigation-details"))

const Loading = () => (
  <div class="flex h-full w-full items-center justify-center">
    <div class="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
  </div>
)

const ServerKey = (props: { children: any }) => {
  const ctx = useServer()
  return (
    <Show when={ctx.url} fallback={<Loading />}>
      {props.children}
    </Show>
  )
}

export const SreApp = () => {
  const defaultServerUrl = import.meta.env.VITE_DEFAULT_SERVER_URL || "https://api.opencode.dev"

  return (
    <ServerProvider defaultUrl={defaultServerUrl}>
      <ServerKey>
        <GlobalSDKProvider>
          <GlobalSyncProvider>
            <SettingsProvider>
              <PermissionProvider>
                <LayoutProvider>
                  <NotificationProvider>
                    <ModelsProvider>
                      <CommandProvider>
                        <HighlightsProvider>
                          <Suspense fallback={<Loading />}>
                            <Router root={SreLayout}>
                              <Route path="/" component={() => <Navigate href="/investigations" />} />
                              <Route path="/investigations" component={InvestigationsList} />
                              <Route path="/investigations/:id" component={InvestigationDetails} />
                            </Router>
                          </Suspense>
                        </HighlightsProvider>
                      </CommandProvider>
                    </ModelsProvider>
                  </NotificationProvider>
                </LayoutProvider>
              </PermissionProvider>
            </SettingsProvider>
          </GlobalSyncProvider>
        </GlobalSDKProvider>
      </ServerKey>
    </ServerProvider>
  )
}

export default SreApp
