export type Decision = "approve" | "refuse";

export default { namespaceEndpoint: "/presentation-text" }
;export type Events = {
  approveOrDenyPresentationText: (
    sentence: string,
    userId: number,
    decision: Decision,
  ) => void;
}
