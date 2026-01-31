import { createEffect, createMemo, Show, untrack, createSignal } from "solid-js"
import { createStore } from "solid-js/store"
import { useLocation, useNavigate } from "@solidjs/router"
import { IconButton } from "@opencode-ai/ui/icon-button"
import { Icon } from "@opencode-ai/ui/icon"
import { Button } from "@opencode-ai/ui/button"
import { Tooltip, TooltipKeybind } from "@opencode-ai/ui/tooltip"
import { useTheme } from "@opencode-ai/ui/theme"
import { DropdownMenu } from "@opencode-ai/ui/dropdown-menu"
import { Avatar, getAvatarColors } from "@opencode-ai/ui/avatar"

import { useLayout } from "@/context/layout"
import { usePlatform } from "@/context/platform"
import { useCommand } from "@/context/command"
import { useLanguage } from "@/context/language"

const AlaudaLogo = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">
    <title>alauda_Blue</title>
    <g id="de0a135b-885c-4036-939d-50f62fab32b6" data-name="Brand Logo">
      <path
        d="M31,16V31H24.41V15.93A8.34,8.34,0,0,0,8.13,13.34L5.65,14.56l2.08,1.73C8,20.39,9.41,27.26,21.44,31H15.92A15,15,0,1,1,31,16Z"
        fill="#3baee4"
      />
      <path d="M14.23,16.63a1.74,1.74,0,1,1-1.73-1.74A1.72,1.72,0,0,1,14.23,16.63Z" fill="#3baee4" />
    </g>
  </svg>
  // <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" class="text-[#3baee4]">
  //   <path
  //     d="M19.3333 13.3333C19.3333 16.647 16.647 19.3333 13.3333 19.3333H7.33333C4.38781 19.3333 2 16.9455 2 14C2 11.0545 4.38781 8.66667 7.33333 8.66667C7.36294 8.66667 7.39239 8.66708 7.42168 8.66788C7.94273 4.90802 11.1648 2 15 2C19.4183 2 23 5.58172 23 10C23 10.4552 22.9619 10.9002 22.8887 11.3347C22.9599 11.3338 23.0314 11.3333 23.1032 11.3333C24.1509 11.3333 25 12.1824 25 13.2302C25 14.2779 24.1509 15.127 23.1032 15.127H19.3333V13.3333Z"
  //     fill="currentColor"
  //   />
  // </svg>
)

