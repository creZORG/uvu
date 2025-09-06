
"use client";

import { useState, useEffect } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth, db } from "@/lib/firebase";
import { doc, getDoc, setDoc, updateDoc, onSnapshot } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Loader2, CheckCircle, Clock, AlertTriangle, FileText, User, Briefcase, Calendar } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { UserProfile, TutorProfile } from "@/lib/types";

const tutorApplicationSchema = z.object({
  photoUrl: z.string().url({ message: "Please enter a valid URL for your photo." }),
  location: z.string().min(3, "Location is required."),
  bio: z.string().min(50, "Bio must be at least 50 characters long."),
  subjects: z.string().min(3, "Please list at least one subject."),
  qualifications: z.string().min(10, "Please describe your qualifications."),
});

type TutorApplicationFormValues = z.infer<typeof tutorApplicationSchema>;

export default function TutorPage() {
  const [user, loading] = useAuthState(auth);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const router = useRouter();
  const { toast } = useToast();

  const form = useForm<TutorApplicationFormValues>({
    resolver: zodResolver(tutorApplicationSchema),
    defaultValues: {
      photoUrl: "",
      location: "",
      bio: "",
      subjects: "",
      qualifications: "",
    },
  });

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.push("/auth");
      return;
    }

    const profileRef = doc(db, "userProfiles", user.uid);
    const unsubscribe = onSnapshot(profileRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = { userId: docSnap.id, ...docSnap.data() } as UserProfile;
        setProfile(data);
        if (data.role !== 'tutor') {
            toast({ variant: "destructive", title: "Access Denied", description: "This page is for tutors only." });
            router.push('/profile');
        }
        // Prefill form if profile data exists
        if(data.tutorProfile) {
            form.reset({
                ...data.tutorProfile,
                subjects: data.tutorProfile.subjects.join(', ')
            });
        }
      }
      setIsLoadingProfile(false);
    });

    return () => unsubscribe();
  }, [user, loading, router, toast, form]);

  const onSubmit = async (data: TutorApplicationFormValues) => {
    if (!user) return;
    try {
      const tutorProfileData: TutorProfile = {
          ...data,
          subjects: data.subjects.split(',').map(s => s.trim()),
          applicationStatus: 'pending'
      };

      const userProfileRef = doc(db, "userProfiles", user.uid);
      await updateDoc(userProfileRef, {
          tutorProfile: tutorProfileData
      });

      toast({
        title: "Application Submitted!",
        description: "Your application is under review. We will notify you once it's processed.",
      });
    } catch (error) {
      console.error("Error submitting application: ", error);
      toast({ variant: "destructive", title: "Submission Failed", description: "There was a problem submitting your application." });
    }
  };

  const renderContent = () => {
    if (isLoadingProfile) {
      return (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      );
    }
    
    const applicationStatus = profile?.tutorProfile?.applicationStatus;

    if (applicationStatus === 'approved') {
        return (
             <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-5xl mx-auto">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">My Profile</CardTitle>
                  <User className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-muted-foreground">
                    Update your bio, subjects, and qualifications.
                  </p>
                </CardContent>
              </Card>
               <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">My Schedule</CardTitle>
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-muted-foreground">
                    Set your availability and manage appointments.
                  </p>
                </CardContent>
              </Card>
               <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Applications</CardTitle>
                  <Briefcase className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-muted-foreground">
                    View and respond to new student requests.
                  </p>
                </CardContent>
              </Card>
               <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Resources</CardTitle>
                  <FileText className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-muted-foreground">
                    Access teaching materials and guides.
                  </p>
                </CardContent>
              </Card>
            </div>
        );
    }

    if (applicationStatus === 'pending') {
        return (
            <Card className="max-w-2xl mx-auto text-center">
                <CardHeader>
                    <CardTitle className="font-headline text-2xl flex items-center justify-center gap-2"><Clock /> Application Pending</CardTitle>
                </CardHeader>
                <CardContent>
                    <p>Your application has been submitted and is currently under review by our team. Thank you for your patience.</p>
                </CardContent>
            </Card>
        );
    }
    
    if (applicationStatus === 'rejected') {
        return (
             <Card className="max-w-2xl mx-auto text-center border-destructive">
                <CardHeader>
                    <CardTitle className="font-headline text-2xl flex items-center justify-center gap-2 text-destructive"><AlertTriangle/> Application Status</CardTitle>
                </CardHeader>
                <CardContent>
                    <p>We regret to inform you that your application was not approved at this time. Please contact administration for more details.</p>
                </CardContent>
            </Card>
        )
    }

    return (
        <Card className="max-w-2xl mx-auto">
            <CardHeader>
                <CardTitle className="font-headline text-2xl">Become a Tutor</CardTitle>
                <CardDescription>Complete the form below to apply. Your profile will be reviewed by an administrator before being publicly listed.</CardDescription>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <FormField control={form.control} name="photoUrl" render={({ field }) => (
                            <FormItem><FormLabel>Profile Photo URL</FormLabel><FormControl><Input placeholder="https://example.com/your-photo.jpg" {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={form.control} name="location" render={({ field }) => (
                            <FormItem><FormLabel>Your Location</FormLabel><FormControl><Input placeholder="e.g., Nakuru, Kenya" {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={form.control} name="subjects" render={({ field }) => (
                            <FormItem><FormLabel>Subjects You Teach</FormLabel><FormControl><Input placeholder="e.g., Mathematics, Python, Web Design" {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={form.control} name="bio" render={({ field }) => (
                            <FormItem><FormLabel>Your Bio</FormLabel><FormControl><Textarea placeholder="Tell students about yourself, your teaching style, and your experience..." className="min-h-[120px]" {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={form.control} name="qualifications" render={({ field }) => (
                            <FormItem><FormLabel>Your Qualifications</FormLabel><FormControl><Textarea placeholder="List your degrees, certifications, and relevant experience." className="min-h-[100px]" {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <Button type="submit" disabled={form.formState.isSubmitting}>
                            {form.formState.isSubmitting && <Loader2 className="animate-spin mr-2" />}
                            Submit Application
                        </Button>
                    </form>
                </Form>
            </CardContent>
        </Card>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-1">
        <section className="py-16 md:py-24">
          <div className="container px-4 md:px-6">
            <div className="text-center mb-12">
              <h1 className="font-headline text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight">
                Tutor Portal
              </h1>
              <p className="max-w-3xl mx-auto text-muted-foreground mt-4 text-lg">
                Manage your profile, availability, and student sessions.
              </p>
            </div>
            {renderContent()}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
