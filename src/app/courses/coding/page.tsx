
"use client";

import { useState, useEffect } from "react";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth, db } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, ArrowRight, CheckCircle, Rocket, Trophy, AlertTriangle, ChevronLeft, Loader2 } from "lucide-react";
import { CodeSnippet } from "@/components/code-snippet";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { isProfileComplete } from "@/lib/utils";
import { courseContent } from "@/lib/course-content";


const totalPages = courseContent.reduce((sum, module) => sum + module.pages.length, 0);

export default function CodingPage() {
  const [user, loading] = useAuthState(auth);
  const router = useRouter();
  const { toast } = useToast();
  
  const [showIntroModal, setShowIntroModal] = useState(false);
  const [showModuleModal, setShowModuleModal] = useState(false);
  const [showResetWarning, setShowResetWarning] = useState(false);
  const [showFinalQuizModal, setShowFinalQuizModal] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);

  const [currentModuleIndex, setCurrentModuleIndex] = useState(0);
  const [currentPageIndex, setCurrentPageIndex] = useState(0);

  useEffect(() => {
    if (loading) return;
    if (!user) {
        router.push('/auth');
        return;
    }

    const fetchProgress = async () => {
        const docRef = doc(db, "userProfiles", user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            const profileData = docSnap.data();
            if (profileData.codingCourseProgress) {
                const { module, page } = profileData.codingCourseProgress;
                setCurrentModuleIndex(module);
                setCurrentPageIndex(page);
            }
        }
        setShowIntroModal(true);
        setHasLoaded(true);
    };

    fetchProgress();
  }, [user, loading, router]);


  useEffect(() => {
    const saveProgress = async () => {
        if(user && hasLoaded) {
            const docRef = doc(db, "userProfiles", user.uid);
            const progress = { module: currentModuleIndex, page: currentPageIndex };
            try {
                await setDoc(docRef, { codingCourseProgress: progress }, { merge: true });
            } catch (error) {
                console.error("Error saving progress: ", error);
            }
        }
    };
    saveProgress();
  }, [currentModuleIndex, currentPageIndex, user, hasLoaded]);
  
  const handleStartOver = () => {
    setShowIntroModal(false);
    setShowResetWarning(true);
  };
  
  const confirmStartOver = () => {
      setCurrentModuleIndex(0);
      setCurrentPageIndex(0);
      setShowResetWarning(false);
  };


  const handleNext = () => {
    if (currentPageIndex < courseContent[currentModuleIndex].pages.length - 1) {
      setCurrentPageIndex(currentPageIndex + 1);
    } else if (currentModuleIndex < courseContent.length - 1) {
      setShowModuleModal(true);
    } else {
        const pagesCompleted = courseContent.slice(0, currentModuleIndex).reduce((acc, module) => acc + module.pages.length, 0) + currentPageIndex + 1;
        const progressPercentage = (pagesCompleted / totalPages) * 100;
        if (progressPercentage >= 100) {
            setShowFinalQuizModal(true);
        }
    }
  };
  
  const handleStartNextModule = () => {
      setShowModuleModal(false);
      setCurrentModuleIndex(currentModuleIndex + 1);
      setCurrentPageIndex(0);
  }

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
      router.push('/student-hub');
    } else {
      router.push('/courses/coding/quiz');
    }
  };
  
  const handlePillClick = (moduleIndex: number) => {
      setCurrentModuleIndex(moduleIndex);
      setCurrentPageIndex(0);
  };

  const currentModule = courseContent[currentModuleIndex];
  const currentPage = currentModule?.pages[currentPageIndex];

  const pagesCompleted = courseContent.slice(0, currentModuleIndex).reduce((acc, module) => acc + module.pages.length, 0) + currentPageIndex + 1;
  const progressPercentage = (pagesCompleted / totalPages) * 100;
  const isCourseComplete = progressPercentage >= 100;


  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      
      <AlertDialog open={showIntroModal} onOpenChange={setShowIntroModal}>
        <AlertDialogContent><AlertDialogHeader><AlertDialogTitle className="font-headline text-2xl">Welcome to the Coding Course!</AlertDialogTitle>
            <AlertDialogDescription className="text-base pt-2">This course takes you from beginner to capable programmer. Here's your learning path:</AlertDialogDescription>
             <div className="max-h-60 overflow-y-auto py-2"><ul className="list-decimal list-inside space-y-1 text-muted-foreground">
                    {courseContent.map((module, index) => (<li key={index}>{module.title}</li>))}</ul></div>
             { (currentModuleIndex > 0 || currentPageIndex > 0) &&
                <p className="pt-2 text-primary font-semibold">You left off at: <span className="font-bold">{currentModule?.title} - Page {currentPageIndex + 1}</span></p>}
          </AlertDialogHeader><AlertDialogFooter className="sm:justify-between"><Button variant="destructive" onClick={handleStartOver}>Start Over</Button><AlertDialogAction onClick={() => setShowIntroModal(false)}>Continue</AlertDialogAction></AlertDialogFooter></AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={showResetWarning} onOpenChange={setShowResetWarning}>
        <AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Are you sure?</AlertDialogTitle><AlertDialogDescription>This will reset all your course progress and cannot be undone.</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={confirmStartOver}>Yes, Reset</AlertDialogAction></AlertDialogFooter></AlertDialogContent>
      </AlertDialog>

       <AlertDialog open={showModuleModal} onOpenChange={setShowModuleModal}>
            <AlertDialogContent><AlertDialogHeader><AlertDialogTitle className="font-headline text-2xl flex items-center gap-2"><Trophy className="text-amber-400" /> Well Done!</AlertDialogTitle>
                    <AlertDialogDescription className="text-base pt-2">You've completed <strong>{currentModule?.title}</strong>. Review these concepts before moving on.</AlertDialogDescription></AlertDialogHeader>
                <div className="space-y-4"><div><h3 className="font-semibold mb-2 text-foreground">Self-Check Quiz:</h3><ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground bg-accent/50 p-4 rounded-md">
                            {currentModule?.quiz.map((q, i) => <li key={i}>{q}</li>)}</ul></div>
                    {courseContent[currentModuleIndex + 1] && (<div><h3 className="font-semibold mb-2 text-foreground">Next Up: {courseContent[currentModuleIndex + 1]?.title}</h3>
                            <p className="text-sm text-muted-foreground">Here's a preview of what you'll learn:</p>
                            <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground mt-2">
                                {courseContent[currentModuleIndex + 1]?.pages.map((p, i) => <li key={i}>{p.title}</li>)}</ul></div>)}</div>
                <AlertDialogFooter><AlertDialogAction onClick={handleStartNextModule} className="w-full"><Rocket className="mr-2"/> Start Next Module</AlertDialogAction></AlertDialogFooter></AlertDialogContent>
        </AlertDialog>

       <AlertDialog open={showFinalQuizModal} onOpenChange={setShowFinalQuizModal}>
        <AlertDialogContent className="max-w-lg"><AlertDialogHeader><AlertDialogTitle className="font-headline text-2xl flex items-center gap-2"><CheckCircle className="text-primary"/> Congratulations!</AlertDialogTitle>
            <AlertDialogDescription className="text-base pt-2">You've completed the course and are ready for the final exam to earn your certificate. Please read the instructions below carefully.</AlertDialogDescription>
          </AlertDialogHeader>
           <div className="text-sm space-y-4 max-h-[60vh] overflow-y-auto pr-4">
                <p><strong>Exam Duration:</strong> Approx. <strong>2.5 to 3 hours</strong>.</p>
                <p><strong>Certificate:</strong> Upon passing, your certificate will be sent to: <strong className="text-primary">{user?.email}</strong>. If incorrect, please <Link href="/profile" className="underline">update your profile</Link> before starting.</p>
                <div className="p-4 rounded-md bg-destructive/10 border border-destructive/50 text-destructive-foreground"><h4 className="font-bold flex items-center gap-2 mb-2"><AlertTriangle/>Important Rules</h4>
                    <ul className="list-disc list-inside space-y-2">
                        <li><strong>Human-Marked Exam:</strong> AI-generated answers are strictly prohibited and will lead to disqualification.</li>
                        <li><strong>Stable Connection:</strong> Ensure you have a stable internet connection.</li>
                        <li><strong>Single Attempt:</strong> This exam can only be attempted once.</li>
                        <li><strong>Do Not Leave The Page:</strong> Navigating away will void your submission.</li></ul></div></div>
          <AlertDialogFooter><AlertDialogCancel>Not Yet</AlertDialogCancel><AlertDialogAction onClick={handleStartQuiz} size="lg">I Understand, Start Final Exam</AlertDialogAction></AlertDialogFooter></AlertDialogContent>
      </AlertDialog>

      <main className="flex-1">
        <section className="py-16 md:py-24"><div className="container px-4 md:px-6">
            <div className="max-w-4xl mx-auto">
                <Button variant="ghost" onClick={() => router.push('/courses')} className="mb-4"><ChevronLeft className="mr-2"/> Back to Courses</Button>
            </div>
            <div className="max-w-4xl mx-auto mb-4">
                 <div className="flex flex-wrap gap-2 mb-4">
                    {courseContent.slice(0, currentModuleIndex + 1).map((module, index) => (<Badge key={index} variant={index === currentModuleIndex ? "default" : "secondary"} className="cursor-pointer" onClick={() => handlePillClick(index)}>Module {index}</Badge>))}</div>
                <div className="flex justify-between mb-2"><span className="text-sm font-medium text-primary">Course Progress</span><span className="text-sm font-medium text-primary">{Math.round(progressPercentage)}%</span></div>
                <Progress value={progressPercentage} /></div>
            <Card className="max-w-4xl mx-auto min-h-[500px] flex flex-col">
              {currentPage ? (
                <>
                  <CardHeader><CardDescription>{currentModule.title} - Page {currentPageIndex + 1} of {currentModule.pages.length}</CardDescription><CardTitle className="font-headline text-2xl">{currentPage.title}</CardTitle></CardHeader>
                  <CardContent className="flex-1 space-y-6">
                      <div className="space-y-4 text-lg">{currentPage.content.map((item, index) => {
                           if (typeof item === 'string') { return <p key={index}>{item}</p>; }
                           if (item.type === 'code') { return <CodeSnippet key={index} language={item.language} code={item.code} />; }
                           return null;})}</div>
                       <p className="pt-4 text-primary/80 italic"><strong>Research Task:</strong> {currentPage.researchPrompt}</p>
                  </CardContent>
                  <CardFooter className="flex justify-between border-t pt-6">
                    <Button variant="outline" onClick={handlePrev} disabled={currentModuleIndex === 0 && currentPageIndex === 0}><ArrowLeft className="mr-2"/> Previous</Button>
                    {isCourseComplete ? (<Button onClick={() => setShowFinalQuizModal(true)}><CheckCircle className="mr-2"/> Finish Course</Button>
                    ) : (<Button onClick={handleNext}>Next <ArrowRight className="ml-2"/></Button>)}
                  </CardFooter>
                </>
              ) : (
                <div className="flex items-center justify-center flex-1">
                    <Loader2 className="h-8 w-8 animate-spin" />
                </div>
              )}
            </Card></div></section>
      </main>
      <Footer />
    </div>
  );
}
