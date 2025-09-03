import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import Image from "next/image";

export default function EnvironmentalStewardshipPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-1">
        <section className="py-16 md:py-24">
          <div className="container px-4 md:px-6">
            <div className="grid md:grid-cols-2 gap-8 lg:gap-16 items-center max-w-5xl mx-auto">
              <div className="relative h-80 w-full rounded-lg overflow-hidden shadow-lg order-last md:order-first">
                <Image
                  src="https://images.unsplash.com/photo-1619479929851-9f44c41258b3?q=80&w=2070"
                  alt="E-Waste Management"
                  fill
                  objectFit="cover"
                  data-ai-hint="e-waste management"
                />
              </div>
              <div>
                <h1 className="font-headline text-4xl md:text-5xl font-bold tracking-tight">
                  E-Waste Management
                </h1>
                <p className="text-muted-foreground mt-4 text-lg">
                  As technology use expands across communities, so does the challenge of electronic waste (e-waste). Uvumbuzi Community Network (UCN) recognizes the risks posed by improper disposal of discarded gadgets, computers, and electronic devices to both human health and the environment.
                </p>
                <div className="text-muted-foreground mt-4 text-lg space-y-4">
                    <p>UCN is developing an E-Waste Management initiative that focuses on:</p>
                    <ul className="list-disc list-inside space-y-2">
                        <li><strong>Awareness & Education:</strong> Sensitizing communities on the dangers of unsafe e-waste disposal and the value of recycling.</li>
                        <li><strong>Safe Collection & Disposal:</strong> Establishing collection points for obsolete devices and linking with certified recycling partners.</li>
                        <li><strong>Upcycling & Reuse:</strong> Training youth and innovators to repurpose components for learning, creativity, and affordable tech solutions.</li>
                        <li><strong>Policy Advocacy:</strong> Engaging local authorities and stakeholders to promote responsible e-waste policies and enforcement.</li>
                    </ul>
                    <p>Through this initiative, UCN seeks to turn e-waste into opportunity—protecting the environment, creating green jobs, and ensuring that the digital revolution remains sustainable and community-friendly.</p>
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