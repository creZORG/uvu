
"use client";

import { useState, useEffect } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { doc, onSnapshot } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Loader2, Search, GraduationCap, Book, MessageSquare, CalendarCheck } from "lucide-react";
import { ProfileEditModal, UserProfile } from "@/components/profile-edit-modal";
import { isProfileComplete } from "@/lib/utils";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Link from "next/link";


export default function ProfilePage() {
  const [user, loading] = useAuthState(auth);
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [isModalRequired, setIsModalRequired] = useState(false);

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.push("/auth");
      return;
    }

    const profileRef = doc(db, "userProfiles", user.uid);
    const unsubscribe = onSnapshot(profileRef, (docSnap) => {
      if (docSnap.exists() && isProfileComplete(docSnap.data())) {
        setProfile(docSnap.data() as UserProfile);
        setIsModalRequired(false);
      } else {
        setProfile(docSnap.exists() ? docSnap.data() as UserProfile : null);
        setIsModalRequired(true);
      }
      setIsLoadingProfile(false);
    });

    return () => unsubscribe();
  }, [user, loading, router]);

  const handleProfileUpdate = () => {
    setIsModalRequired(false);
  };
  
  if (loading || isLoadingProfile) {
    return (
      <div className="flex flex-col min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin" />
        <p className="mt-4 text-muted-foreground">Loading Student Portal...</p>
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
                    <Input placeholder="Search..." className="h-12 pl-12 pr-4 rounded-full text-base" />
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
                </div>
            </header>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                {[
                    { title: "Learning", icon: <GraduationCap/>, buttonText: "Browse Courses", href: "/courses/coding" },
                    { title: "Borrow Books", icon: <Book/>, buttonText: "Browse Catalog", href: "#" },
                    { title: "Discussion Forums", icon: <MessageSquare/>, buttonText: "Join Discussion", href: "#" },
                    { title: "Upcoming Events", icon: <CalendarCheck/>, buttonText: "View Calendar", href: "#" }
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

            <div className="grid lg:grid-cols-3 gap-8">
                <Card className="lg:col-span-2 shadow-md">
                    <CardHeader><CardTitle className="font-headline text-2xl">Announcements</CardTitle></CardHeader>
                    <CardContent className="space-y-6">
                        <div className="border-l-4 border-primary pl-4">
                            <h3 className="font-semibold">New courses available</h3>
                            <p className="text-muted-foreground">Introduction to Python, Creative Writing, Digital Marketing</p>
                        </div>
                        <div className="border-l-4 border-primary pl-4">
                            <h3 className="font-semibold">Book fair next week!</h3>
                            <p className="text-muted-foreground">Visit our book fair from October 10-12 to borrow the latest titles</p>
                        </div>
                    </CardContent>
                </Card>
                 <Card className="shadow-md">
                    <CardHeader><CardTitle className="font-headline text-2xl">Featured Courses</CardTitle></CardHeader>
                    <CardContent>
                        <ul className="space-y-3 list-disc list-inside text-muted-foreground">
                            <li>Fundamentals of Python</li>
                            <li>Introduction to Photography</li>
                            <li>Basic Graphic Design</li>
                        </ul>
                    </CardContent>
                </Card>
            </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}


    