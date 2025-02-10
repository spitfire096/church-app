/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    typescript: {
        ignoreBuildErrors: true,
    },
    eslint: {
        ignoreDuringBuilds: true,
    },
    // Configure module resolution
    webpack: (config) => {
        config.resolve.alias = {
            ...config.resolve.alias,
            '@': './src'
        };
        return config;
    },
    // Add auth configuration
    auth: {
        providers: ['credentials']
    }
};

module.exports = nextConfig; 