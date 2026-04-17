import { computedWithControl } from "@vueuse/core";
import { useQueryCache } from "@pinia/colada";
import type { SuccessfulEventOutput } from "socket-call-client";
import { computed, type Ref } from "vue";

// eslint-disable-next-line @typescript-eslint/no-explicit-any -- library EventsMap shape
type EventsMapLike = Record<string, (...args: any[]) => Promise<any>>;

export default <Events extends EventsMapLike>(
  namespace: string,
  events: Events,
  locale: Ref<string>,
) => {
  type EventStringArrayFirst = {
    [K in keyof Events]: Events[K] extends (...args: infer P) => unknown
      ? P extends [string[]]
        ? SuccessfulEventOutput<Events, K> extends Record<string, unknown>
          ? K
          : never
        : never
      : never;
  }[keyof Events];

  type EventSuccess<E extends EventStringArrayFirst> = SuccessfulEventOutput<
    Events,
    E
  >;

  type SelectedEventValue<
    E extends EventStringArrayFirst,
    S extends keyof EventSuccess<E> | undefined = undefined,
  > =
    (
      [S] extends [keyof EventSuccess<E>] ? EventSuccess<E>[S] : EventSuccess<E>
    ) extends Record<string, infer V>
      ? V
      : never;
  return {
    query: <
      E extends EventStringArrayFirst,
      Subkey extends keyof EventSuccess<E> | undefined = undefined,
    >(
      event: E,
      subKey?: Subkey,
    ) => {
      type SelectedValue = SelectedEventValue<E, Subkey>;

      const queryCache = useQueryCache();

      const map = computedWithControl(locale, () => {
        const mapValue = {} as Record<string, SelectedValue>;
        for (const entry of queryCache.getEntries({
          key: [namespace, event],
        })) {
          const key = entry.key;
          if (typeof key[2] === "string") {
            const st = entry.state.value;
            if (st.status === "success") {
              mapValue[key[2]] = st.data as SelectedValue;
            }
          }
        }
        return mapValue;
      });
      const fetch = (keys: string[]) => {
        const actualKeys = new Set(keys).difference(
          new Set(Object.keys(map.value)),
        );
        if (!actualKeys.size) {
          return Promise.resolve(false);
        }
        const sorted = [...actualKeys].sort((a, b) => a.localeCompare(b));
        return queryCache
          .fetch(
            queryCache.ensure({
              key: [namespace, event, sorted.join(",")] as const,
              query: () => {
                const fetchBatch = events[event] as (
                  keys: string[],
                ) => Promise<EventSuccess<E>>;
                return fetchBatch(sorted).then((data) =>
                  subKey ? data[subKey] : data,
                );
              },
            }),
          )
          .then((state) => (state.status === "success" ? state.data : false));
      };

      const add = (newValues: Record<string, SelectedValue>) => {
        for (const [code, value] of Object.entries(newValues)) {
          queryCache.setQueryData([namespace, event, code], value);
        }
        map.trigger();
      };
      return {
        ref: computed(() => map.value), // Needs to be a computedRef to be understood by Pinia when used in SFCs
        fetch,
        add,
      };
    },
  };
};
