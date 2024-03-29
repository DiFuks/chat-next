import nextPWA from '@ducanh2912/next-pwa';

/** @type {import('next').NextConfig} */
const nextConfig = {
	transpilePackages: [`@ant-design/pro-chat`, `@ant-design/pro-editor`, `react-intersection-observer`],
	eslint: {
		ignoreDuringBuilds: true,
	},
};

const withPWA = nextPWA({
	dest: `public`,
	register: true,
	skipWaiting: true,
	disable: process.env.NODE_ENV === `development`,
});

export default withPWA(nextConfig);
