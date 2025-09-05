
"use client";

import { useState, useEffect } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { UcnLogo } from '@/components/icons';
import { format } from 'date-fns';
import { Loader2 } from 'lucide-react';
import { useReactToPrint } from 'react-to-print';
import { useRef } from 'react';
import { Button } from '@/components/ui/button';

type CertificateData = {
    studentName: string;
    courseName: string;
    issuedAt: {
        toDate: () => Date;
    };
};

export default function CertificatePage({ params }: { params: { id: string } }) {
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
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-destructive">Certificate Not Found</h1>
                    <p className="text-muted-foreground">The certificate ID is invalid or does not exist.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-gray-100 min-h-screen py-12 px-4 flex flex-col items-center justify-center">
             <div ref={certificateRef} className="bg-white p-12 shadow-2xl w-full max-w-4xl aspect-[1.414/1] border-8 border-primary relative font-serif">
                <div className="absolute inset-0 border-2 border-primary/50 m-2"></div>
                <div className="relative flex flex-col h-full items-center justify-center text-center">
                    <div className="absolute top-12 flex items-center gap-4">
                        <UcnLogo className="h-24 w-24" />
                    </div>

                    <p className="text-3xl font-headline tracking-wider mt-32">Certificate of Completion</p>

                    <p className="mt-12 text-xl">This certificate is proudly presented to</p>

                    <p className="text-6xl font-extrabold text-primary font-headline mt-4 tracking-wide">{certificate.studentName}</p>

                    <div className="w-1/2 border-b-2 border-gray-300 mt-8"></div>

                    <p className="mt-8 text-xl max-w-xl">
                        for successfully completing the
                        <span className="font-bold"> {certificate.courseName}</span>.
                    </p>

                    <div className="mt-auto flex justify-between w-full text-lg">
                        <div>
                            <p className="border-t-2 border-gray-400 pt-2 px-8">Signature</p>
                            <p className="font-bold">Lead Instructor</p>
                        </div>
                        <div>
                            <p className="border-t-2 border-gray-400 pt-2 px-8">
                                {certificate.issuedAt ? format(certificate.issuedAt.toDate(), 'PPP') : 'N/A'}
                            </p>
                            <p className="font-bold">Date of Issue</p>
                        </div>
                    </div>
                </div>
            </div>
             <Button onClick={handlePrint} className="mt-8">
                Download / Print Certificate
            </Button>
        </div>
    );
}
