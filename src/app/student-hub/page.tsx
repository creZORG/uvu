
"use client";

import { useState, useEffect } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { doc, onSnapshot, query, collection, orderBy, limit } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Loader2, Search, GraduationCap, Book, Calendar, Ban } from "lucide-react";
import { ProfileEditModal } from "@/components/profile-edit-modal";
import { ProfileDisplay } from "@/components/profile-display";
import { isProfileComplete } from "@/lib/utils";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import type { Course, UserProfile } from "@/lib/types";


export default function StudentHubPage() {
  const [user, loading] = useAuthState(auth);
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [isModalRequired, setIsModalRequired] = useState(false);
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.push("/auth");
      return;
    }

    const profileRef = doc(db, "userProfiles", user.uid);
    const unsubscribeProfile = onSnapshot(profileRef, (docSnap) => {
      if (docSnap.exists()) {
        const profileData = { userId: docSnap.id, ...docSnap.data() } as UserProfile;
        setProfile(profileData);
        if (profileData.role === 'student' || profileData.role === 'admin') {
            setIsAuthorized(true);
            if (isProfileComplete(profileData)) {
              setIsModalRequired(false);
            } else {
              setIsModalRequired(true);
            }
        } else {
            setIsAuthorized(false);
        }
      } else {
        setProfile(null);
        setIsModalRequired(true);
        setIsAuthorized(false);
      }
      setIsLoadingProfile(false);
    });

    const coursesQuery = query(collection(db, "courses"), orderBy("createdAt", "desc"), limit(4));
    const unsubscribeCourses = onSnapshot(coursesQuery, (querySnapshot) => {
        const courseList: Course[] = [];
        querySnapshot.forEach((doc) => {
            courseList.push({ id: doc.id, ...doc.data()} as Course);
        });
        setCourses(courseList);
    });

    return () => {
        unsubscribeProfile();
        unsubscribeCourses();
    };
  }, [user, loading, router]);

  const handleProfileUpdate = () => {
    const redirectUrl = sessionStorage.getItem('redirectAfterProfileUpdate');
    if (redirectUrl) {
      sessionStorage.removeItem('redirectAfterProfileUpdate');
      router.push(redirectUrl);
    } else {
      setIsModalRequired(false);
    }
  };
  
  if (loading || isLoadingProfile) {
    return (
      <div className="flex flex-col min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin" />
        <p className="mt-4 text-muted-foreground">Loading Student Hub...</p>
      </div>
    );
  }
  
  if (!isAuthorized) {
    return (
        <div className="flex flex-col min-h-screen">
            <Header />
            <main className="flex-1 flex items-center justify-center p-4">
                <Card className="w-full max-w-md text-center border-destructive">
                    <CardHeader>
                        <CardTitle className="font-headline text-2xl flex items-center justify-center gap-2 text-destructive"><Ban /> Access Denied</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p>This portal is for students only.</p>
                        <Button asChild className="mt-4"><Link href="/">Return to Homepage</Link></Button>
                    </CardContent>
                </Card>
            </main>
            <Footer />
        </div>
    );
  }

  if (profile?.status === 'suspended') {
     return (
        <div className="flex flex-col min-h-screen">
            <Header />
            <main className="flex-1 flex items-center justify-center p-4">
                <Card className="w-full max-w-md text-center border-destructive bg-destructive/10">
                    <CardHeader>
                        <CardTitle className="font-headline text-2xl flex items-center justify-center gap-2 text-destructive-foreground"><Ban /> Account Suspended</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <p className="text-destructive-foreground/90">Your account has been suspended. Please contact the administration for more information.</p>
                        <Button asChild variant="secondary"><Link href="/contact">Contact Support</Link></Button>
                    </CardContent>
                </Card>
            </main>
            <Footer />
        </div>
    );
  }

  if (isModalRequired) {
    return (
       <div className="flex flex-col min-h-screen bg-background">
        <Header />
        <main className="flex-1 flex items-center justify-center">
            {user && (
                <ProfileEditModal 
                    isOpen={isModalRequired} 
                    setIsOpen={setIsModalRequired} 
                    user={user}
                    existingProfile={profile}
                    onProfileUpdate={handleProfileUpdate}
                />
            )}
        </main>
        <Footer />
       </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen bg-primary/5">
      <Header />
      <main className="flex-1 py-12 md:py-16">
        <div className="container max-w-6xl mx-auto">
            <header className="mb-12 text-center">
                <h1 className="font-headline text-4xl md:text-5xl font-bold tracking-tight">Welcome to the Student Hub</h1>
                 <div className="relative max-w-lg mx-auto mt-6">
                    <Input placeholder="Search resources, courses, and more..." className="h-12 pl-12 pr-4 rounded-full text-base" />
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
                </div>
            </header>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                {[
                    { title: "My Learning", icon: <GraduationCap/>, buttonText: "View My Learning", href: "/courses" },
                    { title: "Browse Books", icon: <Book/>, buttonText: "Browse Catalog", href: "/books" },
                    { title: "Upcoming Events", icon: <Calendar/>, buttonText: "View Calendar", href: "/events" }
                ].map((item) => (
                    <Card key={item.title} className="text-center p-6 flex flex-col items-center justify-between shadow-md hover:shadow-xl transition-shadow">
                        <div className="flex flex-col items-center gap-4">
                            <div className="p-3 bg-primary/10 rounded-full">{item.icon}</div>
                            <CardTitle className="font-headline text-xl">{item.title}</CardTitle>
                        </div>
                        <Button asChild variant="outline" className="mt-4"><Link href={item.href}>{item.buttonText}</Link></Button>
                    </Card>
                ))}
            </div>
            
            {profile && <ProfileDisplay profile={profile} userId={user!.uid} />}

            <div className="grid lg:grid-cols-3 gap-8 mt-12">
                <Card className="lg:col-span-2 shadow-md">
                    <CardHeader><CardTitle className="font-headline text-2xl">Announcements</CardTitle></CardHeader>
                    <CardContent className="space-y-6">
                        <div className="border-l-4 border-primary pl-4">
                            <h3 className="font-semibold">New Courses Available!</h3>
                            <p className="text-muted-foreground">Check out the new dynamic courses on our courses page.</p>
                        </div>
                        <div className="border-l-4 border-primary pl-4">
                            <h3 className="font-semibold">Community Book Fair Next Week!</h3>
                            <p className="text-muted-foreground">Visit our book fair from October 10-12 to borrow the latest titles and meet fellow readers.</p>
                        </div>
                    </CardContent>
                </Card>
                 <Card className="shadow-md">
                    <CardHeader><CardTitle className="font-headline text-2xl">Featured Courses</CardTitle></CardHeader>
                    <CardContent>
                        {courses.length > 0 ? (
                             <ul className="space-y-3 list-disc list-inside text-muted-foreground">
                                {courses.map(course => <li key={course.id}><Link href={`/courses/${course.id}`} className="hover:text-primary">{course.title}</Link></li>)}
                            </ul>
                        ) : (
                            <p className="text-sm text-muted-foreground">No featured courses at the moment. Check back soon!</p>
                        )}
                    </CardContent>
                     <CardFooter>
                        <Button variant="link" asChild className="p-0"><Link href="/courses">View all courses &rarr;</Link></Button>
                    </CardFooter>
                </Card>
            </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

    