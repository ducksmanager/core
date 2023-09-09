import { prismaDm } from "~/prisma";
import { ExpressCall } from "~routes/_express-call";
import { ImageElement } from "~types/ImageElement";

export const get = async (
  ...[req]: ExpressCall<{
    resBody: ImageElement[];
    params: { filename: string };
  }>
) =>
  (
    (await prismaDm.$queryRaw`
    SELECT Pays AS country, Magazine AS magazine, Option_valeur AS optionValue, Numero_debut AS issuenumberStart, Numero_fin AS issuenumberEnd
    FROM edgecreator_valeurs valeurs
      INNER JOIN edgecreator_modeles2 modeles ON valeurs.ID_Option = modeles.ID
      INNER JOIN edgecreator_intervalles intervalles ON valeurs.ID = intervalles.ID_Valeur
    WHERE Nom_fonction = 'Image' AND Option_nom = 'Source' AND (Option_valeur = '${req.params.filename}' OR (Option_valeur LIKE '%[Numero]%' AND Option_valeur LIKE '%.png'))
    GROUP BY Pays, Magazine, Ordre, Option_nom, Numero_debut, Numero_fin
    UNION
    SELECT Pays AS country, Magazine AS magazine, Option_valeur AS optionValue, Numero AS issuenumberStart, Numero AS issuenumberEnd
    FROM tranches_en_cours_modeles modeles
      INNER JOIN tranches_en_cours_valeurs valeurs ON modeles.ID = valeurs.ID_Modele
    WHERE Nom_fonction = 'Image' AND Option_nom = 'Source' AND (Option_valeur = '${req.params.filename}' OR (Option_valeur LIKE '%[Numero]%' AND Option_valeur LIKE '%.png'))
  `) as ImageElement[]
  ).filter(({ optionValue }) =>
    optionValue
      .split(/\[[^]]+]/)
      .every((stringChunk) => req.params.filename.indexOf(stringChunk) > -1)
  );
