import type { JSX } from "solid-js"
import { splitProps } from "solid-js"

import { cn } from "~/lib/utils"

export function Card(props: JSX.HTMLAttributes<HTMLDivElement>) {
  const [local, others] = splitProps(props, ["class"])

  return (
    <div
      class={cn(
        "rounded-lg border bg-card text-card-foreground shadow-sm",
        local.class,
      )}
      {...others}
    />
  )
}

export function CardHeader(props: JSX.HTMLAttributes<HTMLDivElement>) {
  const [local, others] = splitProps(props, ["class"])

  return (
    <div class={cn("flex flex-col gap-1.5 p-5", local.class)} {...others} />
  )
}

export function CardTitle(props: JSX.HTMLAttributes<HTMLHeadingElement>) {
  const [local, others] = splitProps(props, ["class"])

  return (
    <h3
      class={cn("text-lg font-semibold leading-none tracking-normal", local.class)}
      {...others}
    />
  )
}

export function CardContent(props: JSX.HTMLAttributes<HTMLDivElement>) {
  const [local, others] = splitProps(props, ["class"])

  return <div class={cn("p-5 pt-0", local.class)} {...others} />
}
