'use server';

import { Chat } from '@prisma/client';
import { revalidatePath } from 'next/cache';

import { prisma } from './prisma';

export const createChatForUser = async ({ id, userId }: { id?: string; userId: string }): Promise<Chat> => {
	const result = await prisma.chat.create({
		data: {
			id,
			messages: JSON.stringify([]),
			name: `Новый чат`,
			userId,
		},
	});

	revalidatePath(`/`);

	return result;
};
