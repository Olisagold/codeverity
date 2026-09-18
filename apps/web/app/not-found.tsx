import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center bg-base px-6 text-center text-white">
      <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-faint">404</p>
      <h1 className="mt-4 text-[30px] font-medium tracking-[-0.02em] text-white">Page not found</h1>
      <p className="mt-3 max-w-md text-[14.5px] text-muted">
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
      </p>
      <Link
        href="/"
        className="mt-6 inline-block text-[14px] text-accent underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
      >
        Back to home
      </Link>
    </div>
  );
}
