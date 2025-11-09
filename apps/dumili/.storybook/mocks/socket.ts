/// <reference types="vite/client" />

/**
 * WebSocket mocks for Storybook
 * These mocks prevent components from trying to connect to a real WebSocket server
 */

// Mock SocketClient class - this replaces the real SocketClient from socket-call-client
export class SocketClient {
  private namespaces: Map<string, unknown> = new Map();

  constructor() {}

  addNamespace(namespace: string) {
    if (!this.namespaces.has(namespace)) {
      const mockNamespace = new MockSocketNamespace(namespace);
      this.namespaces.set(namespace, mockNamespace);
      return mockNamespace;
    }
    return this.namespaces.get(namespace) as MockSocketNamespace;
  }

  get app() {
    return {
      _connect: () => {},
    };
  }
}

// Mock SocketNamespace
class MockSocketNamespace {
  private listeners: Map<string, Set<() => void>> = new Map();
  public connected = true; // Mock as always connected
  public onConnectError?: () => void;
  public onConnected?: () => void;

  constructor(private namespace: string) {}

  on(event: string, callback: () => void) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(callback);
    return this;
  }

  off(event: string, callback?: () => void) {
    if (!this.listeners.has(event)) return this;
    if (callback) {
      this.listeners.get(event)?.delete(callback);
    } else {
      this.listeners.delete(event);
    }
    return this;
  }

  emit(event: string, ...args: unknown[]) {
    if (import.meta.env.DEV) {
      console.log(`[MockSocket] Emit to ${this.namespace}:`, event, args);
    }
    return this;
  }

  async getUser() {
    return {
      id: 1,
      inducksUsername: "storybook-user",
    };
  }

  async updateUser() {
    return { success: true };
  }

  async getIndexation() {
    return null;
  }

  async acceptIssueSuggestion(suggestionId: number | null) {
    if (import.meta.env.DEV) {
      console.log(`[MockSocket] acceptIssueSuggestion:`, suggestionId);
    }
    return { status: "OK" };
  }

  async createIssueSuggestion(suggestion: {
    publicationcode: string;
    issuenumber: string;
  }) {
    if (import.meta.env.DEV) {
      console.log(`[MockSocket] createIssueSuggestion:`, suggestion);
    }
    return {
      createdIssueSuggestion: {
        id: Math.floor(Math.random() * 1000),
        ...suggestion,
        indexationId: "mock-indexation-id",
        aiStorySearchPossibleStoryId: null,
      },
    };
  }

  async acceptStoryKindSuggestion(
    entryId: number,
    storyKindSuggestionId: number | null,
  ) {
    if (import.meta.env.DEV) {
      console.log(
        `[MockSocket] acceptStoryKindSuggestion:`,
        entryId,
        storyKindSuggestionId,
      );
    }
    return { status: "OK" };
  }

  _connect() {
    if (import.meta.env.DEV) {
      console.log(`[MockSocket] _connect called for ${this.namespace}`);
    }
  }

  indexationUpdated?: (indexation: unknown) => void;
}

export const buildWebStorage = (_storage: Storage) => ({
  get: async (_key: string) => null,
  set: async (_key: string, _value: unknown) => {},
  remove: async (_key: string) => {},
  clear: async () => {},
});
