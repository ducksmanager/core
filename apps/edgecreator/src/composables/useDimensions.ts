import { editingStep } from "~/stores/editingStep";

export type EdgeDimensions = { width: number; height: number };

const dimensions = ref({} as Record<string, { width: number; height: number }>);

export default () => {
  const setDimensions = (
    newDimensions: { width: string | number; height: string | number },
    issuenumber: string
  ) => {
    const issuenumbers = issuenumber
      ? [issuenumber]
      : editingStep().issuenumbers;
    for (const issuenumber of issuenumbers) {
      dimensions.value[issuenumber] = {
        width:
          typeof newDimensions.width === "string"
            ? parseInt(newDimensions.width)
            : newDimensions.width,
        height:
          typeof newDimensions.height === "string"
            ? parseInt(newDimensions.height)
            : newDimensions.height,
      };
    }
  };

  return {
    dimensions,
    setDimensions,
  };
};
