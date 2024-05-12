export type Decision = "approve" | "refuse";

export const namespaceEndpoint = "/presentation-text";
export default abstract class Services {
  static namespaceEndpoint = namespaceEndpoint;

  abstract approveOrDenyPresentationText: (
    sentence: string,
    userId: number,
    decision: Decision,
    callback: () => void,
  ) => void;
}
