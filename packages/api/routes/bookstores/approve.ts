import { prismaDm } from "~/prisma";
import {
  bookstoreComment,
  user,
  userContributionType,
} from "~prisma-schemas/client_dm";
import { ExpressCall } from "~routes/_express-call";

export const post = async (
  ...[req, res]: ExpressCall<{ reqBody: { id: number } }>
) => {
  let bookstoreComment;
  try {
    bookstoreComment = await prismaDm.bookstoreComment.findUniqueOrThrow({
      where: {
        id: req.body.id,
      },
    });
  } catch (e) {
    res.writeHead(400);
    res.end(`Invalid bookstore comment ID: ${req.body.id}`);
    return;
  }
  await prismaDm.bookstoreComment.update({
    data: {
      isActive: true,
      creationDate: new Date(),
    },
    where: {
      id: bookstoreComment.id,
    },
  });
  const user = await prismaDm.user.findUniqueOrThrow({
    where: {
      id: req.user!.id,
    },
  });
  await persistContribution(user, 1, bookstoreComment);
};

const persistContribution = async (
  user: user,
  newPoints: number,
  bookstoreComment: bookstoreComment
) => {
  const currentUserPoints = (
    await prismaDm.userContribution.aggregate({
      _sum: {
        newPoints: true,
      },
      where: {
        userId: user.id,
        contribution: userContributionType.duckhunter,
      },
    })
  )._sum.newPoints;

  await prismaDm.userContribution.create({
    data: {
      userId: user.id,
      contribution: userContributionType.duckhunter,
      date: new Date(),
      newPoints: newPoints,
      totalPoints: (currentUserPoints || 0) + newPoints,
      isEmailSent: false,
      bookstoreCommentId: bookstoreComment.id,
    },
  });
};
