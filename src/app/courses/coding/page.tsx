
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
            title: "Lesson 0.1: What is Programming?",
            content: [
                "Programming is the process of writing exact instructions for a computer to follow.",
                "These instructions are written in special languages that computers understand, like Python or JavaScript.",
                "Using these languages, we can create websites (like Facebook), mobile apps (like Instagram), games, and software tools (like Excel).",
                "It even allows us to control hardware like robots and smart home devices."
            ],
            researchPrompt: "Think about an app you use every day. Try to list five specific instructions you think a programmer had to write to make it work."
        },
        {
            title: "Lesson 0.2: Why Learn Programming?",
            content: [
                "Learning to code is a valuable skill that opens up many career opportunities in fields like Web Development, Data Science, AI, and Game Development.",
                "It's a tool for problem-solving and automation. You can use it to automate repetitive tasks in your work or personal life.",
                "Programming is a creative outlet. It gives you the power to build anything you can imagine.",
                "It enhances logical thinking and your ability to break down complex problems into manageable steps."
            ],
            researchPrompt: "Research one career path that interests you (e.g., 'Web Developer'). What are the typical day-to-day tasks for someone in that role?"
        },
        {
            title: "Lesson 0.3: How Programming Works",
            content: [
                "First, we write human-readable code in a text editor like Visual Studio Code.",
                "Next, a special program called a 'compiler' or 'interpreter' translates our code into machine code (binary 1s and 0s) that the computer's processor (CPU) can execute.",
                "The command line, or terminal, is a powerful tool we use to run these translators and manage our project files.",
                "An IDE (Integrated Development Environment) bundles all these tools—text editor, translator, and terminal—into one application to make development easier."
            ],
            researchPrompt: "What is the key difference between a compiler and an interpreter? Which one does Python use?"
        },
        {
            title: "Lesson 0.4: Overview of Programming Languages",
            content: [
                "There are many different programming languages, each with its own strengths. Think of them as different tools for different jobs.",
                "Python is known for being beginner-friendly and is widely used for web development, data analysis, and AI.",
                "JavaScript is the language of the web, used to make websites interactive.",
                "Other languages like C++, Java, and SQL are used for things like high-performance games, large-scale enterprise applications, and managing databases, respectively."
            ],
            researchPrompt: "Besides Python and JavaScript, find two other programming languages and what they are commonly used for."
        },
        {
            title: "Lesson 0.5: The Programmer's Mindset",
            content: [
                "Thinking like a programmer is more important than memorizing code. It's about how you approach problems.",
                "Decomposition: The skill of breaking a large, complex problem down into smaller, simpler, solvable steps.",
                "Pattern Recognition: Identifying similarities between problems to reuse solutions.",
                "Debugging: Understanding that errors are a normal and essential part of the process. Finding and fixing them is a core skill.",
                "Persistence: The best programmers are not those who know everything, but those who are skilled at finding answers and are persistent when facing challenges."
            ],
            researchPrompt: "What is 'pseudocode' and how can it help you plan your program before you write any actual code?"
        }
    ]
  },
  {
    title: "Module 1: Setting Up Your Environment",
    pages: [
      {
        title: "Essential Tools: Text Editor & Terminal",
        content: [
            "A text editor is where you write your code. Visual Studio Code (VS Code) is a popular, free choice with many helpful extensions.",
            "The terminal (or command line) is a text-based interface to your computer. It's essential for running code, installing tools, and navigating files.",
            "Basic commands you'll use often: `ls` (list files), `cd` (change directory), and `pwd` (show current directory).",
        ],
        researchPrompt: "Explore popular VS Code extensions for Python or JavaScript development."
      },
      {
        title: "Installation & Version Control with Git",
        content: [
            "You'll need to install a runtime for your chosen language, like Python or Node.js (for JavaScript).",
            "Git is a version control system. It tracks changes to your code, allowing you to revert to previous versions and collaborate with others without overwriting work.",
            "GitHub is a website that hosts Git repositories. It's like a social network for coders, allowing you to share your projects and contribute to others.",
        ],
        researchPrompt: "What is the difference between Git and GitHub?"
      }
    ]
  },
    {
    title: "Module 2: Programming Basics",
    pages: [
      {
        title: "Variables, Data Types, and I/O",
        content: [
            "A variable is a container for storing data. Data comes in different types, like integers (numbers), floats (decimals), strings (text), and booleans (true/false).",
            "You can get input from a user (e.g., asking for their name) and print output to the screen (e.g., saying 'Hello' to them).",
            "Example (Python): `name = input('Enter your name: ')` followed by `print('Hello, ' + name)`.",
        ],
        researchPrompt: "What is 'type casting'? For example, converting a string of numbers into an actual integer."
      },
      {
        title: "Operators and Control Flow",
        content: [
            "Operators perform actions: Arithmetic (+, -, *, /), Comparison (==, !=, <, >), and Logical (and, or, not).",
            "Control Flow directs the order in which your code executes.",
            "Conditional Statements (if, else, elif) run code only if a certain condition is true.",
            "Loops ('for' and 'while') repeat a block of code multiple times. 'for' loops are great for iterating over a sequence, while 'while' loops run as long as a condition is true.",
        ],
        researchPrompt: "What is an infinite loop and why should you avoid it?"
      }
    ]
  },
  {
    title: "Module 3: Data Structures",
    pages: [
        {
            title: "Collections of Data: Lists and Tuples",
            content: [
                "Lists (or Arrays) are ordered, changeable collections of items. They are perfect for when you need to store multiple values that you might need to modify later.",
                "Example (Python): `my_fruits = ['apple', 'banana', 'cherry']`",
                "Tuples are ordered, but unchangeable collections. Once a tuple is created, you cannot add, remove, or change its items. This makes them fast and safe for data that shouldn't change.",
                 "Example (Python): `point = (10, 20)`",
            ],
            researchPrompt: "What is the key difference in performance between a list and a tuple in Python?"
        },
        {
            title: "Collections of Data: Sets and Dictionaries",
            content: [
                "Sets are unordered, unindexed collections of unique items. They are useful for membership testing and removing duplicate entries.",
                "Dictionaries (or hashmaps) are unordered collections of key-value pairs. They are optimized for retrieving a value when you know the key.",
                "Example (Python): `student = {'name': 'John Doe', 'age': 25, 'course': 'Coding'}`",
                "JSON (JavaScript Object Notation) is a popular data format that looks very similar to Python dictionaries.",
            ],
            researchPrompt: "Find an example of a JSON object. How does its structure compare to a Python dictionary?"
        }
    ]
  },
   {
    title: "Module 4: Functions & Modules",
    pages: [
      {
        title: "Defining and Using Functions",
        content: [
          "A function is a reusable block of code that performs a specific task. They help keep your code organized and prevent repetition (DRY - Don't Repeat Yourself).",
          "You define a function with the `def` keyword in Python, give it a name, and specify what code it should run.",
          "Parameters are variables listed inside the parentheses in the function definition, which act as placeholders for the data you'll pass in.",
          "The `return` statement is used to send a value back from the function.",
        ],
        researchPrompt: "What is the difference between a parameter and an argument in the context of a function?"
      },
      {
        title: "Scope and Modules",
        content: [
          "Scope determines the visibility of a variable. Variables defined inside a function are in the local scope and can only be used within that function.",
          "Variables defined outside of any function are in the global scope.",
          "A module is simply a file containing Python code. You can import functions from other modules to use in your own code, which is a powerful way to organize large projects.",
          "Python has many built-in modules (like `math` or `random`) that provide useful functions."
        ],
        researchPrompt: "How can you prevent 'namespace pollution' when importing modules in Python?"
      }
    ]
  },
  {
    title: "Module 5: Object-Oriented Programming (OOP)",
    pages: [
      {
        title: "Classes and Objects",
        content: [
          "OOP is a programming paradigm based on the concept of 'objects', which can contain data (attributes) and code (methods).",
          "A Class is a blueprint for creating objects. For example, you could have a `Dog` class.",
          "An Object is an instance of a class. `my_dog = Dog()` would create an object (an instance) of the `Dog` class.",
          "The `__init__` method is a special method that runs automatically when a new object is created, used for initializing its attributes (e.g., `name`, `age`).",
        ],
        researchPrompt: "What does the `self` parameter in a class method refer to?"
      },
      {
        title: "Core OOP Principles",
        content: [
          "Inheritance allows a new class (child) to inherit attributes and methods from an existing class (parent).",
          "Polymorphism means 'many forms', and it allows us to perform a single action in different ways (e.g., different animal classes can have their own `make_sound` method).",
          "Encapsulation is the bundling of data (attributes) and the methods that operate on the data into a single unit (a class). It restricts direct access to some of an object's components.",
          "Abstraction means hiding complex implementation details and showing only the necessary features of the object.",
        ],
        researchPrompt: "Find a real-world analogy for explaining Inheritance in OOP."
      }
    ]
  },
  {
    title: "Module 6: Algorithms & Problem Solving",
    pages: [
      {
        title: "Searching and Sorting Algorithms",
        content: [
          "An algorithm is a step-by-step procedure for solving a problem or accomplishing a task.",
          "Linear Search checks every element in a list one by one. It's simple but can be slow for large lists.",
          "Binary Search is a much faster algorithm for finding an item in a *sorted* list by repeatedly dividing the search interval in half.",
          "Sorting algorithms like Bubble Sort and Insertion Sort are basic methods for arranging items in a specific order.",
        ],
        researchPrompt: "Why must a list be sorted for Binary Search to work?"
      },
      {
        title: "Efficiency and Big-O Notation",
        content: [
          "When solving problems, the efficiency of your code matters. A more efficient algorithm can solve a problem in seconds that might take an inefficient one years.",
          "Big-O notation is a way to describe the performance or complexity of an algorithm as the input size grows.",
          "For example, O(n) (Linear Time) means the runtime grows linearly with the size of the input. O(1) (Constant Time) is extremely fast, as the runtime is independent of input size.",
          "Understanding Big-O helps you choose the right algorithm for the job.",
        ],
        researchPrompt: "What is the Big-O complexity of a Binary Search?"
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
        const pagesCompleted = courseContent.slice(0, currentModuleIndex).reduce((acc, module) => acc + module.pages.length, 0) + currentPageIndex + 1;
        const progressPercentage = (pagesCompleted / totalPages) * 100;
        if (progressPercentage >= 100 && !isQuizUnlocked) {
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
  const isCourseComplete = progressPercentage >= 100;


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
                <CardDescription>{currentModule.title} - Page {currentPageIndex + 1} of {currentModule.pages.length}</CardDescription>
                <CardTitle className="font-headline text-2xl">{currentPage.title}</CardTitle>
              </CardHeader>
              <CardContent className="flex-1 space-y-6">
                  <ul className="list-disc list-inside space-y-2 text-lg">
                    {currentPage.content.map((item, index) => (
                      <li key={index}>{item}</li>
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
