
"use client";

import { useState, useEffect } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Image from "next/image";
import { Loader2 } from "lucide-react";

type TeamMember = {
  id: string;
  name: string;
  title: string;
  bio: string;
  imageUrl: string;
  order: number;
};

export default function AboutPage() {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);

  const aboutContent = `Uvumbuzi Community Network (UCN) is a community-based organization (CBO) domiciled in Kivumbini Ward, Nakuru County, committed to bridging the digital divide and fostering sustainable development through innovation. Rooted in the Swahili word "Uvumbuzi," meaning innovation, UCN exists to spark creativity, resilience, and opportunity in underserved communities. From Nakuru, the network is expanding its reach across Kenya by creating inclusive platforms that combine digital literacy, affordable connectivity, environmental stewardship, entrepreneurship, and lifelong learning. By combining technology, indigenous knowledge, and collaborative leadership, UCN builds networks of resilience that inspire self-reliance and innovation.`;
  const missionVisionContent = `Vision: To empower underserved communities through inclusive access to digital innovation, sustainable development, and lifelong learning, fostering a resilient and connected society. Mission: To create inclusive platforms that promote digital literacy, environmental stewardship, and social innovation by establishing ICT hubs, supporting e-waste recycling initiatives, and equipping youth and women with practical skills for sustainable development. Our Approach: UCN works with schools, community-based organizations, and local governments to co-create solutions that respond to real challenges faced by our communities.`;

  useEffect(() => {
    const contentRef = doc(db, "siteContent", "content");
    const unsubscribe = onSnapshot(contentRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.teamMembers) {
          const sortedTeam = [...data.teamMembers].sort((a,b) => a.order - b.order);
          setTeamMembers(sortedTeam);
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
        <section className="py-16 md:py-24 bg-primary/5">
          <div className="container px-4 md:px-6">
            <div className="text-center">
                <h1 className="font-headline text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight">
                    About Uvumbuzi
                </h1>
                <p className="max-w-3xl mx-auto text-muted-foreground mt-4 text-lg">
                    Building resilient and connected communities through technology and collaboration.
                </p>
            </div>
            <div className="grid md:grid-cols-2 gap-8 lg:gap-16 items-center mt-12 max-w-5xl mx-auto">
              <p className="text-foreground text-lg leading-relaxed">{aboutContent}</p>
              <div className="relative h-64 md:h-80 w-full rounded-lg overflow-hidden shadow-lg">
                <Image src="https://i.pinimg.com/1200x/e3/2f/8a/e32f8a3218f3bd52e41c82b61063880f.jpg" alt="Community Meeting" fill className="object-cover" data-ai-hint="community meeting" />
              </div>
            </div>
          </div>
        </section>

        <section className="py-16 md:py-24">
          <div className="container px-4 md:px-6 text-center">
            <h2 className="font-headline text-3xl md:text-4xl font-bold tracking-tight mb-4">Our Vision & Mission</h2>
            <p className="max-w-4xl mx-auto text-muted-foreground text-lg">
              {missionVisionContent}
            </p>
          </div>
        </section>

        <section id="team" className="py-16 md:py-24 bg-primary/5">
          <div className="container px-4 md:px-6">
            <div className="text-center mb-12">
              <h2 className="font-headline text-3xl md:text-4xl font-bold tracking-tight">Meet the Team</h2>
              <p className="max-w-2xl mx-auto text-muted-foreground mt-4 text-lg">
                The passionate individuals driving our mission forward.
              </p>
            </div>
            {loading ? (
              <div className="flex justify-center">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
                {teamMembers.map((member, index) => (
                  <Card key={index} className="text-center p-6">
                    <Avatar className="w-32 h-32 mx-auto mb-4 border-4 border-primary/20">
                      <AvatarImage src={member.imageUrl} alt={member.name} />
                      <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <CardContent>
                      <h3 className="font-headline text-xl font-bold">{member.name}</h3>
                      <p className="text-primary font-semibold mb-2">{member.title}</p>
                      <p className="text-muted-foreground text-sm">{member.bio}</p>
                    </CardContent>
                  </Card>
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
