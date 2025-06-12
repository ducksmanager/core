import interact from "interactjs";
import { useI18n } from "vue-i18n";

import { step } from "~/stores/step";
import { ui } from "~/stores/ui";

// type Interactive = {
//   onmove: (params: { dx: number; dy: number }) => void;
//   onresizemove: (params: { rect: { width: number; height: number } }) => void;
// };

const shownTips: string[] = [];

export const useStepOptions = () => {
  const issuecode = inject<string>("issuecode");
  if (!issuecode) {
    throw new Error("issuecode not provided");
  }
  const stepStore = step();
  const { t } = useI18n();
  const { zoom } = storeToRefs(ui());
  const width = computed(
    () =>
      stepStore.getFilteredDimensions({
        issuecodes: [issuecode],
      })[0].width,
  );
  const height = computed(
    () =>
      stepStore.getFilteredDimensions({
        issuecodes: [issuecode],
      })[0].height,
  );

  const showMoveResizeToast = (
    type: string,
    options?: { edges: { right: number; bottom: number } } | null,
  ) => {
    if (shownTips.includes(type)) {
      return;
    }
    let text: string;
    switch (type) {
      case "move":
        text = t(
          `You can make your selection snap to the top left corner of the edge by holding Shift while you drag it`,
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
                  : "width",
            ),
          },
        );
    }

    // useToastController().show!({
    //   props: {
    //     body: text!,
    //     title: t("Tip").toString(),
    //     pos: "top-center",
    //     noCloseButton: true,
    //   },
    // });
    // shownTips.push(type);
  };
  const isColorOption = (optionName: string) =>
    optionName.toLowerCase().includes("color") ||
    ["fill", "stroke"].includes(optionName);

  type EitherOr<T, U> =
    | (T & { [K in keyof U]?: never })
    | (U & { [K in keyof T]?: never });

  interface OnMoveHandlerParams {
    currentTarget: SVGElement | HTMLElement;
    dx: number;
    dy: number;
    shiftKey: boolean;
  }

  interface OnResizemoveParams {
    rect: { width: number; height: number };
    shiftKey: boolean;
    edges: { right: number; bottom: number };
  }

  interface MoveCoordinatesParams {
    x: Ref<number>;
    y: Ref<number>;
  }

  interface ResizeDimensionsParams {
    width: Ref<number>;
    height: Ref<number>;
  }

  type MoveParams = EitherOr<
    MoveCoordinatesParams,
    { onmove: (params: OnMoveHandlerParams) => void }
  >;

  type ResizeParams = EitherOr<
    ResizeDimensionsParams,
    { onresizemove: (params: OnResizemoveParams) => void }
  >;

  const enableDragResize = (
    element: HTMLElement | SVGElement,
    params: Partial<MoveParams & ResizeParams>,
  ) =>
    interact(element)
      .draggable({
        onmove: (e) => {
          document.body.classList.add("interacting");
          if ("onmove" in params && params.onmove) {
            params.onmove(e);
          } else if ("x" in params && "y" in params && params.x && params.y) {
            const { dx, dy, shiftKey } = e;
            showMoveResizeToast("move");
            if (shiftKey) {
              params.x.value = 0;
              params.y.value = 0;
            } else {
              params.x.value += dx / zoom.value;
              params.y.value += dy / zoom.value;
            }
          }
        },
        onend: () => document.body.classList.remove("interacting"),
      })
      .resizable({
        edges: { right: true, bottom: true },
      })
      .on("resizemove", (e: OnResizemoveParams) => {
        document.body.classList.add("interacting");
        if ("onresizemove" in params && params.onresizemove) {
          params.onresizemove(e);
        } else if (
          "width" in params &&
          "height" in params &&
          params.width &&
          params.height
        ) {
          const { rect, shiftKey, edges } = e;
          showMoveResizeToast("resize", { edges });
          params.width.value = rect.width / zoom.value;
          params.height.value = rect.height / zoom.value;
          if (shiftKey) {
            if (edges.bottom) {
              params.height.value = height.value;
            }
            if (edges.right) {
              params.width.value = width.value;
            }
          }
        }
      })
      .on("resizeend", () => document.body.classList.remove("interacting"));

  return {
    zoom,
    width,
    height,
    showMoveResizeToast,
    isColorOption,
    enableDragResize,
  };
};
