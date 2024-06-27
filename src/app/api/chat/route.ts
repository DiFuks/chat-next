import { ChatMessage } from '@ant-design/pro-chat';
import { OpenAIStream, StreamingTextResponse } from 'ai';
import { sum } from 'lodash';
import OpenAI from 'openai';
import type { ChatCompletionMessageParam } from 'openai/resources/chat/completions';

import { downloadFile } from '../../../lib/downloadFile';

import { $Enums, prisma } from '@/lib/prisma';

export const POST = async (request: Request): Promise<Response> => {
	const { messages, apiKey, isGenerateImage, translator } = (await request.json()) as {
		messages: ChatMessage[];
		apiKey: string;
		isGenerateImage?: boolean;
		translator?: string | false;
	};
	const openai = new OpenAI({
		apiKey,
	});
	const preparedMessages = messages.map(
		message =>
			({
				content: String(message.content),
				role: message.role,
				name: message.name ?? message.role,
			}) as ChatCompletionMessageParam,
	);

	if (translator) {
		const lastMessage = preparedMessages[preparedMessages.length - 1];
		const messagesWithoutLast = preparedMessages.slice(0, -1);

		const response = await openai.chat.completions.create({
			model: `gpt-4-turbo-preview`,
			stream: true,
			messages: [
				...messagesWithoutLast,
				{ ...lastMessage, content: `Переведи на ${translator}: ${String(lastMessage.content)}` },
			],
		});

		const stream = OpenAIStream(response);

		return new StreamingTextResponse(stream);
	}

	if (isGenerateImage) {
		const prompt = preparedMessages.map(message => `${message.role}: ${String(message.content)}`).join(`\n`);

		const chatCompletionMessageParams: ChatCompletionMessageParam[] = [
			{
				content: `Проанализируй диалог и дай краткое текстовое описание для изображения, которое будет сгенерировано на его основе. Пользователь пришлет диалог в следующем сообщении`,
				role: `system`,
			},
			{
				content: prompt,
				role: `user`,
			},
		];
		const preparedMessagesLength = sum(chatCompletionMessageParams.map(message => String(message.content).length));

		await prisma.statistic.create({
			data: {
				type: $Enums.StatisticType.MESSAGE_IMAGE_DESCRIPTION,
				apiKey: apiKey.slice(-4),
				length: preparedMessagesLength,
			},
		});
		const shortImageDescriptionResponse = await openai.chat.completions.create({
			model: `gpt-4-turbo-preview`,
			messages: chatCompletionMessageParams,
		});

		console.log(`Check image question`, shortImageDescriptionResponse.choices[0].message.content);

		const shortImageDescription = shortImageDescriptionResponse.choices[0].message.content;

		if (!shortImageDescription) {
			return new Response(`Не удалось сгенерировать изображение`);
		}
		const preparedShortImageDescription = shortImageDescription.slice(-4000);

		await prisma.statistic.create({
			data: {
				type: $Enums.StatisticType.IMAGE,
				apiKey: apiKey.slice(-4),
				length: preparedShortImageDescription.length,
			},
		});
		const image = await openai.images.generate({
			model: `dall-e-3`,
			prompt: shortImageDescription.slice(-4000),
			response_format: `url`,
		});

		const imageJSON = image.data[0].url;

		if (!imageJSON) {
			return new Response(`Не удалось сгенерировать изображение`);
		}

		const response = await downloadFile(imageJSON);

		console.log(`Image prompt:`, image.data[0].revised_prompt);

		return new Response(`![${image.data[0].revised_prompt}](/images/${response})`);
	}

	await prisma.statistic.create({
		data: {
			type: $Enums.StatisticType.MESSAGE,
			apiKey: apiKey.slice(-4),
			length: sum(preparedMessages.map(message => String(message.content).length)),
		},
	});
	const response = await openai.chat.completions.create({
		model: `gpt-4-turbo-preview`,
		stream: true,
		messages: preparedMessages,
	});

	const stream = OpenAIStream(response);

	return new StreamingTextResponse(stream);
};
