import { Header } from "@/components/header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ContactForm } from "@/components/contact-form";
import { AnimatedCounter } from "@/components/animated-counter";
import Image from "next/image";
import Link from "next/link";
import { BookOpen, Code, Computer, Handshake, HeartHandshake, Leaf, Lightbulb, Recycle, ShieldCheck, Stethoscope, TowerControl, TrendingUp, Users } from "lucide-react";
import { UcnLogo } from "@/components/icons";
import { Footer } from "@/components/footer";

export default function Home() {
  const aboutContent = `Uvumbuzi Community Network (UCN) is a community-based organization (CBO) domiciled in Kivumbini Ward, Nakuru County, committed to bridging the digital divide and fostering sustainable development through innovation. Rooted in the Swahili word "Uvumbuzi," meaning innovation, UCN exists to spark creativity, resilience, and opportunity in underserved communities. From Nakuru, the network is expanding its reach across Kenya by creating inclusive platforms that combine digital literacy, affordable connectivity, environmental stewardship, entrepreneurship, and lifelong learning. By combining technology, indigenous knowledge, and collaborative leadership, UCN builds networks of resilience that inspire self-reliance and innovation.`;
  const missionVisionContent = `Vision: To empower underserved communities through inclusive access to digital innovation, sustainable development, and lifelong learning, fostering a resilient and connected society. Mission: To create inclusive platforms that promote digital literacy, environmental stewardship, and social innovation by establishing ICT hubs, supporting e-waste recycling initiatives, and equipping youth and women with practical skills for sustainable development. Our Approach: UCN works with schools, community-based organizations, and local governments to co-create solutions that respond to real challenges faced by our communities.`;
  
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1">
        <section id="home" className="relative text-center py-20 md:py-32 lg:py-40 text-white">
          <div className="absolute inset-0 bg-black/50 z-0">
             <Image src="https://i.postimg.cc/52Fq9798/photo-1521790609145-bacea5940bde.avif" alt="Community" fill objectFit="cover" className="opacity-50" />
          </div>
          <div className="container px-4 md:px-6 z-10 relative">
            <h1 className="font-headline text-4xl md:text-5xl lg:text-6xl font-bold tracking-tighter mb-4">
              Empowering Communities Through Digital Innovation
            </h1>
            <p className="max-w-3xl mx-auto text-lg md:text-xl text-white/90 mb-8">
              Uvumbuzi Community Network is dedicated to creating inclusive pathways for underserved populations to participate in the digital economy and social progress.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground">
                <Link href="#programs">Our Programs</Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="border-white text-white hover:bg-white/10 hover:text-white">
                <Link href="#contact">Contact Us</Link>
              </Button>
            </div>
          </div>
        </section>

        <section id="about" className="py-16 md:py-24 bg-background">
          <div className="container px-4 md:px-6">
            <div className="grid md:grid-cols-2 gap-8 lg:gap-16 items-center">
              <div>
                <h2 className="font-headline text-3xl md:text-4xl font-bold tracking-tight mb-4">About Uvumbuzi</h2>
                <p className="text-muted-foreground text-lg mb-6">
                  Building resilient and connected communities through technology and collaboration.
                </p>
                <p className="text-foreground text-lg">{aboutContent}</p>
              </div>
              <div className="relative h-64 md:h-full w-full rounded-lg overflow-hidden shadow-lg">
                <Image src="https://picsum.photos/600/500" alt="Community Meeting" fill objectFit="cover" data-ai-hint="community meeting" />
              </div>
            </div>
          </div>
        </section>

        <section id="mission" className="py-16 md:py-24 bg-primary/10">
          <div className="container px-4 md:px-6 text-center">
            <h2 className="font-headline text-3xl md:text-4xl font-bold tracking-tight mb-4">Our Vision & Mission</h2>
            <p className="max-w-3xl mx-auto text-muted-foreground text-lg mb-8">
              Guiding principles that drive our community initiatives.
            </p>
            <p className="text-foreground text-lg">{missionVisionContent}</p>
          </div>
        </section>

        <section id="values" className="py-16 md:py-24">
          <div className="container px-4 md:px-6">
            <div className="text-center mb-12">
              <h2 className="font-headline text-3xl md:text-4xl font-bold tracking-tight">Our Core Values</h2>
              <p className="max-w-2xl mx-auto text-muted-foreground mt-4 text-lg">
                The principles that guide everything we do.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8">
              {[
                { icon: <HeartHandshake className="size-8 text-primary" />, title: "Inclusion", text: "Equal opportunities for all regardless of background, gender, or ability." },
                { icon: <Lightbulb className="size-8 text-primary" />, title: "Innovation", text: "Practical, community-driven solutions to local challenges." },
                { icon: <Leaf className="size-8 text-primary" />, title: "Sustainability", text: "Protecting the environment and creating sustainable livelihoods." },
                { icon: <Handshake className="size-8 text-primary" />, title: "Collaboration", text: "Building partnerships for greater impact and community ownership." },
                { icon: <ShieldCheck className="size-8 text-primary" />, title: "Integrity", text: "Transparency, accountability, and trust in all our operations." },
              ].map(value => (
                <div key={value.title} className="text-center p-6 rounded-lg hover:bg-accent transition-colors">
                  <div className="flex justify-center mb-4">{value.icon}</div>
                  <h3 className="font-headline text-xl font-semibold mb-2">{value.title}</h3>
                  <p className="text-muted-foreground">{value.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
        
        <section id="programs" className="py-16 md:py-24">
          <div className="container px-4 md:px-6">
            <div className="text-center mb-12">
                <h2 className="font-headline text-3xl md:text-4xl font-bold tracking-tight">Our Programs</h2>
                <p className="max-w-3xl mx-auto text-muted-foreground mt-4 text-lg">
                    Initiatives driving change in our communities.
                </p>
            </div>
            <div className="grid md:grid-cols-2 gap-8">
                {[
                    { icon: <Computer className="size-10 text-primary" />, title: "Digital Access & Literacy", description: "We provide affordable internet connectivity and Wi-Fi hotspots to schools, market centers, health facilities, and households. These hotspots improve access to education, business opportunities, healthcare, and daily communication." },
                    { icon: <Recycle className="size-10 text-primary" />, title: "Environmental Stewardship", description: "Our community e-waste recycling and awareness campaigns create green jobs for youth in recycling and renewable energy. We also establish solar-powered ICT centers for sustainable access." },
                    { icon: <Code className="size-10 text-primary" />, title: "Vumbuachiqs - Girls in Technology", description: "Our flagship program empowering girls and young women in technology through hands-on training in coding, robotics, and digital creativity. We provide mentorship, safe learning spaces, and STEM career guidance." },
                    { icon: <TrendingUp className="size-10 text-primary" />, title: "Youth Empowerment", description: "We equip young people with leadership, entrepreneurship, and life-skills training. Our innovation labs support youth-driven problem solving and provide access to digital tools for market and financial inclusion." },
                ].map(program => (
                    <Card key={program.title} className="flex flex-col sm:flex-row items-center p-6 gap-6 hover:shadow-lg transition-shadow">
                        <div className="flex-shrink-0">{program.icon}</div>
                        <div>
                            <CardTitle className="font-headline text-xl mb-2">{program.title}</CardTitle>
                            <CardDescription>{program.description}</CardDescription>
                             <Button variant="link" className="p-0 mt-2 text-primary">Learn More &rarr;</Button>
                        </div>
                    </Card>
                ))}
            </div>
          </div>
        </section>

        <section id="contact" className="py-16 md:py-24 bg-background">
            <div className="container px-4 md:px-6">
                <div className="grid md:grid-cols-2 gap-8 lg:gap-16 items-center">
                    <div>
                        <h2 className="font-headline text-3xl md:text-4xl font-bold tracking-tight">Contact Us</h2>
                        <p className="text-muted-foreground mt-4 text-lg">
                            Have a question or want to get involved? We'd love to hear from you.
                        </p>
                        <div className="mt-8 space-y-4 text-lg">
                            <p><strong>Email:</strong> info@uvumbuzi.org</p>
                            <p><strong>Phone:</strong> +254 700 000 000</p>
                            <p><strong>Location:</strong> Kivumbini, Nakuru, Kenya</p>
                        </div>
                    </div>
                    <Card className="p-6 sm:p-8">
                      <CardHeader>
                        <CardTitle className="font-headline text-2xl">Send us a message</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ContactForm />
                      </CardContent>
                    </Card>
                </div>
            </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
