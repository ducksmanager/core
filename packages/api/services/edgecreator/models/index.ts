import type { ModelSteps } from "~dm-types/ModelSteps";
import { Prisma } from "~prisma-schemas/client_dm";
import { prismaClient as prismaDm } from "~prisma-schemas/schemas/dm/client";
import { prismaClient as prismaEdgeCreator } from "~prisma-schemas/schemas/edgecreator/client";

export default () => ({
  getModelsSteps: async (modelIds: number[]) =>
    prismaEdgeCreator.$queryRaw<
      {
        issuecode: string;
        stepNumber: number;
        functionName: string;
        options: string;
      }[]
    >`
          select model.issuecode,
                 optionValue.ordre AS stepNumber,
                 optionValue.Nom_fonction AS functionName,
                 concat('{',
                        group_concat(concat('"', optionValue.Option_nom, '": ', '"', optionValue.Option_valeur,
                                            '"')),
                        '}') AS options
          from tranches_en_cours_valeurs optionValue
                    inner join tranches_en_cours_modeles model on optionValue.ID_Modele = model.ID
          where model.ID IN (${Prisma.join(modelIds)})
          group by model.numero, optionValue.ordre
          order by optionValue.ordre
      `.then((steps) =>
      steps.reduce<ModelSteps>(
        (acc, { issuecode, stepNumber, functionName, options }) => {
          if (!acc[issuecode]) {
            acc[issuecode] = {};
          }
          if (!acc[issuecode][stepNumber]) {
            acc[issuecode][stepNumber] = {
              functionName,
              issuecode,
              stepNumber,
              options: {},
            };
          }
          Object.assign(
            acc[issuecode][stepNumber].options,
            JSON.parse(options),
          );
          return acc;
        },
        {},
      ),
    ),
  getModel: async (issuecode: string) => {
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
    return model && modelIsPublished ? model : null;
  },

  getModelMainPhoto: (modelId: number) =>
    prismaEdgeCreator.elementImage.findFirstOrThrow({
      select: {
        id: true,
        fileName: true,
      },
      where: {
        tranches_en_cours_modeles_images: {
          every: {
            modelId,
            isMainPhoto: true,
          },
        },
      },
    }),

  getModelContributors: (modelId: number) =>
    prismaEdgeCreator.edgeContributor.findMany({
      where: {
        modelId,
      },
    }),
});
