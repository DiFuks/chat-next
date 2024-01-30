'use server';

import { ReactElement } from 'react';
import { DeleteOutlined, MessageOutlined, PlusOutlined } from '@ant-design/icons';
import { ChatMessageMap } from '@ant-design/pro-chat';
import { Button, Flex, Layout, Menu } from 'antd';
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
				<Flex align='center' style={{ padding: 10 }}>
					<Image style={{ height: 50, width: `auto` }} src={logo} alt='logo' />
					<Text style={{ color: `rgba(255, 255, 255, 0.8)`, fontSize: 20, fontWeight: 200 }}>chat next</Text>
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
			</Sider>
			<Content style={{ minHeight: 280 }}>
				<Chat key={chatId} initialChats={JSON.parse(activeChat.messages) as ChatMessageMap} chatId={chatId} />
			</Content>
		</Layout>
	);
};

export default Home;
