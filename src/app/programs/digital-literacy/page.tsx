import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import Image from "next/image";

export default function DigitalLiteracyPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-1">
        <section className="py-16 md:py-24">
          <div className="container px-4 md:px-6">
            <div className="grid md:grid-cols-2 gap-8 lg:gap-16 items-center max-w-5xl mx-auto">
              <div>
                <h1 className="font-headline text-4xl md:text-5xl font-bold tracking-tight">
                  Digital Access & Literacy
                </h1>
                <p className="text-muted-foreground mt-4 text-lg">
                  At the heart of Uvumbuzi Community Network’s mission is the belief that equal access to digital tools and skills is essential for empowerment. Through its connectivity initiatives and community programs, UCN is working to bridge the digital divide by making affordable internet and digital resources available to underserved communities.
                </p>
                <p className="text-muted-foreground mt-4 text-lg">
                  UCN offers digital literacy training for youth, women, and marginalized groups—equipping them with practical skills in internet use, online safety, e-learning, digital entrepreneurship, and accessing government and social services. By combining community-owned connectivity with hands-on training, UCN ensures that members are not only connected, but also empowered to use technology meaningfully in education, business, civic engagement, and social development.
                </p>
                 <p className="text-muted-foreground mt-4 text-lg">
                  The goal is simple yet powerful: to transform access into opportunity, and opportunity into sustainable community growth.
                </p>
              </div>
              <div className="relative h-80 w-full rounded-lg overflow-hidden shadow-lg">
                <Image
                  src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=2071"
                  alt="Digital Literacy"
                  fill
                  objectFit="cover"
                  data-ai-hint="students learning computer"
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