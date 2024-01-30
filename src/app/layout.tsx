import { FC, PropsWithChildren } from 'react';
import { AntdRegistry } from '@ant-design/nextjs-registry';
import type { Metadata } from 'next';

export const metadata: Metadata = {
	title: `Chatbot`,
};

const RootLayout: FC<PropsWithChildren> = ({ children }) => (
	<html lang='en'>
		<body style={{ margin: 0, height: `100vh` }}>
			<AntdRegistry>{children}</AntdRegistry>
		</body>
	</html>
);

export default RootLayout;
