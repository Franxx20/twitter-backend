import { Visibility } from '@prisma/client';
import { db } from '@utils/database';

export async function isUserPublicOrFollowed(followerID: string, followedID: string): Promise<boolean> {
  const author = await db.user.findUnique({
    where: {
      id: followedID,
    },
  });

  if (!author) return false;

  if (author.visibility === Visibility.PUBLIC) return true;

  if (author.visibility === Visibility.HIDDEN) return false;

  const follow = await db.follow.findFirst({
    where: {
      followerId: followerID,
      followedId: followedID,
    },
  });

  return follow !== null;
}

export async function isUserFollowed(followerID: string, followedID: string): Promise<boolean> {
  const follow = await db.follow.findFirst({
    where: {
      followerId: followerID,
      followedId: followedID,
    },
  });
  return follow !== null;
}
