
"use client";

import { useState, useEffect } from "react";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth, db } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import { doc, getDoc } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";
import { AlertDialog, AlertDialogAction, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, ArrowRight, CheckCircle } from "lucide-react";

const courseContent = [
  {
    title: "Module 0: Introduction to Programming",
    pages: [
      {
        title: "What is Programming?",
        content: [
          "What is programming?",
          "Why learn programming? (Career paths, automation, web dev, etc.)",
          "How computers 'think' (logic, instructions, etc.)",
        ],
        researchPrompt: "Research the difference between a compiler and an interpreter. The quiz may ask you about this."
      },
      {
        title: "Languages & Tools",
        content: [
          "Brief overview of popular programming languages (Python, JavaScript, Java, C++)",
          "What are IDEs (Integrated Development Environments)?",
          "Introduction to compilers and interpreters.",
        ],
        researchPrompt: "Find out which programming language is most in-demand in your country or city."
      }
    ]
  },
  {
    title: "Module 1: Setting Up Your Environment",
    pages: [
      {
        title: "Essential Tools",
        content: [
            "Choosing and installing a text editor (e.g., VS Code, Sublime Text).",
            "What is a terminal or command line?",
            "Basic navigation commands (ls, cd, pwd).",
        ],
        researchPrompt: "Explore popular VS Code extensions for Python or JavaScript development."
      },
      {
        title: "Installation & Version Control",
        content: [
            "Installing Python or Node.js (for JavaScript).",
            "What is Git and why is it important?",
            "Creating a GitHub account and basic repository setup.",
        ],
        researchPrompt: "What is the difference between Git and GitHub?"
      }
    ]
  },
    {
    title: "Module 2: Programming Basics (Python Recommended)",
    pages: [
      {
        title: "Variables and Operators",
        content: [
            "Variables & Data Types (integers, floats, strings, booleans).",
            "How to get input from a user and print output.",
            "Arithmetic (+, -, *, /), Comparison (==, !=, <, >), and Logical (and, or, not) Operators.",
        ],
        researchPrompt: "Look up 'truthiness' in Python. How does Python evaluate non-boolean values in an `if` statement?"
      },
      {
        title: "Control Flow",
        content: [
            "Conditional Statements (if, else, elif).",
            "How to control the flow of your program based on conditions.",
            "'for' loops (iterating over sequences).",
            "'while' loops (repeating as long as a condition is true).",
            "Basic error handling with try/except blocks.",
        ],
        researchPrompt: "What is an infinite loop and why should you avoid it?"
      }
    ]
  },
  {
    title: "Module 3: Data Structures & Logic",
    pages: [
        {
            title: "Collections of Data",
            content: [
                "Lists / Arrays: Ordered, mutable collections.",
                "Tuples: Ordered, immutable collections.",
                "Sets: Unordered, unique collections.",
                "When to use each type.",
            ],
            researchPrompt: "What is the key difference between a list and a tuple in Python? When would you use one over the other?"
        },
        {
            title: "Key-Value Pairs and Strings",
            content: [
                "Dictionaries / Hashmaps: Storing data as key-value pairs.",
                "In-depth string manipulation and methods.",
                "Nested structures (e.g., a list of dictionaries).",
                "Solving problems using these structures.",
            ],
            researchPrompt: "Find an example of a JSON object. How does its structure compare to a Python dictionary?"
        }
    ]
  },
];


const totalPages = courseContent.reduce((sum, module) => sum + module.pages.length, 0);

