import { prismaDm, prismaEdgeCreator } from "~/prisma";
import { EdgeModel } from "~dm-types/EdgeModel";
import { ModelSteps } from "~dm-types/ModelSteps";
import { ExpressCall } from "~routes/_express-call";

import { Socket } from "../types";

export default (socket: Socket) => {
  socket.on("getUnassignedEdges", async (callback) => prismaEdgeCreator.edgeModel.findMany({
    select: {
      id: true,
      country: true,
      magazine: true,
      issuenumber: true,
      photos: {
        include: {
          elementImage: true,
        },
      },
      contributors: true,
    },
    where: {
      username: null,
      isActive: false,
    },
  }).then(callback))

  socket.on('getEdgesEditedByOthers', async (callback) => prismaEdgeCreator.edgeModel.findMany({
    select: {
      id: true,
      country: true,
      magazine: true,
      issuenumber: true,
    },
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
  }).then(callback))

  socket.on('getModelsSteps', async (modelIds, callback) => {
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
      ))
  })

  socket.on('getModel', async (publicationcode, issuenumber, callback) => {
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
  })
}

export const get = async (
  ...[req, res]: ExpressCall<{ resBody: EdgeModel[] }>
) =>
  res.json(
    (await prismaEdgeCreator.edgeModel.findMany({
      select: {
        id: true,
        country: true,
        magazine: true,
        issuenumber: true,
        username: true,
        photos: {
          include: {
            elementImage: true,
          },
        },
      },
      where: {
        isActive: true,
        OR: [
          {
            username: req.user!.username,
          },
          {
            contributors: {
              some: {
                userId: req.user!.id,
                contribution: "photographe",
              },
            },
          },
        ],
      },
    })) as EdgeModel[]
  );
