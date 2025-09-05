
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth, db } from "@/lib/firebase";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { AlertDialog, AlertDialogAction, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogCancel } from "@/components/ui/alert-dialog";
import { Loader2, AlertTriangle, Ban } from "lucide-react";
import Link from "next/link";
import { NavigationBlocker } from "@/components/navigation-blocker";

const examSchema = z.object({
    q1: z.string().min(10, "Please provide a more detailed answer."),
    q2: z.string().min(10, "Please provide a more detailed answer and code."),
    q3: z.string().min(10, "Please provide a more detailed answer and code."),
    q4: z.string().min(10, "Please provide a more detailed answer and code."),
    q5: z.string().min(10, "Please provide a more detailed answer."),
    q6: z.string().min(10, "Please provide a more detailed answer and code."),
    q7: z.string().min(10, "Please provide a more detailed answer and code."),
    q8: z.string().min(10, "Please provide a more detailed answer and code."),
    q9: z.string().min(10, "Please provide a more detailed answer and code."),
    q10: z.string().min(10, "Please provide a more detailed answer and code."),
    q11: z.string().min(10, "Please provide a more detailed answer."),
    q12: z.string().min(10, "Please provide a more detailed answer."),
    q13: z.string().min(10, "Please provide a more detailed answer."),
    q14: z.string().min(10, "Please provide a more detailed answer and code."),
    q15: z.string().min(10, "Please provide a more detailed answer and code."),
    q16: z.string().min(10, "Please provide a more detailed answer and code."),
    q17: z.string().min(10, "Please provide a more detailed answer."),
    q18: z.string().min(10, "Please provide a more detailed answer."),
    q19: z.string().min(10, "Please provide a more detailed answer and commands."),
    q20: z.string().min(10, "Please provide a more detailed answer and code."),
    q21: z.string().min(10, "Please provide a more detailed answer and code."),
    q22: z.string().min(10, "Please provide a more detailed answer and code."),
});

type ExamFormValues = z.infer<typeof examSchema>;

const examQuestions = {
    "Section A: Programming Fundamentals & Basics": [
        { id: "q1", question: "Explain what a programming language is and why it's important. Give a real-world example of a problem solved with code." },
        { id: "q2", question: "Write a function is_even(number) that returns True if the input is even and False otherwise. Explain how your code works.", isCode: true },
        { id: "q3", question: "What is the difference between a variable and a function in Python? Provide code examples to illustrate your answer.", isCode: true },
    ],
    "Section B: Control Flow & Data Types": [
        { id: "q4", question: "Write a program that asks the user for their age and classifies them as: Minor (<18), Adult (18–64), or Senior (65+). Add input validation and comments.", isCode: true },
        { id: "q5", question: "List three data types in Python. For each: Name the type, Describe what it stores, Give a real-world use case." },
    ],
    "Section C: File Handling & Working with Data": [
        { id: "q6", question: "What is JSON and why is it used in programming? Write a short Python script that loads a JSON file and prints the value of a key named \"username\".", isCode: true },
        { id: "q7", question: "Write a Python program that stores a list of your favorite movies in a text file, one per line. Explain what each line of your code does.", isCode: true },
    ],
    "Section D: APIs & Web Data": [
        { id: "q8", question: "What is an API? Write Python code using the requests library to get data from a public API (e.g., https://api.agify.io?name=michael) and print the age.", isCode: true },
        { id: "q9", question: "Describe how to handle API errors in Python. Write a short snippet that handles 404 and prints a friendly message.", isCode: true },
    ],
    "Section E: GUI Programming": [
        { id: "q10", question: "Using tkinter, write a GUI application that: Opens a window, Displays the message: \"Welcome!\", Has a button that closes the window. Include comments and layout explanation.", isCode: true },
        { id: "q11", question: "What’s the difference between .pack() and .grid() in tkinter? When would you use each?" },
    ],
    "Section F: Testing, Debugging & Code Quality": [
        { id: "q12", question: "Why is testing important in software development? Describe what a unit test does." },
        { id: "q13", question: "Describe one method or tool you use to debug Python code." },
        { id: "q14", question: "Write a unit test for the is_even() function (from Question 2) using Python’s unittest module. Explain the structure of your test.", isCode: true },
    ],
    "Section G: Databases & Data Storage": [
        { id: "q15", question: "Explain what a database is and why developers use them. Write Python code using sqlite3 to: Create a contacts table, Insert one contact with name and phone.", isCode: true },
        { id: "q16", question: "Write a program that: Asks the user for a contact name, Searches the contacts table, Prints the phone number if found, or an error message if not.", isCode: true },
    ],
    "Section H: Career & Portfolio Development": [
        { id: "q17", question: "List three things you should include in a coding portfolio and explain why each is important." },
        { id: "q18", question: "What is one effective way to prepare for a coding interview?" },
        { id: "q19", question: "Explain what Git and GitHub are. Describe how they help teams collaborate. Write the basic commands to: Initialize a repository, Add a file, Commit changes, Push to GitHub.", isCode: true },
    ],
    "Section I: Advanced Concepts & Problem Solving": [
        { id: "q20", question: "Write a Python program to: Read a list of integers from the user (comma-separated), Find and print the second largest number, Handle invalid input. Explain your logic and how your code works.", isCode: true },
        { id: "q21", question: "Explain the concept of recursion with a real-world analogy. Write a recursive Python function that calculates the factorial of a number. Walk through how it works with factorial(4).", isCode: true },
    ],
    "Section J: Data Structures & Algorithms": [
        { id: "q22", question: "Explain the difference between a list and a dictionary in Python. Provide: Use cases for each, Code to: Add an item, Access an item, Delete an item.", isCode: true },
    ]
};

