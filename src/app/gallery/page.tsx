import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import Image from "next/image";

export default function GalleryPage() {
  const galleryImages = [
    { src: "https://i.postimg.cc/jLFzc1b4/IMG-20250902-WA0004.jpg", alt: "Gallery image 1" },
    { src: "https://i.postimg.cc/NK2RzxGq/IMG-20250902-WA0005.jpg", alt: "Gallery image 2" },
    { src: "https://i.postimg.cc/7CvS8TbC/IMG-20250902-WA0006.jpg", alt: "Gallery image 3" },
    { src: "https://i.postimg.cc/gwv8Yk6g/IMG-20250902-WA0007.jpg", alt: "Gallery image 4" },
    { src: "https://i.postimg.cc/7JL2M3tR/IMG-20250902-WA0008.jpg", alt: "Gallery image 5" },
    { src: "https://i.postimg.cc/7Gw7b83w/IMG-20250902-WA0009.jpg", alt: "Gallery image 6" },
    { src: "https://i.postimg.cc/1nBFqCB6/IMG-20250902-WA0010.jpg", alt: "Gallery image 7" },
    { src: "https://i.postimg.cc/3WrmThrZ/IMG-20250902-WA0011.jpg", alt: "Gallery image 8" },
    { src: "https://i.postimg.cc/mhdMZntW/IMG-20250902-WA0012.jpg", alt: "Gallery image 9" },
    { src: "https://i.postimg.cc/yktZcSmf/IMG-20250902-WA0013.jpg", alt: "Gallery image 10" },
    { src: "https://i.postimg.cc/TppbKcDL/IMG-20250902-WA0014.jpg", alt: "Gallery image 11" },
    { src: "https://i.postimg.cc/BjF1gQNJ/IMG-20250902-WA0015.jpg", alt: "Gallery image 12" },
    { src: "https://i.postimg.cc/sBRG0d07/IMG-20250902-WA0016.jpg", alt: "Gallery image 13" },
  ];

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
                A glimpse into our community and the work we do.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {galleryImages.map((image, index) => (
                <div key={index} className="relative aspect-square w-full h-full overflow-hidden rounded-lg shadow-lg group">
                  <Image
                    src={image.src}
                    alt={image.alt}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                    className="object-cover transition-transform duration-300 ease-in-out group-hover:scale-105"
                  />
                   <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}