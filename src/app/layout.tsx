import { FC, PropsWithChildren } from 'react';
import { AntdRegistry } from '@ant-design/nextjs-registry';
import type { Metadata, Viewport } from 'next';

export const metadata: Metadata = {
	title: `Chatbot`,
	description: `Chatbot PWA application with Next 13`,
	generator: `Next.js`,
	manifest: `/manifest.webmanifest`,
	keywords: [`chat-next`],
	authors: [{ name: `Dmitry Fuks`, url: `https://t.me/difuks` }],
	icons: [
		{ rel: `apple-touch-icon`, url: `/icon-192x192.png` },
		{ rel: `icon`, url: `/icon-192x192.png` },
	],
};

export const viewport: Viewport = {
	minimumScale: 1,
	width: `device-width`,
	initialScale: 1.0,
	maximumScale: 1.0,
	userScalable: false,
	viewportFit: `cover`,
};

const RootLayout: FC<PropsWithChildren> = ({ children }) => (
	<html lang='en'>
		<body style={{ margin: 0, height: `100dvh` }}>
			<AntdRegistry>{children}</AntdRegistry>
		</body>
	</html>
);

export default RootLayout;
