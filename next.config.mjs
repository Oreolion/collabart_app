/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    // This tells Vercel/Next.js to not fail the build if it finds ESLint errors.
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
