/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ["geoip-lite"],
  experimental: {
    serverActions: {
      bodySizeLimit: "50mb",
    },
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      }
    ],
  },
  allowedDevOrigins: ["192.168.100.31"],
};

export default nextConfig;
