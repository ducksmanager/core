import { Socket } from "socket.io";

import { prismaDm, prismaEdgeCreator } from "~/prisma";
import { ModelSteps } from "~dm-types/ModelSteps";

import Services from "../types";
import { edgeEditedByOthersFields,unassignedEdgeFields } from "../types";

export default (socket: Socket<Services>) => {
  socket.on("getUnassignedEdges", async (callback) =>
    prismaEdgeCreator.edgeModel
      .findMany({
        select: unassignedEdgeFields,
        where: {
          username: null,
          isActive: false,
        },
      })
      .then(callback)
  );

  socket.on("getEdgesEditedByOthers", async (callback) =>
    prismaEdgeCreator.edgeModel
      .findMany({
        select: edgeEditedByOthersFields,
        where: {
          isActive: true,
          contributors: {
            some: {
              userId: socket.data.user!.id,
              contribution: "photographe",
            },
          },
          OR: [
            {
              username: {
                not: socket.data.user!.username,
              },
            },
            {
              username: null,
            },
          ],
        },
      })
      .then(callback)
  );

  socket.on("getModelsSteps", async (modelIds, callback) => {
    callback(
      (
        (await prismaEdgeCreator.$queryRaw`
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
      `) as {
          issuenumber: string;
          stepNumber: number;
          functionName: string;
          options: string;
        }[]
      ).reduce(
        (
          acc: ModelSteps,
          { issuenumber, stepNumber, functionName, options }
        ) => ({
          ...acc,
          [issuenumber]: {
            ...(acc[issuenumber] || {}),
            [stepNumber]: {
              ...(acc[issuenumber]?.[stepNumber] || {
                functionName,
                issuenumber,
                stepNumber,
                options: {
                  ...(acc[issuenumber]?.[stepNumber]?.options || {}),
                  ...JSON.parse(options),
                },
              }),
            },
          },
        }),
        {}
      )
    );
  });

  socket.on("getModel", async (publicationcode, issuenumber, callback) => {
    const [country, magazine] = publicationcode.split("/");
    const model = await prismaEdgeCreator.edgeModel.findFirst({
      where: {
        country,
        magazine,
        issuenumber,
      },
    });
    const modelIsPublished =
      (await prismaDm.edge.count({
        where: {
          publicationcode,
          issuenumber,
        },
      })) > 0;
    callback(model && modelIsPublished ? model : null);
  });
};
