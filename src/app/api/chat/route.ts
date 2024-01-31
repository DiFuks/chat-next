import { ChatMessage } from '@ant-design/pro-chat';
import { OpenAIStream, StreamingTextResponse } from 'ai';
import OpenAI from 'openai';
import type { ChatCompletionMessageParam } from 'openai/resources/chat/completions';

import { downloadFile } from '../../../lib/downloadFile';

export const POST = async (req: Request): Promise<Response> => {
	const { messages, apiKey } = (await req.json()) as { messages: ChatMessage[]; apiKey: string };
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

	const promt = preparedMessages.map(message => `${message.role}: ${String(message.content)}`).join(`\n`);

	const checkQuestionImageResponse = await openai.chat.completions.create({
		model: `gpt-4-turbo-preview`,
		messages: [
			{
				content: `Ты помогаешь анализировать диалог на наличие намерения сгенерировать изображение. Пользователь пришлет этот диалог`,
				role: `system`,
			},
			{
				content: `Ты отвечаешь только true/false`,
				role: `system`,
			},
			{
				content: `Когда в последнем сообщении обнаружится намерение сгенерировать изображение, ответь true. Во всех остальных случаях ответь false.`,
				role: `system`,
			},
			{
				content: `Если пользователь хочет нарисовать изображение, но не дал его описание - отвечай false. Отвечай true только если пользователь дал описание изображения.`,
				role: `system`,
			},
			{
				content: promt,
				role: `user`,
			},
		],
	});

	console.log(`Check image question`, checkQuestionImageResponse.choices[0].message.content);

	if (checkQuestionImageResponse.choices[0].message.content === `true`) {
		const image = await openai.images.generate({
			model: `dall-e-3`,
			prompt: preparedMessages.map(message => `${message.role}: ${String(message.content)}`).join(`\n`),
		});

		const imageUrl = image.data[0].url;

		if (!imageUrl) {
			return new Response(`Не удалось сгенерировать изображение`);
		}

		const response = await downloadFile(imageUrl);

		console.log(`Image prompt:`, image.data[0].revised_prompt);

		return new Response(`![${image.data[0].revised_prompt}](/images/${response})`);
	}

	const response = await openai.chat.completions.create({
		model: `gpt-4-turbo-preview`,
		stream: true,
		messages: [
			{
				content: `Если пользователь попросит нарисовать что-то, но не даст описание, попроси описать. Не отказывай пользователю в рисовании. Ответь, что можешь нарисовать, попроси дать описание`,
				role: `system`,
				name: `system`,
			},
			...preparedMessages,
		],
	});

	const stream = OpenAIStream(response);

	return new StreamingTextResponse(stream);
};
