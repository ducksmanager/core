import { useToast } from "bootstrap-vue-next";
import interact from "interactjs";
import { useI18n } from "vue-i18n";

import { step } from "~/stores/step";
import { ui } from "~/stores/ui";
import { BaseProps } from "~/types/StepOptionBaseProps";
const uiStore = ui();
const stepStore = step();

// type Interactive = {
//   onmove: (params: { dx: number; dy: number }) => void;
//   onresizemove: (params: { rect: { width: number; height: number } }) => void;
// };

const shownTips: string[] = [];

export const useStepOptions = (
  props: BaseProps,
  component: string,
  attributeKeys: string[]
) => {
  const toast = useToast();
  const { t } = useI18n();
  const zoom = computed(() => uiStore.zoom);
  const width = computed(
    () =>
      stepStore.getFilteredDimensions({
        issuenumbers: [props.issuenumber],
      })[0]!.width
  );
  const height = computed(
    () =>
      stepStore.getFilteredDimensions({
        issuenumbers: [props.issuenumber],
      })[0]!.height
  );
  const attributes = computed(() =>
    Object.keys(props.options!)
      .filter((optionKey) => attributeKeys.includes(optionKey))
      .reduce(
        (acc, optionKey) => ({
          ...acc,
          [optionKey]: props.options![optionKey],
        }),
        {}
      )
  );

  const showMoveResizeToast = (
    type: string,
    options?: { edges: { right: number; bottom: number } } | null
  ) => {
    if (shownTips.includes(type)) {
      return;
    }
    let text: string;
    switch (type) {
      case "move":
        text = t(
          `You can make your selection snap to the top left corner of the edge by holding Shift while you drag it`
        );
        break;
      case "resize":
        text = t(
          `You can make your selection match the {dimension} of the edge by holding Shift while you resize it`,
          {
            dimension: t(
              options!.edges.bottom && options!.edges.right
                ? "width and height"
                : options!.edges.bottom
                ? "height"
                : "width"
            ),
          }
        );
    }
    toast!.show(
      {
        body: text!,
        title: t("Tip").toString(),
      },
      { pos: "top-center", noCloseButton: true, autoHide: true }
    );
    shownTips.push(type);
  };
  const isColorOption = (optionName: string) =>
    optionName.toLowerCase().includes("color") ||
    ["fill", "stroke"].includes(optionName);

  const enableDragResize = (
    element: HTMLElement | SVGElement,
    callbacks: {
      onmove?:
        | null
        | ((params: {
            currentTarget: SVGElement | HTMLElement;
            dx: number;
            dy: number;
          }) => void);
      onresizemove?:
        | null
        | ((params: { rect: { width: number; height: number } }) => void);
    } = {
      onmove: null,
      onresizemove: null,
    }
  ) =>
    interact(element)
      .draggable({
        onmove: (e) => {
          document.body.classList.add("interacting");
          if (callbacks.onmove) {
            callbacks.onmove(e);
          } else {
            const { dx, dy, shiftKey } = e;
            showMoveResizeToast("move");
            if (shiftKey) {
              stepStore.setOptionValues({
                x: 0,
                y: 0,
              });
            } else {
              stepStore.setOptionValues({
                x: (props.options!.x as number) + dx / uiStore.zoom,
                y: (props.options!.y as number) + dy / uiStore.zoom,
              });
            }
          }
        },
        onend: () => document.body.classList.remove("interacting"),
      })
      .resizable({
        edges: { right: true, bottom: true },
      })
      .on("resizemove", (e) => {
        document.body.classList.add("interacting");
        if (callbacks.onresizemove) {
          callbacks.onresizemove(e);
        } else {
          const { rect, shiftKey, edges } = e;
          showMoveResizeToast("resize", { edges });
          rect.width /= uiStore.zoom;
          rect.height /= uiStore.zoom;
          if (shiftKey) {
            if (edges.bottom) {
              rect.height = height.value;
            }
            if (edges.right) {
              rect.width = width.value;
            }
          }
          stepStore.setOptionValues(rect);
        }
      })

      .on("resizeend", () => document.body.classList.remove("interacting"));
  stepStore.setOptionValues(
    [
      {
        optionName: "component",
        optionValue: component,
      },
      ...Object.entries(props.options!).map(([optionName, optionValue]) => ({
        optionName,
        optionValue,
      })),
    ],
    {
      issuenumbers: [props.issuenumber],
      stepNumber: props.stepNumber,
    }
  );

  return {
    zoom,
    width,
    height,
    attributes,
    showMoveResizeToast,
    isColorOption,
    enableDragResize,
  };
};
