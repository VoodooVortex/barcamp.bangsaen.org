"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body>
        <div className="flex min-h-screen items-center justify-center px-6">
          <div className="max-w-md text-center">
            <h1 className="text-2xl font-semibold">Application error</h1>
            <p className="mt-2 text-muted-foreground">
              {error.message || "A fatal error occurred."}
            </p>
            <button
              type="button"
              onClick={reset}
              className="mt-4 rounded-md bg-primary px-4 py-2 text-primary-foreground"
            >
              Try again
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
