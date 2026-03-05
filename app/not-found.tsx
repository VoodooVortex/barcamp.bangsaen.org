export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center px-6">
      <div className="text-center">
        <h1 className="text-2xl font-semibold">Not Found</h1>
        <p className="mt-2 text-muted-foreground">
          The requested page could not be found.
        </p>
      </div>
    </div>
  );
}
