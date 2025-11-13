import Image from "next/image";
import { Button } from "@/components/ui/button";

interface JobCtaCardProps {
  onCreateClick: () => void;
}

export default function JobCtaCard({ onCreateClick }: JobCtaCardProps) {
  return (
    <aside className="hidden md:block md:col-span-4 lg:col-span-3">
      <div className="flex flex-col rounded-lg h-36 p-2 sticky top-16">
        <div className="absolute inset-0 bg-black/50 rounded-lg -z-10"></div>
        <Image
          src={"/images/bg-menu.jpg"}
          alt="bg menu"
          fill
          className="object-cover -z-20 rounded-lg"
        />
        <div>
          <h3 className="text-primary-foreground text-center text-xl font-semibold">
            Recruit the best candidates
          </h3>
          <p className="text-primary-foreground text-center text-sm font-medium">
            Create jobs, invite, and hire with ease
          </p>
        </div>
        <Button
          className="cursor-pointer w-fit px-12 mt-6 mx-auto"
          onClick={onCreateClick}
        >
          Create a new job
        </Button>
      </div>
    </aside>
  );
}
