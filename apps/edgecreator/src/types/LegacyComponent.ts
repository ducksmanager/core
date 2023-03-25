export type LegacyComponent =
  | {
      component: "ArcCircle";
      options: {
        Rempli: string;
        Pos_x_centre: number;
        Pos_y_centre: number;
        Largeur: number;
        Hauteur: number;
        Couleur: string;
      };
    }
  | {
      component: "Fill";
      options: { Pos_x: string; Pos_y: string; Couleur: string };
    }
  | {
      component: "Gradient";
      options: {
        Pos_x_debut: number;
        Pos_y_debut: number;
        Pos_x_fin: number;
        Pos_y_fin: number;
        Couleur_debut: string;
        Couleur_fin: string;
        Sens: string;
      };
    }
  | {
      component: "Image";
      options: {
        Source: string;
        Position: string;
        Decalage_x: number;
        Decalage_y: number;
        Compression_x: number;
        Compression_y: number;
      };
    }
  | {
      component: "Polygon";
      options: {
        X: string;
        Y: string;
        Couleur: string;
      };
    }
  | {
      component: "Rectangle";
      options: {
        Rempli: string;
        Pos_x_debut: number;
        Pos_y_debut: number;
        Pos_x_fin: number;
        Pos_y_fin: number;
        Couleur: string;
      };
    }
  | {
      component: "Staple";
      options: {
        Y1: number;
        Y2: number;
        Taille_agrafe: number;
      };
    }
  | {
      component: "Text";
      options: {
        Pos_x: string;
        Pos_y: string;
        Couleur_texte: string;
        Couleur_fond: string;
        Chaine: string;
        Largeur: string;
        Rotation: string;
        Demi_hauteur: string;
        Compression_x: string;
        Compression_y: string;
        URL: string;
      };
    };
