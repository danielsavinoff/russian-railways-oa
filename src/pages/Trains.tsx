import { A, useParams } from "@solidjs/router"
import { For, Show, createMemo, createResource, createSignal } from "solid-js"

import { Badge } from "~/components/ui/badge"
import { Button, buttonVariants } from "~/components/ui/button"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "~/components/ui/card"
import { Input } from "~/components/ui/input"
import { Select } from "~/components/ui/select"
import { cn } from "~/lib/utils"

type Train = {
  id: string
  name: string
  region: string
  route: string[]
  duration_days: number
  departures: string[]
  price_from: number
  tags: string[]
  description: string
  excursions: string[]
  buy_url: string
}

type TrainsPayload = {
  trains: Train[]
}

const dateFormatter = new Intl.DateTimeFormat("ru-RU", {
  day: "numeric",
  month: "long",
  year: "numeric",
})

const monthFormatter = new Intl.DateTimeFormat("ru-RU", {
  month: "long",
  year: "numeric",
})

const priceFormatter = new Intl.NumberFormat("ru-RU", {
  style: "currency",
  currency: "RUB",
  maximumFractionDigits: 0,
})

const todayIso = new Date().toISOString().slice(0, 10)

async function fetchTrains(): Promise<Train[]> {
  const response = await fetch(`${import.meta.env.BASE_URL}/data/trains.json`)

  if (!response.ok) {
    throw new Error("Не удалось загрузить список поездов")
  }

  const payload = (await response.json()) as TrainsPayload
  return payload.trains
}

function getRouteSummary(train: Train) {
  return `${train.route[0]} -> ${train.route[train.route.length - 1]}`
}

function getNearestDeparture(train: Train) {
  const dates = [...train.departures].sort()
  return dates.find((date) => date >= todayIso) ?? dates[0]
}

function getMonthKey(date: string) {
  return date.slice(0, 7)
}

function formatDate(date: string) {
  return dateFormatter.format(new Date(`${date}T00:00:00`))
}

function formatMonth(monthKey: string) {
  return monthFormatter.format(new Date(`${monthKey}-01T00:00:00`))
}

function formatDuration(days: number) {
  return `${days} ${days === 1 ? "день" : days > 1 && days < 5 ? "дня" : "дней"}`
}

function normalize(value: string) {
  return value.trim().toLocaleLowerCase("ru-RU")
}

