'use server';

import { ReactElement } from 'react';
import { DeleteOutlined, GithubOutlined, MessageOutlined, PlusOutlined } from '@ant-design/icons';
import { ChatMessage } from '@ant-design/pro-chat';
import { Button, Flex, Layout, Menu, Space } from 'antd';
import { Content } from 'antd/es/layout/layout';
import Sider from 'antd/es/layout/Sider';
import Text from 'antd/es/typography/Text';
import Image from 'next/image';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { v4 } from 'uuid';

import { getUser } from '../lib/getUser';
import { removeChat } from '../lib/removeChat';
import styles from './style.module.css';

import { Chat } from '@/components/Chat/Chat';
import logo from '@/images/logo.png';
import telegram from '@/images/telegram.png';

const Home = async ({
	searchParams: { chatId, remove },
}: {
	searchParams: { chatId?: string; remove?: 'true' };
}): Promise<ReactElement> => {
	const user = await getUser({
		chatId,
	});

	if (remove && chatId) {
		await removeChat(chatId);

		const chatIdToRedirect = user.chats.find(chat => chat.id !== chatId)?.id;

		redirect(`/?chatId=${chatIdToRedirect}&forceRevalidate=${new Date().getTime()}`);
	}

	if (!chatId) {
		redirect(`/?chatId=${user.chats[0].id}`);
	}

	const activeChat = user.chats.find(chat => chat.id === chatId);

	if (!activeChat) {
		throw new Error(`Chat not found`);
	}

	return (
		<Layout style={{ height: `100%` }}>
			<Sider breakpoint='lg' collapsedWidth='0' width={300}>
				<Flex vertical style={{ height: `100%` }}>
					<Flex align='center' style={{ padding: 10 }}>
						<Image style={{ height: 50, width: `auto` }} src={logo} alt='logo' />
						<Text style={{ color: `rgba(255, 255, 255, 0.8)`, fontSize: 20, fontWeight: 200 }}>
							chat next
						</Text>
					</Flex>
					<Menu
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
											<Link
												className={styles.deleteButton}
												href={{ pathname: `/`, query: { chatId: chat.id, remove: true } }}
											>
												<Button icon={<DeleteOutlined />} type='primary' danger />
											</Link>
										)}
									</Flex>
								),
								key: chat.id,
								icon: <MessageOutlined />,
							})),
							{
								type: `divider`,
								style: { margin: `12px 0` },
							},
							{
								label: <Link href={{ pathname: `/`, query: { chatId: v4() } }}>Создать чат</Link>,
								key: `create`,
								icon: <PlusOutlined />,
							},
						]}
					/>
					<Space style={{ padding: 10 }}>
						<Link href='https://github.com/DiFuks/chat-next' target='_blank'>
							<Button type='default' icon={<GithubOutlined />} />
						</Link>
						<Link href='https://t.me/difuks' target='_blank'>
							<Button
								type='default'
								icon={<Image style={{ height: 20, width: `auto` }} src={telegram} alt='telegram' />}
							/>
						</Link>

						<Text style={{ color: `rgba(255, 255, 255, 0.8)` }}>powered by Dmitry Fuks</Text>
					</Space>
				</Flex>
			</Sider>
			<Content style={{ minHeight: 280 }}>
				<Chat key={chatId} initialChats={JSON.parse(activeChat.messages) as ChatMessage[]} chatId={chatId} />
			</Content>
		</Layout>
	);
};

export default Home;
