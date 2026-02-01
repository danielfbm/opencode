/* @refresh reload */
import { render } from "solid-js/web"
import { AppBaseProviders } from "@/app"
import { Platform, PlatformProvider } from "@/context/platform"
import SreApp from "@/pages/sre/app"
import pkg from "../package.json"
import "@/index-sre.css"

const DEFAULT_SERVER_URL_KEY = "opencode.settings.dat:defaultServerUrl"

const root = document.getElementById("root")
if (import.meta.env.DEV && !(root instanceof HTMLElement)) {
  throw new Error(
    "Root element not found. Did you forget to add it to your index.html? Or maybe the id attribute got misspelled?",
  )
}

const platform: Platform = {
  platform: "web",
  version: pkg.version,
  openLink(url: string) {
    window.open(url, "_blank")
  },
  back() {
    window.history.back()
  },
  forward() {
    window.history.forward()
  },
  restart: async () => {
    window.location.reload()
  },
  notify: async (title, description, href) => {
    if (!("Notification" in window)) return

    const permission =
      Notification.permission === "default"
        ? await Notification.requestPermission().catch(() => "denied")
        : Notification.permission

    if (permission !== "granted") return

    const inView = document.visibilityState === "visible" && document.hasFocus()
    if (inView) return

    await Promise.resolve()
      .then(() => {
        const notification = new Notification(title, {
          body: description ?? "",
          icon: "https://opencode.ai/favicon-96x96-v3.png",
        })
        notification.onclick = () => {
          window.focus()
          if (href) {
            window.history.pushState(null, "", href)
            window.dispatchEvent(new PopStateEvent("popstate"))
          }
          notification.close()
        }
      })
      .catch(() => undefined)
  },
  getDefaultServerUrl: () => {
    if (typeof localStorage === "undefined") return null
    try {
      return localStorage.getItem(DEFAULT_SERVER_URL_KEY)
    } catch {
      return null
    }
  },
  setDefaultServerUrl: (url) => {
    if (typeof localStorage === "undefined") return
    try {
      if (url) {
        localStorage.setItem(DEFAULT_SERVER_URL_KEY, url)
        return
      }
      localStorage.removeItem(DEFAULT_SERVER_URL_KEY)
    } catch {
      return
    }
  },
}

render(
  () => (
    <PlatformProvider value={platform}>
      <AppBaseProviders>
        <SreApp />
      </AppBaseProviders>
    </PlatformProvider>
  ),
  root!,
)
