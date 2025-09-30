/*/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  webpack: (config, { isServer }) => {
    if (isServer) {
      // Ignore pdf-parse test files that cause build errors
      config.resolve.alias = {
        ...config.resolve.alias,
        canvas: false,
      };
      
      // Add externals to prevent bundling test files
      config.externals = config.externals || [];
      config.externals.push({
        canvas: 'canvas',
      });
    }
    return config;
  },
};

export default nextConfig;