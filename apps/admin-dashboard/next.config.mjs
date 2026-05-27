/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@restaurant/shared-ui'],
  reactStrictMode: true,
  experimental: { typedRoutes: true },
};

export default nextConfig;
