'use client';

import { FC, useCallback } from 'react';
import { DeleteOutlined, MessageOutlined, PlusOutlined } from '@ant-design/icons';
import { Prisma } from '@prisma/client';
import { Button, Flex, Menu as AntMenu } from 'antd';
import Link from 'next/link';
import { v4 } from 'uuid';

import styles from '../../app/style.module.css';
import UserGetPayload = Prisma.UserGetPayload;
import { useRouter, useSearchParams } from 'next/navigation';

import { createChatForUser } from '../../lib/createChat';
import { removeChat } from '../../lib/removeChat';

interface Props {
	user: UserGetPayload<{ include: { chats: true } }>;
	chatId: string;
}

export const Menu: FC<Props> = ({ user, chatId }) => {
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
				...user.chats.map(chat => ({
					label: (
						<Flex justify='space-between' align='center' className={styles.menuItem}>
							<Link href={{ pathname: `/`, query: { chatId: chat.id } }}>{chat.name}</Link>
							{user.chats.length > 1 && (
								<div className={styles.deleteButton}>
									<Button
										icon={<DeleteOutlined />}
										onClick={async () => {
											await removeChat(chat.id);
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

						await createChatForUser({ id: newChatId, userId: user.id });

						router.push(`/?${createQueryString(`chatId`, newChatId)}`);
					},
					key: `create`,
					icon: <PlusOutlined />,
				},
			]}
		/>
	);
};
