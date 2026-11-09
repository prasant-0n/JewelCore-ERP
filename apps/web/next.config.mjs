/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: process.env.BUILD_STANDALONE ? "standalone" : undefined,
  transpilePackages: ["@jewelcore/shared"],
};

export default nextConfig;
