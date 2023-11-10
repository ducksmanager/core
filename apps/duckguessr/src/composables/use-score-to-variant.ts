import { roundScore } from "~types/prisma-client";
import { OngoingRoundScore } from "~types/roundWithScoresAndAuthor";

export const useScoreToVariant = (
  roundScore: roundScore | OngoingRoundScore | null
) => {
  switch (roundScore?.scoreTypeName) {
    case null:
    case undefined:
      return "warning";
    case "Correct author":
      return "success";
    default:
      return "danger";
  }
};