export function Titlebar() {
  const layout = useLayout()
  const platform = usePlatform()
  const command = useCommand()
  const language = useLanguage()
  const theme = useTheme()
  const navigate = useNavigate()
  const location = useLocation()

  const [appTitle] = createSignal("Alauda")

  const mac = createMemo(() => platform.platform === "desktop" && platform.os === "macos")
  const windows = createMemo(() => platform.platform === "desktop" && platform.os === "windows")
  const web = createMemo(() => platform.platform === "web")

  const [history, setHistory] = createStore({
    stack: [] as string[],
    index: 0,
    action: undefined as "back" | "forward" | undefined,
  })

  const path = () => `${location.pathname}${location.search}${location.hash}`

  createEffect(() => {
    const current = path()

    untrack(() => {
      if (!history.stack.length) {
        const stack = current === "/" ? ["/"] : ["/", current]
        setHistory({ stack, index: stack.length - 1 })
        return
      }

      const active = history.stack[history.index]
      if (current === active) {
        if (history.action) setHistory("action", undefined)
        return
      }

      if (history.action) {
        setHistory("action", undefined)
        return
      }

      const next = history.stack.slice(0, history.index + 1).concat(current)
      setHistory({ stack: next, index: next.length - 1 })
    })
  })

  const canBack = createMemo(() => history.index > 0)
  const canForward = createMemo(() => history.index < history.stack.length - 1)

  const back = () => {
    if (!canBack()) return
    const index = history.index - 1
    const to = history.stack[index]
    if (!to) return
    setHistory({ index, action: "back" })
    navigate(to)
  }

  const forward = () => {
    if (!canForward()) return
    const index = history.index + 1
    const to = history.stack[index]
    if (!to) return
    setHistory({ index, action: "forward" })
    navigate(to)
  }

  const getWin = () => {
    if (platform.platform !== "desktop") return

    const tauri = (
      window as unknown as {
        __TAURI__?: { window?: { getCurrentWindow?: () => { startDragging?: () => Promise<void> } } }
      }
    ).__TAURI__
    if (!tauri?.window?.getCurrentWindow) return

    return tauri.window.getCurrentWindow()
  }

  createEffect(() => {
    if (platform.platform !== "desktop") return

    const scheme = theme.colorScheme()
    const value = scheme === "system" ? null : scheme

    const tauri = (window as unknown as { __TAURI__?: { webviewWindow?: { getCurrentWebviewWindow?: () => unknown } } })
      .__TAURI__
    const get = tauri?.webviewWindow?.getCurrentWebviewWindow
    if (!get) return

    const win = get() as { setTheme?: (theme?: "light" | "dark" | null) => Promise<void> }
    if (!win.setTheme) return

    void win.setTheme(value).catch(() => undefined)
  })

  const interactive = (target: EventTarget | null) => {
    if (!(target instanceof Element)) return false

    const selector =
      "button, a, input, textarea, select, option, [role='button'], [role='menuitem'], [contenteditable='true'], [contenteditable='']"

    return !!target.closest(selector)
  }

  const drag = (e: MouseEvent) => {
    if (platform.platform !== "desktop") return
    if (e.buttons !== 1) return
    if (interactive(e.target)) return

    const win = getWin()
    if (!win?.startDragging) return

    e.preventDefault()
    void win.startDragging().catch(() => undefined)
  }

  return (
    <header
      class="h-14 shrink-0 bg-background-strong border-b border-border-base relative grid grid-cols-[auto_minmax(0,1fr)_auto] items-center"
      data-tauri-drag-region
    >
      <div
        classList={{
          "flex items-center min-w-0 h-full": true,
          "pl-2": !mac(),
        }}
        onMouseDown={drag}
        data-tauri-drag-region
      >
        <div id="opencode-titlebar-left" class="flex items-center gap-4 min-w-0 px-2 h-full" data-tauri-drag-region>
          <div class="flex items-center gap-3" data-tauri-drag-region>
            <AlaudaLogo />
            <span class="font-extrabold text-text-strong text-xl select-none tracking-tight">
              Alauda Container Platform
            </span>
          </div>
          <div class="hidden xl:flex items-center gap-3 ml-4 border-l border-border-base pl-4 h-6">
            {/*<div class="flex items-center gap-2 text-13-medium text-text-strong cursor-pointer hover:text-text-interactive-base transition-colors">
              <Icon name="layout-grid" size="small" class="text-icon-weak" />
            </div>*/}
            {/*<div class="flex items-center gap-2 text-13-medium text-text-strong cursor-pointer hover:text-text-interactive-base transition-colors">
              <Icon name="box" size="small" class="text-text-interactive-base" />
              <span>Project: devops</span>
            </div>
            <div class="flex items-center gap-2 text-13-medium text-text-strong cursor-pointer hover:text-text-interactive-base transition-colors">
              <span class="text-text-weak">Namespace:</span>
              <span>devops (Cluster: business-...)</span>
            </div>*/}
          </div>
        </div>
        <Show when={mac()}>
          <div class="w-[72px] h-full shrink-0" data-tauri-drag-region />
          <div class="xl:hidden w-10 shrink-0 flex items-center justify-center">
            <IconButton
              icon="menu"
              variant="ghost"
              class="size-8 rounded-md"
              onClick={layout.mobileSidebar.toggle}
              aria-label={language.t("sidebar.menu.toggle")}
            />
          </div>
        </Show>
        <Show when={!mac()}>
          <div class="xl:hidden w-[48px] shrink-0 flex items-center justify-center">
            <IconButton
              icon="menu"
              variant="ghost"
              class="size-8 rounded-md"
              onClick={layout.mobileSidebar.toggle}
              aria-label={language.t("sidebar.menu.toggle")}
            />
          </div>
        </Show>
        <div class="flex items-center gap-4 shrink-0">
          <TooltipKeybind
            class={web() ? "hidden xl:flex shrink-0 ml-4" : "hidden xl:flex shrink-0 ml-2"}
            placement="bottom"
            title={language.t("command.sidebar.toggle")}
            keybind={command.keybind("sidebar.toggle")}
          >
            <Button
              variant="ghost"
              class="group/sidebar-toggle group-hover:to-icon-active size-6 p-0"
              onClick={layout.sidebar.toggle}
              aria-label={language.t("command.sidebar.toggle")}
              aria-expanded={layout.sidebar.opened()}
            >
              <div class="relative flex items-center justify-center size-4 [&>*]:absolute [&>*]:inset-0">
                <Icon
                  size="small"
                  name={layout.sidebar.opened() ? "layout-left-full" : "layout-left"}
                  class="group-hover/sidebar-toggle:hidden"
                />
                <Icon size="small" name="layout-left-partial" class="hidden group-hover/sidebar-toggle:inline-block" />
                <Icon
                  size="small"
                  name={layout.sidebar.opened() ? "layout-left" : "layout-left-full"}
                  class="hidden group-active/sidebar-toggle:inline-block"
                />
              </div>
            </Button>
          </TooltipKeybind>
          <div class="hidden xl:flex items-center gap-1 shrink-0">
            <Tooltip placement="bottom" value={language.t("common.goBack")} openDelay={2000}>
              <Button
                variant="ghost"
                icon="arrow-left"
                class="size-6 p-0"
                disabled={!canBack()}
                onClick={back}
                aria-label={language.t("common.goBack")}
              />
            </Tooltip>
            <Tooltip placement="bottom" value={language.t("common.goForward")} openDelay={2000}>
              <Button
                variant="ghost"
                icon="arrow-right"
                class="size-6 p-0"
                disabled={!canForward()}
                onClick={forward}
                aria-label={language.t("common.goForward")}
              />
            </Tooltip>
          </div>
        </div>
      </div>

      <div
        class="min-w-0 flex items-center justify-center pointer-events-none lg:absolute lg:inset-0 lg:flex lg:items-center lg:justify-center"
        data-tauri-drag-region
      >
        <div id="opencode-titlebar-center" class="pointer-events-auto w-full min-w-0 flex justify-center lg:w-fit" />
      </div>

      <div
        classList={{
          "flex items-center min-w-0 justify-end": true,
          "pr-6": !windows(),
        }}
        onMouseDown={drag}
        data-tauri-drag-region
      >
        <div
          id="opencode-titlebar-right"
          class="flex items-center gap-4 shrink-0 justify-end h-full pr-4"
          data-tauri-drag-region
        >
          {/*<div class="hidden md:flex items-center gap-2 bg-surface-critical-weak px-3 py-1 rounded-full border border-border-critical-base">
             <Icon name="alert-triangle" size="small" class="text-icon-critical-base" />
             <span class="text-12-medium text-text-critical-strong">Out of Service</span>
          </div>*/}
          {/*<IconButton
            icon="help-circle"
            variant="ghost"
            class="text-icon-weak hover:text-text-interactive-base"
            aria-label="Help"
          />*/}
          <div class="h-6 w-px bg-border-base mx-1" />
          <DropdownMenu>
            <DropdownMenu.Trigger class="flex items-center gap-2 hover:opacity-80 transition-opacity outline-none group">
              {/*<Avatar
                fallback="AU"
                colors={getAvatarColors("Admin User")}
                class="size-8 text-xs font-medium ring-2 ring-white"
              />*/}
              <span class="text-13-medium text-text-strong group-hover:text-text-interactive-base hidden lg:block">
                daniel@alauda.io
              </span>
              <Icon
                name="chevron-down"
                size="small"
                class="text-icon-weak group-hover:text-text-interactive-base hidden lg:block"
              />
            </DropdownMenu.Trigger>
            <DropdownMenu.Portal>
              <DropdownMenu.Content class="min-w-[180px]">
                <DropdownMenu.Item onSelect={() => console.log("Profile")}>
                  <Icon name="user" class="mr-2 size-4" />
                  <span>Profile</span>
                </DropdownMenu.Item>
                <DropdownMenu.Item onSelect={() => console.log("Settings")}>
                  <Icon name="settings" class="mr-2 size-4" />
                  <span>Settings</span>
                </DropdownMenu.Item>
                <DropdownMenu.Separator />
                <DropdownMenu.Item onSelect={() => console.log("Logout")} class="text-error">
                  <Icon name="log-out" class="mr-2 size-4" />
                  <span>Logout</span>
                </DropdownMenu.Item>
              </DropdownMenu.Content>
            </DropdownMenu.Portal>
          </DropdownMenu>
        </div>
        <Show when={windows()}>
          <div class="w-6 shrink-0" />
          <div data-tauri-decorum-tb class="flex flex-row" />
        </Show>
      </div>
    </header>
  )
}
