export default function Unauthorized() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center px-6">
      <div className="text-center">
        <h1 className="text-2xl font-semibold">Unauthorized</h1>
        <p className="mt-2 text-muted-foreground">
          Please sign in to continue.
        </p>
      </div>
    </div>
  );
}
