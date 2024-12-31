import type { issue } from "~prisma-schemas/schemas/dm";
import type { Errorable } from "~socket.io-services";

export default { namespaceEndpoint: "/public-collection" }
;export type Events =  {


  getPublicCollection: (
    username: string) => Errorable<
        { issues: issue[] },
        "User not found" | "This user does not allow sharing"
      >,
    
}
