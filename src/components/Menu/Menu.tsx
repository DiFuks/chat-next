'use client';

import { FC, useCallback } from 'react';
import { DeleteOutlined, MessageOutlined, PlusOutlined } from '@ant-design/icons';
import { Prisma } from '@prisma/client';
import { Button, Flex, Menu as AntMenu } from 'antd';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { v4 } from 'uuid';

import styles from '../../app/style.module.css';
import { createChatForUser } from '../../lib/createChat';
import { removeChat } from '../../lib/removeChat';
import ChatGetPayload = Prisma.ChatGetPayload;

interface Props {
	chats: ChatGetPayload<{ select: { id: true; name: true } }>[];
	chatId: string;
	userId: string;
}

export const Menu: FC<Props> = ({ userId, chats, chatId }) => {
	const router = useRouter();
	const searchParams = useSearchParams();

	const createQueryString = useCallback(
		(name: string, value: string) => {
			const params = new URLSearchParams(searchParams.toString());
			params.set(name, value);

			return params.toString();
		},
		[searchParams],
	);

	return (
		<AntMenu
			theme='dark'
			mode='inline'
			defaultSelectedKeys={[chatId]}
			style={{ flexGrow: 1 }}
			selectedKeys={[chatId]}
			items={[
				...chats.map(chat => ({
					label: (
						<Flex justify='space-between' align='center' className={styles.menuItem}>
							<Link href={{ pathname: `/`, query: { chatId: chat.id } }}>{chat.name}</Link>
							{chats.length > 1 && (
								<div className={styles.deleteButton}>
									<Button
										icon={<DeleteOutlined />}
										onClick={async () => {
											await removeChat(chat.id);

											const firstChat = chats.find(({ id }) => id !== chat.id);

											router.push(`/?${createQueryString(`chatId`, firstChat?.id || ``)}`);
										}}
										type='primary'
										danger
									/>
								</div>
							)}
						</Flex>
					),
					title: chat.name,
					key: chat.id,
					icon: <MessageOutlined />,
				})),
				{
					type: `divider`,
					style: { margin: `12px 0` },
				},
				{
					label: `Создать чат`,
					// eslint-disable-next-line @typescript-eslint/no-misused-promises
					onClick: async () => {
						const newChatId = v4();

						await createChatForUser({ id: newChatId, userId });

						router.push(`/?${createQueryString(`chatId`, newChatId)}`);
					},
					key: `create`,
					icon: <PlusOutlined />,
				},
			]}
		/>
	);
};
