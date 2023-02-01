import { AbstractEvent } from "~types/events/AbstractEvent";

export class MedalEvent extends AbstractEvent {
  type = "medal";
  level!: number;
  contribution!: string;
}
