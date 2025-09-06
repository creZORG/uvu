
"use client";

import { useState, useEffect } from "react";
import { Header } from "@/components/header";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import Image from "next/image";
import Link from "next/link";
import { Handshake, HeartHandshake, Leaf, Lightbulb, Recycle, ShieldCheck, FolderKanban } from "lucide-react";
import { Footer } from "@/components/footer";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";
import { Loader2 } from 'lucide-react';
import { db } from "@/lib/firebase";
import { collection, doc, getDoc, onSnapshot, orderBy, query, limit } from "firebase/firestore";


const defaultSliderImages = [
  {
    src: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=2070",
    alt: "Community members learning together",
    "data-ai-hint": "community learning"
  },
  {
    src: "https://images.unsplash.com/photo-1516321497487-e288fb19713f?q=80&w=2070",
    alt: "Collaborative tech environment",
    "data-ai-hint": "tech collaboration"
  },
  {
    src: "https://images.unsplash.com/photo-1581093450021-4a7360e9a6b5?q=80&w=2070",
    alt: "Innovative electronics workshop",
    "data-ai-hint": "electronics workshop"
  },
];

type Project = {
  id: string;
  title: string;
  content: string;
};

export default function Home() {
  const [loadingContent, setLoadingContent] = useState(true);
  const [loadingProjects, setLoadingProjects] = useState(true);
  const [sliderImages, setSliderImages] = useState(defaultSliderImages);
  const [projects, setProjects] = useState<Project[]>([]);


  useEffect(() => {
    const fetchContent = async () => {
        try {
            const docRef = doc(db, "siteContent", "content");
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                const data = docSnap.data();
                if(data.carouselImages && data.carouselImages.length > 0) setSliderImages(data.carouselImages);
            }
        } catch (error) {
            console.error("Error fetching homepage content:", error);
        } finally {
            setLoadingContent(false);
        }
    };

    const projectsQuery = query(collection(db, "projects"), orderBy("createdAt", "desc"), limit(4));
    const unsubscribe = onSnapshot(projectsQuery, (querySnapshot) => {
        const projs: Project[] = [];
        querySnapshot.forEach((doc) => {
            projs.push({ id: doc.id, ...doc.data() } as Project);
        });
        setProjects(projs);
        setLoadingProjects(false);
    });

    fetchContent();
    return () => unsubscribe();
  }, []);

  const aboutContent = `Uvumbuzi Community Network (UCN) is a community-based organization (CBO) domiciled in Kivumbini Ward, Nakuru County, committed to bridging the digital divide and fostering sustainable development through innovation. Rooted in the Swahili word "Uvumbuzi," meaning innovation, UCN exists to spark creativity, resilience, and opportunity in underserved communities. From Nakuru, the network is expanding its reach across Kenya by creating inclusive platforms that combine digital literacy, affordable connectivity, environmental stewardship, entrepreneurship, and lifelong learning. By combining technology, indigenous knowledge, and collaborative leadership, UCN builds networks of resilience that inspire self-reliance and innovation.`;
  const missionVisionContent = `Vision: To empower underserved communities through inclusive access to digital innovation, sustainable development, and lifelong learning, fostering a resilient and connected society. Mission: To create inclusive platforms that promote digital literacy, environmental stewardship, and social innovation by establishing ICT hubs, supporting e-waste recycling initiatives, and equipping youth and women with practical skills for sustainable development. Our Approach: UCN works with schools, community-based organizations, and local governments to co-create solutions that respond to real challenges faced by our communities.`;
  
  const partnerLogos = [
    { src: "https://i.postimg.cc/k22RKmX9/Whats-App-Image-2025-09-03-at-00-21-08-46a2e09a.jpg", alt: "Partner Logo 1" },
    { src: "https://i.postimg.cc/RNsnWFmX/Whats-App-Image-2025-09-03-at-00-22-49-4862a8d6.jpg", alt: "Partner Logo 2" },
    { src: "https://i.postimg.cc/rKFry4BD/Whats-App-Image-2025-09-03-at-00-26-21-93c84d74.jpg", alt: "Partner Logo 3" },
    { src: "https://i.postimg.cc/mhS9Gj5x/Whats-App-Image-2025-09-03-at-00-27-46-2a5346dd.jpg", alt: "Partner Logo 4" },
    { src: "https://i.postimg.cc/D47bX4mY/Whats-App-Image-2025-09-03-at-00-29-16-dc51b28f.jpg", alt: "Partner Logo 5" },
    { src: "https://i.postimg.cc/xqQm7hgy/Whats-App-Image-2025-09-03-at-00-32-12-1cd3f1ec.jpg", alt: "Partner Logo 6" },
    { src: "https://i.postimg.cc/5YBCyS9C/Whats-App-Image-2025-09-03-at-00-37-32-de020fbf.jpg", alt: "Partner Logo 7" },
  ];

  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <main className="flex-1">
        <section id="home" className="relative h-[60vh] md:h-[80vh] w-full text-center text-white flex items-center justify-center">
            {loadingContent ? (
                <div className="absolute inset-0 flex items-center justify-center bg-secondary">
                    <Loader2 className="h-12 w-12 animate-spin text-primary" />
                </div>
            ) : (
                <Carousel
                    className="absolute inset-0 w-full h-full"
                    plugins={[
                    Autoplay({
                        delay: 3000,
                        stopOnInteraction: false,
                        stopOnMouseEnter: true,
                    }),
                    ]}
                >
                    <CarouselContent>
                    {sliderImages.map((image, index) => (
                        <CarouselItem key={`${image.src}-${index}`}>
                        <div className="relative h-[60vh] md:h-[80vh] w-full">
                            <div
                                className="absolute inset-0 bg-black/40 z-10"
                                style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
                            />
                            <Image
                                src={image.src}
                                alt={image.alt}
                                fill
                                className="object-cover"
                                priority
                                data-ai-hint={image['data-ai-hint']}
                            />
                        </div>
                        </CarouselItem>
                    ))}
                    </CarouselContent>
                </Carousel>
            )}
            
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
                    <Link href="/contact">Contact Us</Link>
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
                <Image src="https://i.pinimg.com/1200x/e3/2f/8a/e32f8a3218f3bd52e41c82b61063880f.jpg" alt="Community Meeting" fill className="object-cover" data-ai-hint="community meeting" />
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
                    A look at our latest initiatives driving change in our communities.
                </p>
            </div>
            {loadingProjects ? (
                <div className="flex justify-center"><Loader2 className="h-8 w-8 animate-spin"/></div>
            ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {projects.map(project => (
                    <Link href={`/programs/${project.id}`} key={project.id}>
                        <Card className="flex flex-col items-center p-6 gap-4 hover:shadow-lg transition-shadow h-full text-center">
                             <div className="p-3 bg-primary/10 rounded-full mb-2">
                                <FolderKanban className="size-8 text-primary" />
                            </div>
                            <CardTitle className="font-headline text-xl">{project.title}</CardTitle>
                            <CardDescription className="line-clamp-3">{project.content}</CardDescription>
                            <Button variant="link" className="p-0 mt-2 text-primary">Learn More &rarr;</Button>
                        </Card>
                    </Link>
                    ))}
                </div>
            )}
            <div className="text-center mt-12">
                <Button asChild size="lg">
                    <Link href="/programs">View All Programs</Link>
                </Button>
            </div>
          </div>
        </section>

        <section id="partners" className="py-16 md:py-24 bg-primary/10">
          <div className="container px-4 md:px-6">
            <div className="text-center mb-12">
              <h2 className="font-headline text-3xl md:text-4xl font-bold tracking-tight">Our Partners</h2>
              <p className="max-w-2xl mx-auto text-muted-foreground mt-4 text-lg">
                We are proud to collaborate with organizations that share our vision.
              </p>
            </div>
            <div className="flex flex-wrap justify-center items-center gap-8 md:gap-12">
              {partnerLogos.map((logo, index) => (
                <div key={index} className="relative h-20 w-40 transition-all duration-300">
                  <Image
                    src={logo.src}
                    alt={logo.alt}
                    fill
                    className="object-contain"
                  />
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
