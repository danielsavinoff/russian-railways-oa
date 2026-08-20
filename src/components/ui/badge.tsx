import type { JSX } from "solid-js"
import { splitProps } from "solid-js"

import { cn } from "~/lib/utils"

type BadgeProps = JSX.HTMLAttributes<HTMLSpanElement> & {
  variant?: "default" | "secondary" | "outline"
}

export function Badge(props: BadgeProps) {
  const [local, others] = splitProps(props, ["class", "variant"])

  return (
    <span
      class={cn(
        "inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium leading-5",
        local.variant === "outline" &&
          "border-border bg-background text-foreground",
        local.variant === "secondary" &&
          "border-transparent bg-secondary text-secondary-foreground",
        (!local.variant || local.variant === "default") &&
          "border-transparent bg-primary text-primary-foreground",
        local.class,
      )}
      {...others}
    />
  )
}
