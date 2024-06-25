'use server';

import { ChatMessage } from '@ant-design/pro-chat';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import OpenAI from 'openai';
import type { ChatCompletionMessageParam } from 'openai/resources/chat/completions';

import { prisma } from './prisma';

export const saveChat = async (messages: ChatMessage[], chatId: string, apiKey: string): Promise<void> => {
	const userId = cookies().get(`userId`);

	if (!userId) {
		throw new Error(`No userId`);
	}

	const openai = new OpenAI({
		apiKey,
	});

	if (Object.values(messages).length === 4) {
		const preparedMessages = Object.values(messages).map(
			message =>
				({
					content: String(message.content),
					role: message.role,
					name: message.name ?? message.role,
				}) as ChatCompletionMessageParam,
		);

		const name = await openai.chat.completions.create({
			model: `gpt-4-turbo-preview`,
			messages: [
				...preparedMessages,
				{
					content: `Дай название этому чату из двух-трех слов`,
					role: `user`,
					name: `user`,
				},
			],
		});

		const newName = name.choices[0].message.content;

		if (!newName) {
			return;
		}

		await prisma.chat.update({
			where: {
				id: chatId,
				userId: userId.value,
			},
			data: {
				name: newName,
			},
		});
	}

	await prisma.chat.update({
		where: {
			id: chatId,
			userId: userId.value,
		},
		data: {
			messages: JSON.stringify(messages),
		},
	});

	revalidatePath(`/`);
};
