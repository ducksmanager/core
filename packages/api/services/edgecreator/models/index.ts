import type { Socket } from "socket.io";

import type { ModelSteps } from "~dm-types/ModelSteps";
import { prismaClient as prismaDm } from "~prisma-schemas/schemas/dm/client";
import { prismaClient as prismaEdgeCreator } from "~prisma-schemas/schemas/edgecreator/client";

import type Events from "../types";

export default (socket: Socket<Events>) => {
  socket.on("getModelsSteps", async (modelIds, callback) => {
    callback(
      (
        await prismaEdgeCreator.$queryRaw<
          {
            issuenumber: string;
            stepNumber: number;
            functionName: string;
            options: string;
          }[]
        >`
          select model.numero AS issuenumber,
                  optionValue.ordre AS stepNumber,
                  optionValue.Nom_fonction AS functionName,
                  concat('{',
                        group_concat(concat('"', optionValue.Option_nom, '": ', '"', optionValue.Option_valeur,
                                            '"')),
                        '}') AS options
          from tranches_en_cours_valeurs optionValue
                    inner join tranches_en_cours_modeles model on optionValue.ID_Modele = model.ID
          where model.ID IN (${modelIds})
          group by model.numero, optionValue.ordre
          order by optionValue.ordre
      `
      ).reduce<ModelSteps>((acc, { issuenumber, stepNumber, functionName, options }) => {
        if (!acc[issuenumber]) {
          acc[issuenumber] = {};
        }
        if (!acc[issuenumber][stepNumber]) {
          acc[issuenumber][stepNumber] = {
            functionName,
            issuenumber,
            stepNumber,
            options: {},
          };
        }
        Object.assign(acc[issuenumber][stepNumber].options, JSON.parse(options));
        return acc;
      }, {}),
    );
  });

  socket.on("getModel", async (issuecode, callback) => {
    const model = await prismaEdgeCreator.edgeModel.findFirst({
      where: {
        issuecode,
      },
    });
    const modelIsPublished =
      (await prismaDm.edge.count({
        where: {
          issuecode,
        },
      })) > 0;
    callback(model && modelIsPublished ? model : null);
  });
};
