export default abstract class {
  static namespaceEndpoint = "/feedback";
  abstract sendFeedback: (feedback: string, callback: () => void) => void;
}

