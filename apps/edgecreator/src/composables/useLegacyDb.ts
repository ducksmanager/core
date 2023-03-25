import { LegacyComponent } from "~/types/LegacyComponent";

import { EdgeDimensions } from "./useDimensions";

const { resolveIssueNumberTemplate } = useTextTemplate();

const componentToHex = (c: number) => {
  const hex = c.toString(16);
  return hex.length === 1 ? "0" + hex : hex;
};
const rgbToHex = (color: string) => {
  if (!color.includes(",")) {
    return `#${color}`;
  }
  const [r, g, b] = color.split(/, ?/).map((component) => parseInt(component));
  return `#${componentToHex(r)}${componentToHex(g)}${componentToHex(b)}`;
};

export default () => {
  const getImageSize = (url: string): Promise<EdgeDimensions> =>
    new Promise((resolve, reject) => {
      const img = new Image();
      img.src = url;
      img.onload = function () {
        resolve({ width: img.width, height: img.height });
      };
      img.onerror = reject;
    });
  const validateOptions = (
    optionNames: string[],
    options: { [optionName: string]: any }
  ) => {
    for (const requiredOption of optionNames) {
      if (options[requiredOption] === undefined) {
        throw new Error("Required option not found: " + requiredOption);
      }
    }
  };
  const getOptionsFromDb = async (
    publicationcode: string,
    issuenumber: string,
    stepNumber: number,
    { component: targetComponent, options: dbOptions }: LegacyComponent,
    edgeDimensions: EdgeDimensions,
    calculateBase64 = true
  ) => {
    switch (targetComponent) {
      case "ArcCircle": {
        validateOptions(
          [
            "Rempli",
            "Pos_x_centre",
            "Pos_y_centre",
            "Largeur",
            "Hauteur",
            "Couleur",
          ],
          dbOptions
        );
        const filled = dbOptions.Rempli === "Oui";

        return {
          cx: dbOptions.Pos_x_centre,
          cy: dbOptions.Pos_y_centre,
          rx: dbOptions.Largeur / 2,
          ry: dbOptions.Hauteur / 2,
          fill: filled ? rgbToHex(dbOptions.Couleur) : "transparent",
          stroke: filled ? "transparent" : rgbToHex(dbOptions.Couleur),
        };
      }
      case "Fill": {
        validateOptions(["Pos_x", "Pos_y", "Couleur"], dbOptions);
        if (parseFloat(dbOptions.Pos_x) !== 0) {
          console.error(
            `Step ${stepNumber}: Pos_x !== 0, this is not supported`
          );
        }
        if (parseFloat(dbOptions.Pos_y) !== 0) {
          console.error(
            `Step ${stepNumber}: Pos_y !== 0, this is not supported`
          );
        }
        return {
          fill: rgbToHex(dbOptions.Couleur),
        };
      }
      case "Gradient": {
        validateOptions(
          [
            "Pos_x_debut",
            "Pos_y_debut",
            "Pos_x_fin",
            "Pos_y_fin",
            "Couleur_debut",
            "Couleur_fin",
            "Sens",
          ],
          dbOptions
        );
        return {
          x: dbOptions.Pos_x_debut,
          y: dbOptions.Pos_y_debut,
          width: dbOptions.Pos_x_fin - dbOptions.Pos_x_debut,
          height: dbOptions.Pos_y_fin - dbOptions.Pos_y_debut,
          colorStart: rgbToHex(dbOptions.Couleur_debut),
          colorEnd: rgbToHex(dbOptions.Couleur_fin),
          direction: dbOptions.Sens,
        };
      }
      case "Image": {
        const [country] = publicationcode.split("/");
        validateOptions(
          [
            "Source",
            "Position",
            "Decalage_x",
            "Decalage_y",
            "Compression_x",
            "Compression_y",
          ],
          dbOptions
        );
        try {
          const elementPath = `${country}/elements/${resolveIssueNumberTemplate(
            dbOptions.Source,
            issuenumber
          )}`;

          const image = calculateBase64
            ? useFetch<{
                dimensions: EdgeDimensions;
                url?: string;
                base64?: string;
              }>(`/fs/base64?${elementPath}`).data.value
            : { dimensions: await getImageSize(`/edges/${elementPath}`) };

          const embeddedImageHeight =
            edgeDimensions.width *
            (image!.dimensions.height / image!.dimensions.width);
          const fromBottom = dbOptions.Position === "bas";
          return {
            src: dbOptions.Source,
            x: dbOptions.Decalage_x || 0,
            y: fromBottom
              ? edgeDimensions.height -
                embeddedImageHeight -
                (dbOptions.Decalage_y || 0)
              : dbOptions.Decalage_y || 0,
            width: (dbOptions.Compression_x || 1) * edgeDimensions.width,
            height: (dbOptions.Compression_y || 1) * embeddedImageHeight,
          };
        } catch (e) {
          console.error(`Image could not be retrieved : ${dbOptions.Source}`);
          return {
            x: 0,
            y: 0,
            width: 20,
            height: 20,
            src: dbOptions.Source,
          };
        }
      }
      case "Polygon": {
        validateOptions(["X", "Y", "Couleur"], dbOptions);
        const x = dbOptions.X.split(",");
        const y = dbOptions.Y.split(",");
        return {
          points: x.map((x, i) => [x, y[i]]),
          fill: rgbToHex(dbOptions.Couleur),
        };
      }
      case "Rectangle": {
        validateOptions(
          [
            "Rempli",
            "Pos_x_debut",
            "Pos_y_debut",
            "Pos_x_fin",
            "Pos_y_fin",
            "Couleur",
          ],
          dbOptions
        );
        const filled = dbOptions.Rempli === "Oui";
        return {
          x: dbOptions.Pos_x_debut,
          y: dbOptions.Pos_y_debut,
          width: dbOptions.Pos_x_fin - dbOptions.Pos_x_debut,
          height: dbOptions.Pos_y_fin - dbOptions.Pos_y_debut,
          fill: filled ? rgbToHex(dbOptions.Couleur) : "transparent",
          stroke: filled ? "transparent" : rgbToHex(dbOptions.Couleur),
        };
      }
      case "Staple": {
        validateOptions(["Y1", "Y2", "Taille_agrafe"], dbOptions);
        return {
          y1: dbOptions.Y1,
          y2: dbOptions.Y2,
          height: dbOptions.Taille_agrafe,
        };
      }
      case "Text": {
        validateOptions(
          [
            "Pos_x",
            "Pos_y",
            "Couleur_texte",
            "Couleur_fond",
            "Chaine",
            "Largeur",
            "Rotation",
            "Demi_hauteur",
            "Compression_x",
            "Compression_y",
          ],
          dbOptions
        );
        let legacyRotation = Math.round(parseFloat(dbOptions.Rotation));
        if (legacyRotation < 0) {
          legacyRotation += 360;
        }
        return {
          x: parseFloat(dbOptions.Pos_x),
          y: parseFloat(dbOptions.Pos_y),
          fgColor: rgbToHex(dbOptions.Couleur_texte),
          bgColor: rgbToHex(dbOptions.Couleur_fond),
          font: dbOptions.URL.replace(/\./g, "/"),
          text: dbOptions.Chaine,
          internalWidth: parseFloat(dbOptions.Largeur),
          rotation: 360 - legacyRotation,
          isHalfHeight: dbOptions.Demi_hauteur === "Oui",
          widthCompression:
            (dbOptions.Compression_x && parseFloat(dbOptions.Compression_x)) ||
            1,
          heightCompression:
            (dbOptions.Compression_y && parseFloat(dbOptions.Compression_y)) ||
            1,
        };
      }
    }
  };

  return {
    getImageSize,
    validateOptions,
    getOptionsFromDb,
  };
};
