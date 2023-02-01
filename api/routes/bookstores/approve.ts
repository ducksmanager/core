import {
  bookstoreComment,
  PrismaClient,
  user,
  userContributionType,
} from "~prisma_clients/client_dm";
import { ExpressCall } from "~routes/_express-call";
import { Call } from "~types/Call";

const prisma = new PrismaClient();

export type postCall = Call<undefined, undefined, { id: number }>;
export const post = async (...[req, res]: ExpressCall<postCall>) => {
  let bookstoreComment;
  try {
    bookstoreComment = await prisma.bookstoreComment.findUniqueOrThrow({
      where: {
        id: req.body.id,
      },
    });
  } catch (e) {
    res.writeHead(400);
    res.end(`Invalid bookstore comment ID: ${req.body.id}`);
    return;
  }
  await prisma.bookstoreComment.update({
    data: {
      isActive: true,
      creationDate: new Date(),
    },
    where: {
      id: bookstoreComment.id,
    },
  });
  const user = await prisma.user.findUniqueOrThrow({
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
    await prisma.userContribution.aggregate({
      _sum: {
        newPoints: true,
      },
      where: {
        userId: user.id,
        contribution: userContributionType.duckhunter,
      },
    })
  )._sum.newPoints;

  await prisma.userContribution.create({
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
