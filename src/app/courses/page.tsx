
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Code, Bot, BrainCircuit, PenTool, Video, Palette } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";


const courses = [
    {
      title: "Coding",
      description: "Test your knowledge of fundamental programming concepts with our interactive quiz.",
      href: "/courses/coding",
      icon: <Code className="size-10 text-primary" />,
    },
    {
      title: "Web Design",
      description: "Learn to create beautiful and functional websites from scratch.",
      href: "/courses/web-design",
      icon: <Palette className="size-10 text-primary" />,
    },
    {
      title: "CCTV Installation",
      description: "Gain practical, hands-on skills in security system installation.",
      href: "/courses/cctv-installation",
      icon: <Video className="size-10 text-primary" />,
    },
    {
      title: "Robotics",
      description: "Explore the exciting field of robotics, automation, and smart machines.",
      href: "/courses/robotics",
      icon: <Bot className="size-10 text-primary" />,
    },
    {
      title: "Artificial Intelligence",
      description: "Dive into the world of Artificial Intelligence and Machine Learning.",
      href: "/courses/ai",
      icon: <BrainCircuit className="size-10 text-primary" />,
    },
    {
      title: "Graphics Design",
      description: "Unleash your creativity and learn the art of visual communication.",
      href: "/courses/graphics-design",
      icon: <PenTool className="size-10 text-primary" />,
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
                Explore a wide range of topics and start your learning journey today.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
                {courses.map((course) => (
                     <Link href={course.href} key={course.title} className="flex">
                        <Card className="flex flex-col w-full hover:shadow-lg transition-shadow duration-300">
                            <CardHeader className="flex flex-row items-start gap-4">
                                {course.icon}
                                <div className="flex-1">
                                    <CardTitle className="font-headline text-xl">{course.title}</CardTitle>
                                    <CardDescription className="mt-2">{course.description}</CardDescription>
                                </div>
                            </CardHeader>
                            <CardContent className="mt-auto">
                                <Button variant="link" className="p-0 text-primary">
                                    Learn More &rarr;
                                </Button>
                            </CardContent>
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
