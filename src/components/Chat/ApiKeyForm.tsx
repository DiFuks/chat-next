import { FC } from 'react';
import { Button, Flex, Form, Input } from 'antd';

interface Props {
	setApiKey: (apiKey: string) => void;
}

export const ApiKeyForm: FC<Props> = ({ setApiKey }) => (
	<Flex align='center' justify='center' style={{ height: `100%` }}>
		<Form<{ apiKey: string }>
			labelCol={{ span: 8 }}
			wrapperCol={{ span: 16 }}
			onFinish={values => {
				localStorage.setItem(`apiKey`, values.apiKey);
				setApiKey(values.apiKey);
			}}
		>
			<Form.Item label='API key' name='apiKey' required rules={[{ required: true, message: `Введите API key` }]}>
				<Input type='password' />
			</Form.Item>

			<Form.Item shouldUpdate wrapperCol={{ offset: 8, span: 16 }}>
				{({ getFieldsError, isFieldsTouched }) => (
					<Button
						htmlType='submit'
						disabled={
							!isFieldsTouched(true) || getFieldsError().filter(({ errors }) => errors.length).length > 0
						}
					>
						Сохранить
					</Button>
				)}
			</Form.Item>
		</Form>
	</Flex>
);
