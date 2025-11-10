/// <reference types="vite/client" />

export class SocketClient {
  public namespaces: Map<string, MockSocketNamespace> = new Map();

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

  async createStorySuggestion(suggestion: {
    entryId: number;
    storycode: string;
  }) {
    if (import.meta.env.DEV) {
      console.log(`[MockSocket] createStorySuggestion:`, suggestion);
    }
    return {
      createdStorySuggestion: {
        id: Math.floor(Math.random() * 1000),
        storycode: suggestion.storycode,
        entryId: suggestion.entryId,
        aiStorySuggestionId: null,
      },
    };
  }

  async acceptStorySuggestion(entryId: number, suggestionId: number | null) {
    if (import.meta.env.DEV) {
      console.log(`[MockSocket] acceptStorySuggestion:`, entryId, suggestionId);
    }
    return { status: "OK" };
  }

  async searchStory(
    keywords: string[],
    options: { withIssues?: boolean; kind?: string } = {},
  ) {
    if (import.meta.env.DEV) {
      console.log(`[MockSocket] searchStory:`, keywords, options);
    }
    return {
      results: [
        {
          storycode: "I TL  116-AP",
          title: "Mock Story Title",
          kind: options.kind || "n",
          entirepages: 1,
          score: 1.0,
        },
        {
          storycode: "I TL  117-AP",
          title: "Another Mock Story",
          kind: options.kind || "c",
          entirepages: 2,
          score: 0.8,
        },
      ] as const,
      hasMore: false,
    };
  }

  async searchStoryByStorycode(partialStorycode: string) {
    if (import.meta.env.DEV) {
      console.log(`[MockSocket] searchStoryByStorycode:`, partialStorycode);
    }
    return {
      results: [
        {
          storycode: partialStorycode + "-AP",
          title: "Mock Story by Code",
          kind: "n" as const,
          entirepages: 1,
          score: 1.0,
        },
      ],
      hasMore: false,
    };
  }

  async getStoryjobs(storyversioncode: string) {
    if (import.meta.env.DEV) {
      console.log(`[MockSocket] getStoryjobs:`, storyversioncode);
    }
    return {
      data: [
        {
          storyversioncode,
          personcode: "CB",
          plotwritartink: "w",
          storyjobcomment: null,
        },
        {
          storyversioncode,
          personcode: "DR",
          plotwritartink: "a",
          storyjobcomment: null,
        },
      ],
    };
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
