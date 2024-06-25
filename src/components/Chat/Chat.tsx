'use client';

import { FC, useEffect, useRef, useState } from 'react';
import { PictureFilled, PictureOutlined, SettingOutlined } from '@ant-design/icons';
import { ChatMessage, ProChat } from '@ant-design/pro-chat';
import { Button, Flex, Form, Input, Layout, Menu, Space, Switch, theme, Typography } from 'antd';
import { debounce } from 'lodash';

import { saveChat } from '../../lib/saveChat';

interface Props {
	initialChats: ChatMessage[];
	chatId: string;
}

const onChatsChangeDebounced = debounce(async (messages: ChatMessage[], chatId: string, apiKey: string) => {
	await saveChat(messages, chatId, apiKey);
}, 1000);

export const Chat: FC<Props> = ({ initialChats, chatId }) => {
	const [apiKey, setApiKey] = useState<string | null>(null);
	const isGenerateImageRef = useRef<HTMLElement>(null);

	const { token } = theme.useToken();

	useEffect(() => {
		const lsApiKey = localStorage.getItem(`apiKey`);

		if (lsApiKey) {
			setApiKey(lsApiKey);
		}
	}, []);

	if (!apiKey) {
		return (
			<Flex align='center' justify='center' style={{ height: `100%` }}>
				<Form<{ apiKey: string }>
					labelCol={{ span: 8 }}
					wrapperCol={{ span: 16 }}
					onFinish={values => {
						localStorage.setItem(`apiKey`, values.apiKey);
						setApiKey(values.apiKey);
					}}
				>
					<Form.Item
						label='API key'
						name='apiKey'
						required
						rules={[{ required: true, message: `Введите API key` }]}
					>
						<Input type='password' />
					</Form.Item>

					<Form.Item shouldUpdate wrapperCol={{ offset: 8, span: 16 }}>
						{({ getFieldsError, isFieldsTouched }) => (
							<Button
								htmlType='submit'
								disabled={
									!isFieldsTouched(true) ||
									getFieldsError().filter(({ errors }) => errors.length).length > 0
								}
							>
								Сохранить
							</Button>
						)}
					</Form.Item>
				</Form>
			</Flex>
		);
	}

	return (
		<Layout style={{ height: `100vh` }}>
			<Layout.Header
				style={{
					padding: 0,
					backgroundColor: token.colorBgContainer,
					display: `flex`,
					justifyContent: `flex-end`,
				}}
			>
				<Menu
					mode='horizontal'
					items={[
						{
							icon: <SettingOutlined />,
							label: `Изменить токен`,
							key: `change-token`,
							onClick: () => {
								localStorage.removeItem(`apiKey`);
								setApiKey(null);
							},
						},
					]}
				/>
			</Layout.Header>
			<Layout.Content style={{ height: `100%` }}>
				<ProChat
					actionsRender={() => [
						<Space key='image-switcher' style={{ paddingTop: token.padding }}>
							<Typography.Text>Создать изображение</Typography.Text>
							<Switch
								checkedChildren={<PictureOutlined />}
								unCheckedChildren={<PictureFilled />}
								ref={isGenerateImageRef}
							/>
						</Space>,
					]}
					style={{ flexGrow: 1 }}
					placeholder='Введите сообщение'
					config={{
						model: `gpt-4-turbo-preview`,
					}}
					helloMessage='Привет, чем я могу помочь?'
					initialChatsList={initialChats}
					onChatsChange={messages => {
						void onChatsChangeDebounced(messages, chatId, apiKey);
					}}
					sendMessageRequest={messages =>
						fetch(`/api/chat`, {
							method: `POST`,
							body: JSON.stringify({
								messages,
								apiKey,
								isGenerateImage: isGenerateImageRef.current?.classList.contains(`ant-switch-checked`),
							}),
						})
					}
					sendButtonRender={(_button, buttonProps) => <Button {...buttonProps}>Отправить</Button>}
				/>
			</Layout.Content>
		</Layout>
	);
};
