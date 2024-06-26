import { Prisma } from '@prisma/client';
import { cookies } from 'next/headers';

import { prisma } from './prisma';
import ChatGetPayload = Prisma.ChatGetPayload;
import { createChatForUser } from './createChat';

interface Result {
	userId: string;
	chats: ChatGetPayload<{ select: { id: true; name: true } }>[];
	activeChat: ChatGetPayload<false>;
}

export const getUser = async ({ chatId }: { chatId?: string }): Promise<Result> => {
	const userId = cookies().get(`userId`);

	if (!userId) {
		throw new Error(`User not found`);
	}

	const activeUser = await prisma.user.findUnique({
		where: {
			id: userId.value,
		},
	});

	if (!activeUser) {
		await prisma.user.create({
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
		});
	}

	const existsChats = await prisma.chat.findMany({
		where: {
			user: {
				id: userId.value,
			},
		},
		select: {
			id: true,
			name: true,
		},
		orderBy: {
			createdAt: `asc`,
		},
	});

	if (existsChats.length === 0) {
		const newChat = await createChatForUser({ id: chatId, userId: userId.value });

		return { userId: userId.value, chats: [newChat], activeChat: newChat };
	}

	const activeChatId = chatId || existsChats[0].id;

	const activeChat = await prisma.chat.findUnique({
		where: {
			id: activeChatId,
		},
	});

	if (!activeChat) {
		const firstChat = await prisma.chat.findUnique({
			where: {
				id: existsChats[0].id,
			},
		});

		if (!firstChat) {
			throw new Error(`Chat not found`);
		}

		return { userId: userId.value, chats: existsChats, activeChat: firstChat };
	}

	return { userId: userId.value, chats: existsChats, activeChat };
};
