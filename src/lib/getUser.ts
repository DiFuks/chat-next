import { Prisma } from '@prisma/client';
import { cookies } from 'next/headers';

import { prisma } from './prisma';
import UserGetPayload = Prisma.UserGetPayload;
import { createChatForUser } from './createChat';

export const getUser = async ({
	chatId,
}: {
	chatId?: string;
}): Promise<UserGetPayload<{ include: { chats: true } }>> => {
	const userId = cookies().get(`userId`);

	if (!userId) {
		throw new Error(`User not found`);
	}

	const existsUser = await prisma.user.findUnique({
		where: {
			id: userId.value,
		},
		include: {
			chats: {
				orderBy: {
					createdAt: `asc`,
				},
			},
		},
	});

	if (existsUser && existsUser.chats.length === 0) {
		return prisma.user.update({
			where: {
				id: userId.value,
			},
			data: {
				chats: {
					create: [await createChatForUser({ id: chatId, userId: userId.value })],
				},
			},
			include: {
				chats: {
					orderBy: {
						createdAt: `asc`,
					},
				},
			},
		});
	}

	if (existsUser) {
		return existsUser;
	}

	return prisma.user.create({
		data: {
			id: userId.value,
			chats: {
				create: [
					{
						id: chatId,
						messages: JSON.stringify([]),
						name: `Новый чат`,
					},
				],
			},
		},
		include: {
			chats: {
				orderBy: {
					createdAt: `asc`,
				},
			},
		},
	});
};