export default function CodingQuizPage() {
    const [user, loading] = useAuthState(auth);
    const router = useRouter();
    const { toast } = useToast();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [isDisqualified, setIsDisqualified] = useState(false);
    const [showSubmitWarning, setShowSubmitWarning] = useState(false);
    const [isMounted, setIsMounted] = useState(false);

    const form = useForm<ExamFormValues>({
        resolver: zodResolver(examSchema),
        defaultValues: Object.fromEntries(Object.values(examQuestions).flat().map(q => [q.id, ""]))
    });
    
    useEffect(() => {
        setIsMounted(true);
        const handleBeforeUnload = (e: BeforeUnloadEvent) => {
             if (!isSubmitted && !isDisqualified) {
                e.preventDefault();
                e.returnValue = 'Are you sure you want to leave? Your exam progress will be lost.';
            }
        };

        const handleVisibilityChange = () => {
            if (document.visibilityState === 'hidden' && !isSubmitted && !isDisqualified) {
                setIsDisqualified(true);
            }
        };

        window.addEventListener('beforeunload', handleBeforeUnload);
        document.addEventListener('visibilitychange', handleVisibilityChange);

        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, [isSubmitted, isDisqualified]);

    const allFields = useWatch({ control: form.control });
    
    const isFormComplete = () => {
        if(!allFields) return false;
        return Object.values(examQuestions).flat().every(q => {
            const value = allFields[q.id as keyof ExamFormValues];
            return typeof value === 'string' && value.trim().length > 0;
        });
    };

    if (!loading && !user && isMounted) {
        router.push("/auth");
    }

    async function onSubmit(data: ExamFormValues) {
        if (!user) {
            toast({ variant: "destructive", title: "You must be logged in to submit." });
            return;
        }
        if (isDisqualified) {
            toast({ variant: "destructive", title: "Submission Blocked", description: "Your exam has been disqualified." });
            return;
        }
        setIsSubmitting(true);
        try {
            await setDoc(doc(db, "examSubmissions", user.uid), {
                userId: user.uid,
                userEmail: user.email,
                quiz: "coding-final-exam",
                answers: data,
                submittedAt: serverTimestamp(),
                status: "submitted",
            });
            setIsSubmitted(true);
        } catch (error: any) {
            toast({
                variant: "destructive",
                title: "Submission Failed",
                description: "There was an error saving your exam. Please try again.",
            });
        } finally {
            setIsSubmitting(false);
        }
    }
    
    if (!isMounted) {
       return (
            <div className="flex flex-col min-h-screen items-center justify-center bg-background">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        );
    }

    if (isDisqualified) {
        return (
             <div className="flex flex-col min-h-screen">
                <Header />
                <main className="flex-1 flex items-center justify-center">
                    <Card className="w-full max-w-2xl text-center p-8 bg-destructive/10 border-destructive">
                        <CardHeader>
                            <CardTitle className="font-headline text-3xl text-destructive-foreground flex items-center justify-center gap-4">
                                <Ban size={32} /> Exam Disqualified
                            </CardTitle>
                            <CardDescription className="text-base pt-4 text-destructive-foreground/90">
                                Your exam attempt has been voided because you navigated away from the exam page. To ensure fairness, all candidates must remain on the page for the duration of the test.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Button asChild>
                                <Link href="/">Return to Homepage</Link>
                            </Button>
                        </CardContent>
                    </Card>
                </main>
                <Footer />
            </div>
        )
    }
    
    if (isSubmitted) {
        return (
            <div className="flex flex-col min-h-screen">
                <Header />
                <main className="flex-1 flex items-center justify-center">
                    <Card className="w-full max-w-2xl text-center p-8">
                        <CardHeader>
                            <CardTitle className="font-headline text-3xl">Submission Received!</CardTitle>
                            <CardDescription className="text-base pt-2">
                                Thank you for completing the final exam. Your answers have been submitted for review. Our instructors will grade your submission, and you will receive your certificate via email if you pass.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Button asChild>
                                <Link href="/">Back to Homepage</Link>
                            </Button>
                        </CardContent>
                    </Card>
                </main>
                <Footer />
            </div>
        );
    }
    
    return (
        <div className="flex flex-col min-h-screen bg-background">
            <NavigationBlocker shouldBlock={!isSubmitted && !isDisqualified} />
            <Header />
            <main className="flex-1 py-12">
                <section className="container max-w-4xl mx-auto">
                    <Card>
                        <CardHeader className="text-center">
                            <CardTitle className="font-headline text-4xl">Final Exam – General Coding Course</CardTitle>
                            <CardDescription className="text-lg">Answer all questions to the best of your ability. Good luck!</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Form {...form}>
                                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-12">
                                    {Object.entries(examQuestions).map(([sectionTitle, questions]) => (
                                        <div key={sectionTitle} className="space-y-8 p-6 border rounded-lg">
                                            <h2 className="font-headline text-2xl font-semibold border-b pb-2">{sectionTitle}</h2>
                                            {questions.map(({ id, question, isCode }, index) => (
                                                <FormField
                                                    key={id}
                                                    control={form.control}
                                                    name={id as keyof ExamFormValues}
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel className="text-lg font-medium">Question {index + 1}: {question}</FormLabel>
                                                            <FormControl>
                                                                <Textarea
                                                                    placeholder={isCode ? "Write your code and explanation here..." : "Write your answer here..."}
                                                                    className={`min-h-[150px] text-base ${isCode ? 'font-mono' : ''}`}
                                                                    {...field}
                                                                    disabled={isDisqualified}
                                                                />
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                            ))}
                                        </div>
                                    ))}

                                    <div className="flex justify-end pt-6">
                                        <Button
                                            type="button"
                                            onClick={() => setShowSubmitWarning(true)}
                                            disabled={!isFormComplete() || isSubmitting || isDisqualified}
                                            size="lg"
                                        >
                                            {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                                            {isSubmitting ? "Submitting..." : "Submit Final Exam"}
                                        </Button>
                                    </div>
                                </form>
                            </Form>
                        </CardContent>
                    </Card>
                </section>
                <AlertDialog open={showSubmitWarning} onOpenChange={setShowSubmitWarning}>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                                This action is final. You will not be able to edit your answers after submitting. Please review your answers one last time before proceeding.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Review Answers</AlertDialogCancel>
                            <AlertDialogAction onClick={form.handleSubmit(onSubmit)}>Yes, Submit My Exam</AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </main>
            <Footer />
        </div>
    );
}
