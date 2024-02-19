import { PrismaClient } from '@prisma/client';

type Global = typeof globalThis & {
	prisma?: PrismaClient;
};

const prismaInstance: PrismaClient = (global as Global).prisma || new PrismaClient();

if (process.env.NODE_ENV === `development`) {
	(global as Global).prisma = prismaInstance;
}

export const prisma = prismaInstance;

export { $Enums } from '@prisma/client';
