import { roundScore } from "~duckguessr-prisma-client";
import { OngoingRoundScore } from "~duckguessr-types/roundWithScoresAndAuthor";

export const useScoreToVariant = (
  roundScore: roundScore | OngoingRoundScore | null,
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
