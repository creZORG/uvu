
"use client";

import { useState, useEffect } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";

import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { auth, db } from "@/lib/firebase";
import { useToast } from "@/hooks/use-toast";

const profileSchema = z.object({
  fullName: z.string().min(3, { message: "Full name must be at least 3 characters." }),
  location: z.string().min(2, { message: "Location is required." }),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

export default function ProfilePage() {
  const [user, loading] = useAuthState(auth);
  const router = useRouter();
  const { toast } = useToast();
  const [isProfileCreated, setIsProfileCreated] = useState(false);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      fullName: "",
      location: "",
    },
  });

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.push("/auth");
      return;
    }

    const fetchProfile = async () => {
      const docRef = doc(db, "userProfiles", user.uid);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const profileData = docSnap.data();
        form.reset(profileData);
        setIsProfileCreated(true);
      }
    };

    fetchProfile();
  }, [user, loading, router, form]);
  
  const onSubmit = async (data: ProfileFormValues) => {
    if (!user) return;

    try {
      const docRef = doc(db, "userProfiles", user.uid);
      if (isProfileCreated) {
        await updateDoc(docRef, data);
      } else {
        await setDoc(docRef, { ...data, userId: user.uid, email: user.email });
      }
      
      toast({
        title: "Profile Saved!",
        description: "Your information has been successfully updated.",
      });

      // Redirect back to courses if they were coming from there
      const redirectPath = sessionStorage.getItem('redirectAfterProfileUpdate');
      if(redirectPath) {
        sessionStorage.removeItem('redirectAfterProfileUpdate');
        router.push(redirectPath);
      }

    } catch (error) {
      console.error("Error saving profile: ", error);
      toast({
        variant: "destructive",
        title: "Uh oh! Something went wrong.",
        description: "There was a problem saving your profile.",
      });
    }
  };

  if (loading || !user) {
    return (
      <div className="flex flex-col min-h-screen items-center justify-center bg-background">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-1 flex items-center justify-center">
        <section className="w-full max-w-lg py-12 px-4">
          <Card>
            <CardHeader>
              <CardTitle className="font-headline text-3xl">
                {isProfileCreated ? "Update Your Profile" : "Create Your Profile"}
              </CardTitle>
              <CardDescription>
                {isProfileCreated 
                  ? "Keep your information up to date." 
                  : "Please complete your profile to access courses and track your progress."}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="fullName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Jane Doe" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="location"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Location</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Nairobi, Kenya" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" className="w-full">
                    {isProfileCreated ? "Update Profile" : "Save and Continue"}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </section>
      </main>
      <Footer />
    </div>
  );
}
