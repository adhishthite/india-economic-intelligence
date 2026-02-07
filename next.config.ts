import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	typescript: {
		// AI Elements + ai SDK types are too large for default heap.
		// Type checking is done separately via tsc.
		ignoreBuildErrors: true,
	},
};

export default nextConfig;
