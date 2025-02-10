/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    typescript: {
        ignoreBuildErrors: true,
    },
    eslint: {
        ignoreDuringBuilds: true,
    },
    // Add build cache configuration
    experimental: {
        // Enable build cache
        turbotrace: {
            logLevel: 'error',
            memoryLimit: 4096
        }
    },
    // Configure module resolution
    webpack: (config) => {
        config.resolve.alias = {
            ...config.resolve.alias,
            '@': '/src'
        };
        return config;
    }
};

module.exports = nextConfig; 