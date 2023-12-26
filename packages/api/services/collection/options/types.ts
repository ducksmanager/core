import { userOptionType } from "~prisma-clients/client_dm";

export default interface WatchedAuthors {
  getOption: (optionName: Required<userOptionType>, callback: (value: string[]) => void) => void;
  setOption: (optionName: userOptionType, optionValues: string[], callback: () => void) => void;
}
