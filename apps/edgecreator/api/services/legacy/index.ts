import type { NamespaceProxyTarget } from "socket-call-server";
import { useSocketEvents } from "socket-call-server";
import type { Socket } from "socket.io";
import { prismaClient as prismaEdgeCreator } from "~prisma-schemas/schemas/edgecreator/client";

const listenEvents = () => ({
  getLegacyDimensions: async (
    publicationcode: string,
    issuenumber: string,
  ) =>
    prismaEdgeCreator.$queryRaw<
      { optionName: string; optionValue: string }[]
    >`
    with inducks_issues as (select row_number() over () as row_num, issuenumber
        from coa.inducks_issue
        where publicationcode = ${publicationcode} order by issuecode)
    select Option_nom as optionName, Option_valeur as optionValue
    from edgecreator_modeles2
             inner join edgecreator_valeurs on edgecreator_modeles2.ID = edgecreator_valeurs.ID_Option
             inner join edgecreator_intervalles on edgecreator_intervalles.ID_Valeur = edgecreator_valeurs.ID
    where Option_nom in ('Dimension_x', 'Dimension_y')
      and Pays = ${publicationcode.split("/")[0]}
      and Magazine = ${publicationcode.split("/")[1]}
    and (select inducks_issues.row_num from inducks_issues where issuenumber = ${issuenumber}) between
      (select inducks_issues.row_num from inducks_issues where issuenumber = Numero_debut)
      and (select inducks_issues.row_num from inducks_issues where issuenumber = Numero_fin)`,
  getLegacySteps: async (
    publicationcode: string,
    issuenumber: string,
  ) => prismaEdgeCreator.$queryRaw<
    {
      stepNumber: number;
      functionName: string;
      optionName: string;
      optionValue: string;
    }[]
  >`
    with inducks_issues as (select row_number() over (order by issuecode) as row_num, issuenumber
        from coa.inducks_issue
        where publicationcode = ${publicationcode})
    select Ordre AS stepNumber,
           Nom_fonction as functionName,
           Option_nom as optionName,
           Option_valeur as optionValue
    
    from edgecreator_modeles2
             inner join edgecreator_valeurs on edgecreator_modeles2.ID = edgecreator_valeurs.ID_Option
             inner join edgecreator_intervalles on edgecreator_intervalles.ID_Valeur = edgecreator_valeurs.ID
    where Option_nom is not null
      and Pays = ${publicationcode.split("/")[0]}
      and Magazine = ${publicationcode.split("/")[1]}
    and (select inducks_issues.row_num from inducks_issues where issuenumber = ${issuenumber}) between
      (select inducks_issues.row_num
       from inducks_issues
       where issuenumber = Numero_debut)
      and
      (select inducks_issues.row_num
       from inducks_issues
       where issuenumber = Numero_fin)
    
    group by Pays, Magazine, Ordre, Option_nom`,
});
export const { client, server } = useSocketEvents<
  typeof listenEvents,
  Record<string, never>
>("/legacy", {
  listenEvents,
  middlewares: [],
});

export type LegacyServices = NamespaceProxyTarget<
  Socket<typeof listenEvents, object, object, { token: string }>,
  Record<string, never>
>;

export type ClientEvents = (typeof client)["emitEvents"];
