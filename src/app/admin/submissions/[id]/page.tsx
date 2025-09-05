
"use client";

import { useState, useEffect } from "react";
import { doc, getDoc, updateDoc, setDoc, serverTimestamp, collection } from "firebase/firestore";
import { db, auth } from "@/lib/firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Loader2, ArrowLeft, Award, Mail, RotateCcw } from "lucide-react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { sendCertificateEmail } from "@/ai/flows/send-certificate-email";
import { MarkingRubric } from "@/components/marking-rubric";

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

const allQuestions = Object.values(examQuestions).flat();
const MAX_SCORE_PER_QUESTION = 5;
const TOTAL_POSSIBLE_SCORE = allQuestions.length * MAX_SCORE_PER_QUESTION;
const PASSING_PERCENTAGE = 0.7; // 70%

const markingSchema = z.object({
    feedback: z.string().optional(),
    marks: z.record(z.coerce.number().min(0).max(MAX_SCORE_PER_QUESTION).default(0)),
});

type MarkingFormValues = z.infer<typeof markingSchema>;

export default function SubmissionPage({ params }: { params: { id: string } }) {
  const [submission, setSubmission] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isUnvoiding, setIsUnvoiding] = useState(false);
  const router = useRouter();
  const { toast } = useToast();
  const [user, authLoading] = useAuthState(auth);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [certificateId, setCertificateId] = useState<string | null>(null);

  const form = useForm<MarkingFormValues>({
    resolver: zodResolver(markingSchema),
    defaultValues: {
      marks: Object.fromEntries(allQuestions.map(q => [q.id, 0]))
    },
  });

  const marks = form.watch("marks");
  const totalMarks = Object.values(marks).reduce((sum, mark) => sum + (Number(mark) || 0), 0);
  const scorePercentage = TOTAL_POSSIBLE_SCORE > 0 ? (totalMarks / TOTAL_POSSIBLE_SCORE) * 100 : 0;
  const finalStatus = scorePercentage >= PASSING_PERCENTAGE * 100 ? "passed" : "failed";

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
        router.push("/auth");
        return;
    }

    const checkRole = async () => {
        const userDoc = await getDoc(doc(db, "userProfiles", user.uid));
        if (userDoc.exists() && userDoc.data().role === "admin") {
            setIsAuthorized(true);
        } else {
            router.push("/");
        }
    };
    checkRole();
  }, [user, authLoading, router]);

  useEffect(() => {
    if (!isAuthorized) return;

    const fetchSubmission = async () => {
      if (!params.id) return;
      try {
        const docRef = doc(db, "examSubmissions", params.id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            const data = docSnap.data();
            setSubmission(data);
            setCertificateId(data.certificateId || null);
            form.reset({
                feedback: data.feedback || "",
                marks: data.marks || Object.fromEntries(allQuestions.map(q => [q.id, 0])),
            });
        } else {
          toast({ variant: "destructive", title: "Submission not found" });
        }
      } catch (error) {
        console.error(error);
        toast({ variant: "destructive", title: "Error fetching submission" });
      } finally {
        setLoading(false);
      }
    };
    fetchSubmission();
  }, [params.id, toast, form, isAuthorized]);

  const onSubmit = async (data: MarkingFormValues) => {
    setIsSubmitting(true);
    try {
        const docRef = doc(db, "examSubmissions", params.id);
        const submissionData = {
          ...data,
          totalMarks,
          scorePercentage,
          status: finalStatus,
          markedAt: new Date(),
        };

        await updateDoc(docRef, submissionData);

        toast({ title: "Marking Saved", description: "The submission has been updated." });
        setSubmission({ ...submission, ...submissionData }); // update local state
    } catch (error) {
        console.error(error);
        toast({ variant: "destructive", title: "Error saving marks" });
    } finally {
        setIsSubmitting(false);
    }
  };

  const handleGenerateAndSendCertificate = async () => {
    if (!submission || finalStatus !== 'passed') return;
    setIsProcessing(true);
    try {
        const userProfileRef = doc(db, "userProfiles", submission.userId);
        const userProfileSnap = await getDoc(userProfileRef);
        if (!userProfileSnap.exists()) {
            throw new Error("Student profile not found.");
        }
        const studentName = userProfileSnap.data().fullName;

        const certRef = doc(collection(db, "certificates"));
        await setDoc(certRef, {
            studentName: studentName,
            studentEmail: submission.userEmail,
            courseName: "General Coding Course",
            issuedAt: serverTimestamp(),
            submissionId: params.id,
            finalScore: scorePercentage.toFixed(2),
        });

        const submissionRef = doc(db, "examSubmissions", params.id);
        await updateDoc(submissionRef, { certificateId: certRef.id });

        setCertificateId(certRef.id);
        toast({ title: "Certificate Generated!", description: "The certificate record has been created." });

        const certificateUrl = `${window.location.origin}/certificate/${certRef.id}`;
        const emailResult = await sendCertificateEmail({
            studentName,
            studentEmail: submission.userEmail,
            certificateUrl,
        });

        if (emailResult.success) {
            toast({ title: "Email Sent!", description: "The certificate has been emailed to the student." });
        } else {
             throw new Error(emailResult.message || "Unknown error sending email.");
        }

    } catch (error) {
        console.error(error);
        toast({ variant: "destructive", title: "Action Failed", description: String(error) });
    } finally {
        setIsProcessing(false);
    }
  };

  const handleUnvoidSubmission = async () => {
    setIsUnvoiding(true);
    try {
      const docRef = doc(db, "examSubmissions", params.id);
      await updateDoc(docRef, {
        status: "submitted",
      });
      setSubmission({ ...submission, status: "submitted" });
      toast({ title: "Submission Reinstated", description: "You can now mark this exam." });
    } catch (error) {
      console.error("Error reinstating submission:", error);
      toast({ variant: "destructive", title: "Error", description: "Could not reinstate submission." });
    } finally {
      setIsUnvoiding(false);
    }
  };


  if (authLoading || loading || !isAuthorized) {
    return (
      <div className="flex flex-col min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin" />
        <p className="mt-4 text-muted-foreground">
          {isAuthorized ? 'Loading submission...' : 'Verifying access...'}
        </p>
      </div>
    );
  }

  if (!submission) {
    return <p>Submission not found.</p>;
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-1 py-12">
        <section className="container max-w-4xl mx-auto">
            <Button variant="ghost" onClick={() => router.back()} className="mb-4">
                <ArrowLeft className="mr-2" /> Back to Dashboard
            </Button>
          <Card>
            <CardHeader>
              <CardTitle className="font-headline text-3xl">Marking Exam</CardTitle>
              <CardDescription>
                Reviewing submission for <span className="font-semibold text-primary">{submission.userEmail}</span>
              </CardDescription>
            </CardHeader>
            <CardContent>
              {submission.status === "disqualified" ? (
                 <div className="text-center p-8 bg-destructive/10 rounded-lg">
                    <h3 className="text-destructive font-bold text-xl">Submission Voided</h3>
                    <p className="text-destructive-foreground mt-2">
                        This exam was disqualified. Reason: <span className="font-semibold">{submission.answers?.reason || "Not specified"}</span>
                    </p>
                    <Button onClick={handleUnvoidSubmission} disabled={isUnvoiding} className="mt-4">
                        {isUnvoiding ? <Loader2 className="animate-spin mr-2"/> : <RotateCcw className="mr-2"/>}
                        Reinstate Exam
                    </Button>
                </div>
              ) : (
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-12">
                    {Object.entries(examQuestions).map(([sectionTitle, questions]) => (
                        <div key={sectionTitle} className="space-y-6">
                            <h2 className="font-headline text-2xl font-semibold border-b pb-2">{sectionTitle}</h2>
                            {questions.map(({id, question, isCode}) => (
                                <div key={id} className="p-4 border rounded-lg bg-background/50 space-y-4">
                                    <h3 className="font-semibold text-lg">{question}</h3>
                                    <p className={`whitespace-pre-wrap p-4 rounded-md bg-muted ${isCode ? 'font-mono text-sm' : 'text-base'}`}>
                                        {submission.answers[id]}
                                    </p>
                                    <FormField
                                        control={form.control}
                                        name={`marks.${id}`}
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Score (0-5)</FormLabel>
                                                <FormControl>
                                                  <Controller
                                                      control={form.control}
                                                      name={`marks.${id}`}
                                                      render={({ field: controllerField }) => (
                                                        <MarkingRubric
                                                          score={controllerField.value}
                                                          onScoreChange={controllerField.onChange}
                                                        />
                                                      )}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            ))}
                        </div>
                    ))}

                    <div className="pt-8 border-t sticky bottom-0 bg-background/95 py-6">
                        <h2 className="font-headline text-2xl mb-4">Marking Summary</h2>
                        <div className="flex justify-between items-center p-4 rounded-lg bg-muted mb-6">
                          <div>
                            <p className="text-muted-foreground">Total Score</p>
                            <p className="font-bold text-2xl">{totalMarks} / {TOTAL_POSSIBLE_SCORE}</p>
                          </div>
                           <div>
                            <p className="text-muted-foreground">Percentage</p>
                            <p className="font-bold text-2xl">{scorePercentage.toFixed(2)}%</p>
                          </div>
                           <div>
                            <p className="text-muted-foreground">Final Status</p>
                            <Badge variant={finalStatus === 'passed' ? 'default' : 'destructive'} className="text-2xl px-4 py-1">
                              {finalStatus}
                            </Badge>
                          </div>
                        </div>

                        <FormField
                            control={form.control}
                            name="feedback"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Overall Feedback (Optional)</FormLabel>
                                    <FormControl>
                                        <Textarea placeholder="Provide overall feedback for the student..." {...field} className="min-h-[120px]" />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <div className="flex flex-wrap gap-4 items-center mt-6">
                            <Button type="submit" disabled={isSubmitting || isProcessing} size="lg">
                                {isSubmitting ? <Loader2 className="animate-spin mr-2" /> : null}
                                Save Marking
                            </Button>
                            {finalStatus === 'passed' && (
                                certificateId ? (
                                    <Button asChild variant="outline" size="lg">
                                        <Link href={`/certificate/${certificateId}`} target="_blank">View Certificate</Link>
                                    </Button>
                                ) : (
                                    <Button type="button" onClick={handleGenerateAndSendCertificate} disabled={isProcessing} size="lg" variant="secondary">
                                        {isProcessing ? <Loader2 className="animate-spin mr-2"/> : <><Award className="mr-2"/><Mail className="mr-2"/></>}
                                        Generate & Email Certificate
                                    </Button>
                                )
                            )}
                        </div>
                    </div>
                  </form>
                </Form>
              )}
            </CardContent>
          </Card>
        </section>
      </main>
      <Footer />
    </div>
  );
}

