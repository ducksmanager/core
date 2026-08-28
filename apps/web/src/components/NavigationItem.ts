import type { FunctionalComponent, SVGAttributes } from "vue";
import type { RouteLocationResolved } from "vue-router";

export type NavigationItem = {
  title: string;
  icon?: FunctionalComponent<SVGAttributes>;
} & (
  | {
      route: RouteLocationResolved;
    }
  | {
      onClick: () => void;
    }
  | object
);
