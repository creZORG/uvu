
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { doc, getDoc, setDoc, collection, query, where, onSnapshot, serverTimestamp, getDocs, writeBatch, orderBy } from "firebase/firestore";
import { db, auth } from "@/lib/firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { differenceInYears, parse } from "date-fns";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Loader2, ArrowLeft, AlertCircle, Star } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { UserProfile } from "@/components/profile-edit-modal";
import Image from "next/image";
import { sendBookRequestEmail } from "@/ai/flows/send-book-request-email";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

type Book = {
  id: string;
  title: string;
  author: string;
  description: string;
  coverImageUrl: string;
};

type Review = {
    id: string;
    userId: string;
    userName: string;
    userImage?: string;
    rating: number;
    comment: string;
    createdAt: { toDate: () => Date };
}

const BorrowingSchema = z.object({
  nationalId: z.string().optional(),
  phoneNumber: z.string().min(10, "A valid phone number is required."),
  parentPhoneNumber: z.string().optional(),
  deliveryLocation: z.string().min(10, "Please provide a detailed delivery location."),
}).superRefine((data, ctx) => {
    // This validation logic depends on age, which we get from the user's profile
    // It's checked dynamically in the component before submission.
});

const ReviewSchema = z.object({
    rating: z.number().min(1, "Please select a rating.").max(5),
    comment: z.string().min(10, "Review must be at least 10 characters.").max(500, "Review must be under 500 characters."),
})

type BorrowingFormValues = z.infer<typeof BorrowingSchema>;
type ReviewFormValues = z.infer<typeof ReviewSchema>;

