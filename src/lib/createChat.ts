import { Chat } from '@prisma/client';
import { cookies } from 'next/headers';

import { prisma } from './prisma';

export const createChatForUser = async ({ id, userId }: { id?: string; userId: string }): Promise<Chat> =>
	prisma.chat.create({
		data: {
			id,
			messages: JSON.stringify({}),
			name: `Новый чат`,
			userId,
		},
	});
