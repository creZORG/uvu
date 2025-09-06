
"use client";

import { useState, useEffect } from "react";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Loader2, AlertTriangle, Phone } from "lucide-react";
import Image from "next/image";
import type { UserProfile } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";

export default function TutorsPage() {
  const [tutors, setTutors] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTutor, setSelectedTutor] = useState<UserProfile | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const tutorsQuery = query(
        collection(db, "userProfiles"), 
        where("role", "==", "tutor"),
        where("tutorProfile.applicationStatus", "==", "approved")
    );
    const unsubscribe = onSnapshot(tutorsQuery, (querySnapshot) => {
      const tutorList: UserProfile[] = [];
      querySnapshot.forEach((doc) => {
        tutorList.push({ userId: doc.id, ...doc.data() } as UserProfile);
      });
      setTutors(tutorList);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleContactClick = (tutor: UserProfile) => {
    setSelectedTutor(tutor);
    setIsModalOpen(true);
    // In a real application, you would log this event to Firestore for safety.
    console.log(`User is viewing contact info for ${tutor.fullName}`);
     toast({
      title: "Action Logged",
      description: "For your safety, a record of this contact view has been created.",
    });
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-1">
        <section className="py-16 md:py-24 bg-primary/5">
          <div className="container px-4 md:px-6">
            <div className="text-center mb-12">
              <h1 className="font-headline text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight">
                Our Tutors
              </h1>
              <p className="max-w-3xl mx-auto text-muted-foreground mt-4 text-lg">
                Meet our community of approved tutors, ready to help you on your learning journey.
              </p>
            </div>
          </div>
        </section>
        <section className="py-16 md:py-24 -mt-24">
             <div className="container px-4 md:px-6">
                {loading ? (
                    <div className="flex justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
                        {tutors.map((tutor) => (
                           <Card key={tutor.userId} className="flex flex-col overflow-hidden hover:shadow-xl transition-shadow duration-300 group">
                                <div className="relative w-full h-60">
                                    <Image
                                        src={tutor.tutorProfile?.photoUrl || 'https://picsum.photos/400/400'}
                                        alt={`Photo of ${tutor.fullName}`}
                                        fill
                                        className="object-cover"
                                        data-ai-hint="person portrait"
                                    />
                                </div>
                                <CardHeader>
                                    <CardTitle className="font-headline text-xl group-hover:text-primary">{tutor.fullName}</CardTitle>
                                    <CardDescription>{tutor.tutorProfile?.location}</CardDescription>
                                </CardHeader>
                                <CardContent className="flex flex-col flex-1">
                                    <p className="text-sm text-muted-foreground mb-4 line-clamp-3 flex-1">{tutor.tutorProfile?.bio}</p>
                                    <div className="mb-4">
                                        <h4 className="font-semibold text-sm mb-2">Subjects:</h4>
                                        <div className="flex flex-wrap gap-2">
                                            {tutor.tutorProfile?.subjects.map(subject => (
                                                <Badge key={subject} variant="secondary">{subject}</Badge>
                                            ))}
                                        </div>
                                    </div>
                                </CardContent>
                                 <CardFooter>
                                    <Button className="w-full" onClick={() => handleContactClick(tutor)}>Contact Tutor</Button>
                                 </CardFooter>
                           </Card>
                        ))}
                         {tutors.length === 0 && <p className="text-muted-foreground col-span-full text-center">No approved tutors are currently available. Check back soon!</p>}
                    </div>
                )}
            </div>
        </section>
      </main>

       <AlertDialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="font-headline text-2xl">Contact Information</AlertDialogTitle>
            <AlertDialogDescription>
                You can reach out to <strong>{selectedTutor?.fullName}</strong> using the details below.
            </AlertDialogDescription>
          </AlertDialogHeader>
            <div className="py-4">
                <div className="flex items-center gap-3 font-semibold text-lg">
                    <Phone size={20} />
                    <span>{selectedTutor?.phoneNumber}</span>
                </div>
            </div>
            <div className="p-4 rounded-md bg-destructive/10 border border-destructive/50 text-destructive-foreground">
                <h4 className="font-bold flex items-center gap-2 mb-2"><AlertTriangle/>Safety Notice</h4>
                <p className="text-xs">
                    Please exercise caution when contacting individuals you meet online. For your safety, we have logged that you have viewed this contact information. Do not share sensitive personal information and arrange to meet in public places if necessary.
                </p>
            </div>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => setIsModalOpen(false)}>Close</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
