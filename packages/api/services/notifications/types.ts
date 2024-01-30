export default abstract class {
  static namespaceEndpoint = "/notifications";
  abstract send: (callback: (value: { notificationsSent: number }) => void) => void;
}