export default function CodingPage() {
  const [user, loading] = useAuthState(auth);
  const router = useRouter();
  const { toast } = useToast();
  
  const [isFirstTime, setIsFirstTime] = useState(false);
  const [isQuizUnlocked, setIsQuizUnlocked] = useState(false);

  const [currentModuleIndex, setCurrentModuleIndex] = useState(0);
  const [currentPageIndex, setCurrentPageIndex] = useState(0);

  useEffect(() => {
    if (loading) return;
    if (!user) {
        router.push('/auth');
        return;
    }
    const hasVisited = localStorage.getItem('hasVisitedCodingCourse');
    if (!hasVisited) {
        setIsFirstTime(true);
        localStorage.setItem('hasVisitedCodingCourse', 'true');
    }

    const savedProgress = localStorage.getItem(`codingCourseProgress_${user.uid}`);
    if (savedProgress) {
        const { module, page } = JSON.parse(savedProgress);
        setCurrentModuleIndex(module);
        setCurrentPageIndex(page);
    }
  }, [user, loading, router]);


  useEffect(() => {
      if(user) {
        const progress = { module: currentModuleIndex, page: currentPageIndex };
        localStorage.setItem(`codingCourseProgress_${user.uid}`, JSON.stringify(progress));
      }
  }, [currentModuleIndex, currentPageIndex, user]);

  const handleNext = () => {
    if (currentPageIndex < courseContent[currentModuleIndex].pages.length - 1) {
      setCurrentPageIndex(currentPageIndex + 1);
    } else if (currentModuleIndex < courseContent.length - 1) {
      setCurrentModuleIndex(currentModuleIndex + 1);
      setCurrentPageIndex(0);
    } else {
        if (!isQuizUnlocked) {
            setIsQuizUnlocked(true);
        }
    }
  };

  const handlePrev = () => {
    if (currentPageIndex > 0) {
      setCurrentPageIndex(currentPageIndex - 1);
    } else if (currentModuleIndex > 0) {
      const prevModuleIndex = currentModuleIndex - 1;
      const prevModulePageCount = courseContent[prevModuleIndex].pages.length;
      setCurrentModuleIndex(prevModuleIndex);
      setCurrentPageIndex(prevModulePageCount - 1);
    }
  };

  const handleStartQuiz = async () => {
    if (!user) {
      router.push('/auth');
      return;
    }
    
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
  
  const currentModule = courseContent[currentModuleIndex];
  const currentPage = currentModule.pages[currentPageIndex];

  const pagesCompleted = courseContent.slice(0, currentModuleIndex).reduce((acc, module) => acc + module.pages.length, 0) + currentPageIndex + 1;
  const progressPercentage = (pagesCompleted / totalPages) * 100;
  const isCourseComplete = progressPercentage === 100;


  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      
      <AlertDialog open={isFirstTime} onOpenChange={setIsFirstTime}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="font-headline text-2xl">Welcome to the Coding Course!</AlertDialogTitle>
            <AlertDialogDescription className="text-lg">
              Pay close attention to each module. Once you complete the course, you will unlock a quiz.
              This quiz can only be attempted once. Good luck!
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => setIsFirstTime(false)}>Let's Begin</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

       <AlertDialog open={isQuizUnlocked} onOpenChange={setIsQuizUnlocked}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="font-headline text-2xl flex items-center gap-2">
                <CheckCircle className="text-primary"/> Congratulations!
            </AlertDialogTitle>
            <AlertDialogDescription className="text-lg pt-2">
              You have completed the course and unlocked the final quiz.
            </AlertDialogDescription>
          </AlertDialogHeader>
           <div className="text-sm space-y-2">
                <p>Please read these instructions carefully before you begin:</p>
                <ul className="list-disc list-inside bg-destructive/10 text-destructive-foreground p-4 rounded-md">
                    <li>This quiz can only be attempted <strong>once</strong>.</li>
                    <li>You must score at least <strong>70%</strong> to pass.</li>
                    <li>Leaving the quiz page after starting will result in disqualification.</li>
                </ul>
            </div>
          <AlertDialogFooter>
            <AlertDialogAction onClick={handleStartQuiz} size="lg">I Understand, Start Quiz</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <main className="flex-1">
        <section className="py-16 md:py-24">
          <div className="container px-4 md:px-6">
            <div className="text-center mb-6">
              <h1 className="font-headline text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight">
                General Coding Course
              </h1>
              <p className="max-w-3xl mx-auto text-muted-foreground mt-4 text-lg">
                Work through each module to build your knowledge. Research the suggested topics to prepare for the final quiz.
              </p>
            </div>

             <div className="max-w-4xl mx-auto mb-8">
                <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium text-primary">Course Progress</span>
                    <span className="text-sm font-medium text-primary">{Math.round(progressPercentage)}%</span>
                </div>
                <Progress value={progressPercentage} />
            </div>

            <Card className="max-w-4xl mx-auto min-h-[500px] flex flex-col">
              <CardHeader>
                <CardDescription>{currentModule.title} - Page {currentPageIndex + 1}</CardDescription>
                <CardTitle className="font-headline text-2xl">{currentPage.title}</CardTitle>
              </CardHeader>
              <CardContent className="flex-1 space-y-6">
                  <ul className="list-disc list-inside space-y-2 text-lg">
                    {currentPage.content.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                   <p className="pt-4 text-primary/80 italic">
                        <strong>Research Task:</strong> {currentPage.researchPrompt}
                    </p>
              </CardContent>
              <CardFooter className="flex justify-between border-t pt-6">
                <Button variant="outline" onClick={handlePrev} disabled={currentModuleIndex === 0 && currentPageIndex === 0}>
                    <ArrowLeft className="mr-2"/> Previous
                </Button>

                {isCourseComplete ? (
                     <Button onClick={() => setIsQuizUnlocked(true)}>
                        <CheckCircle className="mr-2"/> Finish Course & Unlock Quiz
                    </Button>
                ) : (
                    <Button onClick={handleNext}>
                        Next <ArrowRight className="ml-2"/>
                    </Button>
                )}
              </CardFooter>
            </Card>

          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}

