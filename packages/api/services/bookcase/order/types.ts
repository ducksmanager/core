import { Errorable } from "~/services/types";

export default interface Options {
  getBookcaseOrder: (username: string, callback: (value: Errorable<{ publicationCodes: string[] }>) => void) => void;

  setBookcaseOrder: (publicationCodes: string[], callback: (max: number | undefined) => void) => void;
}
