import { PrismaClient } from "~prisma_clients/client_dm";
import { ExpressCall } from "~routes/_express-call";
import { EdgeModel } from "~types/EdgeModel";

const prisma = new PrismaClient();

export const get = async (
  ...[req, res]: ExpressCall<{ resBody: EdgeModel[] }>
) =>
  res.json(
    (await prisma.$queryRaw`
          select model.id,
                 model.pays AS country,
                 model.magazine,
                 model.numero AS issuenumber,
                 image.nomfichier as fileName,
                 model.username,
                 (IF(model.username = :username, 1, 0)) as isEditor
          from tranches_en_cours_modeles model
                   left join tranches_en_cours_contributeurs helperuser on model.ID = helperuser.ID_Modele
                   left join tranches_en_cours_modeles_images photo on model.ID = photo.ID_Modele
                   left join images_tranches image on photo.ID_Image = image.ID
          where model.Active = 1
              and model.username = ${req.user!.username}
             or helperuser.ID_Utilisateur = ${req.user!.id}
      `) as EdgeModel[]
  );
