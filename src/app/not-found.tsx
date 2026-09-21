import Link from "next/link";
import { defaultLocale } from "@/i18n/config";

export default function RootNotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 py-24 text-center">
      <p className="text-primary/20 mb-2 text-8xl font-bold tracking-tight lg:text-9xl">
        404
      </p>
      <h1 className="mb-3 text-3xl font-bold lg:text-4xl">Page not found</h1>
      <p className="mb-8 max-w-md text-lg text-gray-600">
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
      </p>
      <Link
        href={`/${defaultLocale}`}
        className="btn btn-lg btn-primary w-fit rounded-full font-normal"
      >
        Back to home
      </Link>
    </div>
  );
}
