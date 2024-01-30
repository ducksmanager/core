export type Decision = "approve" | "refuse";

export default abstract class Services {
   static namespaceEndpoint: string = "/presentation-text";

  abstract approveOrDenyPresentationText: (
    sentence: string,
    userId: number,
    decision: Decision,
    callback: () => void
  ) => void;
}
