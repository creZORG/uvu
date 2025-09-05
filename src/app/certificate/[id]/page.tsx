
"use client";

import { useState, useEffect } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { UcnLogo } from '@/components/icons';
import { format } from 'date-fns';
import { Loader2, Download, Award } from 'lucide-react';
import { useReactToPrint } from 'react-to-print';
import { useRef } from 'react';
import { Button } from '@/components/ui/button';

type CertificateData = {
    studentName: string;
    courseName: string;
    issuedAt: {
        toDate: () => Date;
    };
    finalScore: string;
};

export default function CertificatePage({ params }: { params: { id:string } }) {
    const [certificate, setCertificate] = useState<CertificateData | null>(null);
    const [loading, setLoading] = useState(true);
    const certificateRef = useRef<HTMLDivElement>(null);

    const handlePrint = useReactToPrint({
        content: () => certificateRef.current,
        documentTitle: `Uvumbuzi Certificate - ${certificate?.studentName || ''}`,
    });

    useEffect(() => {
        const fetchCertificate = async () => {
            if (!params.id) return;
            try {
                const docRef = doc(db, 'certificates', params.id);
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    setCertificate(docSnap.data() as CertificateData);
                } else {
                    console.error("No such certificate!");
                }
            } catch (error) {
                console.error("Error fetching certificate:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchCertificate();
    }, [params.id]);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-100">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </div>
        );
    }

    if (!certificate) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-100">
                <div className="text-center p-4">
                    <h1 className="text-2xl font-bold text-destructive">Certificate Not Found</h1>
                    <p className="text-muted-foreground">The certificate ID is invalid or does not exist.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-gray-100 min-h-screen py-6 sm:py-12 px-4 flex flex-col items-center justify-center font-serif">
            <div className="w-full max-w-4xl">
                 <div ref={certificateRef} className="bg-white p-4 sm:p-8 shadow-2xl w-full h-auto sm:aspect-[1.414/1] border-[6px] sm:border-[10px] border-primary relative print:shadow-none print:border-none">
                    <div className="absolute inset-0 border-2 border-accent m-2 pointer-events-none"></div>
                     <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-5">
                        <UcnLogo className="h-64 w-64 sm:h-96 sm:w-96"/>
                    </div>
                    <div className="relative flex flex-col h-full items-center text-center text-gray-800">
                        <div className="flex flex-col sm:flex-row items-center justify-between w-full">
                           <UcnLogo className="h-16 w-16 sm:h-20 sm:w-20" />
                           <div className="text-center my-4 sm:my-0">
                                <h1 className="font-headline text-2xl sm:text-3xl font-bold text-gray-900">Uvumbuzi Community Network</h1>
                                <p className="text-base sm:text-lg text-muted-foreground">Digital Hub</p>
                           </div>
                           <Award className="h-16 w-16 sm:h-20 sm:w-20 text-accent" />
                        </div>

                        <div className="my-4 sm:my-8">
                            <p className="text-lg sm:text-xl tracking-wider uppercase text-muted-foreground">Certificate of Completion</p>
                        </div>
                        
                        <div className="my-2">
                            <p className="text-lg sm:text-xl tracking-wider">This certifies that</p>
                            <h2 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-primary font-headline my-2 sm:my-4 tracking-wide">{certificate.studentName}</h2>
                            <p className="text-lg sm:text-xl tracking-wider">has successfully completed the course</p>
                        </div>
                        
                        <h3 className="text-2xl sm:text-3xl md:text-4xl font-bold font-headline">{certificate.courseName}</h3>

                        <p className="mt-4 text-sm sm:text-base max-w-2xl">
                           with a final score of <span className="font-bold">{certificate.finalScore}%</span>, demonstrating proficiency in programming fundamentals, data structures, error handling, and database management.
                        </p>
                        

                        <div className="mt-auto w-full flex flex-col sm:flex-row justify-between items-center text-sm sm:text-base space-y-6 sm:space-y-0 pt-8">
                            <div className="text-center">
                                <p className="border-b-2 border-gray-400 pb-1 px-8 italic">Signature</p>
                                <p className="font-bold mt-2">Executive Director</p>
                            </div>
                            <div className="text-center">
                                <p className="font-bold">{certificate.issuedAt ? format(certificate.issuedAt.toDate(), 'PPP') : 'N/A'}</p>
                                <p className="border-t-2 border-gray-400 pt-1">Date of Issue</p>
                            </div>
                            <div className="text-center">
                                <p className="border-b-2 border-gray-400 pb-1 px-8 italic">Signature</p>
                                <p className="font-bold mt-2">Lead Instructor</p>
                            </div>
                        </div>

                        <div className="absolute bottom-2 left-2 text-[10px] sm:text-xs text-gray-400">
                            Certificate ID: {params.id}
                        </div>
                    </div>
                </div>
            </div>
             <Button onClick={handlePrint} className="mt-8 font-sans print:hidden">
                <Download className="mr-2"/> Download / Print Certificate
            </Button>
        </div>
    );
}

