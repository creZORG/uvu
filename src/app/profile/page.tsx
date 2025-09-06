
"use client";

import { useState, useEffect } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { doc, onSnapshot } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Loader2, User, UserCheck, UserPlus, LogIn, ArrowRight } from "lucide-react";
import type { UserProfile } from "@/lib/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { UcnLogo } from "@/components/icons";
import { Badge } from "@/components/ui/badge";

export default function ProfilePage() {
  const [user, loading] = useAuthState(auth);
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);

  useEffect(() => {
    if (loading) return;
    if (!user) {
      // Redirect to login but also allow viewing the page if not logged in.
      // The content will adapt.
      setIsLoadingProfile(false);
      return;
    }

    const profileRef = doc(db, "userProfiles", user.uid);
    const unsubscribeProfile = onSnapshot(profileRef, (docSnap) => {
      if (docSnap.exists()) {
        const profileData = { userId: docSnap.id, ...docSnap.data() } as UserProfile;
        setProfile(profileData);
      } else {
        setProfile(null);
      }
      setIsLoadingProfile(false);
    });

    return () => {
        unsubscribeProfile();
    };
  }, [user, loading, router]);
  
  if (loading || isLoadingProfile) {
    return (
      <div className="flex flex-col min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin" />
        <p className="mt-4 text-muted-foreground">Loading Profile...</p>
      </div>
    );
  }

  const roleActions = {
      student: { label: "Go to Student Hub", href: "/student-hub", icon: <User /> },
      tutor: { label: "Go to Tutor Portal", href: "/tutor", icon: <UserCheck /> },
      admin: { label: "Go to Admin Dashboard", href: "/admin", icon: <UserPlus /> },
      visitor: { label: "Explore Our Courses", href: "/courses", icon: <ArrowRight /> },
  }

  return (
    <div className="flex flex-col min-h-screen bg-primary/5">
      <Header />
      <main className="flex-1 py-12 md:py-16">
        <div className="container max-w-2xl mx-auto">
            <Card className="p-6">
                <CardHeader className="text-center items-center">
                    <UcnLogo className="w-24 h-24 mb-4 rounded-full border-4 border-primary/20 shadow-lg" />
                    <CardTitle className="font-headline text-3xl">
                        {user ? `Welcome, ${profile?.fullName || user.displayName}` : "Your Profile"}
                    </CardTitle>
                    <CardDescription className="text-base">
                        {user ? "Manage your account and access your resources." : "Log in or sign up to access your personalized portal."}
                    </CardDescription>
                </CardHeader>
                <CardContent className="text-center">
                    {user && profile ? (
                        <div className="space-y-6">
                            <div>
                                <p className="text-muted-foreground">You are registered as a:</p>
                                <Badge className="text-lg capitalize mt-2">{profile.role}</Badge>
                            </div>
                            <Button asChild size="lg">
                                <Link href={roleActions[profile.role]?.href || '/'}>
                                    {roleActions[profile.role]?.icon}
                                    {roleActions[profile.role]?.label}
                                </Link>
                            </Button>
                        </div>
                    ) : (
                         <div className="space-y-6">
                            <p className="text-muted-foreground">Create an account to join our community of learners and educators.</p>
                            <Button asChild size="lg">
                                <Link href="/auth">
                                    <LogIn className="mr-2"/>
                                    Login or Sign Up
                                </Link>
                            </Button>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
}
