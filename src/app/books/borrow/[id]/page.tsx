
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { doc, getDoc, setDoc, collection } from "firebase/firestore";
import { db, auth } from "@/lib/firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { differenceInYears, parse } from "date-fns";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Loader2, ArrowLeft, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { UserProfile } from "@/components/profile-edit-modal";
import Image from "next/image";
import { sendBookRequestEmail } from "@/ai/flows/send-book-request-email";

type Book = {
  id: string;
  title: string;
  author: string;
  coverImageUrl: string;
};

const BorrowingSchema = z.object({
  nationalId: z.string().optional(),
  phoneNumber: z.string().min(10, "A valid phone number is required."),
  parentPhoneNumber: z.string().optional(),
  deliveryLocation: z.string().min(10, "Please provide a detailed delivery location."),
}).superRefine((data, ctx) => {
    // This validation logic depends on age, which we get from the user's profile
    // It's checked dynamically in the component before submission.
});

type BorrowingFormValues = z.infer<typeof BorrowingSchema>;

export default function BorrowBookPage({ params }: { params: { id: string } }) {
  const [user, authLoading] = useAuthState(auth);
  const router = useRouter();
  const { toast } = useToast();
  
  const [book, setBook] = useState<Book | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const form = useForm<BorrowingFormValues>({
    resolver: zodResolver(BorrowingSchema),
    defaultValues: {
      nationalId: "",
      phoneNumber: "",
      parentPhoneNumber: "",
      deliveryLocation: ""
    }
  });

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.push("/auth");
      return;
    }

    const fetchData = async () => {
      try {
        // Fetch book details
        const bookRef = doc(db, "books", params.id);
        const bookSnap = await getDoc(bookRef);
        if (bookSnap.exists()) {
          setBook({ id: bookSnap.id, ...bookSnap.data() } as Book);
        } else {
          toast({ variant: "destructive", title: "Book not found." });
          router.push("/books");
          return;
        }

        // Fetch user profile
        const profileRef = doc(db, "userProfiles", user.uid);
        const profileSnap = await getDoc(profileRef);
        if (profileSnap.exists()) {
          const userProfile = profileSnap.data() as UserProfile;
          setProfile(userProfile);
          // Pre-fill form with profile data
          form.reset({
            nationalId: userProfile.nationalId || "",
            phoneNumber: userProfile.phoneNumber || "",
            parentPhoneNumber: userProfile.parentPhoneNumber || "",
            deliveryLocation: userProfile.location || ""
          });
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        toast({ variant: "destructive", title: "Error", description: "Could not load necessary data." });
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user, authLoading, params.id, router, toast, form]);

  const getAge = () => {
    if (profile?.dateOfBirth) {
        const dob = profile.dateOfBirth.toDate ? profile.dateOfBirth.toDate() : parse(profile.dateOfBirth, 'dd/MM/yyyy', new Date());
        if (!isNaN(dob.getTime())) {
          return differenceInYears(new Date(), dob);
        }
    }
    return null;
  };
  const age = getAge();

  const onSubmit = async (data: BorrowingFormValues) => {
    if (!user || !profile || !book) return;

    // Manual validation based on age
    if (age !== null && age >= 18 && !data.nationalId) {
        form.setError("nationalId", { type: "manual", message: "National ID is required for adults."});
        return;
    }
     if (age !== null && age < 18 && !data.parentPhoneNumber) {
        form.setError("parentPhoneNumber", { type: "manual", message: "Parent's phone number is required for minors."});
        return;
    }

    setIsSubmitting(true);
    try {
        const requestRef = doc(collection(db, "bookRequests"));
        await setDoc(requestRef, {
            userId: user.uid,
            userEmail: user.email,
            userName: profile.fullName,
            bookId: book.id,
            bookTitle: book.title,
            requestDetails: data,
            status: "pending",
            requestedAt: new Date(),
        });
        
        // Update user profile with the new info if it changed
        await setDoc(doc(db, "userProfiles", user.uid), {
            nationalId: data.nationalId,
            phoneNumber: data.phoneNumber,
            parentPhoneNumber: data.parentPhoneNumber
        }, { merge: true });

        // Send confirmation email
        await sendBookRequestEmail({
            studentName: profile.fullName,
            studentEmail: user.email,
            bookTitle: book.title
        });

        toast({
            title: "Request Submitted!",
            description: "We have received your request and will contact you shortly to confirm.",
        });
        router.push("/books");

    } catch (error) {
        console.error("Error submitting request:", error);
        toast({ variant: "destructive", title: "Submission Failed", description: "There was a problem submitting your request." });
    } finally {
        setIsSubmitting(false);
    }
  };

  if (loading || authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-1 py-12">
        <div className="container max-w-4xl mx-auto">
             <Button variant="ghost" onClick={() => router.back()} className="mb-4">
                <ArrowLeft className="mr-2" /> Back to Catalog
            </Button>
            <Card>
                <CardHeader>
                    <CardTitle className="font-headline text-3xl">Request to Borrow a Book</CardTitle>
                    <CardDescription>Please confirm your details and delivery location to complete the request.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid md:grid-cols-3 gap-8">
                        <div className="md:col-span-1">
                            {book && (
                                <div className="space-y-4">
                                    <Image
                                        src={book.coverImageUrl || 'https://picsum.photos/400/600'}
                                        alt={`Cover of ${book.title}`}
                                        width={400}
                                        height={600}
                                        className="rounded-lg shadow-lg object-cover w-full"
                                    />
                                    <div>
                                        <h3 className="font-bold text-lg">{book.title}</h3>
                                        <p className="text-sm text-muted-foreground">{book.author}</p>
                                    </div>
                                </div>
                            )}
                        </div>
                        <div className="md:col-span-2">
                             <Form {...form}>
                                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                                    {age !== null && age >= 18 && (
                                        <FormField control={form.control} name="nationalId" render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>National ID Number</FormLabel>
                                                <FormControl><Input placeholder="Your National ID" {...field} /></FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )} />
                                    )}

                                    <FormField control={form.control} name="phoneNumber" render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Your Contact Phone Number</FormLabel>
                                            <FormControl><Input placeholder="e.g., 0712345678" {...field} /></FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )} />

                                    {age !== null && age < 18 && (
                                         <FormField control={form.control} name="parentPhoneNumber" render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Parent/Guardian's Phone Number</FormLabel>
                                                <FormControl><Input placeholder="e.g., 0712345678" {...field} /></FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )} />
                                    )}
                                    
                                    <FormField control={form.control} name="deliveryLocation" render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Precise Delivery Location</FormLabel>
                                            <FormControl><Textarea placeholder="e.g., Kivumbini Estate, Block D, near the water tank." {...field} className="min-h-[100px]" /></FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )} />
                                    
                                    <div className="p-4 rounded-md bg-accent/50 border border-accent">
                                        <div className="flex items-start gap-3">
                                            <AlertCircle className="text-accent-foreground mt-1 flex-shrink-0" />
                                            <div>
                                                <h4 className="font-semibold text-accent-foreground">Please Note</h4>
                                                <p className="text-sm text-accent-foreground/80">
                                                   To facilitate the delivery of this book, a nominal fee for the boda boda service may be required upon its arrival. Our team will contact you via the phone number provided to confirm all details, including any applicable costs, before dispatching your requested item.
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    <Button type="submit" disabled={isSubmitting}>
                                        {isSubmitting && <Loader2 className="animate-spin mr-2" />}
                                        Submit Borrowing Request
                                    </Button>
                                </form>
                             </Form>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
}
