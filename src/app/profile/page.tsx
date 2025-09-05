
"use client";

import { useState, useEffect } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { doc, onSnapshot } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Edit, Loader2 } from "lucide-react";
import { ProfileDisplay } from "@/components/profile-display";
import { ProfileEditModal, UserProfile } from "@/components/profile-edit-modal";


export default function ProfilePage() {
  const [user, loading] = useAuthState(auth);
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.push("/auth");
      return;
    }

    const profileRef = doc(db, "userProfiles", user.uid);
    const unsubscribe = onSnapshot(profileRef, (docSnap) => {
      if (docSnap.exists()) {
        setProfile(docSnap.data() as UserProfile);
      } else {
        // If profile doesn't exist, open the edit modal to force creation
        setIsEditModalOpen(true);
      }
      setIsLoadingProfile(false);
    });

    return () => unsubscribe();
  }, [user, loading, router]);

  if (loading || isLoadingProfile) {
    return (
      <div className="flex flex-col min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin" />
        <p className="mt-4 text-muted-foreground">Loading Profile...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-1 py-12">
        <section className="container max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h1 className="font-headline text-4xl">Your Profile</h1>
            <Button onClick={() => setIsEditModalOpen(true)}>
              <Edit className="mr-2" /> Edit Profile
            </Button>
          </div>
          
          {profile ? (
            <ProfileDisplay profile={profile} userId={user!.uid} />
          ) : (
            <div className="text-center py-16">
                <p className="text-muted-foreground mb-4">Your profile hasn't been created yet.</p>
                <Button onClick={() => setIsEditModalOpen(true)}>Create Your Profile</Button>
            </div>
          )}

        </section>
      </main>
      <Footer />
      
      {user && (
        <ProfileEditModal 
            isOpen={isEditModalOpen} 
            setIsOpen={setIsEditModalOpen} 
            user={user}
            existingProfile={profile}
        />
      )}
    </div>
  );
}
