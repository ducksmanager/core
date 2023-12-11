import dotenv from "dotenv";

dotenv.config({
  path: "../.env",
});

import BookstoreApproved from "~/emails/bookstore-approved";
import EdgesPublishedWithCreator from "~/emails/edges-published-with-creator";
import EdgesPublishedWithPhotographer from "~/emails/edges-published-with-photographer";
import { Email } from "~/emails/email";
import {
  PrismaClient,
  userContribution,
  userContributionType,
} from "~prisma-clients/client_dm";
const prismaDmClient = new PrismaClient();
const medalLevels = {
  [userContributionType.photographe]: [50, 150, 600],
  [userContributionType.createur]: [20, 70, 150],
  [userContributionType.duckhunter]: [1, 3, 5],
} as const;

const emailsSent = [];
for (const contributionTypeStr in medalLevels) {
  const contributionType = contributionTypeStr as userContributionType;
  const pendingEmailContributionsForType =
    await prismaDmClient.userContribution.findMany({
      where: {
        contribution: contributionType,
        isEmailSent: false,
      },
      orderBy: {
        userId: "asc",
        totalPoints: "asc",
      },
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
        {}
      );

    for (const [userId, pendingEmailContributionsForUser] of Object.entries(
      pendingEmailContributionsByUser
    )) {
      console.info(
        `${pendingEmailContributionsForUser.length} contributions pending for user ${userId}`
      );
      const initialPointsCount =
        pendingEmailContributionsForUser[0].totalPoints -
        pendingEmailContributionsForUser[0].newPoints;
      const finalPointsCount =
        pendingEmailContributionsForUser[
          pendingEmailContributionsForUser.length - 1
        ].totalPoints;
      const pointsEarned = finalPointsCount - initialPointsCount;

      const medalReached = medalLevels[contributionType].reduce(
        (medalReached, medalThreshold, medal) =>
          initialPointsCount < medalThreshold &&
          finalPointsCount >= medalThreshold
            ? medal + 1
            : medalReached,
        null as number | null
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
          })
        )
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
      emailsSent.push(email);
      email.send();
    }
  }
}
console.log(
  JSON.stringify({
    emailsSent: emailsSent.map((emailHelper) => ({
      to: emailHelper.getTo(),
      subject: emailHelper.getSubject(),
    })),
  })
);
