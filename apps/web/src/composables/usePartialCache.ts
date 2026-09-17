import { useQueryCache } from "@pinia/colada";
import { useEntityStore } from "pinia-colada-plugin-normalizer";
import { computed, type ComputedRef, type Ref } from "vue";

type EventsMapLike = Record<string, (...args: never[]) => Promise<unknown>>;
type NormalizedEntry<Value> = { id: string; key: string; value: Value };
type WithoutError<T> = T extends { error: unknown } ? never : T;
type RecordValue<Selected extends Record<string, unknown>> =
  Selected extends Record<string, infer Value> ? Value : never;

export default <Events extends EventsMapLike>(
  namespace: string,
  events: Events,
  locale: Ref<string>,
) => {
  type EventData<E extends keyof Events> = WithoutError<
    Awaited<ReturnType<Events[E]>>
  >;

  type BatchEventKey = {
    [K in keyof Events]: Events[K] extends (...args: infer P) => unknown
      ? P extends [string[]]
        ? EventData<K> extends Record<string, unknown>
          ? K
          : never
        : never
      : never;
  }[keyof Events];

  type QueryApi = {
    [E in BatchEventKey]: <
      Selected extends Record<string, unknown> = EventData<E>,
    >(
      select?: (data: EventData<E>) => Selected,
    ) => {
      ref: ComputedRef<Record<string, RecordValue<Selected>>>;
      fetch: (
        keys: string[],
      ) => Promise<Record<string, RecordValue<Selected>> | false>;
      add: (newValues: Record<string, RecordValue<Selected>>) => void;
    };
  };

  const queryCache = useQueryCache();
  const entityStore = useEntityStore();

  const toScopedId = (key: string) => `${locale.value}:${key}`;
  const entityTypeForEvent = (event: keyof Events) =>
    `${namespace}:${String(event)}`;

  const toRecord = <Value>(
    entries: Array<Pick<NormalizedEntry<Value>, "key" | "value">>,
  ) =>
    Object.fromEntries(entries.map(({ key, value }) => [key, value])) as Record<
      string,
      Value
    >;

  const proxyCache = new Map<string, QueryApi[BatchEventKey]>();

  return new Proxy({} as QueryApi, {
    get(_, event: BatchEventKey) {
      if (typeof event !== "string") {
        return undefined;
      }

      const cached = proxyCache.get(event);
      if (cached) {
        return cached;
      }

      const entityType = entityTypeForEvent(event);

      const eventQuery = (<Selected extends Record<string, unknown>>(
        select?: (data: EventData<BatchEventKey>) => Selected,
      ) => {
        type SelectedValue = RecordValue<Selected>;

        const map = computed<Record<string, SelectedValue>>(() => {
          const localePrefix = `${locale.value}:`;
          const mappedValues = {} as Record<string, SelectedValue>;

          for (const { id, data } of entityStore.getEntriesByType(
            entityType,
          ) as Array<{
            id: string;
            data: Pick<NormalizedEntry<SelectedValue>, "key" | "value">;
          }>) {
            if (id.startsWith(localePrefix)) {
              mappedValues[data.key] = data.value;
            }
          }

          console.log("Mapped values for event", event, mappedValues);
          return mappedValues;
        });

        const add = (newValues: Record<string, SelectedValue>) => {
          debugger;
          entityStore.setMany(
            Object.entries(newValues).map(([key, value]) => ({
              entityType,
              id: toScopedId(key),
              data: {
                id: toScopedId(key),
                key,
                value,
              },
            })),
          );
        };

        const fetch = async (keys: string[]) => {
          const actualKeys = new Set(keys).difference(
            new Set(Object.keys(map.value)),
          );
          if (!actualKeys.size) {
            return false;
          }
          const sorted = [...actualKeys].sort((a, b) => a.localeCompare(b));

          const ensuredQuery = queryCache.ensure({
            key: [entityType, locale.value, sorted.join(",")] as const,
            normalize: true,
            query: async () => {
              const fetchBatch = events[event] as unknown as (
                keys: string[],
              ) => Promise<EventData<BatchEventKey>>;
              const data = await fetchBatch(sorted);
              const values = (select ? select(data) : data) as Record<
                string,
                SelectedValue
              >;

              return Object.entries(values).map(([key, value]) => ({
                id: toScopedId(key),
                key,
                value,
              }));
            },
          });

          const queryState = await queryCache.fetch(ensuredQuery);
          return queryState.status === "success"
            ? toRecord(
                queryState.data as Array<
                  Pick<NormalizedEntry<SelectedValue>, "key" | "value">
                >,
              )
            : false;
        };

        return {
          ref: computed(() => map.value),
          fetch,
          add,
        };
      }) as QueryApi[BatchEventKey];
      proxyCache.set(event, eventQuery);

      return eventQuery;
    },
  });
};
