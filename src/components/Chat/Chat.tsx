'use client';

import { FC, useEffect, useRef, useState } from 'react';
import { PictureFilled, PictureOutlined, SettingOutlined } from '@ant-design/icons';
import { ChatMessage, ProChat, ProChatInstance } from '@ant-design/pro-chat';
import { Button, Flex, Grid, Input, Layout, Menu, Select, Skeleton, Space, Switch, theme, Typography } from 'antd';

import styles from '../../app/style.module.css';
import { ApiKeyForm } from './ApiKeyForm';
import { fetchSave } from './lib/fetchSave';

interface Props {
	initialChats: ChatMessage[];
	chatId: string;
}

export const Chat: FC<Props> = ({ initialChats, chatId }) => {
	const [apiKey, setApiKey] = useState<string | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const isGenerateImageRef = useRef<HTMLElement>(null);
	const [isSwitchChecked, setIsSwitchChecked] = useState(false);
	const [translator, setTranslator] = useState<string | false>(false);
	const chatRef = useRef<ProChatInstance>();
	const breakpoint = Grid.useBreakpoint();

	const { token } = theme.useToken();

	useEffect(() => {
		const lsApiKey = localStorage.getItem(`apiKey`);
		const lsIsGenerateImage = localStorage.getItem(`isGenerateImage-${chatId}`);
		const lsTranslator = localStorage.getItem(`translator-${chatId}`);

		if (lsApiKey) {
			setApiKey(lsApiKey);
		}

		setIsSwitchChecked(lsIsGenerateImage === `true`);
		setTranslator(lsTranslator || false);
		setIsLoading(false);
	}, [chatId]);

	const handleSwitchChange = (checked: boolean): void => {
		setIsSwitchChecked(checked);
		localStorage.setItem(`isGenerateImage-${chatId}`, checked ? `true` : `false`);
	};

	const handleTranslatorChange = (value: string | false): void => {
		setTranslator(value);
		localStorage.setItem(`translator-${chatId}`, value || ``);
	};

	useEffect(() => {
		setTimeout(() => {
			if (chatRef.current) {
				chatRef.current.scrollToBottom?.();
			}
		}, 10);
	}, [chatId, apiKey]);

	if (isLoading) {
		return <Skeleton style={{ padding: token.paddingXL }} avatar={{ shape: `circle` }} active />;
	}

	if (!apiKey) {
		return <ApiKeyForm setApiKey={setApiKey} />;
	}

	return (
		<Layout className={styles.chat} style={{ height: `100dvh` }}>
			<Layout.Header
				style={{
					padding: 0,
					backgroundColor: token.colorBgContainer,
					display: `flex`,
					justifyContent: `flex-end`,
				}}
			>
				<Menu
					disabledOverflow
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
					chatRef={chatRef}
					userMeta={{
						avatar: `https://avatars.dicebear.com/api/avataaars/1.svg`,
						title: `Пользователь`,
					}}
					backToBottomConfig={{
						onMouseDown: () => {
							if (chatRef.current) {
								chatRef.current.scrollToBottom?.();
							}
						},
					}}
					actionsRender={() => (
						<Flex gap='small' align={!breakpoint.sm ? `flex-end` : undefined} vertical={!breakpoint.sm}>
							<Space key='translator' style={{ paddingBottom: token.paddingSM }}>
								<Typography.Text>Перевести на</Typography.Text>
								<Select
									defaultValue={translator}
									onChange={handleTranslatorChange}
									style={{ width: 150 }}
									disabled={isSwitchChecked}
									options={[
										{
											value: false,
											label: `Не переводить`,
										},
										{
											value: `Русский`,
										},
										{
											value: `Английский`,
										},
									]}
								/>
							</Space>

							<Space key='image-switcher' style={{ paddingBottom: token.paddingSM }}>
								<Typography.Text>Создать изображение</Typography.Text>
								<Switch
									disabled={translator !== false}
									checkedChildren={<PictureOutlined />}
									unCheckedChildren={<PictureFilled />}
									ref={isGenerateImageRef}
									checked={isSwitchChecked}
									onChange={handleSwitchChange}
								/>
							</Space>
						</Flex>
					)}
					inputRender={(_input, _onMessageSend, inputProps) => (
						<Input.TextArea {...inputProps} autoSize={{ minRows: 3 }} />
					)}
					sendButtonRender={(_button, buttonProps) => (
						<Button
							{...buttonProps}
							style={{ marginRight: token.paddingSM, marginBottom: token.paddingSM }}
						>
							Отправить
						</Button>
					)}
					style={{ flexGrow: 1 }}
					styles={{
						chatListItemContent: {
							width: `auto`,
						},
						chatListItem: {
							cursor: `auto`,
						},
						chatInputArea: {
							padding: token.paddingSM,
						},
					}}
					placeholder='Введите сообщение'
					config={{
						model: `gpt-4-turbo-preview`,
					}}
					helloMessage='Привет, чем я могу помочь?'
					initialChatsList={initialChats}
					sendMessageRequest={async messages =>
						fetchSave({
							messages,
							apiKey,
							chatId,
							isGenerateImage: isSwitchChecked,
							chatRef,
							translator,
						})
					}
				/>
			</Layout.Content>
		</Layout>
	);
};
