/* eslint-disable prefer-const */
import { PrismaClient } from '@prisma/client';

declare global {
    // eslint-disable-next-line no-var
    var prisma: PrismaClient | undefined;
}

// Use this if you want to log the queries
// export const prisma = global.prisma || new PrismaClient({ log: ['query'] });
export const prisma = global.prisma || new PrismaClient();

if (process.env.NODE_ENV !== 'production') global.prisma = prisma;
