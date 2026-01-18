import type { SimpleBookstore } from "~dm-types/SimpleBookstore";

export const isAllowedToCreateBookstoreComment = (userId: number, bookstore: SimpleBookstore) =>
    ! bookstore.comments
      .filter((comment) => comment.userId === userId)
      .some((comment) => comment.creationDate && (
        typeof comment.creationDate === "string"
            ? new Date(comment.creationDate)
            : comment.creationDate
        ) > new Date(Date.now() - 1000 * 60 * 60 * 24 * 180 /* 180 days */)
    );
  