export default function Trains() {
  const params = useParams()
  const [trains] = createResource(fetchTrains)
  const [region, setRegion] = createSignal("all")
  const [month, setMonth] = createSignal("all")
  const [query, setQuery] = createSignal("")

  const allTrains = createMemo(() => trains() ?? [])

  const regions = createMemo(() =>
    [...new Set(allTrains().map((train) => train.region))].sort((a, b) =>
      a.localeCompare(b, "ru-RU"),
    ),
  )

  const months = createMemo(() => {
    const keys = new Set<string>()
    allTrains().forEach((train) =>
      train.departures.forEach((departure) => keys.add(getMonthKey(departure))),
    )

    return [...keys].sort()
  })

  const filteredTrains = createMemo(() => {
    const search = normalize(query())

    return allTrains().filter((train) => {
      const matchesRegion = region() === "all" || train.region === region()
      const matchesMonth =
        month() === "all" ||
        train.departures.some((departure) => getMonthKey(departure) === month())
      const matchesSearch = normalize(train.name).includes(search)

      return matchesRegion && matchesMonth && matchesSearch
    })
  })

  const selectedTrain = createMemo(() =>
    allTrains().find((train) => train.id === params.trainId),
  )

  const resetFilters = () => {
    setRegion("all")
    setMonth("all")
    setQuery("")
  }

  return (
    <main class="min-h-screen bg-[linear-gradient(180deg,#f7f7f8_0%,#ffffff_34%,#f4f7f5_100%)] text-foreground">
      <div class="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-5 sm:px-6 lg:px-8 lg:py-8">
        <header class="flex flex-col gap-3 border-b pb-5 lg:flex-row lg:items-end lg:justify-between">
          <div class="space-y-2">
            <p class="text-sm font-medium uppercase tracking-normal text-red-700">
              Туристические поезда
            </p>
            <h1 class="text-3xl font-semibold leading-tight tracking-normal text-zinc-950 sm:text-4xl">
              Маршруты РЖД по России
            </h1>
            <p class="max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">
              Выберите регион, месяц отправления или найдите поезд по названию.
            </p>
          </div>
          <div class="rounded-md border bg-white px-4 py-3 text-sm shadow-sm">
            <span class="font-semibold">{filteredTrains().length}</span>{" "}
            маршрутов найдено
          </div>
        </header>

        <section class="grid gap-3 rounded-lg border bg-white p-4 shadow-sm md:grid-cols-[1fr_220px_220px_auto] md:items-end">
          <label class="grid gap-2 text-sm font-medium">
            Поиск по названию
            <Input
              placeholder="Например, Кавказ"
              value={query()}
              onInput={(event) => setQuery(event.currentTarget.value)}
            />
          </label>

          <label class="grid gap-2 text-sm font-medium">
            Регион
            <Select
              value={region()}
              onChange={(event) => setRegion(event.currentTarget.value)}
            >
              <option value="all">Все регионы</option>
              <For each={regions()}>
                {(item) => <option value={item}>{item}</option>}
              </For>
            </Select>
          </label>

          <label class="grid gap-2 text-sm font-medium">
            Месяц отправления
            <Select
              value={month()}
              onChange={(event) => setMonth(event.currentTarget.value)}
            >
              <option value="all">Все месяцы</option>
              <For each={months()}>
                {(item) => <option value={item}>{formatMonth(item)}</option>}
              </For>
            </Select>
          </label>

          <Button
            type="button"
            variant="outline"
            class="w-full md:w-auto"
            onClick={resetFilters}
          >
            Сбросить
          </Button>
        </section>

        <Show
          when={!trains.error}
          fallback={
            <Card>
              <CardContent class="pt-5 text-sm text-red-700">
                Не удалось загрузить данные поездов.
              </CardContent>
            </Card>
          }
        >
          <Show
            when={!trains.loading}
            fallback={
              <Card>
                <CardContent class="pt-5 text-sm text-muted-foreground">
                  Загружаем маршруты...
                </CardContent>
              </Card>
            }
          >
            <div class="grid gap-6 lg:grid-cols-[minmax(0,1fr)_420px]">
              <section class="grid content-start gap-4 sm:grid-cols-2 xl:grid-cols-3">
                <Show
                  when={filteredTrains().length > 0}
                  fallback={
                    <Card class="sm:col-span-2 xl:col-span-3">
                      <CardContent class="pt-5 text-sm text-muted-foreground">
                        По выбранным фильтрам поездов нет.
                      </CardContent>
                    </Card>
                  }
                >
                  <For each={filteredTrains()}>
                    {(train) => (
                      <A
                        href={`/trains/${train.id}`}
                        class={cn(
                          "group block rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                          selectedTrain()?.id === train.id && "ring-2 ring-red-700",
                        )}
                      >
                        <Card class="h-full transition-colors group-hover:border-zinc-400">
                          <CardHeader>
                            <div class="flex items-start justify-between gap-3">
                              <CardTitle>{train.name}</CardTitle>
                              <Badge variant="secondary">{train.region}</Badge>
                            </div>
                          </CardHeader>
                          <CardContent class="grid gap-4">
                            <dl class="grid gap-3 text-sm">
                              <div>
                                <dt class="text-muted-foreground">Маршрут</dt>
                                <dd class="font-medium">{getRouteSummary(train)}</dd>
                              </div>
                              <div class="grid grid-cols-2 gap-3">
                                <div>
                                  <dt class="text-muted-foreground">
                                    Длительность
                                  </dt>
                                  <dd class="font-medium">
                                    {formatDuration(train.duration_days)}
                                  </dd>
                                </div>
                                <div>
                                  <dt class="text-muted-foreground">
                                    Ближайшая дата
                                  </dt>
                                  <dd class="font-medium">
                                    {formatDate(getNearestDeparture(train))}
                                  </dd>
                                </div>
                              </div>
                            </dl>
                            <div class="flex items-end justify-between gap-3 border-t pt-4">
                              <span class="text-sm text-muted-foreground">
                                Цена от
                              </span>
                              <span class="text-xl font-semibold">
                                {priceFormatter.format(train.price_from)}
                              </span>
                            </div>
                          </CardContent>
                        </Card>
                      </A>
                    )}
                  </For>
                </Show>
              </section>

              <aside class="lg:sticky lg:top-6 lg:self-start">
                <Show
                  when={params.trainId}
                  fallback={
                    <Card>
                      <CardHeader>
                        <CardTitle>Выберите поезд</CardTitle>
                      </CardHeader>
                      <CardContent class="text-sm leading-6 text-muted-foreground">
                        Нажмите на карточку маршрута, чтобы посмотреть описание,
                        даты отправления, экскурсии и ссылку на покупку билета.
                      </CardContent>
                    </Card>
                  }
                >
                  <Show
                    when={selectedTrain()}
                    fallback={
                      <Card>
                        <CardHeader>
                          <CardTitle>Поезд не найден</CardTitle>
                        </CardHeader>
                        <CardContent class="grid gap-4 text-sm text-muted-foreground">
                          <p>Такого маршрута нет в текущем списке.</p>
                          <A href="/trains" class={buttonVariants({ variant: "outline" })}>
                            Вернуться к каталогу
                          </A>
                        </CardContent>
                      </Card>
                    }
                  >
                    {(train) => (
                      <Card>
                        <CardHeader class="gap-3">
                          <div class="flex flex-wrap gap-2">
                            <Badge>{train().region}</Badge>
                            <Badge variant="outline">
                              {formatDuration(train().duration_days)}
                            </Badge>
                          </div>
                          <div class="space-y-2">
                            <CardTitle class="text-2xl leading-tight">
                              {train().name}
                            </CardTitle>
                            <p class="text-sm font-medium text-muted-foreground">
                              {getRouteSummary(train())}
                            </p>
                          </div>
                        </CardHeader>
                        <CardContent class="grid gap-6">
                          <p class="text-sm leading-6">{train().description}</p>

                          <section class="grid gap-3">
                            <h2 class="text-sm font-semibold uppercase tracking-normal text-muted-foreground">
                              Даты отправления
                            </h2>
                            <div class="flex flex-wrap gap-2">
                              <For each={train().departures}>
                                {(departure) => (
                                  <Badge variant="outline">
                                    {formatDate(departure)}
                                  </Badge>
                                )}
                              </For>
                            </div>
                          </section>

                          <section class="grid gap-3">
                            <h2 class="text-sm font-semibold uppercase tracking-normal text-muted-foreground">
                              Экскурсии
                            </h2>
                            <ul class="grid gap-2 text-sm">
                              <For each={train().excursions}>
                                {(excursion) => (
                                  <li class="rounded-md border bg-zinc-50 px-3 py-2">
                                    {excursion}
                                  </li>
                                )}
                              </For>
                            </ul>
                          </section>

                          <section class="grid gap-3">
                            <h2 class="text-sm font-semibold uppercase tracking-normal text-muted-foreground">
                              Теги
                            </h2>
                            <div class="flex flex-wrap gap-2">
                              <For each={train().tags}>
                                {(tag) => <Badge variant="secondary">{tag}</Badge>}
                              </For>
                            </div>
                          </section>

                          <a
                            href={train().buy_url}
                            target="_blank"
                            rel="noreferrer"
                            class={buttonVariants({ class: "w-full" })}
                          >
                            Купить билет
                          </a>
                        </CardContent>
                      </Card>
                    )}
                  </Show>
                </Show>
              </aside>
            </div>
          </Show>
        </Show>
      </div>
    </main>
  )
}
