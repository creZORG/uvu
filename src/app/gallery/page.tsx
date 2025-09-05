
"use client";

import { useState, useEffect } from "react";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Loader2 } from "lucide-react";

type GalleryImage = {
  src: string;
  alt: string;
  className: string;
};

const defaultGalleryImages = [
    { src: "https://i.postimg.cc/jLFzc1b4/IMG-20250902-WA0004.jpg", alt: "Gallery image 1", className: "row-span-2" },
    { src: "https://i.postimg.cc/NK2RzxGq/IMG-20250902-WA0005.jpg", alt: "Gallery image 2", className: "" },
    { src: "https://i.postimg.cc/7CvS8TbC/IMG-20250902-WA0006.jpg", alt: "Gallery image 3", className: "col-span-2" },
    { src: "https://i.postimg.cc/gwv8Yk6g/IMG-20250902-WA0007.jpg", alt: "Gallery image 4", className: "" },
];

export default function GalleryPage() {
  const [galleryImages, setGalleryImages] = useState<GalleryImage[]>(defaultGalleryImages);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const contentRef = doc(db, "siteContent", "content");
    const unsubscribe = onSnapshot(contentRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.galleryImages && data.galleryImages.length > 0) {
          setGalleryImages(data.galleryImages);
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-1">
        <section className="py-16 md:py-24">
          <div className="container px-4 md:px-6">
            <div className="text-center mb-12">
              <h1 className="font-headline text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight">
                Our Gallery
              </h1>
              <p className="max-w-3xl mx-auto text-muted-foreground mt-4 text-lg">
                A glimpse into our community, the work we do, and the lives we impact.
              </p>
            </div>
            {loading ? (
                 <div className="flex justify-center">
                    <Loader2 className="h-8 w-8 animate-spin" />
                </div>
            ) : (
                <div className="grid grid-cols-2 md:grid-cols-4 auto-rows-[200px] gap-4">
                {galleryImages.map((image, index) => (
                    <div key={index} className={cn("relative w-full h-full overflow-hidden rounded-lg shadow-lg group", image.className)}>
                    <Image
                        src={image.src}
                        alt={image.alt}
                        fill
                        sizes="(max-width: 768px) 50vw, 25vw"
                        className="object-cover transition-transform duration-300 ease-in-out group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </div>
                ))}
                </div>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
