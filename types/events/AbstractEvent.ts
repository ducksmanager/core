export abstract class AbstractEvent {
  abstract type: string;
  users: (number | null)[] = [];
  timestamp = 0;
}

export abstract class AbstractEventRaw {
  abstract type: string;
  users?: string | undefined = undefined;
  userId?: number | undefined = undefined;
  timestamp = 0;
}
