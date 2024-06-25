import { ChatMessage, ProChatChatReference } from '@ant-design/pro-chat';

import { saveChat } from '../../../lib/saveChat';

interface Params {
	messages: ChatMessage[];
	apiKey: string;
	chatId: string;
	isGenerateImage: boolean;
	translator: string | false;
	chatRef: ProChatChatReference;
}

export const fetchSave = async ({
	messages,
	isGenerateImage,
	chatId,
	apiKey,
	chatRef,
	translator,
}: Params): Promise<Response> => {
	const response = await fetch(`/api/chat`, {
		method: `POST`,
		body: JSON.stringify({
			messages,
			apiKey,
			isGenerateImage,
			translator,
		}),
	});

	const reader = response.clone().body?.getReader();

	void (async () => {
		// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition,no-constant-condition
		while (true) {
			// eslint-disable-next-line no-await-in-loop
			const streamResult = await reader?.read();

			if (!streamResult) {
				return;
			}

			if (streamResult.done) {
				// eslint-disable-next-line @typescript-eslint/no-misused-promises
				setTimeout(async () => {
					const chatList = chatRef.current?.getChatList();

					console.log(chatList);

					if (!chatList) {
						return;
					}

					await saveChat(chatList, chatId, apiKey);
				}, 100);

				return;
			}
		}
	})();

	return response;
};
