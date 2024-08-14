import dotenv from "dotenv";

dotenv.config({
  path: "../.env",
});

import PushNotifications from "@pusher/push-notifications-server";
import dayjs from "dayjs";

import { i18n } from "~/emails/email";
import { augmentIssueArrayWithInducksData } from "~/services/coa";
import { prismaClient as prismaCoa } from "~prisma-schemas/schemas/coa/client";
import type { user } from "~prisma-schemas/schemas/dm";
import { prismaClient as prismaDm } from "~prisma-schemas/schemas/dm/client";
import {
  COUNTRY_CODE_OPTION,
  getSuggestions,
} from "~services/stats/suggestions";

const suggestionsSince = dayjs().add(-7, "days");
let notificationsSent = 0;

const sendSuggestedIssueNotification = async (
  issuecode: string,
  issueTitle: string,
  storyCountPerAuthor: { [personcode: string]: number },
  userToNotify: user,
) => {
  const pusher = new PushNotifications({
    instanceId: process.env.PUSHER_INSTANCE_ID!,
    secretKey: process.env.PUSHER_SECRET_KEY!,
  });

  const notificationContent = {
    title: i18n.__("{{issueTitle}} est sorti !", {
      issueTitle,
    }),
    body: Object.keys(storyCountPerAuthor)
      .map((authorName) =>
        i18n.__(
          storyCountPerAuthor[authorName] === 1
            ? "• 1 nouvelle histoire de {{authorName}}"
            : "• {{newStoriesNumber}} nouvelles histoires de {{authorName}}",
          {
            authorName,
            newStoriesNumber: `${storyCountPerAuthor[authorName]}`,
          },
        ),
      )
      .join(""),
  };
  await pusher.publishToUsers([userToNotify.username], {
    fcm: {
      notification: notificationContent,
    },
    apns: {
      aps: {
        alert: notificationContent,
      },
    },
  });
  console.log(
    `Notification sent to user ${userToNotify.username} concerning the release of issue ${issueTitle}`,
  );
  await prismaDm.userSuggestionNotification.create({
    data: {
      issuecode,
      text: issueTitle,
      userId: userToNotify.id,
      date: new Date(),
    },
  });
};

getSuggestions(
  suggestionsSince.toDate(),
  COUNTRY_CODE_OPTION.countries_to_notify,
  "score",
  null,
  null,
  false,
).then(async ({ suggestionsPerUser, authors }) => {
  const usersById = (await prismaDm.user.findMany()).groupBy("id");

  const allSuggestedIssues = [
    ...new Set(
      Object.values(suggestionsPerUser).reduce<string[]>(
        (acc, suggestion) => [
          ...acc,
          ...Object.values(suggestion.issues).map((issue) => issue.issuecode),
        ],
        [],
      ),
    ),
  ];

  const alreadySentNotificationsPerUser = (
    await prismaDm.userSuggestionNotification.findMany({
      where: {
        issuecode: {
          in: allSuggestedIssues,
        },
      },
    })
  ).reduce<{ [userId: number]: string[] }>(
    (acc, notification) => ({
      [notification.userId]: [
        ...new Set(...(acc[notification.userId] || []), notification.issuecode),
      ],
    }),
    {},
  );

  for (const [userId, suggestionsForUser] of Object.entries(
    suggestionsPerUser,
  )) {
    const userIdNumber = parseInt(userId);
    const pendingNotificationsForUser = await augmentIssueArrayWithInducksData(
      Object.values(suggestionsForUser.issues).filter(
        (suggestion) =>
          !alreadySentNotificationsPerUser[userIdNumber] ||
          !alreadySentNotificationsPerUser[userIdNumber].includes(
            suggestion.issuecode,
          ),
      ),
    );

    console.log(
      `${pendingNotificationsForUser.length} new issue(s) will be suggested to user ${userId}`,
    );
    console.log(
      `${
        Object.values(suggestionsForUser.issues).length -
        pendingNotificationsForUser.length
      } issue(s) have already been suggested to user ${userId}`,
    );

    const publicationTitles = (
      await prismaCoa.inducks_publication.findMany({
        where: {
          publicationcode: {
            in: [
              ...new Set(
                pendingNotificationsForUser.map(
                  ({ publicationcode }) => publicationcode,
                ),
              ),
            ],
          },
        },
      })
    ).groupBy("publicationcode");

    for (const suggestedIssue of pendingNotificationsForUser) {
      const issueTitle = `${
        publicationTitles[suggestedIssue.publicationcode]
      } ${suggestedIssue.issuenumber}`;

      const storyCountPerAuthor = Object.keys(suggestedIssue.stories).reduce(
        (acc, personcode) => ({
          ...acc,
          [authors[personcode]]: suggestedIssue.stories[personcode].length,
        }),
        {},
      );
      try {
        await sendSuggestedIssueNotification(
          suggestedIssue.issuecode,
          issueTitle,
          storyCountPerAuthor,
          usersById[userIdNumber],
        );
        notificationsSent++;
      } catch (e) {
        console.log(e);
      }
    }
  }
  console.log(`${notificationsSent} notification(s) sent.`);
  process.exit(0);
});
