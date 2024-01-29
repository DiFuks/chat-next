/** @type {import('next').NextConfig} */
const nextConfig = {
    transpilePackages: [
        '@ant-design/pro-chat',
        '@ant-design/pro-editor',
        'react-intersection-observer',
    ],
    env: {
        OPENAI_KEY: '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',
    }
};

export default nextConfig;
