import Stage5Client from './stage5-client';

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic';

// Server component for static generation
export function generateStaticParams() {
  // Return empty array - activities are created dynamically at runtime
  return [];
}

export default function Stage5Page() {
  return <Stage5Client />;
}
