import Image from "next/image";
import Link from "next/link";
import React from "react";

export default function Hero() {
  return (
    <section className="container mx-auto px-4 md:px-6">
      <div className="flex flex-col sm:flex-row items-center justify-evenly gap-12">
        <div className="flex-1 space-y-6 text-center sm:text-left">
          <div className="space-y-4">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900">
              Start Your Digital Career
            </h1>
            <div className="space-y-2">
              <p className="text-2xl md:text-4xl font-bold text-teal-600">
                in just a few months
              </p>
              <p className="text-2xl md:text-4xl font-bold text-teal-600">
                or get a 100% refund
              </p>
            </div>
          </div>

          <div className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto lg:mx-0">
            <p>
              Discover your potential and boost your skills.
              <br />
              With <span className="font-bold text-teal-600">We Hire</span>,
              <span className="font-semibold text-gray-900">
                {" "}
                land your dream career!
              </span>
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start sm:pt-4">
            <Link
              href="/auth/register"
              className="px-8 py-3 bg-teal-600 text-white font-semibold rounded-lg hover:bg-teal-700 transition-colors shadow-lg hover:shadow-xl"
            >
              Get Started
            </Link>
          </div>
        </div>

        <div className="flex-1 flex justify-center sm:justify-end sm:pr-6">
          <div className="relative w-64 h-64 md:w-72 lg:w-96 md:h-72 lg:h-96 max-w-md lg:max-w-lg">
            <Image
              src="/hero.png"
              alt="We Hire - Platform for managing hiring processes"
              fill
              className="object-contain"
              priority
            />
          </div>
        </div>
      </div>
    </section>
  );
}
