import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import Image from "next/image";

export default function YouthEmpowermentPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-1">
        <section className="py-16 md:py-24">
          <div className="container px-4 md:px-6">
            <div className="grid md:grid-cols-2 gap-8 lg:gap-16 items-center max-w-5xl mx-auto">
              <div className="relative h-80 w-full rounded-lg overflow-hidden shadow-lg order-last md:order-first">
                 <Image
                  src="https://images.unsplash.com/photo-1524178232363-1fb2b075b655?q=80&w=2070"
                  alt="Youth Empowerment"
                  fill
                  objectFit="cover"
                  data-ai-hint="youth empowerment"
                />
              </div>
              <div>
                <h1 className="font-headline text-4xl md:text-5xl font-bold tracking-tight">
                  Youth Empowerment
                </h1>
                <p className="text-muted-foreground mt-4 text-lg">
                  Uvumbuzi Community Network (UCN) recognizes that youth are the driving force of innovation and community transformation. Through its Youth Empowerment initiative, UCN creates opportunities for young people to build skills, access resources, and unlock their potential as leaders and changemakers.
                </p>
                <div className="text-muted-foreground mt-4 text-lg space-y-4">
                    <p>The program focuses on:</p>
                    <ul className="list-disc list-inside space-y-2">
                        <li><strong>Capacity Building:</strong> Training in digital skills, entrepreneurship, leadership, and life skills.</li>
                        <li><strong>Innovation & Creativity:</strong> Providing platforms for youth to showcase ideas, develop solutions, and engage in community projects.</li>
                        <li><strong>Economic Opportunities:</strong> Linking young people to mentorship, internships, and income-generating ventures.</li>
                        <li><strong>Civic Engagement:</strong> Encouraging youth participation in governance, advocacy, and community decision-making.</li>
                    </ul>
                    <p>By investing in the energy, creativity, and resilience of young people, UCN empowers them to drive social, economic, and digital transformation within their communities.</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}