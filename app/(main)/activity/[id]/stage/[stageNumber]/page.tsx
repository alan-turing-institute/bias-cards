// Force dynamic rendering for this route
export const dynamic = 'force-dynamic';

// Server component for static generation
export async function generateStaticParams() {
  // Return empty array to allow dynamic generation
  return [];
}

// This file handles the catch-all case for stage routes
export default function GenericStagePage() {
  return (
    <div className="flex h-full items-center justify-center">
      <div className="text-center">
        <h2 className="font-semibold text-lg">Stage Not Found</h2>
        <p className="text-muted-foreground">
          Please navigate to a specific stage.
        </p>
      </div>
    </div>
  );
}
