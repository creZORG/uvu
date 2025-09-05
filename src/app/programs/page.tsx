
"use client";

import { useState, useEffect } from "react";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Loader2, FolderKanban } from "lucide-react";

type Project = {
  id: string;
  title: string;
  content: string;
  imageUrls: { url: string }[];
};

export default function ProgramsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const projectsQuery = query(collection(db, "projects"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(projectsQuery, (querySnapshot) => {
      const projs: Project[] = [];
      querySnapshot.forEach((doc) => {
        projs.push({ id: doc.id, ...doc.data() } as Project);
      });
      setProjects(projs);
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
            <div className="text-center mb-12">
              <h1 className="font-headline text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight">
                Our Programs & Projects
              </h1>
              <p className="max-w-3xl mx-auto text-muted-foreground mt-4 text-lg">
                Driving community transformation through focused initiatives in technology, environment, and empowerment.
              </p>
            </div>
          </div>
        </section>
        <section className="py-16 md:py-24 -mt-24">
             <div className="container px-4 md:px-6">
                {loading ? (
                    <div className="flex justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
                        {projects.map((project) => (
                            <Link href={`/programs/${project.id}`} key={project.id} className="flex">
                                <Card className="flex flex-col w-full hover:shadow-xl hover:-translate-y-2 transition-all duration-300">
                                    <CardHeader className="items-center text-center">
                                        <div className="p-4 bg-primary/10 rounded-full mb-4">
                                            <FolderKanban className="size-12 text-primary" />
                                        </div>
                                        <CardTitle className="font-headline text-2xl">{project.title}</CardTitle>
                                    </CardHeader>
                                    <CardContent className="text-center flex-1">
                                        <p className="text-muted-foreground line-clamp-3">{project.content}</p>
                                    </CardContent>
                                    <CardFooter className="mt-auto justify-center pt-4">
                                        <Button variant="outline">
                                            Learn More
                                        </Button>
                                    </CardFooter>
                                </Card>
                            </Link>
                        ))}
                         {projects.length === 0 && <p className="text-muted-foreground col-span-full text-center">No projects have been added yet.</p>}
                    </div>
                )}
            </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}

    