import { type ComponentProps, splitProps, Show } from "solid-js"

export interface AvatarProps extends ComponentProps<"div"> {
  fallback: string
  src?: string
  background?: string
  foreground?: string
  size?: "small" | "normal" | "large"
  colors?: { background: string; foreground: string }
}

const COLORS = [
  { background: "var(--avatar-background-pink)", foreground: "var(--avatar-text-pink)" },
  { background: "var(--avatar-background-mint)", foreground: "var(--avatar-text-mint)" },
  { background: "var(--avatar-background-orange)", foreground: "var(--avatar-text-orange)" },
  { background: "var(--avatar-background-purple)", foreground: "var(--avatar-text-purple)" },
  { background: "var(--avatar-background-cyan)", foreground: "var(--avatar-text-cyan)" },
  { background: "var(--avatar-background-lime)", foreground: "var(--avatar-text-lime)" },
]

export function getAvatarColors(name: string) {
  let hash = 0
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash)
  }
  return COLORS[Math.abs(hash) % COLORS.length]
}

export function Avatar(props: AvatarProps) {
  const [split, rest] = splitProps(props, [
    "fallback",
    "src",
    "background",
    "foreground",
    "size",
    "class",
    "classList",
    "style",
    "colors",
  ])
  const src = split.src // did this so i can zero it out to test fallback
  return (
    <div
      {...rest}
      data-component="avatar"
      data-size={split.size || "normal"}
      data-has-image={src ? "" : undefined}
      classList={{
        ...(split.classList ?? {}),
        [split.class ?? ""]: !!split.class,
      }}
      style={{
        ...(typeof split.style === "object" ? split.style : {}),
        ...(!src && split.background ? { "--avatar-bg": split.background } : {}),
        ...(!src && split.foreground ? { "--avatar-fg": split.foreground } : {}),
      }}
    >
      <Show when={src} fallback={split.fallback?.[0]}>
        {(src) => <img src={src()} draggable={false} data-slot="avatar-image" />}
      </Show>
    </div>
  )
}
