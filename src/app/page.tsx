'use server';

import { ReactElement } from 'react';
import { MessageOutlined, PlusOutlined } from '@ant-design/icons';
import { ChatMessageMap } from '@ant-design/pro-chat';
import { Flex, Layout, Menu } from 'antd';
import { Content } from 'antd/es/layout/layout';
import Sider from 'antd/es/layout/Sider';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { v4 } from 'uuid';

import { getUser } from '../lib/getUser';

import { Chat } from '@/components/Chat/Chat';

const Home = async ({ searchParams: { chatId } }: { searchParams: { chatId?: string } }): Promise<ReactElement> => {
	const user = await getUser({
		chatId,
	});

	if (!chatId) {
		redirect(`/?chatId=${user.chats[0].id}`);
	}

	const activeChat = user.chats.find(chat => chat.id === chatId);

	if (!activeChat) {
		throw new Error(`Chat not found`);
	}

	return (
		<Layout style={{ height: `100%` }}>
			<Content>
				<Layout style={{ height: `100%` }}>
					<Sider width={300}>
						<Flex style={{ height: `100%` }}>
							<Menu
								mode='inline'
								defaultSelectedKeys={[chatId]}
								style={{ flexGrow: 1 }}
								selectedKeys={[chatId]}
								items={[
									...user.chats.map(chat => ({
										label: (
											<Link href={{ pathname: `/`, query: { chatId: chat.id } }}>
												{chat.name}
											</Link>
										),
										key: chat.id,
										icon: <MessageOutlined />,
									})),
									{
										type: `divider`,
										style: { margin: `12px 0` },
									},
									{
										label: (
											<Link href={{ pathname: `/`, query: { chatId: v4() } }}>Создать чат</Link>
										),
										key: `create`,
										icon: <PlusOutlined />,
									},
								]}
							/>
						</Flex>
					</Sider>
					<Content style={{ minHeight: 280 }}>
						<Chat
							key={chatId}
							initialChats={JSON.parse(activeChat.messages) as ChatMessageMap}
							chatId={chatId}
						/>
					</Content>
				</Layout>
			</Content>
		</Layout>
	);
};

export default Home;
