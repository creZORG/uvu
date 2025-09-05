
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth, db } from "@/lib/firebase";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { Progress } from "@/components/ui/progress";
import { AlertDialog, AlertDialogAction, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import Link from "next/link";

const quizQuestions = [
    {
      question: "What does HTML stand for?",
      options: [
        "Hyper Trainer Marking Language",
        "Hyper Text Marketing Language",
        "Hyper Text Markup Language",
        "Hyperlink and Text Markup Language",
      ],
      answer: "Hyper Text Markup Language",
    },
    {
      question: "Which CSS property is used to change the text color of an element?",
      options: ["font-color", "text-color", "color", "font-style"],
      answer: "color",
    },
    {
      question: "What is the correct syntax for a JavaScript 'for' loop?",
      options: [
        "for (i = 0; i <= 5; i++)",
        "for (i <= 5; i++)",
        "for (i = 0; i <= 5)",
        "for i = 1 to 5",
      ],
      answer: "for (i = 0; i <= 5; i++)",
    },
    {
      question: "In Python, how do you declare a variable with the value 'hello'?",
      options: [
        "variable name = 'hello'",
        "var name = 'hello'",
        "name = 'hello'",
        "string name = 'hello'",
      ],
      answer: "name = 'hello'",
    },
     {
      question: "What is the purpose of a function in programming?",
      options: [
        "To store data",
        "To create loops",
        "To perform a specific task and reuse code",
        "To style a webpage",
      ],
      answer: "To perform a specific task and reuse code",
    },
];

export default function CodingQuizPage() {
  const [user, loading, error] = useAuthState(auth);
  const router = useRouter();

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/auth");
    }
  }, [user, loading, router]);
  
  const handleNextQuestion = async () => {
    if (selectedAnswer === quizQuestions[currentQuestionIndex].answer) {
      setScore(score + 1);
    }
    
    setSelectedAnswer(null);

    if (currentQuestionIndex < quizQuestions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      setQuizFinished(true);
      if (user) {
        try {
            await setDoc(doc(db, "quizResults", `${user.uid}_coding`), {
                userId: user.uid,
                quiz: "coding",
                score: score + (selectedAnswer === quizQuestions[currentQuestionIndex].answer ? 1 : 0),
                total: quizQuestions.length,
                completedAt: serverTimestamp(),
            });
        } catch (e) {
            console.error("Error adding document: ", e);
        }
      }
    }
  };

  if (loading || !user) {
    return (
      <div className="flex flex-col min-h-screen items-center justify-center bg-background">
        <p>Loading...</p>
      </div>
    );
  }

  const currentQuestion = quizQuestions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / quizQuestions.length) * 100;

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-1 flex items-center justify-center">
        <section className="w-full max-w-2xl py-12 px-4 md:px-6">
            <Card className="p-6 sm:p-8">
              <CardHeader>
                <CardTitle className="font-headline text-2xl md:text-3xl">
                  Coding Quiz
                </CardTitle>
                 <CardDescription>
                  Question {currentQuestionIndex + 1} of {quizQuestions.length}
                </CardDescription>
                <Progress value={progress} className="mt-2" />
              </CardHeader>
              <CardContent>
                <h2 className="text-lg md:text-xl font-semibold mb-6">{currentQuestion.question}</h2>
                <RadioGroup
                  value={selectedAnswer ?? undefined}
                  onValueChange={setSelectedAnswer}
                  className="space-y-4"
                >
                  {currentQuestion.options.map((option, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      <RadioGroupItem value={option} id={`option-${index}`} />
                      <Label htmlFor={`option-${index}`} className="text-base">
                        {option}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
                <Button
                  onClick={handleNextQuestion}
                  disabled={!selectedAnswer}
                  className="w-full mt-8"
                >
                  {currentQuestionIndex < quizQuestions.length - 1 ? "Next Question" : "Finish Quiz"}
                </Button>
              </CardContent>
            </Card>
        </section>
        
         <AlertDialog open={quizFinished} onOpenChange={setQuizFinished}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Quiz Completed!</AlertDialogTitle>
                <AlertDialogDescription>
                  You've successfully completed the coding quiz.
                  Your score is: {score} out of {quizQuestions.length}
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogAction asChild>
                  <Link href="/courses/coding">Back to Courses</Link>
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>

      </main>
      <Footer />
    </div>
  );
}
