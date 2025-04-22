import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	// Your existing image configuration
	images: {
		remotePatterns: [
			{
				protocol: "https",
				hostname: "images.unsplash.com",
			},
			{
				protocol: "https",
				hostname: "utfs.io",
			},
			{
				protocol: "https",
				hostname: "replicate.delivery",
			},
		],
	},
	optimizeFonts: false,
	webpack: (config, { dev, isServer }) => {
		// Only apply optimizations for production builds
		if (!dev && !isServer) {
			// Disable specific optimizations that might be causing issues
			config.optimization.minimize = false;
		}
		return config;
	},
};

export default nextConfig;
