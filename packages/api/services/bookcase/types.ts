import type { BookcaseEdge } from "~dm-types/BookcaseEdge";
import type { Errorable } from "~socket.io-services";

export default { namespaceEndpoint: "/bookcase" }
;export type Events =  {

  getBookcase: (
    username: string) => Errorable<
        { edges: BookcaseEdge[] },
        "Unauthorized" | "Forbidden" | "Not found"
      >,
    

  getBookcaseOrder: (
    username: string) => Errorable<
        { publicationCodes: string[] },
        "Unauthorized" | "Forbidden" | "Not found"
      >,
    

  setBookcaseOrder: (
    publicationCodes: string[]) => number | undefined

  getBookcaseOptions: (
    username: string) => Errorable<
        {
          textures: {
            bookcase: string;
            bookshelf: string;
          };
          showAllCopies: boolean;
        },
        "Unauthorized" | "Forbidden" | "Not found"
      >,
    

  setBookcaseOptions: (
    data: {
      textures: { bookcase: string; bookshelf: string };
      showAllCopies: boolean;
    }) => string
}
