/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: new URL(process.env.SUPABASE_URL).hostname,
        port: "",
        pathname: "/storage/v1/object/public/cabin-images/**",
      },
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
    ],
  },
  // output: "export",
};

export default nextConfig;
