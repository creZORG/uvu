
"use client";

import { useState, useEffect } from "react";
import { UserProfile } from "./profile-edit-modal";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { courseContent } from "@/lib/course-content";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { format, differenceInYears } from 'date-fns';
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Button } from "./ui/button";
import { Edit, BookOpen, BrainCircuit, Code, Brush, BarChart, Bot, Tv, Wifi, Camera, ShieldLock, Wrench } from "lucide-react";
import { UcnLogo } from "./icons";


interface ProfileDisplayProps {
    profile: UserProfile;
    userId: string;
}

const totalPages = courseContent.reduce((sum, module) => sum + module.pages.length, 0);

const interestIcons: { [key: string]: React.ReactNode } = {
    "ICT Literacy": <BookOpen className="mr-2" />,
    "Coding": <Code className="mr-2" />,
    "Graphics & Design": <Brush className="mr-2" />,
    "Digital Marketing": <BarChart className="mr-2" />,
    "Entrepreneurship": <BrainCircuit className="mr-2" />,
    "BPO Training": <Tv className="mr-2" />,
    "Robotics": <Bot className="mr-2" />,
    "Web Development": <Code className="mr-2" />,
    "Networking (Fiber Optics & Radio Technology)": <Wifi className="mr-2" />,
    "CCTV Installation": <Camera className="mr-2" />,
    "Access Control Systems": <ShieldLock className="mr-2" />,
    "Power (Solar DC Option)": <Wrench className="mr-2" />,
};

export function ProfileDisplay({ profile, userId }: ProfileDisplayProps) {
    const [examStatus, setExamStatus] = useState<string | null>(null);
    const [finalScore, setFinalScore] = useState<number | null>(null);

    useEffect(() => {
        const fetchExamStatus = async () => {
            const examDocRef = doc(db, "examSubmissions", userId);
            const docSnap = await getDoc(examDocRef);
            if (docSnap.exists()) {
                const data = docSnap.data();
                setExamStatus(data.status);
                if(data.scorePercentage) {
                    setFinalScore(data.scorePercentage);
                }
            }
        };
        fetchExamStatus();
    }, [userId]);


    const { module = 0, page = 0 } = profile.codingCourseProgress || {};
    const pagesCompleted = courseContent.slice(0, module).reduce((acc, mod) => acc + mod.pages.length, 0) + page + 1;
    const progressPercentage = totalPages > 0 ? (pagesCompleted / totalPages) * 100 : 0;
    
    let dob: Date | null = null;
    let age: number | null = null;
    if (profile.dateOfBirth) {
        dob = profile.dateOfBirth.toDate ? profile.dateOfBirth.toDate() : new Date(profile.dateOfBirth);
        if (!isNaN(dob.getTime())) {
            age = differenceInYears(new Date(), dob);
        }
    }

    const getStatusVariant = (status: string | null) => {
        switch (status) {
          case "disqualified": return "destructive";
          case "passed": return "default";
          case "failed": return "outline";
          case "submitted": return "secondary";
          default: return "secondary";
        }
    };

    return (
        <div className="grid md:grid-cols-3 gap-8">
            <div className="md:col-span-1 space-y-6">
                <Card className="bg-gradient-to-br from-primary/10 to-accent/20 border-primary/20 shadow-lg">
                     <CardHeader className="text-center items-center">
                        <UcnLogo className="w-24 h-24 mb-4" />
                        <CardTitle className="font-headline text-2xl">{profile.fullName}</CardTitle>
                        <CardDescription className="text-base">{profile.email}</CardDescription>
                    </CardHeader>
                    <CardContent className="text-sm space-y-3">
                         <div className="border-t border-primary/10 pt-3">
                            <p className="text-xs text-muted-foreground">Location</p>
                            <p>{profile.location}</p>
                        </div>
                         <div className="border-t border-primary/10 pt-3">
                            <p className="text-xs text-muted-foreground">Phone</p>
                            <p>{profile.phoneNumber}</p>
                        </div>
                        <div className="border-t border-primary/10 pt-3">
                            <p className="text-xs text-muted-foreground">Education Level</p>
                            <p>{profile.levelOfEducation}</p>
                        </div>
                    </CardContent>
                </Card>
            </div>
            <div className="md:col-span-2 space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="font-headline">My Learning</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <h3 className="font-semibold text-lg">General Coding Course</h3>
                            <div>
                                <div className="flex justify-between mb-1">
                                    <span className="text-sm font-medium text-primary">Course Progress</span>
                                    <span className="text-sm font-medium text-primary">{Math.round(progressPercentage)}%</span>
                                </div>
                                <Progress value={progressPercentage} />
                            </div>
                             <div>
                                <h4 className="font-medium text-sm text-muted-foreground mb-2">Exam Status</h4>
                                {examStatus ? (
                                    <Badge variant={getStatusVariant(examStatus)} className="text-base capitalize">
                                        {examStatus} {finalScore !== null ? `(${finalScore.toFixed(2)}%)` : ''}
                                    </Badge>
                                ) : (
                                    <Badge variant="outline">Not Started</Badge>
                                )}
                            </div>
                            <Button asChild>
                                <Link href="/courses/coding">
                                    {progressPercentage > 0 ? "Continue Course" : "Start Course"}
                                </Link>
                            </Button>
                        </div>
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader>
                        <CardTitle className="font-headline">My Interests</CardTitle>
                         <CardDescription>The skills you're interested in learning at Uvumbuzi.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-wrap gap-2">
                            {profile.areasOfInterest && profile.areasOfInterest.map(interest => (
                                <Badge key={interest} variant="secondary" className="text-sm py-1 px-3 flex items-center">
                                    {interestIcons[interest] || <BrainCircuit className="mr-2"/>}
                                    {interest}
                                </Badge>
                            ))}
                            {(!profile.areasOfInterest || profile.areasOfInterest.length === 0) && (
                                <p className="text-sm text-muted-foreground">No interests selected yet.</p>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
