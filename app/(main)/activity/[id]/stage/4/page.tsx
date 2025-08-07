import Stage4Client from './stage4-client';

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic';

// Server component for static generation
export function generateStaticParams() {
  // Return empty array - activities are created dynamically at runtime
  return [];
}

export default function Stage4Page() {
  return <Stage4Client />;
}
