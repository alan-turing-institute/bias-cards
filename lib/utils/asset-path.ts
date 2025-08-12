/**
 * Get the correct asset path for static assets in production/development
 * Handles the base path configuration for Next.js static exports
 */
export function getAssetPath(path: string): string {
  // Remove leading slash if present for consistency
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;

  // Get base path from environment variable (set during build)
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';

  // Return the full path
  return basePath ? `${basePath}/${cleanPath}` : `/${cleanPath}`;
}
