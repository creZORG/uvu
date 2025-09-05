
"use client"

import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Code, Bot, BrainCircuit, PenTool, Video, Palette, Tv, Lock } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const courses = [
    {
      title: "General Coding Course",
      description: "Learn fundamental programming concepts and build your first applications. Master Python, from variables to APIs, and solve real-world problems like Git authentication!",
      href: "/courses/coding",
      icon: <Code className="size-10 text-primary" />,
      status: "available",
    },
    {
      title: "Web Design Fundamentals",
      description: "Learn to create beautiful and functional websites from scratch using HTML, CSS, and JavaScript.",
      href: "/courses/web-design",
      icon: <Palette className="size-10 text-primary" />,
      status: "coming-soon",
    },
    {
      title: "CCTV & Security Systems",
      description: "Gain practical, hands-on skills in security system installation and maintenance.",
      href: "/courses/cctv-installation",
      icon: <Video className="size-10 text-primary" />,
      status: "coming-soon",
    },
    {
      title: "Introduction to Robotics",
      description: "Explore the exciting field of robotics, automation, and build your own smart machines.",
      href: "/courses/robotics",
      icon: <Bot className="size-10 text-primary" />,
      status: "coming-soon",
    },
    {
      title: "AI & Machine Learning",
      description: "Dive into the world of Artificial Intelligence and discover how machines can learn and predict.",
      href: "/courses/ai",
      icon: <BrainCircuit className="size-10 text-primary" />,
      status: "coming-soon",
    },
    {
      title: "Graphics Design Essentials",
      description: "Unleash your creativity and learn the art of visual communication with industry-standard tools.",
      href: "/courses/graphics-design",
      icon: <PenTool className="size-10 text-primary" />,
      status: "coming-soon",
    },
];


export default function CoursesPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-1">
        <section className="py-16 md:py-24">
          <div className="container px-4 md:px-6">
            <div className="text-center mb-12">
              <h1 className="font-headline text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight">
                Our Courses
              </h1>
              <p className="max-w-3xl mx-auto text-muted-foreground mt-4 text-lg">
                Explore a wide range of topics and start your learning journey today. The General Coding Course is now available!
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
                {courses.map((course) => {
                    const isAvailable = course.status === 'available';
                    
                    return (
                        <div key={course.title} className={cn("flex", isAvailable && "transform scale-105 shadow-2xl rounded-lg")}>
                            <Card className={cn(
                                "flex flex-col w-full hover:shadow-lg transition-all duration-300", 
                                !isAvailable && "bg-muted/50 cursor-not-allowed opacity-60",
                                isAvailable && "border-primary border-2"
                            )}>
                                <CardHeader className="flex-row items-start gap-4">
                                    {course.icon}
                                    <div className="flex-1">
                                        <CardTitle className="font-headline text-xl">{course.title}</CardTitle>
                                        <CardDescription className="mt-2">{course.description}</CardDescription>
                                    </div>
                                </CardHeader>
                                <CardFooter className="mt-auto flex justify-between items-center pt-4">
                                    <Badge variant={isAvailable ? "default" : "secondary"}>
                                        {isAvailable ? "Available Now" : "Coming Soon"}
                                    </Badge>
                                    
                                    {isAvailable ? (
                                        <Button asChild>
                                            <Link href={course.href}>Start Learning &rarr;</Link>
                                        </Button>
                                    ) : (
                                         <Button variant="outline" className="p-0 text-muted-foreground" disabled>
                                            <Lock className="mr-2" /> Coming Soon
                                        </Button>
                                    )}
                                </CardFooter>
                            </Card>
                        </div>
                    );
                })}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
