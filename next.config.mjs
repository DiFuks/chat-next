/** @type {import('next').NextConfig} */
const nextConfig = {
    transpilePackages: [
        '@ant-design/pro-chat',
        '@ant-design/pro-editor',
        'react-intersection-observer',
    ],
    eslint: {
        ignoreDuringBuilds: true,
    }
};

export default nextConfig;
