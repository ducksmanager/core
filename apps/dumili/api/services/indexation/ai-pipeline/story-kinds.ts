import { getEntryPages } from "~dumili-utils/entryPages";
import prisma from "~prisma/client";
import type { aiKumikoResult } from "~prisma/client_dumili/client";

import type { IndexationAiContext } from "../context";

export const setInferredEntriesStoryKinds = async (
  { indexation, events }: IndexationAiContext
) => {
  for (const entry of indexation.entries) {
    if (
      entry.storyKindSuggestions.some(
        ({ aiKumikoResultId }) => aiKumikoResultId,
      )
    ) {
      console.log(
        `Entry starting at page ${entry.position}: already has an inferred story kind`,
      );
      continue;
    }

    events.reportSetInferredEntryStoryKind(entry.id);
    const pagesInferredStoryKinds = await prisma.image.findMany({
      include: {
        aiKumikoResult: true,
      },
      where: {
        id: {
          in: getEntryPages(indexation, entry.id)
            .filter(({ imageId }) => !!imageId)
            .map(({ imageId }) => imageId!),
        },
      },
    });

    if (!pagesInferredStoryKinds.length) {
      console.log(
        `Entry starting at page ${entry.position}: No pages with inferred story kinds found`,
      );
    } else {
      const mostInferredStoryKind = Object.entries(
        (
          pagesInferredStoryKinds.filter(
            ({ aiKumikoResult }) => aiKumikoResult !== null,
          ) as { aiKumikoResult: aiKumikoResult }[]
        )
          .map(({ aiKumikoResult: { id, inferredStoryKindRowsStr } }) => ({
            id,
            inferredStoryKindRowsStr,
          }))
          .groupBy("inferredStoryKindRowsStr", "id[]"),
      ).sort((a, b) => b[1].length - a[1].length)[0][0];

      const entryIdx = indexation.entries.findIndex(
        ({ id }) => id === entry.id,
      );
      console.log(
        `Kumiko: entry #${entryIdx}: inferred story kind and number of rows are ${mostInferredStoryKind}`,
      );

      if (mostInferredStoryKind) {
        const suggestion = indexation.entries[
          entryIdx
        ].storyKindSuggestions.find(
          ({ storyKindRowsStr }) => storyKindRowsStr === mostInferredStoryKind,
        );
        if (suggestion) {
          await prisma.entry.update({
            data: {
              storyKindSuggestions: {
                update: {
                  data: {
                    aiKumikoResultId: pagesInferredStoryKinds.find(
                      ({ aiKumikoResult }) =>
                        aiKumikoResult?.inferredStoryKindRowsStr ===
                        mostInferredStoryKind,
                    )?.aiKumikoResultId,
                  },
                  where: {
                    id: suggestion.id,
                  },
                },
              },
            },
            where: {
              id: entry.id,
            },
          });
          if (!entry.acceptedStoryKindSuggestionId) {
            await prisma.entry.update({
              data: {
                acceptedStoryKindSuggestionId: suggestion.id,
              },
              where: {
                id: entry.id,
              },
            });
          }
        } else {
          console.warn(
            `Entry starting at page ${entry.position}: no inferred story kind and number of rows found`,
          );
        }
      }
    }

    events.reportSetInferredEntryStoryKindEnd(entry.id);
  }
};
