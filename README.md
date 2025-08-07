# Bias Cards

Educational web application for teaching about cognitive biases through interactive card sorting.

## Tailwind CSS Static Export Issue Resolution

**Issue**: When running `pnpm build` and serving the static export, Tailwind CSS styles don't load correctly.

**Root Cause**: The `basePath` configuration in `next.config.ts` causes CSS to be requested at `/bias-cards/_next/static/css/...` but local servers serve files at `/_next/static/css/...`.

**Solution for Local Testing**:
1. Temporarily remove `basePath` and `assetPrefix` from `next.config.ts`:
```typescript
const nextConfig: NextConfig = {
  output: 'export',
  // basePath: isProd ? '/bias-cards' : '',
  // assetPrefix: isProd ? '/bias-cards/' : '',
  trailingSlash: true,
  images: { unoptimized: true },
};
```

2. Run `pnpm build`
3. Serve with `pnpm start` or `pnpm dlx serve out -s -l 3002`
4. Restore original configuration for production deployment

**Note**: The Tailwind v4 and Next.js configurations are correct. This is purely a local testing vs production base path issue.