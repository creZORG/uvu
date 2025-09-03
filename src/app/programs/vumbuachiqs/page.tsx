import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import Image from "next/image";

export default function VumbuachiqsPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-1">
        <section className="py-16 md:py-24">
          <div className="container px-4 md:px-6">
            <div className="grid md:grid-cols-2 gap-8 lg:gap-16 items-center max-w-5xl mx-auto">
              <div>
                <h1 className="font-headline text-4xl md:text-5xl font-bold tracking-tight">
                  Vumbuachiqs – Girls in Technology
                </h1>
                <p className="text-muted-foreground mt-4 text-lg">
                  Vumbuachiqs is Uvumbuzi Community Network’s flagship initiative dedicated to empowering girls and young women through technology. The program seeks to break barriers of gender inequality in the digital space by creating opportunities for girls to access, learn, and innovate with technology.
                </p>
                <p className="text-muted-foreground mt-4 text-lg">
                  Through training workshops, mentorship, and hands-on projects, Vumbuachiqs equips participants with skills in coding, robotics, digital design, internet safety, and entrepreneurship. The initiative also provides a safe and supportive environment where girls can connect with mentors, explore STEM careers, and grow their confidence as future innovators.
                </p>
                <p className="text-muted-foreground mt-4 text-lg">
                  By nurturing the next generation of female tech leaders, Vumbuachiqs contributes to a more inclusive, diverse, and empowered digital community—ensuring that girls are not just consumers of technology, but creators and change-makers.
                </p>
              </div>
               <div className="relative h-80 w-full rounded-lg overflow-hidden shadow-lg">
                <Image
                  src="https://images.unsplash.com/photo-1552056722-549e7c39b034?q=80&w=1974"
                  alt="Girls in Technology"
                  fill
                  objectFit="cover"
                  data-ai-hint="girls technology"
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