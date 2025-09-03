import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import Image from "next/image";

export default function WomenInTechPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-1">
        <section className="py-16 md:py-24">
          <div className="container px-4 md:px-6">
            <div className="grid md:grid-cols-2 gap-8 lg:gap-16 items-center max-w-5xl mx-auto">
              <div>
                <h1 className="font-headline text-4xl md:text-5xl font-bold tracking-tight">
                  Women in Tech
                </h1>
                <p className="text-muted-foreground mt-4 text-lg">
                  Our Women in Tech program is designed to create a supportive ecosystem where women can thrive in the technology sector. We provide mentorship, networking opportunities, and skills development workshops to help women advance their careers and become leaders in the industry.
                </p>
                <p className="text-muted-foreground mt-4 text-lg">
                  From coding bootcamps to leadership training, we offer a range of resources to empower women at every stage of their professional journey. We believe that a more diverse and inclusive tech industry is a more innovative and successful one.
                </p>
              </div>
              <div className="relative h-80 w-full rounded-lg overflow-hidden shadow-lg">
                <Image
                  src="https://images.unsplash.com/photo-1573164713988-8665fc963095?q=80&w=2069"
                  alt="Women in Tech"
                  fill
                  objectFit="cover"
                  data-ai-hint="women technology"
                />
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}