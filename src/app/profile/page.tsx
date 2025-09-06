
"use client";

import { useState, useEffect } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { doc, onSnapshot } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Loader2 } from "lucide-react";
import { ProfileDisplay } from "@/components/profile-display";
import { ProfileEditModal, UserProfile } from "@/components/profile-edit-modal";
import { isProfileComplete } from "@/lib/utils";

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
        // If profile doesn't exist or is incomplete, show the modal.
        setProfile(docSnap.exists() ? docSnap.data() as UserProfile : null);
        setIsModalRequired(true);
      }
      setIsLoadingProfile(false);
    });

    return () => unsubscribe();
  }, [user, loading, router]);

  if (loading || isLoadingProfile) {
    return (
      <div className="flex flex-col min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin" />
        <p className="mt-4 text-muted-foreground">Loading Student Portal...</p>
      </div>
    );
  }
  
  const handleProfileUpdate = () => {
    // This function will be called from the modal upon successful submission
    // to hide the modal and show the profile display.
    setIsModalRequired(false);
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-1 py-12">
        <section className="container max-w-4xl mx-auto">
          {profile && !isModalRequired ? (
             <div>
                <h1 className="font-headline text-4xl mb-6">Student Portal</h1>
                <ProfileDisplay profile={profile} userId={user!.uid} />
              </div>
          ) : (
            <div className="text-center py-16">
                <p className="text-muted-foreground mb-4">Loading your portal...</p>
                 <Loader2 className="h-8 w-8 animate-spin mx-auto" />
            </div>
          )}
        </section>
      </main>
      <Footer />
      
      {user && (
        <ProfileEditModal 
            isOpen={isModalRequired} 
            setIsOpen={setIsModalRequired} 
            user={user}
            existingProfile={profile}
            onProfileUpdate={handleProfileUpdate}
        />
      )}
    </div>
  );
}
