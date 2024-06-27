import { ChangeEvent, FC, KeyboardEvent, ReactNode, useRef, useState } from 'react';
import { ArrowUpOutlined, AudioOutlined, SendOutlined, StopOutlined } from '@ant-design/icons';
import { Button, Flex, Input, theme } from 'antd';
import { TextAreaProps } from 'antd/es/input';

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
	const { token } = theme.useToken();

	const [audioState, setAudioState] = useState<false | 'recording' | 'loading'>(false);
	const mediaRecorderRef = useRef<MediaRecorder | null>(null);

	const handleSend = async (): Promise<void> => {
		if (audioState === `recording`) {
			mediaRecorderRef.current?.stop();
			setAudioState(false);

			return;
		}

		if (!value) {
			const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

			const mediaRecorder = new MediaRecorder(stream);
			mediaRecorderRef.current = mediaRecorder;
			mediaRecorder.start();

			setAudioState(`recording`);

			mediaRecorder.ondataavailable = async e => {
				stream.getTracks().forEach(track => track.stop());

				const formData = new FormData();

				formData.append(`file`, e.data);
				formData.append(`apiKey`, apiKey);

				setAudioState(`loading`);

				const response = await fetch(`/api/audio`, {
					method: `POST`,
					body: formData,
				});

				const { text } = (await response.json()) as { text: string };

				setAudioState(false);
				onMessageSend(text);
			};

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
				style={{ position: `absolute`, right: token.paddingXS, bottom: token.paddingXS }}
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
