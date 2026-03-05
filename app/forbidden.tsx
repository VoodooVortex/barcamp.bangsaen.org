export default function Forbidden() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center px-6">
      <div className="text-center">
        <h1 className="text-2xl font-semibold">Forbidden</h1>
        <p className="mt-2 text-muted-foreground">
          You do not have permission to access this resource.
        </p>
      </div>
    </div>
  );
}