export default function BookDetailPage({ params }: { params: { id: string } }) {
  const [user, authLoading] = useAuthState(auth);
  const router = useRouter();
  const { toast } = useToast();
  
  const [book, setBook] = useState<Book | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [avgRating, setAvgRating] = useState(0);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmittingRequest, setIsSubmittingRequest] = useState(false);
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [hasAlreadyReviewed, setHasAlreadyReviewed] = useState(false);
  
  const borrowForm = useForm<BorrowingFormValues>({
    resolver: zodResolver(BorrowingSchema),
    defaultValues: { nationalId: "", phoneNumber: "", parentPhoneNumber: "", deliveryLocation: "" }
  });

  const reviewForm = useForm<ReviewFormValues>({
    resolver: zodResolver(ReviewSchema),
    defaultValues: { rating: 0, comment: "" }
  });

  useEffect(() => {
    if (authLoading) return;

    const fetchData = async () => {
      try {
        const bookRef = doc(db, "books", params.id);
        const bookSnap = await getDoc(bookRef);
        if (bookSnap.exists()) {
          const bookData = { id: bookSnap.id, ...bookSnap.data() } as Book;
          setBook(bookData);
          if (bookData.description) {
            // No need to reset here, we will have a dedicated description field
          }
        } else {
          toast({ variant: "destructive", title: "Book not found." });
          router.push("/books");
          return;
        }

        if (user) {
            const profileRef = doc(db, "userProfiles", user.uid);
            const profileSnap = await getDoc(profileRef);
            if (profileSnap.exists()) {
              const userProfile = profileSnap.data() as UserProfile;
              setProfile(userProfile);
              borrowForm.reset({
                nationalId: userProfile.nationalId || "",
                phoneNumber: userProfile.phoneNumber || "",
                parentPhoneNumber: userProfile.parentPhoneNumber || "",
                deliveryLocation: userProfile.location || ""
              });
            }
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        toast({ variant: "destructive", title: "Error", description: "Could not load necessary data." });
      } finally {
        setLoading(false);
      }
    };
    fetchData();
    
    // Set up reviews listener
    const reviewsQuery = query(collection(db, `books/${params.id}/reviews`), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(reviewsQuery, (snapshot) => {
        const reviewList: Review[] = [];
        let totalRating = 0;
        let userHasReviewed = false;
        snapshot.forEach(doc => {
            const review = { id: doc.id, ...doc.data() } as Review;
            reviewList.push(review);
            totalRating += review.rating;
            if (user && review.userId === user.uid) {
                userHasReviewed = true;
            }
        });
        setReviews(reviewList);
        setHasAlreadyReviewed(userHasReviewed);
        if (reviewList.length > 0) {
            setAvgRating(totalRating / reviewList.length);
        } else {
            setAvgRating(0);
        }
    });

    return () => unsubscribe();

  }, [user, authLoading, params.id, router, toast, borrowForm]);

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

  const onBorrowSubmit = async (data: BorrowingFormValues) => {
    if (!user || !profile || !book) {
        toast({ variant: "destructive", title: "Please log in to borrow a book." });
        router.push("/auth");
        return;
    }

    if (age !== null && age >= 18 && !data.nationalId) {
        borrowForm.setError("nationalId", { type: "manual", message: "National ID is required for adults."});
        return;
    }
     if (age !== null && age < 18 && !data.parentPhoneNumber) {
        borrowForm.setError("parentPhoneNumber", { type: "manual", message: "Parent's phone number is required for minors."});
        return;
    }

    setIsSubmittingRequest(true);
    try {
        const requestRef = doc(collection(db, "bookRequests"));
        await setDoc(requestRef, {
            userId: user.uid, userEmail: user.email, userName: profile.fullName,
            bookId: book.id, bookTitle: book.title, requestDetails: data,
            status: "pending", requestedAt: new Date(),
        });
        
        await setDoc(doc(db, "userProfiles", user.uid), {
            nationalId: data.nationalId, phoneNumber: data.phoneNumber,
            parentPhoneNumber: data.parentPhoneNumber
        }, { merge: true });

        await sendBookRequestEmail({
            studentName: profile.fullName, studentEmail: user.email!, bookTitle: book.title
        });

        toast({ title: "Request Submitted!", description: "We have received your request and will contact you shortly." });
        router.push("/books");

    } catch (error) {
        console.error("Error submitting request:", error);
        toast({ variant: "destructive", title: "Submission Failed", description: "There was a problem submitting your request." });
    } finally {
        setIsSubmittingRequest(false);
    }
  };

  const onReviewSubmit = async (data: ReviewFormValues) => {
    if (!user || !profile || !book) {
        toast({ variant: "destructive", title: "You must be logged in to leave a review." });
        return;
    }
    setIsSubmittingReview(true);
    try {
        const reviewRef = doc(collection(db, `books/${book.id}/reviews`));
        await setDoc(reviewRef, {
            userId: user.uid,
            userName: profile.fullName,
            userImage: user.photoURL || '',
            rating: data.rating,
            comment: data.comment,
            createdAt: serverTimestamp(),
        });

        // Also update the book's average rating in a transaction
        const bookRef = doc(db, 'books', book.id);
        const newAvg = (avgRating * reviews.length + data.rating) / (reviews.length + 1);
        
        const batch = writeBatch(db);
        batch.update(bookRef, {
            avgRating: newAvg,
            reviewCount: reviews.length + 1
        });
        await batch.commit();


        toast({ title: "Review Submitted!", description: "Thank you for your feedback." });
        reviewForm.reset({rating: 0, comment: ""});
    } catch (error) {
         console.error("Error submitting review:", error);
         toast({ variant: "destructive", title: "Submission Failed", description: "There was a problem submitting your review." });
    } finally {
        setIsSubmittingReview(false);
    }
  }

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
                <CardContent className="pt-6">
                    <div className="grid md:grid-cols-3 gap-8">
                        <div className="md:col-span-1">
                             {book && (
                                <div className="space-y-4 text-center md:text-left">
                                    <Image
                                        src={book.coverImageUrl || 'https://picsum.photos/400/600'}
                                        alt={`Cover of ${book.title}`}
                                        width={400}
                                        height={600}
                                        className="rounded-lg shadow-lg object-cover w-full"
                                    />
                                    <div>
                                        <h2 className="font-bold text-2xl font-headline mt-4">{book.title}</h2>
                                        <p className="text-lg text-muted-foreground">{book.author}</p>
                                    </div>
                                    <div className="flex items-center justify-center md:justify-start gap-1">
                                      {Array.from({length: 5}).map((_, i) => <Star key={i} className={i < avgRating ? "text-amber-400 fill-amber-400" : "text-gray-300"} />)}
                                      <span className="text-muted-foreground ml-2">({reviews.length} reviews)</span>
                                    </div>
                                    <p className="text-muted-foreground pt-2">{book.description}</p>
                                </div>
                            )}
                        </div>
                        <div className="md:col-span-2">
                            <Card className="bg-primary/5">
                                 <CardHeader>
                                    <CardTitle className="font-headline text-2xl">Request to Borrow</CardTitle>
                                    <CardDescription>Confirm your details to complete the request.</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <Form {...borrowForm}>
                                        <form onSubmit={borrowForm.handleSubmit(onBorrowSubmit)} className="space-y-6">
                                            {age !== null && age >= 18 && (
                                                <FormField control={borrowForm.control} name="nationalId" render={({ field }) => (
                                                    <FormItem><FormLabel>National ID Number</FormLabel><FormControl><Input placeholder="Your National ID" {...field} /></FormControl><FormMessage /></FormItem>
                                                )} />
                                            )}

                                            <FormField control={borrowForm.control} name="phoneNumber" render={({ field }) => (
                                                <FormItem><FormLabel>Your Contact Phone Number</FormLabel><FormControl><Input placeholder="e.g., 0712345678" {...field} /></FormControl><FormMessage /></FormItem>
                                            )} />

                                            {age !== null && age < 18 && (
                                                <FormField control={borrowForm.control} name="parentPhoneNumber" render={({ field }) => (
                                                    <FormItem><FormLabel>Parent/Guardian's Phone Number</FormLabel><FormControl><Input placeholder="e.g., 0712345678" {...field} /></FormControl><FormMessage /></FormItem>
                                                )} />
                                            )}
                                            
                                            <FormField control={borrowForm.control} name="deliveryLocation" render={({ field }) => (
                                                <FormItem><FormLabel>Precise Delivery Location</FormLabel><FormControl><Textarea placeholder="e.g., Kivumbini Estate, Block D, near the water tank." {...field} className="min-h-[100px]" /></FormControl><FormMessage /></FormItem>
                                            )} />
                                            
                                            <div className="p-4 rounded-md bg-accent/50 border border-accent">
                                                <div className="flex items-start gap-3">
                                                    <AlertCircle className="text-accent-foreground mt-1 flex-shrink-0" />
                                                    <div>
                                                        <h4 className="font-semibold text-accent-foreground">Please Note</h4>
                                                        <p className="text-sm text-accent-foreground/80">To facilitate the delivery of this book, a nominal fee for the boda boda service may be required upon its arrival. Our team will contact you via the phone number provided to confirm all details, including any applicable costs, before dispatching your requested item.</p>
                                                    </div>
                                                </div>
                                            </div>

                                            <Button type="submit" disabled={isSubmittingRequest}>
                                                {isSubmittingRequest && <Loader2 className="animate-spin mr-2" />}
                                                Submit Borrowing Request
                                            </Button>
                                        </form>
                                    </Form>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </CardContent>
            </Card>
            
            <Card className="mt-8">
                <CardHeader>
                    <CardTitle className="font-headline text-2xl">Reviews & Ratings</CardTitle>
                </CardHeader>
                <CardContent>
                   <div className="grid md:grid-cols-2 gap-8">
                        <div>
                             <h3 className="font-semibold mb-4">Leave a Review</h3>
                             {user ? (
                                hasAlreadyReviewed ? (
                                    <p className="text-muted-foreground">You have already reviewed this book.</p>
                                ) : (
                                    <Form {...reviewForm}>
                                        <form onSubmit={reviewForm.handleSubmit(onReviewSubmit)} className="space-y-4">
                                             <Controller
                                                control={reviewForm.control}
                                                name="rating"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Your Rating</FormLabel>
                                                        <div className="flex gap-1">
                                                            {[1,2,3,4,5].map(star => (
                                                                <button type="button" key={star} onClick={() => field.onChange(star)}>
                                                                    <Star className={star <= field.value ? "text-amber-400 fill-amber-400" : "text-gray-300"}/>
                                                                </button>
                                                            ))}
                                                        </div>
                                                        <FormMessage/>
                                                    </FormItem>
                                                )}
                                             />
                                            <FormField
                                                control={reviewForm.control}
                                                name="comment"
                                                render={({ field }) => (
                                                    <FormItem><FormLabel>Your Review</FormLabel><FormControl><Textarea placeholder="Share your thoughts on this book..." {...field} /></FormControl><FormMessage /></FormItem>
                                                )}
                                            />
                                            <Button type="submit" disabled={isSubmittingReview}>
                                                 {isSubmittingReview && <Loader2 className="animate-spin mr-2" />}
                                                 Submit Review
                                            </Button>
                                        </form>
                                    </Form>
                                )
                             ) : (
                                 <p className="text-muted-foreground">Please <a href="/auth" className="text-primary underline">log in</a> to leave a review.</p>
                             )}
                        </div>
                        <div className="space-y-6 max-h-96 overflow-y-auto pr-4">
                             <h3 className="font-semibold mb-4">What Others Are Saying</h3>
                            {reviews.length > 0 ? (
                                reviews.map(review => (
                                    <div key={review.id} className="flex gap-4">
                                        <Avatar>
                                            <AvatarImage src={review.userImage} alt={review.userName} />
                                            <AvatarFallback>{review.userName.charAt(0)}</AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <p className="font-semibold">{review.userName}</p>
                                                <div className="flex">
                                                     {Array.from({length: 5}).map((_, i) => <Star key={i} size={16} className={i < review.rating ? "text-amber-400 fill-amber-400" : "text-gray-300"} />)}
                                                </div>
                                            </div>
                                            <p className="text-sm text-muted-foreground">{review.comment}</p>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="text-muted-foreground">No reviews yet. Be the first to share your thoughts!</p>
                            )}
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
