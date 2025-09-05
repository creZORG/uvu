
"use client";

import { useEffect } from "react";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth, db } from "@/lib/firebase";
import Link from "next/link";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useRouter } from "next/navigation";
import { doc, getDoc } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";

export default function CodingPage() {
  const [user, loading] = useAuthState(auth);
  const router = useRouter();
  const { toast } = useToast();

  const topics = [
    {
      title: "Introduction to Programming",
      subtopics: ["What is code?", "Basic syntax and variables", "Data types"],
    },
    {
      title: "Control Structures",
      subtopics: ["If/else statements", "Loops (for, while)", "Switch cases"],
    },
    {
      title: "Functions",
      subtopics: ["Defining functions", "Parameters and arguments", "Return values"],
    },
    {
      title: "Data Structures",
      subtopics: ["Arrays and lists", "Objects and dictionaries", "Basic algorithms"],
    },
  ];

  const handleStartQuiz = async () => {
    if (!user) {
      router.push('/auth');
      return;
    }
    
    // Check for user profile completeness
    const profileDocRef = doc(db, "userProfiles", user.uid);
    const profileDoc = await getDoc(profileDocRef);

    if (!profileDoc.exists() || !isProfileComplete(profileDoc.data())) {
      toast({
          variant: "destructive",
          title: "Profile Incomplete",
          description: "Please complete your profile before starting the quiz.",
      });
      sessionStorage.setItem('redirectAfterProfileUpdate', '/courses/coding/quiz');
      router.push('/profile');
    } else {
      router.push('/courses/coding/quiz');
    }
  };

  const isProfileComplete = (profile: any) => {
      if (!profile) return false;
      const requiredFields = ['fullName', 'location', 'dateOfBirth', 'gender', 'occupation'];
      return requiredFields.every(field => profile[field]);
  };


  const renderStartButton = () => {
    if (loading) {
      return <Button size="lg" disabled>Loading...</Button>;
    }
    // The button is always active, but the check happens in handleStartQuiz
    return (
       <Button onClick={handleStartQuiz} size="lg">
          Start Quiz
        </Button>
    );
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-1">
        <section className="py-16 md:py-24">
          <div className="container px-4 md:px-6">
            <div className="text-center mb-12">
              <h1 className="font-headline text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight">
                Coding Quiz
              </h1>
              <p className="max-w-3xl mx-auto text-muted-foreground mt-4 text-lg">
                Test your knowledge of fundamental programming concepts.
              </p>
            </div>
            <Card className="max-w-4xl mx-auto">
              <CardHeader>
                <CardTitle>Quiz Topics</CardTitle>
                <CardDescription>This quiz covers the following topics and subtopics:</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {topics.map((topic) => (
                    <div key={topic.title} className="p-4 border rounded-lg">
                      <h3 className="font-semibold text-lg mb-2">{topic.title}</h3>
                      <ul className="list-disc list-inside text-muted-foreground">
                        {topic.subtopics.map((subtopic) => (
                          <li key={subtopic}>{subtopic}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
                <div className="text-center pt-6">
                  {renderStartButton()}
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
