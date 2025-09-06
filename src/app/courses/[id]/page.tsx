
"use client";

import { useState, useEffect } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import Image from "next/image";
import { Loader2, ChevronLeft, Code, Image as ImageIcon, Video, AlertTriangle } from "lucide-react";
import { CodeSnippet } from "@/components/code-snippet";
import type { Course, CourseContentBlock } from "@/app/admin/page";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";


export default function DynamicCoursePage({ params }: { params: { id: string } }) {
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchCourse = async () => {
      if (!params.id) return;
      
      // Handle static course route
      if (params.id === 'coding') {
          router.replace('/courses/coding');
          return;
      }
      
      try {
        const docRef = doc(db, "courses", params.id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setCourse({ id: docSnap.id, ...docSnap.data() } as Course);
        } else {
          console.error("No such course!");
        }
      } catch (error) {
        console.error("Error fetching course:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCourse();
  }, [params.id, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (!course) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-center p-4">
          <h1 className="text-2xl font-bold text-destructive">Course Not Found</h1>
          <p className="text-muted-foreground">The course ID is invalid or does not exist.</p>
        </div>
      </div>
    );
  }
  
  const getYouTubeEmbedUrl = (url: string) => {
    let videoId;
    try {
        const urlObj = new URL(url);
        if (urlObj.hostname === 'youtu.be') {
            videoId = urlObj.pathname.slice(1);
        } else if (urlObj.hostname.includes('youtube.com')) {
            videoId = urlObj.searchParams.get('v');
        }
    } catch(e) {
        // Fallback for simple URLs without protocol
        if (url.includes('youtu.be/')) {
            videoId = url.split('youtu.be/')[1];
        } else if (url.includes('watch?v=')) {
            videoId = url.split('watch?v=')[1];
        }
    }
    
    if (videoId) {
        // Sanitize to remove extra query params
        const ampersandPosition = videoId.indexOf('&');
        if (ampersandPosition !== -1) {
            videoId = videoId.substring(0, ampersandPosition);
        }
        return `https://www.youtube.com/embed/${videoId}`;
    }
    return null;
  }

  const renderContentBlock = (block: CourseContentBlock, index: number) => {
    switch (block.type) {
        case 'text':
            return <p key={index} className="text-lg whitespace-pre-wrap">{block.content}</p>;
        case 'code':
            return <CodeSnippet key={index} language={block.language || 'bash'} code={block.content} />;
        case 'image':
            return <Image key={index} src={block.content} alt={`Course image ${index + 1}`} width={800} height={450} className="rounded-lg shadow-md my-4" />;
        case 'video':
            const embedUrl = getYouTubeEmbedUrl(block.content);
            return embedUrl ? (
                <div key={index} className="aspect-video my-4"><iframe src={embedUrl} title="YouTube video player" frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen className="w-full h-full rounded-lg"></iframe></div>
            ) : <p className="text-destructive">Invalid YouTube URL</p>;
        case 'tip':
            return (<div key={index} className="my-4 p-4 bg-accent/50 border-l-4 border-accent rounded-r-lg flex items-start gap-3"><AlertTriangle className="text-accent-foreground flex-shrink-0 mt-1" /><p className="text-accent-foreground">{block.content}</p></div>);
        default:
            return null;
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-1 py-12 md:py-16">
        <div className="container max-w-4xl mx-auto">
           <div className="mb-8">
               <Button variant="ghost" onClick={() => router.push('/courses')}><ChevronLeft className="mr-2"/> Back to Courses</Button>
           </div>
           <article className="prose lg:prose-xl dark:prose-invert max-w-none">
                <h1 className="font-headline text-4xl md:text-5xl font-bold tracking-tight mb-4">{course.title}</h1>
                <p className="text-muted-foreground text-xl lead">{course.description}</p>
                <hr className="my-8"/>
                <div className="space-y-6">
                    {course.content.map(renderContentBlock)}
                </div>
            </article>
        </div>
      </main>
      <Footer />
    </div>
  );
}
