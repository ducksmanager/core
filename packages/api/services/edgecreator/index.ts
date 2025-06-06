import { useSocketEvents } from "socket-call-server";

import { prismaClient as prismaDm } from "~prisma-schemas/schemas/dm/client";

import edgeModelReady from "../../emails/edge-model-ready";
import type { UserServices } from "../../index";
import { RequiredAuthMiddleware } from "../auth/util";
import namespaces from "../namespaces";
import edgePublication from "./edge-publication";
import edgeSprites from "./edge-sprites";
import models from "./models";
import multipleEdgePhotos from "./multiple-edge-photos";

type ImageElement = {
  country: string;
  magazine: string;
  optionValue: string;
  issuenumberStart: string;
  issuenumberEnd: string;
};

const listenEvents = (services: UserServices) => {
  const { _socket } = services;
  return {
    ...models(),
    ...edgeSprites(),
    ...edgePublication(),
    ...multipleEdgePhotos(services),

    // TODO check if usages in SVG models
    getImagesFromFilename: async (fileName: string) =>
      // TODO prismaClient.edgeModel.findMany ?
      (
        await prismaDm.$queryRaw<ImageElement[]>`
      SELECT Pays AS country, Magazine AS magazine, Option_valeur AS optionValue, Numero_debut AS issuenumberStart, Numero_fin AS issuenumberEnd
      FROM edgecreator_valeurs valeurs
        INNER JOIN edgecreator_modeles2 modeles ON valeurs.ID_Option = modeles.ID
        INNER JOIN edgecreator_intervalles intervalles ON valeurs.ID = intervalles.ID_Valeur
      WHERE Nom_fonction = 'Image' AND Option_nom = 'Source' AND (Option_valeur = '${fileName}' OR (Option_valeur LIKE '%[Numero]%' AND Option_valeur LIKE '%.png'))
      GROUP BY Pays, Magazine, Ordre, Option_nom, Numero_debut, Numero_fin
      UNION
      SELECT Pays AS country, Magazine AS magazine, Option_valeur AS optionValue, Numero AS issuenumberStart, Numero AS issuenumberEnd
      FROM tranches_en_cours_modeles modeles
        INNER JOIN tranches_en_cours_valeurs valeurs ON modeles.ID = valeurs.ID_Modele
      WHERE Nom_fonction = 'Image' AND Option_nom = 'Source' AND (Option_valeur = '${fileName}' OR (Option_valeur LIKE '%[Numero]%' AND Option_valeur LIKE '%.png'))
    `
      ).filter(({ optionValue }) =>
        optionValue
          .split(/\[[^]]+]/)
          .every((stringChunk) => fileName.indexOf(stringChunk) > -1),
      ),

    submitEdge: async (issuecode: string) => {
      const user = await prismaDm.user.findUniqueOrThrow({
        where: {
          id: _socket.data.user.id,
        },
      });

      const email = new edgeModelReady({
        user,
        issuecode,
      });
      await email.send();

      return { url: email.data.ecLink };
    },
  };
};

export const { client, server } = useSocketEvents<
  typeof listenEvents,
  Record<string, never>
>(namespaces.EDGECREATOR, {
  listenEvents,
  middlewares: [RequiredAuthMiddleware],
});

export type ClientEvents = (typeof client)["emitEvents"];
