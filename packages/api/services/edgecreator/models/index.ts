import type { Socket } from "socket.io";

import type { ModelSteps } from "~dm-types/ModelSteps";
import { prismaDm, prismaEdgeCreator } from "~prisma-clients";

import type Events from "../types";

export default (socket: Socket<Events>) => {
  socket.on("getModelsSteps", async (modelIds, callback) => {
    callback(
      (
        await prismaEdgeCreator.$queryRaw<
          {
            shortIssuenumber: string;
            stepNumber: number;
            functionName: string;
            options: string;
          }[]
        >`
          select model.short_issuenumber AS shortIssuenumber,
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
      ).reduce(
        (
          acc: ModelSteps,
          { shortIssuenumber, stepNumber, functionName, options },
        ) => ({
          ...acc,
          [shortIssuenumber]: {
            ...(acc[shortIssuenumber] || {}),
            [stepNumber]: {
              ...(acc[shortIssuenumber]?.[stepNumber] || {
                functionName,
                shortIssuenumber,
                stepNumber,
                options: {
                  ...(acc[shortIssuenumber]?.[stepNumber]?.options || {}),
                  ...JSON.parse(options),
                },
              }),
            },
          },
        }),
        {},
      ),
    );
  });

  socket.on("getModel", async (shortIssuenumber, callback) => {
    const model = await prismaEdgeCreator.edgeModel.findFirst({
      where: {
        shortIssuenumber,
      },
    });
    const modelIsPublished =
      (await prismaDm.edge.count({
        where: {
          shortIssuenumber,
        },
      })) > 0;
    callback(model && modelIsPublished ? model : null);
  });
};
