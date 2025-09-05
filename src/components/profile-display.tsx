
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

interface ProfileDisplayProps {
    profile: UserProfile;
    userId: string;
}

const totalPages = courseContent.reduce((sum, module) => sum + module.pages.length, 0);

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
                <Card>
                    <CardHeader>
                        <CardTitle className="font-headline">{profile.fullName}</CardTitle>
                        <CardDescription>{profile.email}</CardDescription>
                    </CardHeader>
                    <CardContent className="text-sm space-y-2">
                        <p><strong>Occupation:</strong> {profile.occupation}</p>
                        <p><strong>Location:</strong> {profile.location}</p>
                        <p><strong>Gender:</strong> <span className="capitalize">{profile.gender}</span></p>
                        <p><strong>Phone:</strong> {profile.phoneNumber}</p>
                        {dob && <p><strong>Date of Birth:</strong> {format(dob, 'PPP')}</p>}
                    </CardContent>
                </Card>
                {age !== null && age < 18 && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="font-headline text-lg">Parent/Guardian</CardTitle>
                        </CardHeader>
                        <CardContent className="text-sm space-y-2">
                            <p><strong>Name:</strong> {profile.parentName || 'Not provided'}</p>
                            <p><strong>Phone:</strong> {profile.parentPhoneNumber || 'Not provided'}</p>
                        </CardContent>
                    </Card>
                )}
            </div>
            <div className="md:col-span-2">
                <Card>
                    <CardHeader>
                        <CardTitle className="font-headline">My Courses</CardTitle>
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
            </div>
        </div>
    );
}
