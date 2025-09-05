
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Code, Computer, Recycle, TrendingUp, Tv, Users, Wifi } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const programs = [
    {
        href: "/programs/digital-literacy",
        icon: <Computer className="size-12 text-primary" />,
        title: "Digital Literacy",
        description: "Equipping youth, women, and marginalized groups with practical digital skills for education, business, and social development."
    },
    {
        href: "/programs/digital-literacy",
        icon: <Wifi className="size-12 text-primary" />,
        title: "Affordable Community Internet",
        description: "Providing affordable and reliable internet connectivity to schools, market centers, and households to improve access to essential services."
    },
    {
        href: "/programs/environmental-stewardship",
        icon: <Recycle className="size-12 text-primary" />,
        title: "Environmental Stewardship",
        description: "Promoting green jobs and sustainability through community e-waste recycling and renewable energy awareness campaigns."
    },
    {
        href: "/programs/vumbuachiqs",
        icon: <Code className="size-12 text-primary" />,
        title: "Vumbuachiqs - Girls in Technology",
        description: "Our flagship program empowering girls and young women with hands-on training in coding, robotics, and digital creativity."
    },
    {
        href: "/programs/youth-empowerment",
        icon: <TrendingUp className="size-12 text-primary" />,
        title: "Youth Empowerment",
        description: "Equipping young people with leadership, entrepreneurship, and life-skills through innovation labs and digital tools."
    },
    {
        href: "/programs/women-in-tech",
        icon: <Users className="size-12 text-primary" />,
        title: "Women in Tech",
        description: "Fostering a supportive ecosystem for women to advance their careers and become leaders in the technology industry."
    },
    {
        href: "/programs/ucn-radio",
        icon: <Tv className="size-12 text-primary" />,
        title: "UCN Radio (Future Plan)",
        description: "Our upcoming community radio station will serve as a voice for education, empowerment, and civic engagement."
    },
];

export default function ProgramsPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-1">
        <section className="py-16 md:py-24 bg-primary/5">
          <div className="container px-4 md:px-6">
            <div className="text-center mb-12">
              <h1 className="font-headline text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight">
                Our Programs
              </h1>
              <p className="max-w-3xl mx-auto text-muted-foreground mt-4 text-lg">
                Driving community transformation through focused initiatives in technology, environment, and empowerment.
              </p>
            </div>
          </div>
        </section>
        <section className="py-16 md:py-24 -mt-24">
             <div className="container px-4 md:px-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
                    {programs.map((program) => (
                        <Link href={program.href} key={program.title} className="flex">
                            <Card className="flex flex-col w-full hover:shadow-xl hover:-translate-y-2 transition-all duration-300">
                                <CardHeader className="items-center text-center">
                                    <div className="p-4 bg-primary/10 rounded-full mb-4">
                                        {program.icon}
                                    </div>
                                    <CardTitle className="font-headline text-2xl">{program.title}</CardTitle>
                                </CardHeader>
                                <CardContent className="text-center flex-1">
                                    <p className="text-muted-foreground">{program.description}</p>
                                </CardContent>
                                <CardFooter className="mt-auto justify-center pt-4">
                                    <Button variant="outline">
                                        Learn More
                                    </Button>
                                </CardFooter>
                            </Card>
                        </Link>
                    ))}
                </div>
            </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
