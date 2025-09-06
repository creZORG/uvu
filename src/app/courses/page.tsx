
"use client";

import { useState, useEffect } from "react";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Loader2, ArrowRight } from "lucide-react";
import Image from "next/image";
import type { Course } from "@/app/admin/page";


const staticCourse = {
    id: 'coding',
    title: 'General Coding Course',
    description: "Work through each module to build your knowledge from scratch and prepare for the final certification exam.",
    thumbnailUrl: 'https://i.postimg.cc/8P5Y7bVb/coding-course.jpg',
    isStatic: true,
};

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([staticCourse]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const coursesQuery = query(collection(db, "courses"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(coursesQuery, (querySnapshot) => {
      const courseList: Course[] = [];
      querySnapshot.forEach((doc) => {
        courseList.push({ id: doc.id, ...doc.data() } as Course);
      });
      setCourses([staticCourse, ...courseList]);
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
                Our Courses
              </h1>
              <p className="max-w-3xl mx-auto text-muted-foreground mt-4 text-lg">
                Explore our range of courses designed to equip you with the skills for the digital age.
              </p>
            </div>
          </div>
        </section>
        <section className="py-16 md:py-24 -mt-24">
             <div className="container px-4 md:px-6">
                {loading ? (
                    <div className="flex justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
                        {courses.map((course) => (
                           <Card key={course.id} className="flex flex-col overflow-hidden hover:shadow-xl transition-shadow duration-300 group">
                                <Link href={`/courses/${course.id}`} className="flex flex-col h-full">
                                    <div className="relative w-full h-48">
                                        <Image
                                            src={course.thumbnailUrl || 'https://picsum.photos/400/200'}
                                            alt={`Thumbnail for ${course.title}`}
                                            fill
                                            className="object-cover"
                                        />
                                    </div>
                                    <CardHeader>
                                        <CardTitle className="font-headline text-xl group-hover:text-primary">{course.title}</CardTitle>
                                         <CardDescription className="line-clamp-2">{course.description}</CardDescription>
                                    </CardHeader>
                                    <CardFooter className="mt-auto">
                                        <Button asChild className="w-full">
                                            <span className="w-full">
                                                Start Learning <ArrowRight className="ml-2"/>
                                            </span>
                                        </Button>
                                    </CardFooter>
                                </Link>
                           </Card>
                        ))}
                         {courses.length === 0 && <p className="text-muted-foreground col-span-full text-center">No courses are currently available.</p>}
                    </div>
                )}
            </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
