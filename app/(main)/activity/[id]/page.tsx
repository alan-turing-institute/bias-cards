// Force dynamic rendering for this route
export const dynamic = 'force-dynamic';

// Server component for static generation
export function generateStaticParams() {
  // Return empty array - activities are created dynamically at runtime
  return [];
}

// Redirect to stage 1
export default function ActivityPage() {
  return null; // The layout will handle the redirect
}
