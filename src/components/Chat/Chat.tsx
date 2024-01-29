'use client';

import { FC } from 'react';
import { ChatMessageMap, ProChat } from '@ant-design/pro-chat';
import { debounce } from 'lodash';

interface Props {
	initialChats: ChatMessageMap;
	chatId: string;
}

const onChatsChangeDebounced = debounce(async (messages: ChatMessageMap, chatId: string) => {
	await fetch(`/api/save`, {
		method: `POST`,
		body: JSON.stringify({ messages, chatId }),
	});
}, 1000);

export const Chat: FC<Props> = ({ initialChats, chatId }) => (
	<ProChat
		placeholder='Введите сообщение'
		displayMode='chat'
		config={{
			model: `gpt-4-turbo-preview`,
		}}
		helloMessage='Привет, чем я могу помочь?'
		initialChats={initialChats}
		showTitle
		userMeta={{
			title: `Пользователь`,
			avatar: ``,
		}}
		assistantMeta={{ title: `ИИ`, avatar: `🤖` }}
		onChatsChange={messages => {
			void onChatsChangeDebounced(messages, chatId);
		}}
		request={messages =>
			fetch(`/api/chat`, {
				method: `POST`,
				body: JSON.stringify({ messages }),
			})
		}
	/>
);
