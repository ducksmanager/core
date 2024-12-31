export default {
  namespaceEndpoint: "/feedback",
  eventInterfaces: {} as unknown as {
    sendFeedback: (feedback: string) => void;
  },
};
