export interface Services {
  sendFeedback: (feedback: string, callback: () => void) => void;
}

export const NamespaceEndpoint = "/feedback";
