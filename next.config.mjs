import createMDX from '@next/mdx';

const isProd = process.env.NODE_ENV === 'production';

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Only use static export in production
  ...(isProd && { output: 'export' }),
  basePath: isProd ? '/bias-cards' : '',
  assetPrefix: isProd ? '/bias-cards/' : '',
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  serverExternalPackages: ['fstream', 'unzipper'],
  // Configure MDX
  pageExtensions: ['js', 'jsx', 'mdx', 'ts', 'tsx'],
};

const withMDX = createMDX({
  // Add markdown plugins here, as desired
});

export default withMDX(nextConfig);
