
"use client";

import { useState, useEffect } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import Image from "next/image";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

type Project = {
  id: string;
  title: string;
  content: string;
  imageUrls: { url: string }[];
};

export default function ProjectDetailPage({ params }: { params: { id: string } }) {
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProject = async () => {
      if (!params.id) return;
      try {
        const docRef = doc(db, "projects", params.id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setProject({ id: docSnap.id, ...docSnap.data() } as Project);
        } else {
          console.error("No such project!");
        }
      } catch (error) {
        console.error("Error fetching project:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProject();
  }, [params.id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-center p-4">
          <h1 className="text-2xl font-bold text-destructive">Project Not Found</h1>
          <p className="text-muted-foreground">The project ID is invalid or does not exist.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-1">
        <section className="py-16 md:py-24">
          <div className="container px-4 md:px-6">
            <div className="grid md:grid-cols-2 gap-8 lg:gap-16 items-start max-w-5xl mx-auto">
              <div className="space-y-4">
                <h1 className="font-headline text-4xl md:text-5xl font-bold tracking-tight">
                  {project.title}
                </h1>
                <p className="text-muted-foreground mt-4 text-lg whitespace-pre-wrap">{project.content}</p>
              </div>
              
              {project.imageUrls && project.imageUrls.length > 0 && (
                 <div className="relative h-[500px] w-full">
                    {project.imageUrls.map((image, index) => (
                         <div 
                            key={index} 
                            className={cn(
                                "absolute w-[60%] h-auto aspect-[4/3] rounded-lg shadow-2xl overflow-hidden transition-all duration-300 hover:scale-105 hover:z-10",
                            )}
                            style={{
                                top: `${index * 15 + 5}%`,
                                left: `${index % 2 === 0 ? 5 : 35}%`,
                                transform: `rotate(${index % 2 === 0 ? -5 : 5}deg)`,
                            }}
                         >
                            <Image
                                src={image.url}
                                alt={`${project.title} image ${index + 1}`}
                                fill
                                className="object-cover"
                            />
                        </div>
                    ))}
                 </div>
              )}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}

    