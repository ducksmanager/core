export default abstract class {
  static namespaceEndpoint: string = "/me";

  abstract getUser: (callback: (data: { username: string }) => void) => void;
}