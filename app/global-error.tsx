'use client';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html>
      <body>
        <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-8">
          <h1 className="text-4xl font-bold">Critical Error</h1>
          <p className="text-center max-w-md">
            A critical error occurred. Please refresh the page.
          </p>
          <button
            onClick={reset}
            className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800"
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
