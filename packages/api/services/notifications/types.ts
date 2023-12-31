export interface Services {
  send: (callback: (value: { notificationsSent: number }) => void) => void;
}

export const NamespaceEndpoint = "/notifications";
