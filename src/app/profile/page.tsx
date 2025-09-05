
"use client";

import { useState, useEffect } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { useForm, useWatch } from "react-hook-form";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { differenceInYears, parse } from "date-fns";
import { Loader2 } from "lucide-react";


const profileSchema = z.object({
  fullName: z.string().min(3, { message: "Full name must be at least 3 characters." }),
  location: z.string().min(2, { message: "Location is required." }),
  dateOfBirth: z.string().refine((val) => /^\d{2}\/\d{2}\/\d{4}$/.test(val), {
    message: "Please enter a valid date in DD/MM/YYYY format.",
  }),
  phoneNumber: z.string().min(10, { message: "Please enter a valid phone number." }),
  gender: z.string({ required_error: "Please select a gender." }),
  occupation: z.string().min(2, { message: "Occupation is required." }),
  parentName: z.string().optional(),
  parentPhoneNumber: z.string().optional(),
}).superRefine((data, ctx) => {
  const dob = parse(data.dateOfBirth, 'dd/MM/yyyy', new Date());
  if (isNaN(dob.getTime())) {
    // The regex check should handle this, but as a fallback.
    return;
  }
  const age = differenceInYears(new Date(), dob);
  if (age < 18) {
    if (!data.parentName || data.parentName.length < 3) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["parentName"],
        message: "Parent's name is required and must be at least 3 characters.",
      });
    }
    if (!data.parentPhoneNumber || data.parentPhoneNumber.length < 10) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["parentPhoneNumber"],
        message: "Parent's phone number is required.",
      });
    }
  }
});


type ProfileFormValues = z.infer<typeof profileSchema>;

export default function ProfilePage() {
  const [user, loading] = useAuthState(auth);
  const router = useRouter();
  const { toast } = useToast();
  const [isProfileCreated, setIsProfileCreated] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      fullName: "",
      location: "",
      dateOfBirth: "",
      phoneNumber: "",
      occupation: "",
      parentName: "",
      parentPhoneNumber: "",
    },
  });

  const dobWatch = useWatch({
    control: form.control,
    name: 'dateOfBirth'
  });

  const isUnder18 = () => {
    if (dobWatch && /^\d{2}\/\d{2}\/\d{4}$/.test(dobWatch)) {
      const dob = parse(dobWatch, 'dd/MM/yyyy', new Date());
      if (!isNaN(dob.getTime())) {
        return differenceInYears(new Date(), dob) < 18;
      }
    }
    return false;
  };


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
        // Convert Firestore Timestamp back to DD/MM/YYYY string for the form
        if (profileData.dateOfBirth && profileData.dateOfBirth.toDate) {
            const date = profileData.dateOfBirth.toDate();
            profileData.dateOfBirth = `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}/${date.getFullYear()}`;
        }
        form.reset(profileData);
        setIsProfileCreated(true);
      }
    };

    fetchProfile();
  }, [user, loading, router, form]);
  
  const onSubmit = async (data: ProfileFormValues) => {
    if (!user) return;
    setIsSubmitting(true);
    
    try {
      const docRef = doc(db, "userProfiles", user.uid);
      const dobDate = parse(data.dateOfBirth, 'dd/MM/yyyy', new Date());

      const dataToSave = {
        ...data,
        dateOfBirth: dobDate, // Store as a proper timestamp
      };

      if (isProfileCreated) {
        await updateDoc(docRef, dataToSave);
      } else {
        await setDoc(docRef, { ...dataToSave, userId: user.uid, email: user.email });
      }
      
      toast({
        title: "Profile Saved!",
        description: "Your information has been successfully updated.",
      });

      const redirectPath = sessionStorage.getItem('redirectAfterProfileUpdate');
      if(redirectPath) {
        sessionStorage.removeItem('redirectAfterProfileUpdate');
        router.push(redirectPath);
      } else {
        router.push("/");
      }

    } catch (error) {
      console.error("Error saving profile: ", error);
      toast({
        variant: "destructive",
        title: "Uh oh! Something went wrong.",
        description: "There was a problem saving your profile.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading || !user) {
    return (
      <div className="flex flex-col min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin" />
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
                   <FormField
                    control={form.control}
                    name="phoneNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone Number</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., 0712345678" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="dateOfBirth"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Date of Birth</FormLabel>
                        <FormControl>
                          <Input placeholder="DD/MM/YYYY" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                   <FormField
                    control={form.control}
                    name="gender"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Gender</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select your gender" />
                            </Trigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="male">Male</SelectItem>
                            <SelectItem value="female">Female</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                             <SelectItem value="prefer-not-to-say">Prefer not to say</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="occupation"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Occupation</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Student, Developer" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  {isUnder18() && (
                    <div className="space-y-6 p-4 border-l-4 border-primary bg-accent/50 rounded-r-lg">
                       <h3 className="font-semibold text-foreground">Parent/Guardian Information Required</h3>
                       <FormField
                        control={form.control}
                        name="parentName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Parent/Guardian Full Name</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g., John Doe" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                       <FormField
                        control={form.control}
                        name="parentPhoneNumber"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Parent/Guardian Phone Number</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g., 0712345678" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  )}

                  <Button type="submit" className="w-full" disabled={isSubmitting}>
                     {isSubmitting ? <Loader2 className="animate-spin mr-2" /> : null}
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
