import { PrismaClient } from '@prisma/client';
// import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
// import { Constants, myS3 } from '@utils';

export const db = new PrismaClient();
