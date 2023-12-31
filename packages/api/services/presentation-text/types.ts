export type Decision = "approve" | "refuse";

export interface Services {
  approveOrDenyPresentationText: (
    sentence: string,
    userId: number,
    decision: Decision,
    callback: () => void
  ) => void;
}

export const NamespaceEndpoint = "/presentation-text";
