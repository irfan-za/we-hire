import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";
import React from "react";

export default function NotFound() {
  return (
    <div className="h-[calc(100vh-4rem)] flex items-center justify-center px-4">
      <div className="max-w-2xl w-full text-center space-y-8">
        <div className="relative w-full max-w-md mx-auto h-36 md:h-48">
          <Image
            src="/images/not-found.svg"
            alt="404 - Page Not Found"
            fill
            className="object-contain"
            priority
          />
        </div>

        <div className="space-y-4">
          <h1 className="text-4xl md:text-6xl font-bold">404</h1>
          <h2 className="text-2xl md:text-3xl font-semibold">Page Not Found</h2>
          <p className="text-muted-foreground md:text-lg max-w-md mx-auto">
            Oops! The page you&apos;re looking for doesn&apos;t exist. It might
            have been moved or deleted.
          </p>
        </div>

        <div className="flex gap-4 justify-center items-center md:pt-4">
          <Link href="/">
            <Button className="px-8">Go to Homepage</Button>
          </Link>
          <Link href="/jobs">
            <Button variant="outline" className="px-8">
              Browse Jobs
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
