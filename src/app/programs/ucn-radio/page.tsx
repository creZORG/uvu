import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import Image from "next/image";

export default function UcnRadioPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-1">
        <section className="py-16 md:py-24">
          <div className="container px-4 md:px-6">
            <div className="grid md:grid-cols-2 gap-8 lg:gap-16 items-center max-w-5xl mx-auto">
             <div className="relative h-80 w-full rounded-lg overflow-hidden shadow-lg order-last md:order-first">
                <Image
                  src="https://images.unsplash.com/photo-1519300185346-39a09214159c?q=80&w=1966"
                  alt="Radio Station"
                  fill
                  objectFit="cover"
                  data-ai-hint="radio station"
                />
              </div>
              <div>
                <h1 className="font-headline text-4xl md:text-5xl font-bold tracking-tight">
                  UCN Radio Station – Future Plan
                </h1>
                <p className="text-muted-foreground mt-4 text-lg">
                  As part of its vision to create an empowered and connected community, Uvumbuzi Community Network (UCN) is laying the groundwork for the establishment of UCN Radio, a community radio station that will serve as a voice for the people in Nakuru County and beyond.
                </p>
              </div>
            </div>

            <div className="max-w-5xl mx-auto mt-16">
                 <h2 className="font-headline text-3xl font-bold tracking-tight text-center mb-8">Purpose and Role</h2>
                <p className="text-muted-foreground text-lg text-center max-w-3xl mx-auto">
                    UCN Radio will be more than just an entertainment channel – it will be a platform for education, empowerment, and civic engagement, fully aligned with UCN’s mission of bridging social and digital gaps. The station will ensure that underserved communities have access to timely, relevant, and culturally resonant information.
                </p>

                <div className="grid md:grid-cols-2 gap-8 mt-12">
                    <div>
                        <h3 className="font-headline text-2xl font-semibold mb-4">Planned Features & Content</h3>
                        <ul className="list-disc list-inside space-y-2 text-muted-foreground text-lg">
                            <li><strong>Educational Programs:</strong> Broadcasting on health, agriculture, technology, climate change, and digital literacy.</li>
                            <li><strong>Youth & Women Voices:</strong> Platforms for young innovators, entrepreneurs, and women leaders to share their experiences and solutions.</li>
                            <li><strong>Cultural Preservation:</strong> Showcasing local music, oral histories, and indigenous knowledge.</li>
                            <li><strong>Civic Engagement:</strong> Promoting governance awareness, community dialogues, and peacebuilding conversations.</li>
                            <li><strong>Interactive Call-in Shows:</strong> Giving community members the opportunity to raise issues, ask questions, and engage directly.</li>
                        </ul>
                    </div>
                     <div>
                        <h3 className="font-headline text-2xl font-semibold mb-4">Impact Goals</h3>
                        <ul className="list-disc list-inside space-y-2 text-muted-foreground text-lg">
                           <li>Amplify local voices that are often excluded from mainstream media.</li>
                            <li>Support community learning through accessible and relatable content.</li>
                            <li>Strengthen social cohesion by giving all groups—youth, women, elders—a place to be heard.</li>
                            <li>Promote digital inclusion by linking on-air programs with online resources through UCN’s connectivity initiatives.</li>
                        </ul>
                    </div>
                </div>

                 <div className="mt-12">
                        <h3 className="font-headline text-2xl font-semibold mb-4 text-center">Next Steps in Development</h3>
                        <ol className="list-decimal list-inside space-y-2 text-muted-foreground text-lg max-w-2xl mx-auto">
                           <li><strong>Regulatory Process:</strong> Secure licensing and compliance with the Communications Authority of Kenya (CAK).</li>
                            <li><strong>Infrastructure Development:</strong> Establish the radio studio, transmission equipment, and community reporting hubs.</li>
                            <li><strong>Capacity Building:</strong> Train volunteer presenters, journalists, and community correspondents.</li>
                            <li><strong>Partnership Building:</strong> Collaborate with NGOs, government agencies, and local schools to co-create educational content.</li>
                            <li><strong>Pilot Broadcasts:</strong> Start with online radio streaming as groundwork for FM launch.</li>
                        </ol>
                    </div>

            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}