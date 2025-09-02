import { cn } from "@/lib/utils";
import Image from "next/image";

export function UcnLogo({ className }: { className?: string }) {
  return (
    <div className={cn("relative", className)}>
      <Image
        src="https://i.postimg.cc/Lspf9mbM/Whats-App-Image-2025-09-03-at-00-46-50-8b10af69.jpg"
        alt="Uvumbuzi Community Network Logo"
        layout="fill"
        objectFit="contain"
      />
    </div>
  );
}
