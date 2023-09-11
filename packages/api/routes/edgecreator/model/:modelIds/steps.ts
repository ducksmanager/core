import { prismaEdgeCreator } from "~/prisma";
import { ExpressCall } from "~routes/_express-call";
import { ModelSteps } from "~dm-types/ModelSteps";

export const get = async (
  ...[req, res]: ExpressCall<{
    resBody: ModelSteps;
    params: { modelIds: string };
  }>
) =>
  res.json(
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
        where model.ID IN (${req.params.modelIds})
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
