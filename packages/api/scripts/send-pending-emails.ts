import dotenv from "dotenv";

dotenv.config({
  path: "../.env",
});

import BookstoreApproved from "~/emails/bookstore-approved";
import EdgesPublishedWithCreator from "~/emails/edges-published-with-creator";
import EdgesPublishedWithPhotographer from "~/emails/edges-published-with-photographer";
import type { Email } from "~/emails/email";
import type { userContribution } from "~prisma-clients/schemas/dm";
import { prismaClient as prismaDmClient, userContributionType } from "~prisma-clients/schemas/dm";
const medalLevels = {
  [userContributionType.photographe]: { 1: 50, 2: 150, 3: 600 },
  [userContributionType.createur]: { 1: 20, 2: 70, 3: 150 },
  [userContributionType.duckhunter]: { 1: 1, 2: 3, 3: 5 },
} as const;

(async () => {
  const emailPromises: Promise<Email>[] = [];
  for (const contributionTypeStr in medalLevels) {
    const contributionType = contributionTypeStr as userContributionType;
    const pendingEmailContributionsForType =
      await prismaDmClient.userContribution.findMany({
        where: {
          contribution: contributionType,
          isEmailSent: false,
        },
        orderBy: [
          {
            userId: "asc",
          },
          {
            totalPoints: "asc",
          },
        ],
      });
    if (!pendingEmailContributionsForType.length) {
      console.info(`No email to send for contribution ${contributionType}`);
    } else {
      const pendingEmailContributionsByUser =
        pendingEmailContributionsForType.reduce<
          Record<number, userContribution[]>
        >(
          (acc, contribution) => ({
            ...acc,
            [contribution.userId]: [
              ...(acc[contribution.userId] || []),
              contribution,
            ],
          }),
          {},
        );

      for (const [userId, pendingEmailContributionsForUser] of Object.entries(
        pendingEmailContributionsByUser,
      )) {
        console.info(
          `${pendingEmailContributionsForUser.length} contributions pending for user ${userId}`,
        );
        const initialPointsCount =
          pendingEmailContributionsForUser[0].totalPoints -
          pendingEmailContributionsForUser[0].newPoints;
        const finalPointsCount =
          pendingEmailContributionsForUser[
            pendingEmailContributionsForUser.length - 1
          ].totalPoints;
        const pointsEarned = finalPointsCount - initialPointsCount;

        const medalReached = Object.entries(
          medalLevels[contributionType],
        ).reduce(
          (medalReached, [medal, medalThreshold]) =>
            initialPointsCount < medalThreshold &&
              finalPointsCount >= medalThreshold
              ? parseInt(medal)
              : medalReached,
          null as number | null,
        );

        await prismaDmClient.$transaction(
          pendingEmailContributionsForUser.map(({ id }) =>
            prismaDmClient.userContribution.update({
              where: {
                id,
              },
              data: {
                isEmailSent: true,
              },
            }),
          ),
        );

        const user = await prismaDmClient.user.findUniqueOrThrow({
          where: { id: parseInt(userId) },
        });

        const locale = "fr";
        let email: Email;
        switch (contributionType) {
          case "duckhunter":
            email = new BookstoreApproved({
              user,
              locale,
              newMedalLevel: medalReached,
            });
            break;
          case "photographe":
            email = new EdgesPublishedWithPhotographer({
              user,
              locale,
              extraEdges: pendingEmailContributionsForUser.length,
              extraPhotographerPoints: pointsEarned,
              newMedalLevel: medalReached,
            });
            break;
          case "createur":
            email = new EdgesPublishedWithCreator({
              user,
              locale,
              extraEdges: pendingEmailContributionsForUser.length,
              extraCreatorPoints: pointsEarned,
              newMedalLevel: medalReached,
            });
            break;
        }
        emailPromises.push(email.send().then(() => email));
      }
    }
  }
  console.log(
    JSON.stringify({
      emails_sent: (await Promise.all(emailPromises)).map((email) => ({
        to: email.getTo(),
        subject: email.getSubject(),
      })),
    }),
  );
})();
