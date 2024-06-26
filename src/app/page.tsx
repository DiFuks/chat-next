'use server';

import { ReactElement } from 'react';
import { GithubOutlined } from '@ant-design/icons';
import { ChatMessage } from '@ant-design/pro-chat';
import { Button, Flex, Layout, Space } from 'antd';
import { Content } from 'antd/es/layout/layout';
import Sider from 'antd/es/layout/Sider';
import Text from 'antd/es/typography/Text';
import Image from 'next/image';
import Link from 'next/link';
import { redirect } from 'next/navigation';

import { Menu } from '../components/Menu/Menu';
import { getUser } from '../lib/getUser';

import { Chat } from '@/components/Chat/Chat';
import logo from '@/images/logo.png';
import telegram from '@/images/telegram.png';

const Home = async ({
	searchParams: { chatId },
}: {
	searchParams: { chatId?: string; remove?: 'true' };
}): Promise<ReactElement> => {
	const { chats, activeChat, userId } = await getUser({
		chatId,
	});

	if (!chatId || chatId !== activeChat.id) {
		redirect(`/?chatId=${activeChat.id}`);
	}

	return (
		<Layout style={{ height: `100vh` }} hasSider>
			<Sider breakpoint='lg' collapsedWidth='0' width={300} style={{ height: `100vh` }}>
				<Flex vertical style={{ height: `100%` }}>
					<Flex align='center' style={{ padding: 10 }}>
						<Image style={{ height: 50, width: `auto` }} src={logo} alt='logo' />
						<Text style={{ color: `rgba(255, 255, 255, 0.8)`, fontSize: 20, fontWeight: 200 }}>
							chat next
						</Text>
					</Flex>
					<Menu chats={chats} userId={userId} chatId={chatId} />
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
