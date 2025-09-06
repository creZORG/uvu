
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth, db } from "@/lib/firebase";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Loader2, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const RequestSchema = z.object({
  title: z.string().min(3, "Book title is required."),
  author: z.string().min(3, "Author's name is required."),
  reason: z.string().min(10, "Please provide a reason for your request."),
});

type RequestFormValues = z.infer<typeof RequestSchema>;

export default function RequestBookPage() {
  const [user, authLoading] = useAuthState(auth);
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<RequestFormValues>({
    resolver: zodResolver(RequestSchema),
    defaultValues: { title: "", author: "", reason: "" },
  });

  const onSubmit = async (data: RequestFormValues) => {
    if (!user) {
      toast({ variant: "destructive", title: "Authentication Error", description: "You must be logged in to make a request." });
      return;
    }
    setIsSubmitting(true);
    try {
      await addDoc(collection(db, "newBookRequests"), {
        ...data,
        requestedBy: user.email,
        userId: user.uid,
        requestedAt: serverTimestamp(),
      });
      toast({ title: "Request Submitted!", description: "Thank you! We will review your book request." });
      form.reset();
      router.push("/books");
    } catch (error) {
      console.error("Error submitting book request:", error);
      toast({ variant: "destructive", title: "Submission Failed", description: "Could not submit your request. Please try again." });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (authLoading) {
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
        <div className="container max-w-2xl mx-auto">
          <Button variant="ghost" onClick={() => router.back()} className="mb-4">
            <ArrowLeft className="mr-2" /> Back to Catalog
          </Button>
          <Card>
            <CardHeader>
              <CardTitle className="font-headline text-3xl">Request a New Book</CardTitle>
              <CardDescription>Can't find what you're looking for? Let us know what you'd like to read, and we'll do our best to add it to our collection.</CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField control={form.control} name="title" render={({ field }) => (
                    <FormItem><FormLabel>Book Title</FormLabel><FormControl><Input placeholder="e.g., The Hitchhiker's Guide to the Galaxy" {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField control={form.control} name="author" render={({ field }) => (
                    <FormItem><FormLabel>Author</FormLabel><FormControl><Input placeholder="e.g., Douglas Adams" {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField control={form.control} name="reason" render={({ field }) => (
                    <FormItem><FormLabel>Reason for Request</FormLabel><FormControl><Textarea placeholder="Tell us why you're interested in this book..." {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting && <Loader2 className="animate-spin mr-2" />}
                    Submit Request
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
}

    