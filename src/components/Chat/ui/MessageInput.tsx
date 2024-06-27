import { ChangeEvent, FC, KeyboardEvent, ReactNode, useState } from 'react';
import { ArrowUpOutlined, AudioOutlined, SendOutlined } from '@ant-design/icons';
import { Button, Flex, Input, theme } from 'antd';
import { TextAreaProps } from 'antd/es/input';

import { useRecorder } from '../lib/useRecorder';

interface Props extends TextAreaProps {
	onMessageSend: (message: string) => void;
	isButtonDisabled: boolean;
	apiKey: string;
}

export const MessageInput: FC<Props> = ({
	onMessageSend,
	isButtonDisabled,
	value,
	onChange,
	onPressEnter,
	apiKey,
	...props
}) => {
	const [audioState, setAudioState] = useState<false | 'recording' | 'loading'>(false);
	const recording = useRecorder();
	const { token } = theme.useToken();

	const handleSend = async (): Promise<void> => {
		if (audioState === `recording`) {
			recording.stop();
			setAudioState(false);

			return;
		}

		if (!value) {
			setAudioState(`recording`);

			try {
				const audio = await recording.record();

				const formData = new FormData();

				formData.append(`file`, audio);
				formData.append(`apiKey`, apiKey);

				setAudioState(`loading`);

				const response = await fetch(`/api/audio`, {
					method: `POST`,
					body: formData,
				});

				const { text } = (await response.json()) as { text: string };

				setAudioState(false);
				onMessageSend(text);
			} finally {
				setAudioState(false);
			}

			return;
		}

		onMessageSend(String(value));
		onChange?.({ target: { value: `` } } as ChangeEvent<HTMLTextAreaElement>);
	};

	const handlePressEnter = (e: KeyboardEvent<HTMLTextAreaElement>): void => {
		onPressEnter?.(e);

		console.log(e.defaultPrevented);

		if (e.defaultPrevented) {
			onChange?.({ target: { value: `` } } as ChangeEvent<HTMLTextAreaElement>);
		}
	};

	const getButtonIcon = (): ReactNode => {
		if (audioState) {
			return <ArrowUpOutlined />;
		}

		if (value) {
			return <SendOutlined />;
		}

		return <AudioOutlined />;
	};

	return (
		<Flex style={{ width: `100%`, position: `relative` }} gap='middle' align='flex-end'>
			<Input.TextArea
				{...props}
				disabled={props.disabled || !!audioState}
				onPressEnter={handlePressEnter}
				value={value}
				autoSize={{ minRows: 3 }}
				style={{ paddingRight: token.sizeXXL + token.paddingXS }}
				onChange={onChange}
			/>

			<Button
				style={{
					position: `absolute`,
					right: token.paddingXS,
					bottom: token.paddingXS,
					transform: audioState === `recording` ? `scale(1.3)` : `none`,
				}}
				size='large'
				type='primary'
				shape='circle'
				icon={getButtonIcon()}
				disabled={isButtonDisabled || audioState === `loading`}
				loading={audioState === `loading`}
				onClick={handleSend}
			/>
		</Flex>
	);
};
