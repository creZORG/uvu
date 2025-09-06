
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
import { Edit, BookOpen, BrainCircuit, Code, Brush, BarChart, Bot, Tv, Wifi, Camera, ShieldCheck, Wrench } from "lucide-react";
import { UcnLogo } from "./icons";


interface ProfileDisplayProps {
    profile: UserProfile;
    userId: string;
}

const totalPages = courseContent.reduce((sum, module) => sum + module.pages.length, 0);

const interestIcons: { [key: string]: React.ReactNode } = {
    "ICT Literacy": <BookOpen size={16} className="mr-2" />,
    "Coding": <Code size={16} className="mr-2" />,
    "Graphics & Design": <Brush size={16} className="mr-2" />,
    "Digital Marketing": <BarChart size={16} className="mr-2" />,
    "Entrepreneurship": <BrainCircuit size={16} className="mr-2" />,
    "BPO Training": <Tv size={16} className="mr-2" />,
    "Robotics": <Bot size={16} className="mr-2" />,
    "Web Development": <Code size={16} className="mr-2" />,
    "Networking (Fiber Optics & Radio Technology)": <Wifi size={16} className="mr-2" />,
    "CCTV Installation": <Camera size={16} className="mr-2" />,
    "Access Control Systems": <ShieldCheck size={16} className="mr-2" />,
    "Power (Solar DC Option)": <Wrench size={16} className="mr-2" />,
};

export function ProfileDisplay({ profile, userId }: ProfileDisplayProps) {
    const [examStatus, setExamStatus] = useState<string | null>(null);
    const [finalScore, setFinalScore] = useState<number | null>(null);
    const [certificateId, setCertificateId] = useState<string | null>(null);

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
                if(data.certificateId) {
                    setCertificateId(data.certificateId);
                }
            }
        };
        fetchExamStatus();
    }, [userId]);


    const { module = 0, page = 0 } = profile.codingCourseProgress || {};
    const pagesCompleted = courseContent.slice(0, module).reduce((acc, mod) => acc + mod.pages.length, 0) + page + 1;
    const progressPercentage = totalPages > 0 ? (pagesCompleted / totalPages) * 100 : 0;
    
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
        <Card className="p-6 bg-gradient-to-tr from-card to-background">
            <div className="grid md:grid-cols-3 gap-8">
                <div className="md:col-span-1 space-y-4 md:border-r md:pr-8">
                     <div className="flex flex-col items-center md:items-start text-center md:text-left">
                        <UcnLogo className="w-24 h-24 mb-4 rounded-full border-4 border-primary/20 shadow-lg" />
                        <CardTitle className="font-headline text-2xl">{profile.fullName}</CardTitle>
                        <CardDescription className="text-base">{profile.email}</CardDescription>
                    </div>
                    <div className="text-sm space-y-3 pt-4 border-t">
                         <div>
                            <p className="text-xs text-muted-foreground">Location</p>
                            <p>{profile.location}</p>
                        </div>
                         <div>
                            <p className="text-xs text-muted-foreground">Phone</p>
                            <p>{profile.phoneNumber}</p>
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground">Education</p>
                            <p>{profile.levelOfEducation}</p>
                        </div>
                    </div>
                </div>
                <div className="md:col-span-2 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="font-headline text-xl">My Learning</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <h3 className="font-semibold">General Coding Course</h3>
                            <div>
                                <div className="flex justify-between mb-1">
                                    <span className="text-sm font-medium text-primary">Course Progress</span>
                                    <span className="text-sm font-medium text-primary">{Math.round(progressPercentage)}%</span>
                                </div>
                                <Progress value={progressPercentage} />
                            </div>
                            <div className="flex items-center gap-4 flex-wrap">
                                 <div>
                                    <h4 className="font-medium text-sm text-muted-foreground mb-1">Exam Status</h4>
                                    {examStatus ? (
                                        <Badge variant={getStatusVariant(examStatus)} className="text-base capitalize">
                                            {examStatus} {finalScore !== null ? `(${finalScore.toFixed(2)}%)` : ''}
                                        </Badge>
                                    ) : (
                                        <Badge variant="outline">Not Started</Badge>
                                    )}
                                </div>
                                {certificateId && (
                                    <Button asChild variant="outline" size="sm">
                                        <Link href={`/certificate/${certificateId}`} target="_blank">View Certificate</Link>
                                    </Button>
                                )}
                            </div>
                            <Button asChild>
                                <Link href="/courses/coding">
                                    {progressPercentage > 0 && progressPercentage < 100 ? "Continue Course" : "Go to Course"}
                                </Link>
                            </Button>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle className="font-headline text-xl">My Interests</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex flex-wrap gap-2">
                                {profile.areasOfInterest && profile.areasOfInterest.map(interest => (
                                    <Badge key={interest} variant="secondary" className="text-sm py-1 px-3 flex items-center">
                                        {interestIcons[interest] || <BrainCircuit size={16} className="mr-2"/>}
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
        </Card>
    );
}
