import type { Errorable } from "~socket.io-services";

export default { namespaceEndpoint: "/status" }
;export type Events =  {


  getDbStatus: (
    ) => Errorable<
        void,
        "Some DB checks have failed" | "Some COA tables are empty"
      >,
    
  getPastecStatus: (
    ) => Errorable<
        { numberOfImages: number },
        "Pastec /imageIds response is invalid" | "Pastec is unreachable"
      >,
    
  getPastecSearchStatus: (
    ) => Errorable<
        { numberOfImages: number },
        | "Pastec search returned no image"
        | "Pastec /searcher response is invalid"
        | "Pastec is unreachable"
      >,
    
}
