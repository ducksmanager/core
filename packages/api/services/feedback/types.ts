export const namespaceEndpoint = "/feedback";
export default abstract class {
  static namespaceEndpoint = namespaceEndpoint;
  abstract sendFeedback: (feedback: string, callback: () => void) => void;
}
