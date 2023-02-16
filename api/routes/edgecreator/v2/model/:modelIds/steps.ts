import { PrismaClient } from "~prisma_clients/client_dm";
import { ExpressCall } from "~routes/_express-call";
import { ModelSteps } from "~types/ModelSteps";

const prisma = new PrismaClient();

export const get = async (
  ...[req, res]: ExpressCall<ModelSteps, { modelIds: string }>
) =>
  res.json(
    (
      (await prisma.$queryRaw`
                select model.numero AS issuenumber,
                       optionValue.ordre AS stepNumber,
                       optionValue.Nom_fonction AS functionName,
                       concat('{',
                              group_concat(concat('"', optionValue.Option_nom, '": ', '"', optionValue.Option_valeur,
                                                  '"')), '}') AS options
                from tranches_en_cours_valeurs optionValue
                         inner join tranches_en_cours_modeles model on optionValue.ID_Modele = model.ID
                where model.ID IN (${req.params.modelIds.split(",")})
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
