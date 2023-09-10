import { AbstractEvent } from "./AbstractEvent";

export class MedalEvent extends AbstractEvent {
  type = "medal";
  level!: number;
  contribution!: string;
}
