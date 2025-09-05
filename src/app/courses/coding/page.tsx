
"use client";

import { useState, useEffect } from "react";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth, db } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import { doc, getDoc } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { AlertDialog, AlertDialogAction, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

const courseModules = [
  {
    title: "Module 0: Introduction to Programming",
    goal: "Familiarize learners with what programming is, and how it is used in real life.",
    topics: [
      "What is programming?",
      "Why learn programming? (Career paths, automation, web dev, etc.)",
      "How computers 'think' (logic, instructions, etc.)",
      "Overview of programming languages",
      "Intro to compilers, interpreters, IDEs",
    ],
    researchPrompt: "Research the difference between a compiler and an interpreter. The quiz may ask you about this."
  },
  {
    title: "Module 1: Setting Up Your Environment",
    goal: "Teach how to prepare the development environment.",
    topics: [
      "Text editors (VS Code, Sublime, etc.)",
      "Install Python or JavaScript (Python is recommended for this course)",
      "Terminal / command line basics",
      "Git and GitHub (version control fundamentals)",
    ],
    researchPrompt: "Explore popular VS Code extensions for Python or JavaScript development. Understanding your tools is key."
  },
  {
    title: "Module 2: Programming Basics (Python Recommended)",
    goal: "Build strong foundations in programming logic.",
    topics: [
      "Variables & Data Types (integers, floats, strings, booleans)",
      "Input/Output functions",
      "Arithmetic, Comparison, and Logical Operators",
      "Conditional Statements (if/else/elif)",
      "Loops (for, while)",
      "Basic error handling (try/except blocks)",
    ],
    researchPrompt: "Look up 'truthiness' in Python. How does Python evaluate non-boolean values in an `if` statement?"
  },
  {
    title: "Module 3: Data Structures & Logic",
    goal: "Teach how to store and manipulate data effectively.",
    topics: ["Lists / Arrays", "Tuples", "Dictionaries / Hashmaps", "Sets", "Strings in depth", "Nested structures", "Problem solving with loops and conditions"],
    researchPrompt: "What is the key difference between a list and a tuple in Python? When would you use one over the other?"
  },
  {
    title: "Module 4: Functions & Modules",
    goal: "Start writing reusable and clean code.",
    topics: ["Defining functions with `def`", "Parameters and return values", "Variable Scope (local vs. global)", "Built-in vs custom functions", "Importing and creating modules"],
    researchPrompt: "Investigate the concept of recursion. How can a function call itself to solve a problem?"
  },
  {
    title: "Module 5: Object-Oriented Programming (OOP)",
    goal: "Understand how large-scale programs are structured.",
    topics: ["Classes and Objects", "__init__, attributes, and methods", "Inheritance and Polymorphism", "Encapsulation and Abstraction", "Comparing OOP vs Functional programming paradigms"],
    researchPrompt: "What are the four pillars of Object-Oriented Programming? The quiz will expect you to know them."
  },
  {
    title: "Module 6: Algorithms & Problem Solving",
    goal: "Strengthen logic and efficiency.",
    topics: ["Sorting (Bubble, Insertion)", "Searching (Linear, Binary)", "Introduction to Big-O notation", "Greedy algorithms", "Practice problems (LeetCode, HackerRank style)"],
    researchPrompt: "Compare the time complexity (Big-O) of linear search versus binary search. Why is binary search often faster?"
  },
  {
    title: "Module 7: File Handling & Data Processing",
    goal: "Teach real-world input/output operations.",
    topics: ["Reading/writing files (text, CSV)", "JSON parsing and serialization", "Basic data cleaning techniques", "Working with file paths"],
    researchPrompt: "What is CSV format? How is it different from JSON?"
  },
  {
    title: "Module 8: Web Development Basics",
    goal: "Introduce web concepts and front-end basics.",
    topics: ["What are HTML, CSS, and JavaScript?", "Build a static webpage", "Introduction to the client-server model", "Introduction to Flask or Node.js for a simple web server"],
    researchPrompt: "What is the Document Object Model (DOM) and how does JavaScript interact with it?"
  },
  {
    title: "Module 9: APIs and Web Integration",
    goal: "Work with real data sources.",
    topics: ["What is an API?", "HTTP basics (GET, POST, headers)", "Using `requests` (Python) or `fetch` (JS) to call APIs", "Building a simple API endpoint", "API keys and authentication basics"],
    researchPrompt: "Find a free, public API (e.g., a weather or space API) and examine the JSON data it returns."
  },
  {
    title: "Module 10: Databases",
    goal: "Store and query structured data.",
    topics: ["What is a database?", "SQL basics (SELECT, INSERT, UPDATE, DELETE)", "Relational vs NoSQL databases", "Using SQLite with Python", "Introduction to ORMs (like SQLAlchemy)"],
    researchPrompt: "What is the difference between a primary key and a foreign key in a relational database?"
  },
  {
    title: "Module 11: Testing and Debugging",
    goal: "Teach clean code and maintenance.",
    topics: ["Why testing matters", "Manual debugging strategies (print statements, etc.)", "Unit testing with `unittest` or `pytest`", "The importance of logging", "Writing effective test cases"],
    researchPrompt: "What is Test-Driven Development (TDD)? What are its potential benefits?"
  },
  {
    title: "Module 12: Deployment and Project Management",
    goal: "Make apps real and usable.",
    topics: ["Hosting with GitHub Pages, Netlify, or Heroku", "Environment variables for configuration", "Basic CI/CD with GitHub Actions", "Package management (pip/npm)", "Organizing project folders and structure"],
    researchPrompt: "What does CI/CD stand for, and why is it important in modern software development?"
  }
];


export default function CodingPage() {
  const [user, loading] = useAuthState(auth);
  const router = useRouter();
  const { toast } = useToast();
  const [isFirstTime, setIsFirstTime] = useState(false);
  
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
  }, [user, loading, router]);


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

      <main className="flex-1">
        <section className="py-16 md:py-24">
          <div className="container px-4 md:px-6">
            <div className="text-center mb-12">
              <h1 className="font-headline text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight">
                General Coding Course
              </h1>
              <p className="max-w-3xl mx-auto text-muted-foreground mt-4 text-lg">
                This course provides a comprehensive introduction to programming. Study the modules and conduct your own research to prepare for the final quiz.
              </p>
            </div>
            <Card className="max-w-4xl mx-auto">
              <CardHeader>
                <CardTitle>Course Modules</CardTitle>
                <CardDescription>Work through each module to build your knowledge from the ground up.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <Accordion type="single" collapsible className="w-full">
                  {courseModules.map((module) => (
                    <AccordionItem value={module.title} key={module.title}>
                      <AccordionTrigger className="font-headline text-lg hover:no-underline">
                        {module.title}
                      </AccordionTrigger>
                      <AccordionContent className="space-y-4 pt-2">
                        <p className="font-semibold text-muted-foreground">{module.goal}</p>
                        <ul className="list-disc list-inside space-y-1">
                          {module.topics.map((topic) => <li key={topic}>{topic}</li>)}
                        </ul>
                         <p className="pt-2 text-primary/80 italic">
                            <strong>Research Task:</strong> {module.researchPrompt}
                        </p>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                   <AccordionItem value="final-project">
                      <AccordionTrigger className="font-headline text-lg hover:no-underline text-primary">
                        Module 13: Final Project
                      </AccordionTrigger>
                      <AccordionContent className="space-y-4 pt-2">
                        <p className="font-semibold text-muted-foreground">Apply everything you've learned in a realistic project.</p>
                        <ul className="list-disc list-inside space-y-1">
                            <li>Choose your own project: A web app, data tool, API, etc.</li>
                            <li>Use Git for version control.</li>
                            <li>Include a README, tests, and documentation.</li>
                            <li>Present the project (video, slides, or demo).</li>
                        </ul>
                         <p className="pt-2 text-primary/80 italic">
                            <strong>Note:</strong> Completing a final project is highly recommended for your portfolio but not required to unlock the quiz.
                        </p>
                      </AccordionContent>
                    </AccordionItem>
                </Accordion>
                
                <div className="text-center pt-8 border-t">
                  <h2 className="font-headline text-2xl font-bold mb-4">Ready to test your knowledge?</h2>
                  <p className="text-muted-foreground mb-6">After studying all the modules, you can proceed to the final quiz.</p>
                  <Button onClick={handleStartQuiz} size="lg">
                    Start Final Quiz
                  </Button>
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

